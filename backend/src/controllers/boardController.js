const {
  Board,
  BoardMember,
  User,
  Column,
  Label,
  Card,
  Comment,
  AuditLog,
  Notification
} = require('../db/associations');

const sequelize = require('../db/db');
const emailService = require('../services/emailService');
const { redis, acquireLock, releaseLock } = require('../services/redisClient');

const POSITION_GAP = 1000n;

/* -------------------- HELPERS -------------------- */
function getGapPosition(prevPos, nextPos) {
  if (prevPos == null && nextPos == null) return Number(POSITION_GAP);
  if (prevPos == null) return Number(BigInt(nextPos) - POSITION_GAP);
  if (nextPos == null) return Number(BigInt(prevPos) + POSITION_GAP);
  return Number((BigInt(prevPos) + BigInt(nextPos)) / 2n);
}

async function hasBoardPermission(userId, boardId, roles = ['owner', 'admin', 'editor']) {
  const membership = await BoardMember.findOne({ where: { user_id: userId, board_id: boardId } });
  console.log(`Checking permission for user ${userId} on board ${boardId}:`, membership ? `role: ${membership.role}` : 'no membership found');
  return membership && roles.includes(membership.role);
}

async function validateAssignee(assignee_id) {
  if (!assignee_id) return true;
  const user = await User.findByPk(assignee_id);
  return user && !user.is_deleted && user.is_active;
}

/* -------------------- BOARD CONTROLLER -------------------- */
exports.createBoard = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, is_public, background_color } = req.body;
    const owner_id = req.user.id;

    const board = await Board.create(
      { title, description, is_public, background_color, owner_id },
      { transaction: t }
    );

    await BoardMember.create(
      { board_id: board.id, user_id: owner_id, role: 'owner' },
      { transaction: t }
    );

    const defaultColumns = [
      { title: 'To Do', position: 1, board_id: board.id },
      { title: 'In Progress', position: 2, board_id: board.id },
      { title: 'Done', position: 3, board_id: board.id }
    ];

    await Column.bulkCreate(defaultColumns, { transaction: t });

    await t.commit();

    try {
      req.io.to(`user:${owner_id}`).emit('boardCreated', board);
      console.log(`📋 Emitting boardCreated event to user:${owner_id}:`, board.toJSON());
    } catch (emitError) {
      console.error('Failed to emit board created event:', emitError);
    }

    res.status(201).json(board);
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    next(err);
  }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id, { include: [{ model: Column }] });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!(await hasBoardPermission(req.user.id, req.params.id, ['owner', 'admin', 'editor', 'viewer']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const membership = await BoardMember.findOne({
      where: { board_id: req.params.id, user_id: req.user.id }
    });

    const boardData = board.toJSON();
    boardData.userRole = membership ? membership.role : 'viewer';

    res.json(boardData);
  } catch (err) {
    next(err);
  }
};

exports.getBoards = async (req, res, next) => {
  try {
    const memberships = await BoardMember.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Board }]
    });

    const boards = memberships.map(m => m.Board);
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

exports.getBoardMembers = async (req, res, next) => {
  try {
    const { id: boardId } = req.params;
    
    console.log(`Getting members for board ${boardId} by user ${req.user.id}`);
    
    const board = await Board.findByPk(boardId);
    if (!board) {
      console.log('Board not found');
      return res.status(404).json({ error: 'Board not found' });
    }
    console.log('Board found:', board.title);

    console.log('Checking permissions...');
    const hasPermission = await hasBoardPermission(req.user.id, boardId, ['owner', 'admin', 'editor', 'viewer']);
    console.log('Has permission:', hasPermission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('Querying board_members table...');
    const boardMembers = await BoardMember.findAll({
      where: { board_id: boardId }
    });
    console.log(`Found ${boardMembers.length} board members`);

    if (boardMembers.length === 0) {
      console.log('No board members found, checking if user is owner...');
      if (board.owner_id === req.user.id) {
        console.log('User is owner, creating board member record...');
        const ownerMember = await BoardMember.create({
          board_id: boardId,
          user_id: req.user.id,
          role: 'owner'
        });
        boardMembers.push(ownerMember);
        console.log('Created owner board member record');
      }
    }

    // Step 4: Get user details for each member
    const members = [];
    for (const bm of boardMembers) {
      try {
        const user = await User.scope('withDeleted').findByPk(bm.user_id);
        members.push({
          id: bm.id,
          user_id: bm.user_id,
          role: bm.role,
          joined_at: bm.joined_at,
          User: user ? {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_deleted: user.is_deleted
          } : null
        });
      } catch (userErr) {
        console.error(`Error fetching user ${bm.user_id}:`, userErr);
        members.push({
          id: bm.id,
          user_id: bm.user_id,
          role: bm.role,
          joined_at: bm.joined_at,
          User: null
        });
      }
    }

    console.log(`Final result: ${members.length} members`);
    res.json(members);
  } catch (err) {
    console.error('Error in getBoardMembers:', err);
    console.error('Error stack:', err.stack);
    next(err);
  }
};

exports.getUserRole = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    console.log(`Getting role for user ${userId} on board ${boardId}`);
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const membership = await BoardMember.findOne({
      where: { board_id: boardId, user_id: userId }
    });

    console.log('Membership found:', membership ? membership.role : 'none');

    if (!membership) {
      return res.status(404).json({ error: 'User is not a member of this board' });
    }

    res.json({ role: membership.role });
  } catch (err) {
    console.error('Error in getUserRole:', err);
    console.error('Error stack:', err.stack);
    next(err);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!(await hasBoardPermission(req.user.id, req.params.id, ['owner', 'admin']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await board.update(req.body);
    res.json(board);
  } catch (err) {
    next(err);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!(await hasBoardPermission(req.user.id, req.params.id, ['owner']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await board.destroy();
    res.json({ message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { boardId } = req.params;
    const { user_id, role } = req.body;

    const board = await Board.findByPk(boardId, { transaction: t });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!(await hasBoardPermission(req.user.id, boardId, ['owner']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const user = await User.findByPk(user_id, { transaction: t });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const member = await BoardMember.create({ board_id: boardId, user_id, role }, { transaction: t });
    await t.commit();

    try {
      req.io.to(`board:${boardId}`).emit('memberAdded', member);
      console.log(`👥 Emitting memberAdded event to board:${boardId}:`, member.toJSON());
    } catch (emitError) {
      console.error('Failed to emit member added event:', emitError);
    }

    // Send email notification for board invitation
    try {
      const inviter = await User.findByPk(req.user.id);
      if (user && board && inviter) {
        await emailService.sendBoardInvitationEmail(
          user.email,
          user.firstname || user.email,
          board.title,
          inviter.firstname || inviter.email,
          role
        );
      }
    } catch (emailError) {
      console.error('Failed to send board invitation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json(member);
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    next(err);
  }
};

exports.updateMemberRole = async (req, res, next) => {
  const { boardId, userId } = req.params;
  try {
    console.log(`[updateMemberRole] Updating role for user ${userId} on board ${boardId}`);
    console.log(`[updateMemberRole] New role: ${req.body.role}`);
    console.log(`[updateMemberRole] Requesting user: ${req.user.id}`);
    
    if (!(await hasBoardPermission(req.user.id, boardId, ['owner']))) {
      console.log('[updateMemberRole] Insufficient permissions');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const member = await BoardMember.findOne({ where: { board_id: boardId, user_id: userId } });
    if (!member) {
      console.log('[updateMemberRole] Member not found');
      return res.status(404).json({ error: 'Member not found' });
    }

    console.log(`[updateMemberRole] Found member with current role: ${member.role}`);
    await member.update({ role: req.body.role });
    console.log(`[updateMemberRole] Updated member role to: ${req.body.role}`);
    
    // Only emit if req.io exists (WebSocket context)
    if (req.io) {
      req.io.to(`board:${boardId}`).emit('memberUpdated', member);
      console.log(`👥 Emitting memberUpdated event to board:${boardId}:`, member.toJSON());
    }
    
    res.json(member);
  } catch (err) {
    console.error('[updateMemberRole] Error:', err);
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  const { boardId, userId } = req.params;
  try {
    console.log(`[removeMember] Removing user ${userId} from board ${boardId}`);
    console.log(`[removeMember] Requesting user: ${req.user.id}`);
    
    if (!(await hasBoardPermission(req.user.id, boardId, ['owner']))) {
      console.log('[removeMember] Insufficient permissions');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const member = await BoardMember.findOne({ where: { board_id: boardId, user_id: userId } });
    if (!member) {
      console.log('[removeMember] Member not found');
      return res.status(404).json({ error: 'Member not found' });
    }

    console.log(`[removeMember] Found member with role: ${member.role}`);
    await member.destroy();
    console.log('[removeMember] Member removed successfully');
    
    // Only emit if req.io exists (WebSocket context)
    if (req.io) {
      req.io.to(`board:${boardId}`).emit('memberRemoved', { userId });
      console.log(`👥 Emitting memberRemoved event to board:${boardId}:`, { userId });
    }
    
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('[removeMember] Error:', err);
    next(err);
  }
};

exports.exportBoard = async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [
        { model: Column, include: [{ model: Card }] },
        { model: BoardMember }
      ]
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (!(await hasBoardPermission(req.user.id, req.params.id, ['owner', 'admin', 'editor', 'viewer']))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const exportData = {
      title: board.title,
      description: board.description,
      background_color: board.background_color,
      is_public: board.is_public,
      columns: board.Columns.map(column => ({
        title: column.title,
        position: column.position,
        cards: column.Cards.map(card => ({
          title: card.title,
          description: card.description,
          position: card.position,
          due_date: card.due_date
        }))
      }))
    };

    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
};

exports.importBoard = async (req, res) => {
  try {
    const { title, description, background_color, is_public, columns } = req.body;
    const owner_id = req.user.id;

    const board = await Board.create({ title, description, background_color, is_public, owner_id });

    await BoardMember.create({ board_id: board.id, user_id: owner_id, role: 'owner' });

    for (const columnData of columns) {
      const column = await Column.create({
        title: columnData.title,
        position: columnData.position,
        board_id: board.id
      });

      for (const cardData of columnData.cards) {
        await Card.create({
          title: cardData.title,
          description: cardData.description,
          position: cardData.position,
          due_date: cardData.due_date,
          column_id: column.id
        });
      }
    }

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: 'Import failed' });
  }
};

// Debug endpoint to join a board
exports.joinBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;
    
    // Check if board exists
    const board = await Board.findByPk(boardId);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    
    // Check if user is already a member
    const existingMembership = await BoardMember.findOne({
      where: { user_id: userId, board_id: boardId }
    });
    
    if (existingMembership) {
      return res.json({ 
        message: 'Already a member', 
        role: existingMembership.role,
        alreadyMember: true 
      });
    }
    
    // Add user as a viewer
    const membership = await BoardMember.create({
      board_id: boardId,
      user_id: userId,
      role: 'viewer'
    });
    
    console.log(`User ${userId} joined board ${boardId} as ${membership.role}`);
    res.json({ message: 'Successfully joined board', role: membership.role });
  } catch (err) {
    next(err);
  }
};