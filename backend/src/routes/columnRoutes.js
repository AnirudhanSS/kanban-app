const express = require('express');
const router = express.Router();
const columnController = require('../controllers/columnController');
const auth = require('../middlewares/authMiddleware');


router.post('/', auth, columnController.createColumn);
router.put('/:id', auth, columnController.updateColumn);
router.delete('/:id', auth, columnController.deleteColumn);


module.exports = router;