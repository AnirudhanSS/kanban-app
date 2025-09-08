// Test script to verify WebSocket functionality
const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");

// Create a simple test server
const app = http.createServer();
const io = new Server(app, {
  cors: { origin: "*" }
});

// Mock user for testing
const testUser = {
  id: "test-user-123",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User"
};

// Simple auth middleware for testing
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("No token provided"));
  }
  
  try {
    // For testing, accept any token or create a mock user
    socket.user = testUser;
    socket.userId = testUser.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  console.log(`👤 User: ${socket.user.first_name} ${socket.user.last_name}`);

  socket.on("joinBoard", (boardId) => {
    console.log(`📋 User ${socket.user.id} joining board: ${boardId}`);
    socket.join(`board:${boardId}`);
    socket.to(`board:${boardId}`).emit("userJoined", {
      userId: socket.user.id,
      userName: `${socket.user.first_name} ${socket.user.last_name}`
    });
  });

  socket.on("leaveBoard", (boardId) => {
    console.log(`📋 User ${socket.user.id} leaving board: ${boardId}`);
    socket.leave(`board:${boardId}`);
    socket.to(`board:${boardId}`).emit("userLeft", {
      userId: socket.user.id
    });
  });

  socket.on("updateCard", (data) => {
    console.log(`🔄 Card update from ${socket.user.id}:`, data);
    socket.to(`board:${data.boardId}`).emit("card:updated", {
      ...data,
      updatedBy: socket.user.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("cardMoved", (data) => {
    console.log(`📦 Card moved by ${socket.user.id}:`, data);
    socket.to(`board:${data.boardId}`).emit("card:moved", {
      ...data,
      movedBy: socket.user.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  // Send a test message to confirm connection
  socket.emit("test", { message: "WebSocket connection successful!", timestamp: new Date().toISOString() });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Test WebSocket server running on port ${PORT}`);
  console.log(`🔗 Connect to: http://localhost:${PORT}`);
  console.log(`📝 Use any token in auth.token for testing`);
});
