// src/middlewares/checkBoardRole.js
const { BoardMember, Column, Card } = require('../db/associations');

function checkBoardRole(requiredRoles = []) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // from authMiddleware
      let boardId = req.params.boardId || req.body.board_id;

      // If we have column_id instead of board_id, get board_id from column
      if (!boardId && req.body.column_id) {
        const column = await Column.findByPk(req.body.column_id);
        if (!column) return res.status(404).json({ error: 'Column not found' });
        boardId = column.board_id;
      }

      // If we have card ID (for PUT/DELETE operations), get board_id from card
      if (!boardId && req.params.id && (req.method === 'PUT' || req.method === 'DELETE')) {
        console.log(`[checkBoardRole] Looking up card ${req.params.id} for ${req.method} operation`);
        const card = await Card.findByPk(req.params.id);
        if (!card) {
          console.log(`[checkBoardRole] Card ${req.params.id} not found`);
          return res.status(404).json({ error: 'Card not found' });
        }
        console.log(`[checkBoardRole] Found card, column_id: ${card.column_id}`);
        const column = await Column.findByPk(card.column_id);
        if (!column) {
          console.log(`[checkBoardRole] Column ${card.column_id} not found`);
          return res.status(404).json({ error: 'Column not found' });
        }
        boardId = column.board_id;
        console.log(`[checkBoardRole] Found board_id: ${boardId}`);
      }

      if (!boardId) return res.status(400).json({ error: 'Board ID missing' });

      const membership = await BoardMember.findOne({ where: { user_id: userId, board_id: boardId } });
      if (!membership) return res.status(403).json({ error: 'Not a member of this board' });

      if (!requiredRoles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.boardRole = membership.role; // attach role to request
      req.boardId = boardId; // attach boardId to request for use in controllers
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = checkBoardRole;
