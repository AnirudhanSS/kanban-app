const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', boardController.createBoard);
router.get('/', boardController.getBoards);
router.get('/:id/members', boardController.getBoardMembers);
router.get('/:id/role', boardController.getUserRole);
router.get('/:id/export', boardController.exportBoard);
router.get('/:id', boardController.getBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

router.post('/:boardId/members', boardController.addMember);
router.put('/:boardId/members/:userId', boardController.updateMemberRole);
router.delete('/:boardId/members/:userId', boardController.removeMember);

router.post('/import', boardController.importBoard);

// Debug endpoint to add user to a board
router.post('/:boardId/join', boardController.joinBoard);

module.exports = router;
