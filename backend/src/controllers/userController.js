// src/controllers/userController.js
const User = require('../db/models/User');
const BoardMember = require('../db/models/BoardMember');
const Board = require('../db/models/Board');
const sequelize = require('../db/db');

exports.createUser = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { email, first_name, last_name, password_hash, board_id, role } = req.body;

    // 1. create user
    const user = await User.create({ email, first_name, last_name, password_hash }, { transaction: t });

    // 2. optional board role assignment
    if (board_id && role) {
      const board = await Board.findByPk(board_id, { transaction: t });
      if (!board) {
        await t.rollback();
        return res.status(404).json({ error: 'Board not found' });
      }

      // create board member entry
      await BoardMember.create({
        board_id,
        user_id: user.id,
        role: role // 'owner','admin','editor','viewer'
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(user);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};


// get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('getCurrentUser called, req.user:', req.user);
    const user = req.user; // set by authMiddleware
    if (!user) {
      console.log('No user found in req.user');
      return res.status(401).json({ error: "User not found" });
    }
    
    console.log('User found:', user.id, user.email);
    
    // Return user without sensitive data
    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (err) {
    console.error('getCurrentUser error:', err);
    res.status(500).json({ error: err.message });
  }
};

// read all
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// read one
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete (already written by you)
exports.deleteUser = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({
      is_deleted: true,
      email: `deleted_${Date.now()}_${user.email}`
    }, { transaction: t });

    await t.commit();
    res.json({ message: "User soft-deleted" });
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
