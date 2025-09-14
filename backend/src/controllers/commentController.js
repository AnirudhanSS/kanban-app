const { Comment, Card, User, Column, BoardMember } = require('../db/associations');
const sequelize = require('../db/db');

// Get all comments for a card
exports.getComments = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    // Verify card exists and user has access
    const card = await Card.findByPk(cardId, {
      include: [{
        model: Column,
        include: [{
          model: require('../db/associations').Board
        }]
      }]
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user is a member of the board
    const membership = await BoardMember.findOne({
      where: { user_id: req.user.id, board_id: card.Column.Board.id }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get comments with user information
    const comments = await Comment.findAll({
      where: { card_id: cardId },
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Add a new comment
exports.addComment = async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { cardId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Verify card exists and user has access
    const card = await Card.findByPk(cardId, {
      include: [{
        model: Column,
        include: [{
          model: require('../db/associations').Board
        }]
      }]
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user is a member of the board
    const membership = await BoardMember.findOne({
      where: { user_id: req.user.id, board_id: card.Column.Board.id }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create the comment
    const comment = await Comment.create({
      card_id: cardId,
      user_id: req.user.id,
      content: content.trim(),
      parent_comment_id: parentCommentId || null
    }, { transaction: t });

    // Load comment with user information
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email']
      }],
      transaction: t
    });

    // Create audit log
    await require('../db/associations').AuditLog.create({
      board_id: card.Column.Board.id,
      user_id: req.user.id,
      entity_type: 'comment',
      entity_id: comment.id,
      action: 'create',
      old_values: null,
      new_values: comment.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }, { transaction: t });

    // Handle @mentions and send email notifications
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    let match;
    const mentionedUsers = new Set();
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1].toLowerCase();
      const mentionedUser = await User.findOne({ where: { username } });
      if (!mentionedUser) continue;

      const isMember = await BoardMember.findOne({ 
        where: { user_id: mentionedUser.id, board_id: card.Column.Board.id } 
      });
      if (!isMember) continue;

      mentionedUsers.add(mentionedUser);
    }

    // Send email notifications for mentions
    for (const mentionedUser of mentionedUsers) {
      try {
        const commenter = await User.findByPk(req.user.id);
        if (commenter && mentionedUser.id !== req.user.id) {
          await require('../services/emailService').sendMentionEmail(
            mentionedUser.email,
            mentionedUser.first_name || mentionedUser.email,
            card.title || 'Untitled Card',
            card.Column.Board.title,
            commenter.first_name || commenter.email,
            content.trim()
          );
        }
      } catch (emailError) {
        console.error('Failed to send mention email:', emailError);
        // Don't fail the request if email fails
      }
    }

    await t.commit();

    // Emit real-time update
    if (req.io) {
      req.io.to(`board:${card.Column.Board.id}`).emit('comment:added', commentWithUser);
      
      // Emit mention notifications
      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser.id !== req.user.id) {
          req.io.to(`user:${mentionedUser.id}`).emit('mention:added', {
            commentId: comment.id,
            cardId: cardId,
            fromUserId: req.user.id,
            content: content.trim()
          });
        }
      }
    }

    res.status(201).json(commentWithUser);
  } catch (error) {
    await t.rollback();
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Update a comment - DISABLED
// exports.updateComment = async (req, res, next) => {
//   // Comment update functionality has been disabled
//   res.status(501).json({ error: 'Comment update feature is not available' });
// };

// Delete a comment
exports.deleteComment = async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findByPk(commentId, {
      include: [{
        model: Card,
        include: [{
          model: Column,
          include: [{
            model: require('../db/associations').Board
          }]
        }]
      }]
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the author or has admin/owner role
    const membership = await BoardMember.findOne({
      where: { 
        user_id: req.user.id, 
        board_id: comment.Card.Column.Board.id 
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isAuthor = comment.user_id === req.user.id;
    const isAdmin = ['owner', 'admin'].includes(membership.role);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    const oldValues = comment.toJSON();

    // Delete the comment
    await comment.destroy({ transaction: t });

    // Create audit log
    await require('../db/associations').AuditLog.create({
      board_id: comment.Card.Column.Board.id,
      user_id: req.user.id,
      entity_type: 'comment',
      entity_id: comment.id,
      action: 'delete',
      old_values,
      new_values: null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }, { transaction: t });

    await t.commit();

    // Emit real-time update
    if (req.io) {
      req.io.to(`board:${comment.Card.Column.Board.id}`).emit('comment:deleted', { commentId });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
