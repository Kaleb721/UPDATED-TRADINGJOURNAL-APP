const { verifyToken } = require('../config/auth');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Please log in.'
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }

    req.user = {
        id: decoded.userId,
        username: decoded.username
    };
    
    logger.debug(`User ${decoded.username} (${decoded.userId}) authenticated`);
    next();
};

module.exports = authenticate;