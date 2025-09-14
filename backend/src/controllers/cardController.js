const { Card, Column, BoardMember, AuditLog, Notification, User } = require('../db/associations');
const sequelize = require('../db/db');
const { Op } = require('sequelize');
const { acquireLock, releaseLock } = require('../services/redisClient');
const emailService = require('../services/emailService');
const POSITION_GAP = 1000n;

function getGapPosition(prevPos, nextPos) {
  if (prevPos == null && nextPos == null) return Number(POSITION_GAP);
  if (prevPos == null) return Number(BigInt(nextPos) - POSITION_GAP);
  if (nextPos == null) return Number(BigInt(prevPos) + POSITION_GAP);
  
  const gap = Math.floor(Number((BigInt(prevPos) + BigInt(nextPos)) / 2n));
  if (gap === prevPos || gap === nextPos) {
    return Number(BigInt(prevPos) + POSITION_GAP);
  }
  
  return gap;
}

async function findAvailablePosition(columnId, afterPosition, beforePosition, transaction) {
  const { Card } = require('../db/associations');
  
  // Get existing cards in the column to find occupied positions
  const existingCards = await Card.findAll({
    where: { column_id: columnId },
    attributes: ['position'],
    order: [['position', 'ASC']],
    transaction
  });
  
  const occupiedPositions = new Set(existingCards.map(card => Number(card.position)));
  
  // Try to find a position between afterPosition and beforePosition
  let position = Math.floor(getGapPosition(afterPosition ?? null, beforePosition ?? null));
  
  // If the calculated position is occupied, find the next available position
  let attempts = 0;
  while (occupiedPositions.has(position) && attempts < 10) {
    position = Math.floor(position + Math.random() * 1000 + 1);
    attempts++;
  }
  
  // If still occupied, use a timestamp-based position
  if (occupiedPositions.has(position)) {
    position = Math.floor(Date.now() + Math.random() * 1000);
  }
  
  return position;
}

async function hasBoardPermission(userId, boardId, roles = ['owner','admin','editor']) {
  const membership = await BoardMember.findOne({ where: { user_id: userId, board_id: boardId } });
  return membership && roles.includes(membership.role);
}

async function validateAssignee(assignee_id) {
  if (!assignee_id) return true;
  const user = await User.findByPk(assignee_id);
  return !!(user && !user.is_deleted && user.is_active);
}

function emitBoardUpdate(io, board_id, event, payload) {
  io.to(`board:${board_id}`).emit(event, payload);
}

exports.createCard = async (req, res, next) => {
  console.log('🔍 Creating card, req.io available:', !!req.io);
  const t = await sequelize.transaction();
  try {
    const { column_id, title, description, assignee_id, after_position, before_position, due_date } = req.body;

    const column = await Column.findByPk(column_id);
    if (!column) {
      await t.rollback();
      return res.status(404).json({ error: 'Column not found' });
    }

    if (!(await hasBoardPermission(req.user.id, column.board_id))) {
      await t.rollback();
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    if (!(await validateAssignee(assignee_id))) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid assignee' });
    }

    // SIMPLE APPROACH: Use timestamp for new cards - no conflicts!
    const position = Date.now();
    
    const card = await Card.create({ 
      column_id, 
      title, 
      description, 
      assignee_id, 
      position, 
      due_date
    }, { transaction: t });

    await AuditLog.create({
      board_id: column.board_id,
      user_id: req.user.id,
      entity_type: 'card',
      entity_id: card.id,
      action: 'CardCreated',
      new_values: card.toJSON()
    }, { transaction: t });

    if (assignee_id) {
      const notification = await Notification.create({
        user_id: assignee_id,
        card_id: card.id,
        board_id: column.board_id,
        type: 'card_assigned',
        title: 'A card was assigned to you',
        message: `Card "${title}" was assigned.`,
        data: { card_id: card.id, board_id: column.board_id }
      }, { transaction: t });

      req.io.to(`user_${assignee_id}`).emit('notification', notification);

      // Send email notification for card assignment
      try {
        const assignee = await User.findByPk(assignee_id);
        const board = await require('../db/associations').Board.findByPk(column.board_id);
        const assigner = await User.findByPk(req.user.id);
        
        if (assignee && board && assigner) {
          await emailService.sendCardAssignmentEmail(
            assignee.email,
            assignee.first_name || assignee.email,
            title,
            board.title,
            assigner.first_name || assigner.email
          );
        }
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
        // Don't fail the request if email fails
      }
    }

    await t.commit();

    try {
      console.log(`➕ Emitting cardCreated event to board:${column.board_id}:`, card.toJSON());
      req.io.to(`board:${column.board_id}`).emit('cardCreated', card);
    } catch (emitError) {
      console.error('Failed to emit board update:', emitError);
    }

    res.status(201).json(card);
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error('❌ createCard failed:', err);
    console.error('❌ Error details:', err.message, err.stack);
    console.error('❌ Request body:', req.body);
    console.error('❌ User ID:', req.user?.id);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('Position conflict - this should not happen with timestamp approach');
      return res.status(409).json({ 
        error: 'Position conflict - retry the move',
        details: err.fields 
      });
    }
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: err.errors.map(e => e.message) 
      });
    }
    
    next(err);
  }
};

exports.updateCard = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, assignee_id, position, version, column_id } = req.body;
    const card = await Card.findByPk(req.params.id, { transaction: t });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const column = await Column.findByPk(card.column_id, { transaction: t });
    if (!column) return res.status(404).json({ error: 'Column not found' });

    if (!(await hasBoardPermission(req.user.id, column.board_id, ['owner', 'admin', 'editor']))) {
      return res.status(403).json({ error: 'Insufficient permissions - editor role required' });
    }
    if (!(await validateAssignee(assignee_id))) {
      return res.status(400).json({ error: 'Invalid assignee' });
    }

    if (column_id && column_id !== card.column_id) {
      const newColumn = await Column.findByPk(column_id, { transaction: t });
      if (!newColumn) return res.status(404).json({ error: 'Target column not found' });
      
      if (!(await hasBoardPermission(req.user.id, newColumn.board_id, ['owner', 'admin', 'editor']))) {
        return res.status(403).json({ error: 'Insufficient permissions for target column' });
      }
    }

    // Skip version check for position-only updates to allow concurrent moves
    if (version != null && card.version !== version && (title || description || assignee_id)) {
      return res.status(409).json({ error: 'Card was updated by someone else. Refresh and retry.' });
    }

    // Only acquire lock for content updates, not for position-only updates
    // Position updates use timestamp-based positioning and can happen concurrently
    let lockAcquired = true;
    const isPositionOnlyUpdate = (title === undefined && description === undefined && assignee_id === undefined) && 
                                 (position !== undefined || column_id !== undefined);
    
    if (req.socketId && !isPositionOnlyUpdate) {
      lockAcquired = await acquireLock(card.id, req.socketId);
      if (!lockAcquired) return res.status(423).json({ error: 'Card is being updated by someone else. Try again.' });
    }

    const old_values = card.toJSON();
    
    const updateData = { title, description, assignee_id, version: card.version + 1 };
    
    // SIMPLE APPROACH: Just update the card - no position constraints!
    if (position !== undefined) {
      updateData.position = parseInt(position, 10);
    }
    
    if (column_id) {
      updateData.column_id = column_id;
    }
    
    // Update the card - let multiple cards have the same position temporarily
    await card.update(updateData, { transaction: t });

    const action = column_id && column_id !== old_values.column_id ? 'CardMoved' : 'CardUpdated';
    
    await AuditLog.create({
      board_id: column.board_id,
      user_id: req.user.id,
      entity_type: 'card',
      entity_id: card.id,
      action,
      old_values,
      new_values: card.toJSON()
    }, { transaction: t });

    if (assignee_id && assignee_id !== old_values.assignee_id) {
      const notification = await Notification.create({
        user_id: assignee_id,
        card_id: card.id,
        board_id: column.board_id,
        type: 'card_assigned',
        title: 'A card was assigned to you',
        message: `Card "${card.title}" was assigned.`,
        data: { card_id: card.id, board_id: column.board_id }
      }, { transaction: t });

      if (req.io) {
        req.io.to(`user_${assignee_id}`).emit('notification', notification);
      }

      // Send email notification for card assignment change
      try {
        const assignee = await User.findByPk(assignee_id);
        const board = await require('../db/associations').Board.findByPk(column.board_id);
        const assigner = await User.findByPk(req.user.id);
        
        if (assignee && board && assigner) {
          await emailService.sendCardAssignmentEmail(
            assignee.email,
            assignee.first_name || assignee.email,
            card.title,
            board.title,
            assigner.first_name || assigner.email
          );
        }
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
        // Don't fail the request if email fails
      }
    }

    await t.commit();
    if (req.socketId && !isPositionOnlyUpdate) {
      await releaseLock(card.id, req.socketId);
    }

    if (req.io) {
      const eventName = column_id && column_id !== old_values.column_id ? 'cardMoved' : 'cardUpdated';
      console.log(`🔄 Emitting ${eventName} event to board:${column.board_id}:`, card.toJSON());
      req.io.to(`board:${column.board_id}`).emit(eventName, card);
      
      // Also emit the card:moved event for consistency
      if (eventName === 'cardMoved') {
        req.io.to(`board:${column.board_id}`).emit('card:moved', {
          cardId: card.id,
          newColumnId: card.column_id,
          newPosition: card.position
        });
      }
    }

    res.json(card);
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    if (req.socketId && !isPositionOnlyUpdate) {
      await releaseLock(req.params.id, req.socketId);
    }
    
    // SIMPLE APPROACH: Handle conflicts gracefully
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('Position conflict - handled gracefully');
      return res.status(409).json({ error: 'Position conflict - retry the move' });
    }
    
    next(err);
  }
};

exports.deleteCard = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const card = await Card.findByPk(req.params.id, { transaction: t });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const column = await Column.findByPk(card.column_id, { transaction: t });
    if (!column) return res.status(404).json({ error: 'Column not found' });

    if (!(await hasBoardPermission(req.user.id, column.board_id, ['owner','admin']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const lockAcquired = await acquireLock(card.id, req.socketId);
    if (!lockAcquired) return res.status(423).json({ error: 'Card is being updated by someone else. Try again.' });

    const old_values = card.toJSON();
    await card.destroy({ transaction: t });

    await AuditLog.create({
      board_id: column.board_id,
      user_id: req.user.id,
      entity_type: 'card',
      entity_id: card.id,
      action: 'CardDeleted',
      old_values
    }, { transaction: t });

    await t.commit();
    
    if (req.socketId) {
      await releaseLock(card.id, req.socketId);
    }

    if (req.io) {
      try {
        console.log(`🗑️ Emitting cardDeleted event to board:${column.board_id}:`, { id: card.id });
        req.io.to(`board:${column.board_id}`).emit('cardDeleted', { id: card.id });
      } catch (emitError) {
        console.error('Failed to emit board update:', emitError);
      }
    }

    res.json({ message: 'Card deleted' });
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    if (req.socketId) {
      await releaseLock(req.params.id, req.socketId);
    }
    next(err);
  }
};

exports.getCard = async (req, res, next) => {
  try {
    const card = await Card.findByPk(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const column = await Column.findByPk(card.column_id);
    if (!column) return res.status(404).json({ error: 'Column not found' });

    if (!(await hasBoardPermission(req.user.id, column.board_id, ['owner','admin','editor','viewer']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.getCardsByBoard = async (req, res, next) => {
  try {
    const boardId = req.params.boardId;
    console.log(`User ${req.user.id} trying to access cards for board ${boardId}`);
    
    const hasPermission = await hasBoardPermission(req.user.id, boardId, ['owner','admin','editor','viewer']);
    console.log(`User ${req.user.id} has permission for board ${boardId}:`, hasPermission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const columns = await Column.findAll({ 
      where: { board_id: boardId },
      order: [['position', 'ASC']]
    });

    const columnIds = columns.map(col => col.id);
    const cards = await Card.findAll({
      where: { column_id: columnIds },
      order: [['position', 'ASC']]
    });

    res.json(cards);
  } catch (err) {
    next(err);
  }
};