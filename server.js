const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Server will continue running...');
});

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI compatibility
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(requestLogger);

// Serve test interface
app.get('/test-interface', (req, res) => {
  res.sendFile(__dirname + '/test-interface.html');
});

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger UI with CDN (works on Vercel)
app.get('/api-docs', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Working Time API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags:
 *       - Health
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2023-11-10T12:00:00.000Z'
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 */
// Test Login endpoint (No Auth Required) - For Testing
app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }
    
    // Mock login for testing
    if (password === 'password123') {
      const token = 'mock-jwt-token-' + Date.now();
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: 1,
          email: email,
          first_name: 'Test',
          last_name: 'User',
          tenant_id: 1
        }
      });
    } else {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Use password: password123'
      });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Login failed',
      message: err.message
    });
  }
});

// Test endpoint to check if API is working
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vercel API is working perfectly!',
    timestamp: new Date().toISOString(),
    environment: 'Vercel Production',
    endpoints: {
      health: '/health',
      docs: '/api-docs', 
      login: '/auth/login',
      register: '/auth/register',
      profile: '/api/user/profile',
      time_entries: '/api/time-entries',
      leave_requests: '/api/leave-requests',
      projects: '/api/projects'
    },
    test_credentials: {
      email: 'admin@company.com',
      password: 'password123'
    },
    vercel_deployment: true
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Database Debug Endpoint (No Auth Required)
app.get('/debug-db', async (req, res) => {
  try {
    // Always use mock database in Vercel production
    if (process.env.NODE_ENV === 'production') {
      return res.status(200).json({
        status: 'Mock database connected successfully',
        timestamp: new Date().toISOString(),
        database_time: new Date().toISOString(),
        version: 'PostgreSQL Mock Database v1.0',
        connection_config: {
          host: 'mock',
          port: 'mock',
          database: 'mock_timemanagement',
          user: 'mock_user',
          ssl: 'false'
        },
        mock_data: {
          users: 3,
          time_entries: 2,
          leave_requests: 1,
          projects: 2
        }
      });
    }
    
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version()');
    client.release();
    await pool.end();
    
    res.status(200).json({
      status: 'database connected successfully',
      timestamp: new Date().toISOString(),
      database_time: result.rows[0].current_time,
      version: result.rows[0].version,
      connection_config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        ssl: process.env.DB_SSL
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'database connection failed',
      timestamp: new Date().toISOString(),
      error: err.message,
      error_code: err.code,
      connection_config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        ssl: process.env.DB_SSL
      },
      env_check: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
        DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
        DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'HIDDEN' : 'NOT SET',
        DB_SSL: process.env.DB_SSL ? 'SET' : 'NOT SET'
      }
    });
  }
});

// Database Connection Test
app.get('/test-db', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const result = await pool.query('SELECT NOW() as current_time, version()');
    res.status(200).json({
      status: 'database connected',
      timestamp: new Date().toISOString(),
      database_time: result.rows[0].current_time,
      version: result.rows[0].version,
      env_vars: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
        DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
        DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'database error',
      error: error.message,
      timestamp: new Date().toISOString(),
      env_vars: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
        DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
        DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  }
});

// Routes with error handling
try {
  app.use('/auth', authRoutes);
  app.use('/api', apiRoutes);
} catch (error) {
  console.error('Error setting up routes:', error);
}

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server (only when not in serverless environment)
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Working Time API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5433'}/${process.env.DB_NAME || 'timemanagement'}`);
  });
} else if (process.env.VERCEL) {
  console.log('🚀 Vercel serverless function ready');
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
}

// Export for Vercel serverless
module.exports = app;