const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    handleValidationErrors
} = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.'
});

router.post('/register', authLimiter, validateRegistration, handleValidationErrors, authController.register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
module.exports = router;