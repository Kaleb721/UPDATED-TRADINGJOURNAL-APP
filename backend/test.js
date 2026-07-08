const { Pool } = require('pg');
require('dotenv').config();

console.log('\n========================================');
console.log('SIMPLE CONNECTION TEST');
console.log('========================================');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('========================================\n');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'trading_journal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function test() {
    try {
        const client = await pool.connect();
        console.log('✅✅✅ CONNECTED SUCCESSFULLY! ✅✅✅');
        const result = await client.query('SELECT NOW()');
        console.log('Current time:', result.rows[0].now);
        client.release();
        await pool.end();
        console.log('\n✅ All good! Run npm run dev');
    } catch (error) {
        console.log('❌❌❌ CONNECTION FAILED ❌❌❌');
        console.log('\n🔴 ERROR:');
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        console.log('\n');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 PostgreSQL is not running!');
            console.log('   Run: net start postgresql-x64-16');
        } else if (error.code === '28P01') {
            console.log('💡 Wrong password!');
            console.log('   Check DB_PASSWORD in .env');
        } else if (error.code === '3D000') {
            console.log('💡 Database does not exist!');
            console.log('   Create it in pgAdmin');
        } else {
            console.log('💡 Unknown error. Check the details above.');
        }
    }
    console.log('\n========================================');
    process.exit(0);
}

test();