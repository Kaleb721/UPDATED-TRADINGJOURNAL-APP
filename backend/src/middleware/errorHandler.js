const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    logger.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err.details || null
        })
    });
};

class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errorHandler,
    ApiError
};