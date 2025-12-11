const { Pool } = require('pg');

// Using SSH tunnel - connecting to localhost:5433
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'timemanagement',
    user: 'sdadmin',
    password: '04D8lt1+9^sG/!Dj',
    ssl: false // No SSL needed for localhost tunnel
});

async function testConnection() {
    try {
        console.log('Testing database connection through SSH tunnel...');
        console.log('Connecting to localhost:5433 (tunneled to 217.20.195.77:5432)');
        
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        console.log('✅ Database connected successfully!');
        console.log('PostgreSQL Version:', result.rows[0].version);
        
        const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('\nAvailable tables:');
        tablesResult.rows.forEach(row => console.log('  -', row.table_name));
        
        // Test a simple user query
        try {
            const userResult = await client.query('SELECT COUNT(*) as user_count FROM users');
            console.log('\nUser count:', userResult.rows[0].user_count);
        } catch (err) {
            console.log('Users table query failed:', err.message);
        }
        
        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
}

testConnection();