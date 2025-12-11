const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// Database proxy server that runs on the database server
// This will expose PostgreSQL through HTTP API

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'timemanagement',
    user: 'sdadmin',
    password: '04D8lt1+9^sG/!Dj',
    ssl: false
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Database proxy running', timestamp: new Date().toISOString() });
});

// Execute query endpoint
app.post('/query', async (req, res) => {
    try {
        const { query, params } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const client = await pool.connect();
        const result = await client.query(query, params);
        client.release();
        
        res.json({
            success: true,
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields
        });
        
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            code: err.code
        });
    }
});

// Transaction endpoint
app.post('/transaction', async (req, res) => {
    const client = await pool.connect();
    try {
        const { queries } = req.body;
        
        if (!queries || !Array.isArray(queries)) {
            return res.status(400).json({ error: 'Queries array is required' });
        }
        
        await client.query('BEGIN');
        
        const results = [];
        for (const { query, params } of queries) {
            const result = await client.query(query, params);
            results.push({
                rows: result.rows,
                rowCount: result.rowCount
            });
        }
        
        await client.query('COMMIT');
        
        res.json({
            success: true,
            results
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Transaction error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            code: err.code
        });
    } finally {
        client.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Database proxy server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /health');
    console.log('- POST /query');
    console.log('- POST /transaction');
});

module.exports = app;