// src/controllers/adminController.js
const Board = require('../db/models/Board');
const BoardMember = require('../db/models/BoardMember');
const AuditLog = require('../db/models/AuditLog');
const User = require('../db/models/User');
const { getOnline } = require('../services/redisClient');

exports.listBoards = async (req, res) => {
  try {
    const boards = await Board.findAll({
      include: [{
        model: BoardMember,
        include: [{ model: User, attributes: ['id', 'name', 'email', 'username'] }],
      }],
    });

    // Map boards to include members with roles
    const mapped = boards.map(board => ({
      id: board.id,
      name: board.name,
      members: board.BoardMembers.map(m => ({
        id: m.User.id,
        name: m.User.name,
        email: m.User.email,
        username: m.User.username,
        role: m.role,
      })),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('listBoards failed', err);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
};

exports.listMembers = async (req, res) => {
  try {
    const members = await BoardMember.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'username'] }],
    });

    // Map with online status
    const onlineUserIds = await getOnline();

    const mapped = members.map(m => ({
      boardId: m.board_id,
      userId: m.user_id,
      role: m.role,
      name: m.User.name,
      email: m.User.email,
      username: m.User.username,
      online: onlineUserIds.includes(String(m.user_id)), // cast to string just in case
    }));

    res.json(mapped);
  } catch (err) {
    console.error('listMembers failed', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

exports.listAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['created_at', 'DESC']] });
    res.json(logs);
  } catch (err) {
    console.error('listAuditLogs failed', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

exports.listActiveUsers = async (req, res) => {
  try {
    const onlineUserIds = await getOnline();
    if (!onlineUserIds.length) return res.json([]);

    const users = await User.findAll({
      where: { id: onlineUserIds },
      attributes: ['id', 'name', 'email', 'username'],
    });

    res.json(users.map(u => ({ ...u.toJSON(), online: true })));
  } catch (err) {
    console.error('listActiveUsers failed', err);
    res.status(500).json({ error: 'Failed to fetch active users' });
  }
};
