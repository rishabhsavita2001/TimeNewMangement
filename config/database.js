const { Pool } = require('pg');
const { MockDatabase } = require('./mock_database');

// Database Connection Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433, // Default to SSH tunnel port
  database: process.env.DB_NAME || 'timemanagement',
  user: process.env.DB_USER || 'sdadmin',
  password: process.env.DB_PASSWORD || '04D8lt1+9^sG/!Dj',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 5, // Reduced for serverless
  idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
  connectionTimeoutMillis: 10000, // 10 seconds timeout for serverless
};

console.log('Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: dbConfig.ssl,
  environment: process.env.NODE_ENV
});

// Use mock database in production until real database is accessible
const useMockDatabase = process.env.NODE_ENV === 'production' || process.env.USE_MOCK_DB === 'true';

let pool;
if (useMockDatabase) {
  console.log('🔄 Using Mock Database for production deployment');
  pool = new MockDatabase();
} else {
  console.log('🔗 Using Real Database connection');
  pool = new Pool(dbConfig);
}

// Set session variables for Row Level Security
const setSessionVariables = async (client, userId, tenantId) => {
  try {
    await client.query(`SET session.current_user_id = '${userId}'`);
    await client.query(`SET session.current_tenant_id = '${tenantId}'`);
  } catch (error) {
    console.error('Error setting session variables:', error);
    throw error;
  }
};

// Execute query with RLS context
const executeWithRLS = async (query, params, userId, tenantId) => {
  const client = await pool.connect();
  try {
    await setSessionVariables(client, userId, tenantId);
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
};

// Execute transaction with RLS context
const executeTransactionWithRLS = async (queries, userId, tenantId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setSessionVariables(client, userId, tenantId);
    
    const results = [];
    for (const { query, params } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database connection
testConnection();

module.exports = {
  pool,
  executeWithRLS,
  executeTransactionWithRLS,
  testConnection
};