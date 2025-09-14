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
        include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }],
      }],
    });

    // Map boards to include members with roles
    const mapped = boards.map(board => ({
      id: board.id,
      name: board.title,
      members: board.BoardMembers.map(m => ({
        id: m.User.id,
        name: `${m.User.first_name} ${m.User.last_name || ''}`.trim(),
        email: m.User.email,
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
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }],
    });

    // Map with online status
    const onlineUserIds = await getOnline();

    const mapped = members.map(m => ({
      boardId: m.board_id,
      userId: m.user_id,
      role: m.role,
      name: `${m.User.first_name} ${m.User.last_name || ''}`.trim(),
      email: m.User.email,
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
      attributes: ['id', 'first_name', 'last_name', 'email'],
    });

    res.json(users.map(u => ({ ...u.toJSON(), online: true })));
  } catch (err) {
    console.error('listActiveUsers failed', err);
    res.status(500).json({ error: 'Failed to fetch active users' });
  }
};

// Board-specific admin endpoints
exports.getBoardMembers = async (req, res) => {
  try {
    const { boardId } = req.params;
    
    // Check if user has admin/owner access to this board
    const membership = await BoardMember.findOne({
      where: { user_id: req.user.id, board_id: boardId, role: ['owner', 'admin'] }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await BoardMember.findAll({
      where: { board_id: boardId },
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }],
    });

    // Map with online status
    const onlineUserIds = await getOnline(boardId);

    const mapped = members.map(m => ({
      id: m.User.id,
      name: `${m.User.first_name} ${m.User.last_name || ''}`.trim(),
      email: m.User.email,
      role: m.role,
      online: onlineUserIds.includes(String(m.User.id)),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('getBoardMembers failed', err);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
};

exports.getBoardAuditLogs = async (req, res) => {
  try {
    const { boardId } = req.params;
    
    // Check if user has admin/owner access to this board
    const membership = await BoardMember.findOne({
      where: { user_id: req.user.id, board_id: boardId, role: ['owner', 'admin'] }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = await AuditLog.findAll({ 
      where: { board_id: boardId },
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 100 // Limit to recent 100 activities
    });

    res.json(logs);
  } catch (err) {
    console.error('getBoardAuditLogs failed', err);
    res.status(500).json({ error: 'Failed to fetch board audit logs' });
  }
};

exports.getBoardStats = async (req, res) => {
  try {
    const { boardId } = req.params;
    
    // Check if user has admin/owner access to this board
    const membership = await BoardMember.findOne({
      where: { user_id: req.user.id, board_id: boardId, role: ['owner', 'admin'] }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get board info
    const board = await Board.findByPk(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Get member count
    const memberCount = await BoardMember.count({ where: { board_id: boardId } });

    // Get online users for this board
    const onlineUserIds = await getOnline();
    const onlineCount = onlineUserIds.length;

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivityCount = await AuditLog.count({
      where: { 
        board_id: boardId,
        created_at: { [require('sequelize').Op.gte]: sevenDaysAgo }
      }
    });

    res.json({
      boardName: board.title,
      totalMembers: memberCount,
      onlineMembers: onlineCount,
      recentActivity: recentActivityCount
    });
  } catch (err) {
    console.error('getBoardStats failed', err);
    res.status(500).json({ error: 'Failed to fetch board stats' });
  }
};
