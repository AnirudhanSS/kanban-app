const express = require("express");
const cors = require("cors");
const path = require("path");
const boardRoutes = require('./routes/boardRoutes');
const cardRoutes = require('./routes/cardRoutes');
const app = express();

// Middleware to pass io object to routes
app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => res.send("Kanban backend is running 🚀"));
app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/boards", require("./routes/boardRoutes"));
app.use("/cards", require("./routes/cardRoutes"));
app.use("/columns", require("./routes/columnRoutes"));
app.use("/comments", require("./routes/commentRoutes"));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/comments', require('./routes/commentRoutes'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
