const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkBoardRole = require('../middlewares/checkBoardRole');

router.use(authMiddleware);

router.post('/', checkBoardRole(['owner','admin','editor']), cardController.createCard);
router.put('/:id', checkBoardRole(['owner','admin','editor']), cardController.updateCard);
router.get('/:id', checkBoardRole(['owner','admin','editor','viewer']), cardController.getCard);
router.delete('/:id', checkBoardRole(['owner','admin','editor']), cardController.deleteCard);
router.get('/board/:boardId', checkBoardRole(['owner','admin','editor','viewer']), cardController.getCardsByBoard);

module.exports = router;
