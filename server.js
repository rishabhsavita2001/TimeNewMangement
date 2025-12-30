const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Working Time API',
      version: '1.0.0',
      description: 'Node.js API for Working Time & Absence Management System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'https://api-layer.vercel.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token. Get token from /api/get-token endpoint'
        }
      }
    }
  },
  apis: ['./server.js'] // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Swagger UI setup - PUBLIC
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customSiteTitle: 'Working Time API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// COMPLETELY PUBLIC ROUTES - ZERO AUTHENTICATION

/**
 * @swagger
 * /api/get-token:
 *   get:
 *     summary: Generate test Bearer token
 *     description: Get a test JWT token for API authentication. No authentication required.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT Bearer token
 *                     user:
 *                       type: object
 *                     expiresIn:
 *                       type: string
 *                     usage:
 *                       type: string
 */
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

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running properly
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is working perfectly',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     description: Simple test endpoint without authentication
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get user profile
 *     description: Get current user's profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    data: req.user
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User sign out / logout
 *     description: Sign out user from application and invalidate session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sign out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Your sign out success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     loggedOutAt:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       example: "logged_out"
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Your sign out success',
    data: {
      userId: req.user?.userId || 1,
      loggedOutAt: new Date().toISOString(),
      status: 'logged_out'
    }
  });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve list of all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
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

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Get basic API information and available endpoints
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */
// Catch all
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Server is running!',
    documentation: '/api-docs',
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