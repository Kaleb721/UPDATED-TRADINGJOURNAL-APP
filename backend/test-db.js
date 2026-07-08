const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing database connection...');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'trading_journal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL successfully!');
    
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('Tables found:', result.rows.map(r => r.table_name).join(', ') || 'No tables yet');
        
        client.release();
        await pool.end();
        console.log('✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('\nCheck your .env file credentials');
        process.exit(1);
    }
}

testConnection();