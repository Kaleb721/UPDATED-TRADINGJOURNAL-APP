const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
dotenv.config();

const app = express();

app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: '*',
    credentials: true
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.'
});
app.use('/api', globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - ${req.ip}`);
    next();
});

app.use(express.static(path.join(__dirname, '../../frontend')));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    
    const pathname = req.path.split('?')[0];
    
    if (pathname.endsWith('.html')) {
        const filePath = path.join(__dirname, '../../frontend', pathname);
        return res.sendFile(filePath);
    }
    
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use(errorHandler);

module.exports = app;