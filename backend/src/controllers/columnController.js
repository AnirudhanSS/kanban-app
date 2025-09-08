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
