// src/services/socketAuth.js
const jwt = require("jsonwebtoken");
const { User } = require("../db/associations");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.sub);

    if (!user || user.is_deleted) return next(new Error("Invalid token user"));

    // Assign user and id explicitly
    socket.user = user;
    socket.userId = user.id;

    next();
  } catch (err) {
    next(new Error("Authentication failed: " + (err.message || "unknown")));
  }
};
