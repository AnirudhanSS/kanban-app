// src/controllers/columnController.js
const { Column, Board, BoardMember, AuditLog } = require('../db/associations');
const sequelize = require('../db/db');

async function hasBoardPermission(userId, boardId, roles = ['owner','admin','editor']) {
  const membership = await BoardMember.findOne({ where: { user_id: userId, board_id: boardId } });
  return membership && roles.includes(membership.role);
}

exports.createColumn = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { board_id, title, position, color, card_limit } = req.body;

    const board = await Board.findByPk(board_id);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // only owner/admin/editor can create columns
    if (!(await hasBoardPermission(req.user.id, board_id))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const column = await Column.create({ board_id, title, position, color, card_limit }, { transaction: t });

    await AuditLog.create({
      board_id,
      user_id: req.user.id,
      entity_type: 'column',
      entity_id: column.id,
      action: 'ColumnCreated',
      new_values: column.toJSON()
    }, { transaction: t });

    await t.commit();
    
    // Emit real-time update
    if (req.io) {
      try {
        req.io.to(`board:${board_id}`).emit('columnCreated', column);
        console.log(`📋 Emitting columnCreated event to board:${board_id}:`, column.toJSON());
      } catch (emitError) {
        console.error('Failed to emit column created event:', emitError);
      }
    }
    
    res.status(201).json(column);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.updateColumn = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const column = await Column.findByPk(req.params.id, { transaction: t });
    if (!column) return res.status(404).json({ error: 'Column not found' });

    if (!(await hasBoardPermission(req.user.id, column.board_id))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const old_values = column.toJSON();
    await column.update(req.body, { transaction: t });

    await AuditLog.create({
      board_id: column.board_id,
      user_id: req.user.id,
      entity_type: 'column',
      entity_id: column.id,
      action: 'ColumnUpdated',
      old_values,
      new_values: column.toJSON()
    }, { transaction: t });

    await t.commit();
    
    // Emit real-time update
    if (req.io) {
      try {
        req.io.to(`board:${column.board_id}`).emit('columnUpdated', column);
        console.log(`📋 Emitting columnUpdated event to board:${column.board_id}:`, column.toJSON());
      } catch (emitError) {
        console.error('Failed to emit column updated event:', emitError);
      }
    }
    
    res.json(column);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.reorderColumns = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { columnIds } = req.body; // Array of column IDs in new order
    
    if (!Array.isArray(columnIds) || columnIds.length === 0) {
      return res.status(400).json({ error: 'columnIds must be a non-empty array' });
    }

    // Get all columns to verify they exist and get board_id
    const columns = await Column.findAll({
      where: { id: columnIds },
      transaction: t
    });

    if (columns.length !== columnIds.length) {
      return res.status(400).json({ error: 'Some columns not found' });
    }

    const boardId = columns[0].board_id;
    
    // Check permissions
    if (!(await hasBoardPermission(req.user.id, boardId, ['owner','admin','editor']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update positions using simple sequential approach
    const updates = [];
    for (let i = 0; i < columnIds.length; i++) {
      const newPosition = i + 1; // Simple sequential positioning (1, 2, 3...)
      updates.push(
        Column.update(
          { position: newPosition },
          { where: { id: columnIds[i] }, transaction: t }
        )
      );
    }

    await Promise.all(updates);

    await AuditLog.create({
      board_id: boardId,
      user_id: req.user.id,
      entity_type: 'board',
      entity_id: boardId,
      action: 'ColumnsReordered',
      new_values: { columnIds, positions: columnIds.map((_, i) => i + 1) }
    }, { transaction: t });

    await t.commit();
    
    // Emit real-time update
    if (req.io) {
      try {
        req.io.to(`board:${boardId}`).emit('columnsReordered', { columnIds });
        console.log(`🔄 Emitting columnsReordered event to board:${boardId}:`, columnIds);
      } catch (emitError) {
        console.error('Failed to emit columns reordered event:', emitError);
      }
    }
    
    res.json({ message: 'Columns reordered successfully', columnIds });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.deleteColumn = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const column = await Column.findByPk(req.params.id, { transaction: t });
    if (!column) return res.status(404).json({ error: 'Column not found' });

    if (!(await hasBoardPermission(req.user.id, column.board_id))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const old_values = column.toJSON();
    await column.update({ is_archived: true }, { transaction: t });

    await AuditLog.create({
      board_id: column.board_id,
      user_id: req.user.id,
      entity_type: 'column',
      entity_id: column.id,
      action: 'ColumnArchived',
      old_values,
      new_values: column.toJSON()
    }, { transaction: t });

    await t.commit();
    
    // Emit real-time update
    if (req.io) {
      try {
        req.io.to(`board:${column.board_id}`).emit('columnDeleted', { id: column.id, board_id: column.board_id });
        console.log(`📋 Emitting columnDeleted event to board:${column.board_id}:`, { id: column.id });
      } catch (emitError) {
        console.error('Failed to emit column deleted event:', emitError);
      }
    }
    
    res.json({ message: 'Column archived' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
