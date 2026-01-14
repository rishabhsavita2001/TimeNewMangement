const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const nodemailer = require('nodemailer');

const app = express();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'managementtime04@gmail.com',
    pass: 'sarx oodf rrxb bfuk' // App password
  }
});

// OTP Storage (in production, use Redis or database)
if (!global.otpStorage) {
  global.otpStorage = {};
}

// Reset Token Storage
if (!global.resetTokens) {
  global.resetTokens = {};
}

// Generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate reset token
function generateResetToken(email) {
  return `reset_${Date.now()}_${email.replace('@', '_').replace('.', '_')}`;
}

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

// ===== FORGOT PASSWORD FLOW APIS =====

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request OTP for password reset
 *     description: Send 4-digit OTP to user's email for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "Verification code sent to your email address"
 *                 expiresIn:
 *                   type: string
 *                   example: "5 minutes"
 *                 otpForTesting:
 *                   type: string
 *                   example: "1234"
 *       400:
 *         description: Bad request - Email required
 */
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate 4-digit OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes expiry

    // Store OTP with expiry
    global.otpStorage[email] = {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    };

    // Send OTP email
    const mailOptions = {
      from: '"Time Management System" <managementtime04@gmail.com>',
      to: email,
      subject: 'Password Reset - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi there,</p>
          <p>You requested to reset your password. Please use the following 4-digit verification code:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 10px;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Time Management Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Verification code sent to your email address',
      expiresIn: '5 minutes',
      // For testing purposes (remove in production)
      otpForTesting: otp
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Verify 4-digit OTP and get reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: "OTP verified successfully"
 *                 resetToken:
 *                   type: string
 *                   example: "reset_1768372640_user_example_com"
 *                 expiresIn:
 *                   type: string
 *                   example: "15 minutes"
 */
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const otpData = global.otpStorage[email];
    
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this email'
      });
    }

    if (Date.now() > otpData.expiresAt) {
      delete global.otpStorage[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (otpData.otp !== otp) {
      otpData.attempts++;
      if (otpData.attempts >= 3) {
        delete global.otpStorage[email];
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(email);
    global.resetTokens[email] = {
      token: resetToken,
      expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
      verified: true
    };

    // Clean up OTP
    delete global.otpStorage[email];

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with new password
 *     description: Reset password using reset token and send invitation email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               resetToken:
 *                 type: string
 *                 example: "reset_1768372640_user_example_com"
 *               newPassword:
 *                 type: string
 *                 example: "mynewpassword123"
 *               confirmPassword:
 *                 type: string
 *                 example: "mynewpassword123"
 *             required:
 *               - email
 *               - resetToken
 *               - newPassword
 *               - confirmPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully. You can now login with your new password"
 *                 emailSent:
 *                   type: boolean
 *                   example: true
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const tokenData = global.resetTokens[email];
    
    if (!tokenData || tokenData.token !== resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (Date.now() > tokenData.expiresAt) {
      delete global.resetTokens[email];
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please start the process again.'
      });
    }

    // In a real app, update password in database
    // For now, just simulate success
    
    // Clean up reset token
    delete global.resetTokens[email];

    // Send success email invitation
    const invitationMailOptions = {
      from: '"Time Management System" <managementtime04@gmail.com>',
      to: email,
      subject: 'Password Reset Successful - Account Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Hi Jenny,</p>
          <p>Your password has been reset successfully. You can now sign in with your new password.</p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0;">🎉 You have been invited by Sheila to join</h3>
            <p style="margin: 10px 0 0 0;"><strong>Time Management System</strong> - our internal system used to manage working time, absences, and employee requests.</p>
          </div>

          <p><strong>What's next?</strong></p>
          <p>To activate your account, please click the button below and create your password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://api-layer.vercel.app" style="background: #6f42c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Activate your account
            </a>
          </div>

          <p><strong>For security reasons, this invitation link will expire in 7 days.</strong></p>
          
          <p><strong>Once your account is activated:</strong></p>
          <ul>
            <li>• Your company and role will already be assigned</li>
            <li>• You can start tracking your working time, absences, and employee requests immediately</li>
            <li>• Submit working time requests for approval</li>
          </ul>

          <p><small>If you did not expect this invitation, you can safely ignore this email.</small></p>
          <p><small>If you have any questions, please contact your company administrator.</small></p>

          <p>Best regards,<br><strong>Danie Alex</strong><br>Product Team - Time Management System</p>
        </div>
      `
    };

    await transporter.sendMail(invitationMailOptions);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password',
      emailSent: true
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
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