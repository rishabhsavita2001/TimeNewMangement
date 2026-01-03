const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Swagger configuration with Logout endpoint
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
    },
    paths: {
      '/api/auth/logout': {
        post: {
          summary: 'User sign out / logout',
          description: 'Sign out user from application and invalidate session',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Sign out successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Your sign out success' },
                      data: {
                        type: 'object',
                        properties: {
                          userId: { type: 'integer', example: 1 },
                          loggedOutAt: { type: 'string', format: 'date-time' },
                          status: { type: 'string', example: 'logged_out' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Access token required'
            },
            '403': {
              description: 'Invalid or expired token'
            }
          }
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

// =============================================================================
// TIMER APIS (Fixed Implementation)
// =============================================================================

// Initialize global timer storage
global.activeTimers = global.activeTimers || {};
global.stoppedTimersToday = global.stoppedTimersToday || {};

/**
 * @swagger
 * /api/me/timer/start:
 *   post:
 *     summary: Start timer
 *     description: Start time tracking timer with force restart capability
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               taskId:
 *                 type: string
 *               notes:
 *                 type: string
 *               force:
 *                 type: boolean
 *                 description: Force start timer even if one was stopped today
 *     responses:
 *       200:
 *         description: Timer started successfully
 *       400:
 *         description: Timer already running or stopped today (use force=true)
 */
app.post('/api/me/timer/start', authenticateToken, (req, res) => {
  const { projectId, taskId, notes, force = false } = req.body || {};
  const userId = req.user.userId;
  const timerId = `timer_${userId}_${Date.now()}`;
  const startTime = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  // Check if user already has a running timer
  const existingTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === userId && timer.isRunning
  );

  if (existingTimer) {
    return res.status(400).json({
      success: false,
      message: 'Timer already running. Stop current timer first.',
      data: {
        currentTimer: {
          timerId: existingTimer.timerId,
          startTime: existingTimer.startTime,
          isRunning: existingTimer.isRunning,
          isPaused: existingTimer.isPaused
        }
      }
    });
  }

  // Check if user stopped a timer today and force is not enabled
  if (!force && global.stoppedTimersToday[userId] && global.stoppedTimersToday[userId] === today) {
    return res.status(400).json({
      success: false,
      message: 'Timer was already stopped today. Use force=true to restart.',
      data: {
        stoppedToday: true,
        suggestion: 'Add "force": true to your request body to restart timer'
      }
    });
  }

  // Create new timer
  global.activeTimers[timerId] = {
    timerId,
    userId,
    tenantId: req.user.tenantId || 1,
    startTime,
    projectId,
    taskId,
    notes,
    isRunning: true,
    isPaused: false,
    isBreak: false,
    totalPausedTime: 0,
    pauseStartTime: null
  };

  // Clear stopped today flag if force restarting
  if (force && global.stoppedTimersToday[userId]) {
    delete global.stoppedTimersToday[userId];
  }

  res.json({
    success: true,
    message: 'Timer started successfully',
    data: { 
      timerId, 
      startTime, 
      isRunning: true,
      isPaused: false,
      isBreak: false, 
      projectId, 
      taskId, 
      notes,
      forceRestart: force
    }
  });
});

/**
 * @swagger
 * /api/me/timer/stop:
 *   post:
 *     summary: Stop timer
 *     description: Stop the currently running timer
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Timer stopped successfully
 *       404:
 *         description: No running timer found
 */
app.post('/api/me/timer/stop', authenticateToken, (req, res) => {
  const { notes: stopNotes } = req.body || {};
  const userId = req.user.userId;
  
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === userId && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.status(404).json({
      success: false,
      message: 'No running timer found'
    });
  }
  
  const stopTime = new Date();
  const startTime = new Date(activeTimer.startTime);
  const today = stopTime.toISOString().split('T')[0];
  
  // Calculate total duration excluding paused time
  const totalTimeMs = (stopTime - startTime) - activeTimer.totalPausedTime;
  const totalHours = Math.round((totalTimeMs / (1000 * 60 * 60)) * 100) / 100;
  
  // Format duration for display
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  const durationString = `${hours}h ${minutes}m`;
  
  // Mark that user stopped timer today
  global.stoppedTimersToday[userId] = today;
  
  // Remove timer from active timers (THIS FIXES THE ISSUE!)
  delete global.activeTimers[activeTimer.timerId];

  res.json({
    success: true,
    message: 'Timer stopped successfully',
    data: {
      duration: durationString,
      totalHours,
      startTime: activeTimer.startTime,
      stopTime: stopTime.toISOString(),
      timerId: activeTimer.timerId,
      stoppedToday: true
    }
  });
});

/**
 * @swagger
 * /api/me/timer/pause:
 *   post:
 *     summary: Pause/Resume timer
 *     description: Pause or resume the current running timer
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timer paused/resumed successfully
 *       404:
 *         description: No running timer found
 */
app.post('/api/me/timer/pause', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === userId && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.status(404).json({
      success: false,
      message: 'No running timer found'
    });
  }
  
  const now = new Date();
  
  if (activeTimer.isPaused) {
    // Resume timer
    if (activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      activeTimer.totalPausedTime += pauseDuration;
    }
    activeTimer.isPaused = false;
    activeTimer.isBreak = false; // Resume means back to work
    activeTimer.pauseStartTime = null;
    
    res.json({
      success: true,
      message: 'Timer resumed successfully',
      data: {
        isPaused: false,
        isBreak: false,
        timerId: activeTimer.timerId,
        totalPausedTime: Math.round(activeTimer.totalPausedTime / 1000 / 60) // minutes
      }
    });
  } else {
    // Pause timer (break)
    activeTimer.isPaused = true;
    activeTimer.isBreak = true; // Pause means on break
    activeTimer.pauseStartTime = now.toISOString();
    
    res.json({
      success: true,
      message: 'Timer paused successfully - on break',
      data: {
        isPaused: true,
        isBreak: true,
        timerId: activeTimer.timerId,
        pausedAt: activeTimer.pauseStartTime
      }
    });
  }
});

/**
 * @swagger
 * /api/me/timer/current:
 *   get:
 *     summary: Get current timer status
 *     description: Get the status of the current running timer (if any)
 *     tags: [Timer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current timer status retrieved
 */
app.get('/api/me/timer/current', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  // Find user's running timer
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === userId && timer.isRunning
  );
  
  if (!activeTimer) {
    const today = new Date().toISOString().split('T')[0];
    const stoppedToday = global.stoppedTimersToday[userId] === today;
    
    return res.json({
      success: true,
      data: {
        hasActiveTimer: false,
        timer: null,
        stoppedToday,
        canStart: !stoppedToday || false, // Can always start with force=true
        message: stoppedToday ? 'Timer was stopped today. Use force=true to restart.' : 'No active timer'
      }
    });
  }
  
  // Calculate current duration
  const now = new Date();
  const startTime = new Date(activeTimer.startTime);
  let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
  
  // If currently paused, don't include the time since pause started
  if (activeTimer.isPaused && activeTimer.pauseStartTime) {
    const pauseDuration = now - new Date(activeTimer.pauseStartTime);
    currentTimeMs -= pauseDuration;
  }
  
  const currentHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
  const hours = Math.floor(currentHours);
  const minutes = Math.round((currentHours - hours) * 60);
  const currentDuration = `${hours}h ${minutes}m`;
  
  res.json({
    success: true,
    data: {
      hasActiveTimer: true,
      timer: {
        timerId: activeTimer.timerId,
        startTime: activeTimer.startTime,
        isRunning: activeTimer.isRunning,
        isPaused: activeTimer.isPaused,
        isBreak: activeTimer.isBreak, // THIS FIXES THE isBreak ISSUE!
        currentDuration,
        currentHours: Math.round(currentHours * 100) / 100,
        projectId: activeTimer.projectId,
        taskId: activeTimer.taskId,
        notes: activeTimer.notes
      }
    }
  });
});

/**
 * @swagger
 * /api/me/work-summary/today:
 *   get:
 *     summary: Get today's work summary
 *     description: Get work summary for today including total hours worked
 *     tags: [Work Summary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's work summary
 */
app.get('/api/me/work-summary/today', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  res.json({
    success: true,
    data: {
      date: today,
      totalWorked: "4h 30m", // This would come from database in real implementation
      weeklyBalance: "+3h 20m", // This would be calculated from weekly target
      vacationLeft: "Left 8d",
      overtime: "4h",
      clockIn: "09:00 AM",
      clockOut: "05:30 PM",
      status: "Working",
      breaks: [
        { start: "12:00 PM", end: "12:30 PM", duration: "30m" }
      ]
    }
  });
});

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Get dashboard summary with timer and work info
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 */
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === userId && timer.isRunning
  );
  
  res.json({
    success: true,
    data: {
      user: {
        name: req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email,
        status: activeTimer ? (activeTimer.isPaused ? 'On Break' : 'Working') : 'Available'
      },
      timer: {
        isActive: !!activeTimer,
        isRunning: activeTimer?.isRunning || false,
        isPaused: activeTimer?.isPaused || false,
        isBreak: activeTimer?.isBreak || false,
        startTime: activeTimer?.startTime || null,
        currentTask: activeTimer?.notes || null
      },
      todaysSummary: {
        totalHours: "4h 30m",
        hoursTarget: "8h",
        breakTime: "30m",
        overtime: "4h"
      },
      weeklyBalance: "+3h 20m",
      vacationLeft: "Left 8d"
    }
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