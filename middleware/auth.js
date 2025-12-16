const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Generate JWT Token
const generateToken = (payload) => {
  // For mock database in production or when using mock, return simple mock token
  if (process.env.NODE_ENV === 'production' || process.env.USE_MOCK_DB === 'true') {
    return `mock-jwt-token-${Date.now()}`;
  }
  
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not found, using mock token');
    return `mock-jwt-token-${Date.now()}`;
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: process.env.JWT_ISSUER || 'working-time-api',
    audience: process.env.JWT_AUDIENCE || 'working-time-client'
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    // For mock tokens, return mock payload
    if (token.startsWith('mock-jwt-token-')) {
      return {
        userId: 1,
        tenantId: 1,
        email: 'admin@company.com'
      };
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'working-time-api',
      audience: process.env.JWT_AUDIENCE || 'working-time-client'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Skip authentication in production with mock database for now
    if (process.env.NODE_ENV === 'production' || process.env.USE_MOCK_DB === 'true') {
      req.user = {
        id: 1,
        email: 'admin@company.com',
        tenant_id: 1,
        tenantId: 1,
        first_name: 'Admin',
        last_name: 'User',
        firstName: 'Admin',
        lastName: 'User',
        employee_number: 'EMP001',
        employeeNumber: 'EMP001',
        tenant_name: 'Default Company',
        tenantName: 'Default Company'
      };
      req.userId = 1;
      req.tenantId = 1;
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = verifyToken(token);
    
    // For mock database in production/Vercel, use mock user data
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.USE_MOCK_DB === 'true' || token.startsWith('mock-jwt-token-')) {
      req.user = {
        id: 1,
        tenantId: 1,
        employeeNumber: 'EMP001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        tenantName: 'Default Company'
      };
      req.userId = 1;
      req.tenantId = 1;
      return next();
    }
    
    // Verify user still exists and is active (real database)
    const userQuery = `
      SELECT 
        u.id,
        u.tenant_id,
        u.employee_number,
        u.first_name,
        u.last_name,
        u.email,
        u.is_active,
        t.name as tenant_name
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND u.is_active = true
    `;

    const userResult = await pool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid user',
        message: 'User not found or inactive'
      });
    }

    // Attach user info to request
    req.user = {
      id: userResult.rows[0].id,
      tenantId: userResult.rows[0].tenant_id,
      employeeNumber: userResult.rows[0].employee_number,
      firstName: userResult.rows[0].first_name,
      lastName: userResult.rows[0].last_name,
      email: userResult.rows[0].email,
      tenantName: userResult.rows[0].tenant_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      error: 'Invalid token',
      message: 'Please provide a valid authentication token'
    });
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  hashPassword,
  comparePassword
};