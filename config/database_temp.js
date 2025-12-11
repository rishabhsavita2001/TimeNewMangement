// Temporary database configuration for testing Vercel deployment
const { Pool } = require('pg');

// Mock database configuration - replace with real database later
const mockDatabase = {
    host: 'localhost',
    port: 5432,
    database: 'mock_db',
    user: 'test_user',
    password: 'test_password',
    ssl: false
};

// For Vercel deployment - use environment variables
const realDatabase = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Mock pool for testing API endpoints without real database
const createMockPool = () => ({
    async connect() {
        return {
            async query(text, params) {
                console.log('Mock query:', text, params);
                
                // Mock responses for different queries
                if (text.includes('SELECT version()')) {
                    return { rows: [{ version: 'PostgreSQL Mock Version' }] };
                }
                if (text.includes('FROM users')) {
                    return { 
                        rows: [
                            { id: 1, username: 'testuser', email: 'test@example.com' },
                            { id: 2, username: 'admin', email: 'admin@example.com' }
                        ] 
                    };
                }
                if (text.includes('INSERT INTO')) {
                    return { rows: [{ id: Date.now() }] };
                }
                return { rows: [] };
            },
            release() {
                console.log('Mock connection released');
            }
        };
    },
    async end() {
        console.log('Mock pool ended');
    }
});

module.exports = {
    createPool: () => process.env.NODE_ENV === 'production' ? new Pool(realDatabase) : createMockPool(),
    mockDatabase,
    realDatabase
};