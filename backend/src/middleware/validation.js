const { body, param, query, validationResult } = require('express-validator');


const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .escape(),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('fullName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters')
        .escape()
];

const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];


const validateTrade = [
    body('date')
        .isISO8601()
        .withMessage('Invalid date format. Use YYYY-MM-DD'),
    body('asset')
        .trim()
        .notEmpty()
        .withMessage('Asset symbol is required')
        .isLength({ min: 1, max: 20 })
        .withMessage('Asset symbol cannot exceed 20 characters')
        .matches(/^[A-Za-z0-9]+$/)
        .withMessage('Asset symbol can only contain letters and numbers')
        .toUpperCase()
        .escape(),
    body('type')
        .isIn(['long', 'short'])
        .withMessage('Trade type must be either "long" or "short"'),
    body('entryPrice')
        .isFloat({ min: 0.001 })
        .withMessage('Entry price must be greater than 0'),
    body('exitPrice')
        .isFloat({ min: 0.001 })
        .withMessage('Exit price must be greater than 0'),
    body('quantity')
        .isFloat({ min: 0.001 })
        .withMessage('Quantity must be greater than 0'),
    
    body('fees')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Fees must be a positive number')
        .toFloat(),
    body('stopLoss')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Stop loss must be a positive number')
        .toFloat(),
    body('takeProfit')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Take profit must be a positive number')
        .toFloat(),
    body('strategy')
        .optional()
        .isIn(['swing', 'day', 'scalp', 'position', ''])
        .withMessage('Invalid strategy selected'),
    body('emotion')
        .optional()
        .isIn(['confident', 'neutral', 'anxious', 'fearful', 'greedy', ''])
        .withMessage('Invalid emotion selected'),
    body('setup')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Setup cannot exceed 1000 characters')
        .escape(),
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters')
        .escape(),
    body('screenshotNotes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Screenshot notes cannot exceed 500 characters')
        .escape(),
    body('screenshots')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Maximum 5 screenshots allowed')
];


const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }));
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateTrade,
    handleValidationErrors
};