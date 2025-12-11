const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('Host:', process.env.DB_HOST);
        console.log('Port:', process.env.DB_PORT);
        console.log('Database:', process.env.DB_NAME);
        console.log('User:', process.env.DB_USER);
        
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        console.log('✅ Database connected successfully!');
        console.log('PostgreSQL Version:', result.rows[0].version);
        
        const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('\nAvailable tables:');
        tablesResult.rows.forEach(row => console.log('  -', row.table_name));
        
        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Error details:', err);
    }
}

testConnection();