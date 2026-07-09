const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
    validateTrade,
    handleValidationErrors
} = require('../middleware/validation');
const tradeController = require('../controllers/tradeController');
router.use(authenticate);


router.get('/', tradeController.getAllTrades);
router.get('/statistics', tradeController.getStatistics);
router.get('/assets', tradeController.getAssets);
router.get('/:id', tradeController.getTrade);
router.post('/', validateTrade, handleValidationErrors, tradeController.createTrade);
router.put('/:id', validateTrade, handleValidationErrors, tradeController.updateTrade);
router.delete('/:id', tradeController.deleteTrade);

module.exports = router;