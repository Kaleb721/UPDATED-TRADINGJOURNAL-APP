const { Pool } = require('pg');
const logger = require('./logger');
require('dotenv').config();
const password = process.env.DB_PASSWORD || '';

console.log('\n========================================');
console.log('📊 DATABASE CONNECTION');
console.log('========================================');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || '5432');
console.log('Database:', process.env.DB_NAME || 'trading_journal');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Password:', password ? '✅ SET' : '❌ NOT SET');
console.log('========================================\n');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'trading_journal',
    user: process.env.DB_USER || 'postgres',
    password: password,  // ← This will be '1234' from .env
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('\n💡 FIX: Check your .env file');
        console.error('   DB_PASSWORD should be: 1234');
        if (err.code === 'ECONNREFUSED') {
            console.error('   PostgreSQL is not running!');
        } else if (err.code === '28P01') {
            console.error('   Password is wrong!');
        }
    } else {
        console.log('✅ PostgreSQL database connected successfully!');
        logger.info('✅ PostgreSQL database connected successfully');
        release();
    }
});
pool.on('error', (err) => {
    console.error('Unexpected database error:', err.message);
    logger.error('Unexpected database error:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};