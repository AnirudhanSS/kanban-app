// src/middlewares/checkAdmin.js
const { BoardMember } = require('../db/associations');

async function checkAdmin(req, res, next) {
  try {
    const user = req.user; // set by authMiddleware
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // pseudo: consider owner/admin globally, or just for all boards
    // simplest: check if user is an owner/admin in any board
    const membership = await BoardMember.findOne({
      where: { user_id: user.id, role: ['owner','admin'] },
    });

    if (!membership) return res.status(403).json({ error: 'Insufficient permissions' });

    req.adminRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkAdmin;
