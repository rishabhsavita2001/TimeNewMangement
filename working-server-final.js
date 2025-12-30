const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// COMPLETELY PUBLIC ROUTES - ZERO AUTHENTICATION
app.get('/api/get-token', (req, res) => {
  console.log('Generating token - PUBLIC ENDPOINT');
  
  const testUser = {
    userId: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'employee'
  };

  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    success: true,
    message: 'Test Bearer token generated successfully',
    data: {
      token,
      user: testUser,
      expiresIn: '24 hours',
      usage: 'Add this token in Authorization header as: Bearer ' + token
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is working perfectly',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working - no auth needed'
  });
});

// Authentication middleware (only for protected routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required. Use /api/get-token to get a test token.',
      hint: 'Add Authorization header: Bearer <token>'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired token. Get a new token from /api/get-token'
      });
    }
    req.user = user;
    next();
  });
};

// PROTECTED ROUTES - REQUIRE AUTH
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    data: req.user
  });
});

app.get('/api/users', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Users list retrieved successfully',
    data: [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' }
    ]
  });
});

// Catch all
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Server is running!',
    endpoints: {
      public: [
        'GET /api/get-token',
        'GET /api/health', 
        'GET /api/test'
      ],
      protected: [
        'GET /api/me',
        'GET /api/users'
      ]
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Get token: http://localhost:${PORT}/api/get-token`);
});

module.exports = app;