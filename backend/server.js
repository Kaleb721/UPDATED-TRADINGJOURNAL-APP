const app = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received: closing server');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received: closing server');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});