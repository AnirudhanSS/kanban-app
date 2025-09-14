const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware'); 
const checkAdmin = require('../middlewares/checkAdmin');

router.use(authMiddleware); // only logged-in users, or add admin check
router.use(checkAdmin);

router.get('/boards', adminController.listBoards);
router.get('/members', adminController.listMembers);
router.get('/audit-logs', adminController.listAuditLogs);
router.get('/active-users', adminController.listActiveUsers);

// Board-specific admin routes
router.get('/boards/:boardId/members', adminController.getBoardMembers);
router.get('/boards/:boardId/audit-logs', adminController.getBoardAuditLogs);
router.get('/boards/:boardId/stats', adminController.getBoardStats);

module.exports = router;
