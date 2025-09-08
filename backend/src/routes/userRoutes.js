const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// create user (optional board + role assignment)
router.post('/', userController.createUser);

// get current user profile
router.get('/me', authMiddleware, userController.getCurrentUser);

// read all users
router.get('/', userController.getAllUsers);

// read one user
router.get('/:id', userController.getUserById);

// update user
router.put('/:id', userController.updateUser);

// soft-delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
