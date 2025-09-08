// src/middlewares/authMiddleware.js
const User = require('../db/models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

module.exports = async (req, res, next) => {
  try {
    console.log('authMiddleware called for:', req.path);
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      console.log('No token in header');
      return res.status(401).json({ error: 'Token missing' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
      console.log('Token verified, payload:', payload);
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // fetch user
    console.log('Looking for user with ID:', payload.sub);
    const user = await User.findByPk(payload.sub);
    if (!user || user.is_deleted) {
      console.log('User not found or deleted:', user ? 'deleted' : 'not found');
      return res.status(401).json({ error: 'User not found or deleted' });
    }

    console.log('User found:', user.id, user.email);
    req.user = user; // ✅ this is now guaranteed
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    next(err);
  }
};
