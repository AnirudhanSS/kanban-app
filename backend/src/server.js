const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const sequelize = require("./db/db");
require("dotenv").config();
require("./db/associations");

const { addPresence, removePresence, getOnline, acquireLock, releaseLock } = require("./services/redisClient");
const socketAuth = require("./services/socketAuth");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" },
});

// Make io available to routes
app.set('io', io);

io.use(socketAuth);

sequelize.authenticate()
  .then(() => console.log("Postgres ✅ connected"))
  .catch(err => console.error("Postgres ❌ connection failed", err));

io.on("connection", (socket) => {
  const user = socket.user;
  socket.locks = new Map();

  socket.join(`user:${user.id}`);
  socket.on("joinBoard", async (boardId) => {
    socket.join(`board:${boardId}`);
    await addPresence(boardId, user.id, socket.id);
    const online = await getOnline(boardId);
    io.to(`board:${boardId}`).emit("presence:update", online);
  });

  socket.on("leaveBoard", async (boardId) => {
    socket.leave(`board:${boardId}`);
    await removePresence(socket.id);
    const online = await getOnline(boardId);
    io.to(`board:${boardId}`).emit("presence:update", online);
  });

  socket.on("updateCard", async (data) => handleCardUpdate(socket, data));
  socket.on("cardMoved", async (data) => handleCardMove(socket, data));
  socket.on("addComment", async (data) => handleAddComment(socket, data));
  
  // Visual feedback events
  socket.on("card:edit_start", async (data) => handleCardEditStart(socket, data));
  socket.on("card:edit_end", async (data) => handleCardEditEnd(socket, data));
  socket.on("card:move_start", async (data) => handleCardMoveStart(socket, data));
  socket.on("card:move_end", async (data) => handleCardMoveEnd(socket, data));
  socket.on("disconnect", async () => {
    try {
      await removePresence(socket.id);
      for (const [key, owner] of socket.locks) {
        await releaseLock(key, owner);
      }
      socket.locks.clear();
    } catch (err) {
      console.error("Disconnect cleanup failed", err);
    }
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000} 🚀`);
});

const { Card, Column, BoardMember, Comment, User, AuditLog } = require("./db/associations");

async function handleCardUpdate(socket, data) {
  const { boardId, cardId, ...fields } = data;
  const lockKey = `card:${cardId}`;
  const lockOwner = socket.id;

  try {
    const gotLock = await acquireLock(lockKey, lockOwner, 5);
    if (!gotLock) return socket.emit("error", "Card is being edited by another user");

    socket.locks.set(lockKey, lockOwner);

    const membership = await BoardMember.findOne({ where: { user_id: socket.user.id, board_id: boardId } });
    if (!membership || !["owner","admin","editor"].includes(membership.role)) {
      return socket.emit("error", "Insufficient permissions");
    }

    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");

    const oldValues = card.toJSON();
    const allowedFields = ["title","description","assignee_id","reporter_id","due_date","priority","position","column_id","estimated_hours","actual_hours","is_archived"];
    allowedFields.forEach(f => { if (fields[f] !== undefined) card[f] = fields[f]; });

    card.version = (card.version || 0) + 1;
    await card.save();

    await AuditLog.create({
      board_id: boardId,
      user_id: socket.user.id,
      entity_type: "card",
      entity_id: card.id,
      action: "update",
      old_values: oldValues,
      new_values: card.toJSON(),
      ip_address: socket.handshake.address,
      user_agent: socket.handshake.headers["user-agent"]
    });

    console.log(`🔄 Emitting card:updated event to board:${boardId}:`, card.toJSON());
    socket.to(`board:${boardId}`).emit("card:updated", card);

  } catch (err) {
    console.error("updateCard failed", err);
    socket.emit("error", "Failed to update card: " + err.message);
  } finally {
    if (socket.locks.has(lockKey)) {
      await releaseLock(lockKey, socket.locks.get(lockKey));
      socket.locks.delete(lockKey);
    }
  }
}

async function handleCardMove(socket, data) {
  const { boardId, cardId, newColumnId, newPosition } = data;
  const lockKey = `card:${cardId}`;
  const lockOwner = socket.id;

  try {
    const gotLock = await acquireLock(lockKey, lockOwner, 5);
    if (!gotLock) return socket.emit("error", "Card is being edited by another user");

    socket.locks.set(lockKey, lockOwner);

    const membership = await BoardMember.findOne({ where: { user_id: socket.user.id, board_id: boardId } });
    if (!membership || !["owner","admin","editor"].includes(membership.role)) {
      return socket.emit("error", "Insufficient permissions");
    }

    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");

    const oldValues = card.toJSON();
    
    // Update card position and column
    card.column_id = newColumnId;
    card.position = Math.floor(newPosition) || card.position; // Ensure position is always an integer
    card.version = (card.version || 0) + 1;
    
    await card.save();

    await AuditLog.create({
      board_id: boardId,
      user_id: socket.user.id,
      entity_type: "card",
      entity_id: card.id,
      action: "move",
      old_values: oldValues,
      new_values: card.toJSON(),
      ip_address: socket.handshake.address,
      user_agent: socket.handshake.headers["user-agent"]
    });

    // Emit to all users in the board (including the sender)
    const moveEvent = {
      cardId: card.id,
      newColumnId: card.column_id,
      newPosition: card.position,
      movedBy: socket.user.id,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📦 Emitting card:moved event to board:${boardId}:`, moveEvent);
    io.to(`board:${boardId}`).emit("card:moved", moveEvent);

  } catch (err) {
    console.error("cardMoved failed", err);
    socket.emit("error", "Failed to move card: " + err.message);
  } finally {
    if (socket.locks.has(lockKey)) {
      await releaseLock(lockKey, socket.locks.get(lockKey));
      socket.locks.delete(lockKey);
    }
  }
}

async function handleAddComment(socket, data) {
  const { cardId, content, parentCommentId } = data;
  const lockKey = `card:${cardId}`;
  const lockOwner = socket.id;

  try {
    const gotLock = await acquireLock(lockKey, lockOwner, 5);
    if (!gotLock) return socket.emit("error", "Card is being edited by another user");

    socket.locks.set(lockKey, lockOwner);

    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");

    const column = await Column.findByPk(card.column_id);
    if (!column) return socket.emit("error", "Column not found");
    const boardId = column.board_id;

    const membership = await BoardMember.findOne({ where: { user_id: socket.user.id, board_id: boardId } });
    if (!membership) return socket.emit("error", "Not a member of this board");

    const comment = await Comment.create({
      card_id: cardId,
      user_id: socket.user.id,
      content,
      parent_comment_id: parentCommentId || null
    });

    await AuditLog.create({
      board_id: boardId,
      user_id: socket.user.id,
      entity_type: "comment",
      entity_id: comment.id,
      action: "create",
      old_values: null,
      new_values: comment.toJSON(),
      ip_address: socket.handshake.address,
      user_agent: socket.handshake.headers["user-agent"]
    });

    // Mentions
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    let match;
    const mentionedUsers = new Set();
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1].toLowerCase();
      const mentionedUser = await User.findOne({ where: { username } });
      if (!mentionedUser) continue;

      const isMember = await BoardMember.findOne({ where: { user_id: mentionedUser.id, board_id: boardId } });
      if (!isMember) continue;

      mentionedUsers.add(mentionedUser);
    }

    // Send email notifications for mentions
    for (const mentionedUser of mentionedUsers) {
      try {
        const commenter = await User.findByPk(socket.user.id);
        if (commenter && mentionedUser.id !== socket.user.id) {
          await require('./services/emailService').sendMentionEmail(
            mentionedUser.email,
            mentionedUser.first_name || mentionedUser.email,
            card.title || 'Untitled Card',
            column.title || 'Board',
            commenter.first_name || commenter.email,
            content
          );
        }
      } catch (emailError) {
        console.error('Failed to send mention email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Emit mention notifications
    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser.id !== socket.user.id) {
        socket.to(`user:${mentionedUser.id}`).emit("mention:added", {
          commentId: comment.id,
          cardId,
          fromUserId: socket.user.id,
          content
        });
      }
    }

    socket.to(`board:${boardId}`).emit("comment:added", comment);

  } catch (err) {
    console.error("addComment failed", err);
    socket.emit("error", "Failed to add comment: " + err.message);
  } finally {
    if (socket.locks.has(lockKey)) {
      await releaseLock(lockKey, socket.locks.get(lockKey));
      socket.locks.delete(lockKey);
    }
  }
}

// Visual feedback handlers
async function handleCardEditStart(socket, data) {
  const { cardId, boardId, field } = data;
  
  try {
    // Get card to verify it exists and user has permission
    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");
    
    const column = await Column.findByPk(card.column_id);
    if (!column) return socket.emit("error", "Column not found");
    
    const membership = await BoardMember.findOne({ 
      where: { user_id: socket.user.id, board_id: column.board_id } 
    });
    if (!membership || !["owner","admin","editor"].includes(membership.role)) {
      return socket.emit("error", "Insufficient permissions");
    }

    // Store editing state in Redis (expires in 5 minutes)
    const editKey = `card_editing:${cardId}`;
    const editData = {
      userId: socket.user.id,
      userName: socket.user.first_name || socket.user.email,
      field: field || 'general',
      timestamp: Date.now()
    };
    
    const redis = require('./services/redisClient').redis;
    if (redis) {
      await redis.setex(editKey, 300, JSON.stringify(editData));
    }
    
    // Broadcast to all users in the board (except sender)
    const editStartEvent = {
      cardId,
      userId: socket.user.id,
      userName: socket.user.first_name || socket.user.email,
      field: field || 'general',
      timestamp: Date.now()
    };
    
    console.log(`✏️ User ${socket.user.email} started editing card ${cardId}`);
    socket.to(`board:${column.board_id}`).emit("card:edit_start", editStartEvent);
    
  } catch (err) {
    console.error("handleCardEditStart failed", err);
    socket.emit("error", "Failed to start edit session: " + err.message);
  }
}

async function handleCardEditEnd(socket, data) {
  const { cardId, boardId } = data;
  
  try {
    // Get card to verify it exists
    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");
    
    const column = await Column.findByPk(card.column_id);
    if (!column) return socket.emit("error", "Column not found");

    // Remove editing state from Redis
    const editKey = `card_editing:${cardId}`;
    const redis = require('./services/redisClient').redis;
    if (redis) {
      await redis.del(editKey);
    }
    
    // Broadcast to all users in the board (except sender)
    const editEndEvent = {
      cardId,
      userId: socket.user.id,
      timestamp: Date.now()
    };
    
    console.log(`✅ User ${socket.user.email} finished editing card ${cardId}`);
    socket.to(`board:${column.board_id}`).emit("card:edit_end", editEndEvent);
    
  } catch (err) {
    console.error("handleCardEditEnd failed", err);
    socket.emit("error", "Failed to end edit session: " + err.message);
  }
}

async function handleCardMoveStart(socket, data) {
  const { cardId, boardId } = data;
  
  try {
    // Get card to verify it exists and user has permission
    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");
    
    const column = await Column.findByPk(card.column_id);
    if (!column) return socket.emit("error", "Column not found");
    
    const membership = await BoardMember.findOne({ 
      where: { user_id: socket.user.id, board_id: column.board_id } 
    });
    if (!membership || !["owner","admin","editor"].includes(membership.role)) {
      return socket.emit("error", "Insufficient permissions");
    }

    // Store moving state in Redis (expires in 2 minutes)
    const moveKey = `card_moving:${cardId}`;
    const moveData = {
      userId: socket.user.id,
      userName: socket.user.first_name || socket.user.email,
      timestamp: Date.now()
    };
    
    const redis = require('./services/redisClient').redis;
    if (redis) {
      await redis.setex(moveKey, 120, JSON.stringify(moveData));
    }
    
    // Broadcast to all users in the board (except sender)
    const moveStartEvent = {
      cardId,
      userId: socket.user.id,
      userName: socket.user.first_name || socket.user.email,
      timestamp: Date.now()
    };
    
    console.log(`🔄 User ${socket.user.email} started moving card ${cardId}`);
    socket.to(`board:${column.board_id}`).emit("card:move_start", moveStartEvent);
    
  } catch (err) {
    console.error("handleCardMoveStart failed", err);
    socket.emit("error", "Failed to start move session: " + err.message);
  }
}

async function handleCardMoveEnd(socket, data) {
  const { cardId, boardId } = data;
  
  try {
    // Get card to verify it exists
    const card = await Card.findByPk(cardId);
    if (!card) return socket.emit("error", "Card not found");
    
    const column = await Column.findByPk(card.column_id);
    if (!column) return socket.emit("error", "Column not found");

    // Remove moving state from Redis
    const moveKey = `card_moving:${cardId}`;
    const redis = require('./services/redisClient').redis;
    if (redis) {
      await redis.del(moveKey);
    }
    
    // Broadcast to all users in the board (except sender)
    const moveEndEvent = {
      cardId,
      userId: socket.user.id,
      timestamp: Date.now()
    };
    
    console.log(`✅ User ${socket.user.email} finished moving card ${cardId}`);
    socket.to(`board:${column.board_id}`).emit("card:move_end", moveEndEvent);
    
  } catch (err) {
    console.error("handleCardMoveEnd failed", err);
    socket.emit("error", "Failed to end move session: " + err.message);
  }
}
