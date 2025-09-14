const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// All comment routes require authentication
router.use(authMiddleware);

// Get comments for a card
router.get('/cards/:cardId/comments', commentController.getComments);

// Add comment to a card
router.post('/cards/:cardId/comments', commentController.addComment);

// Update a comment - DISABLED
// router.put('/comments/:commentId', commentController.updateComment);

// Delete a comment
router.delete('/comments/:commentId', commentController.deleteComment);

module.exports = router;
