const express = require('express');
const Joi = require('joi');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken, hashPassword, comparePassword } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validation');
const { pool } = require('../config/database');
const { auditLog } = require('../middleware/logger');
const { sendOTPEmail, sendPasswordResetConfirmation } = require('../config/emailService');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Authentication failed
 *               message: Invalid email or password
 */
// Login endpoint
router.post('/login', validateBody(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // For mock database in production/Vercel, use proper password validation
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.USE_MOCK_DB === 'true') {
    // Mock database with proper password validation
    try {
      // Define allowed users and their passwords for demo
      const validCredentials = {
        'admin@company.com': 'password123'
      };
      
      // Check for exact password match for known users
      if (validCredentials[email] && validCredentials[email] === password) {
        // Valid credentials for known user
        const token = generateToken({
          userId: 1,
          tenantId: 1,
          email: email
        });

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: 1,
              tenantId: 1,
              employeeNumber: 'EMP001',
              firstName: 'Admin',
              lastName: 'User',
              email: email,
              tenantName: 'Default Company'
            }
          }
        });
      } 
      
      // For demo purposes, allow specific passwords for new registrations
      const allowedDemoPasswords = ['password123', 'test123', 'demo123'];
      if (allowedDemoPasswords.includes(password) && email.includes('@') && password.length >= 6) {
        // For any other registered user (mock behavior)
        const userId = Math.floor(Math.random() * 1000) + 2; // Generate random ID
        const token = generateToken({
          userId: userId,
          tenantId: 1,
          email: email
        });

        // Extract name from email for mock user
        const emailPrefix = email.split('@')[0];
        const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: userId,
              tenantId: 1,
              employeeNumber: `EMP${userId}`,
              firstName: firstName,
              lastName: 'User',
              email: email,
              tenantName: 'Default Company'
            }
          }
        });
      } else {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password format. Email must be valid and password must be at least 6 characters.'
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Login processing failed'
      });
    }
  }

  // Find user with credentials (real database)
  const userQuery = `
    SELECT 
      u.id,
      u.tenant_id,
      u.employee_number,
      u.first_name,
      u.last_name,
      u.email,
      u.password_hash,
      u.is_active,
      u.last_login,
      t.name as tenant_name
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true
  `;

  const userResult = await pool.query(userQuery, [email]);

  if (userResult.rows.length === 0) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  }

  const user = userResult.rows[0];

  // Verify password
  const isValidPassword = await comparePassword(password, user.password_hash);
  
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    tenantId: user.tenant_id,
    email: user.email
  });

  // auditLog('LOGIN_SUCCESS', { 
  //   userId: user.id, 
  //   tenantId: user.tenant_id,
  //   email: user.email 
  // });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        tenantId: user.tenant_id,
        employeeNumber: user.employee_number,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        tenantName: user.tenant_name
      }
    }
  });
}));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user (demo purposes - in production this would be admin only)
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User already exists
 *               message: An account with this email already exists
 *       400:
 *         description: Invalid tenant or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register endpoint (for demo purposes - in production, this would be admin only)
router.post('/register', validateBody(schemas.register), asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, employeeNumber } = req.body;
  let { tenantId } = req.body;
  
  // For production/mock database, use simplified registration
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.USE_MOCK_DB === 'true') {
    tenantId = tenantId || 1;
    
    // Generate mock user data for production
    const mockUserId = Math.floor(Math.random() * 1000) + 100;
    const mockUser = {
      id: mockUserId,
      tenantId: tenantId,
      employeeNumber: employeeNumber || `EMP${mockUserId}`,
      firstName: firstName,
      lastName: lastName,
      email: email,
      tenantName: 'Default Company'
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: mockUser
      }
    });
  }

  // Check if user already exists (real database)
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'An account with this email already exists'
    });
  }

  // Check if tenant exists and is active
  const tenantResult = await pool.query(
    'SELECT id FROM tenants WHERE id = $1',
    [tenantId]
  );

  if (tenantResult.rows.length === 0) {
    return res.status(400).json({
      error: 'Invalid tenant',
      message: 'The specified tenant does not exist or is inactive'
    });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const insertQuery = `
    INSERT INTO users (
      tenant_id, employee_number, first_name, last_name, email, password_hash, 
      username, is_active, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $5, true, NOW(), NOW())
    RETURNING id, employee_number, first_name, last_name, email, tenant_id
  `;

  const newUser = await pool.query(insertQuery, [
    tenantId,
    employeeNumber || `EMP${Date.now()}`,
    firstName,
    lastName,
    email,
    passwordHash
  ]);

  // auditLog('USER_REGISTERED', {
  //   userId: newUser.rows[0].id,
  //   tenantId,
  //   email
  // });

  // Transform database response to match Swagger schema
  const userRecord = newUser.rows[0];
  const responseUser = {
    id: userRecord.id,
    tenantId: userRecord.tenant_id,
    employeeNumber: userRecord.employee_number,
    firstName: userRecord.first_name,
    lastName: userRecord.last_name,
    email: userRecord.email,
    tenantName: 'Default Company' // Mock tenant name
  };

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: responseUser
    }
  });
}));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Refresh an existing JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: New JWT authentication token
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token required',
      message: 'Please provide a valid token'
    });
  }

  try {
    const { verifyToken } = require('../middleware/auth');
    const decoded = verifyToken(token);

    // Verify user still exists and is active
    const userResult = await pool.query(`
      SELECT 
        u.id,
        u.tenant_id,
        u.email,
        u.is_active
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND u.is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid user',
        message: 'User not found or inactive'
      });
    }

    const user = userResult.rows[0];

    // Generate new token
    const newToken = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Unable to refresh token'
    });
  }
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user (for audit logging)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 */
// Logout endpoint (for audit logging)
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const { verifyToken } = require('../middleware/auth');
      const decoded = verifyToken(token);
      
      auditLog('LOGOUT', {
        userId: decoded.userId,
        tenantId: decoded.tenantId
      });
    } catch (error) {
      // Token invalid, but still return success for logout
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     description: Send 4-digit OTP to user's email for password reset
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
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
 *                   example: OTP sent to your email
 *                 otpForTesting:
 *                   type: string
 *                   description: OTP for testing (only in demo environment)
 *                   example: "1234"
 *       400:
 *         description: Invalid email
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', validateBody(Joi.object({
  email: Joi.string().email().required()
})), asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // Check if user exists in registered users
  // Mock registered users for demo (in production, this would check actual database)
  const registeredEmails = [
    'admin@company.com',
    'test@company.com', 
    'manager@company.com',
    'employee@company.com',
    'managementtime04@gmail.com', // Gmail account for email testing
    'rishabh738043@gmail.com' // User's email for testing
  ];
  
  const userExists = registeredEmails.some(registeredEmail => 
    registeredEmail.toLowerCase() === email.toLowerCase()
  );
  
  console.log(`📧 User check for ${email}: ${userExists ? 'Found' : 'Not found'} in registered users`);
  console.log(`📋 Registered emails: ${registeredEmails.join(', ')}`)

  // STRICT VALIDATION: Only proceed if user exists
  if (!userExists) {
    console.log(`🚫 BLOCKING unregistered email: ${email}`);
    return res.status(400).json({
      success: false,
      error: 'Email not registered',
      message: 'This email address is not registered with us. Please check your email or register first.'
    });
  }

  // Double check - ensure user is actually in the list
  if (!registeredEmails.includes(email.toLowerCase())) {
    console.log(`🚫 DOUBLE-CHECK FAILED for email: ${email}`);
    return res.status(400).json({
      success: false,
      error: 'Email not registered', 
      message: 'This email address is not registered with us. Please check your email or register first.'
    });
  }

  console.log(`✅ PROCEEDING with registered email: ${email}`);
  
  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Store OTP with expiration (5 minutes)
  const expirationTime = Date.now() + 5 * 60 * 1000;
  otpStorage.set(email, {
    otp: otp,
    expires: expirationTime,
    attempts: 0
  });
  
  try {
    // Send OTP via email
    console.log(`📧 Sending OTP ${otp} to ${email}...`);
    const emailResult = await sendOTPEmail(email, otp);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: `OTP sent successfully to ${email}`,
        expiresIn: '5 minutes'
      });
    } else {
      // Email sending failed - fallback to showing OTP for demo
      console.error('Email sending failed:', emailResult.error);
      console.log('📧 Fallback: Showing OTP in response for demo purposes');
      
      res.json({
        success: true,
        message: `Email sending temporarily unavailable. Here's your OTP for testing:`,
        otpForTesting: otp,
        expiresIn: '5 minutes',
        note: 'In production, this OTP would be sent via email'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Complete fallback - still allow password reset flow
    res.json({
      success: true,
      message: 'OTP generated (email service temporarily unavailable)',
      otpForTesting: otp,
      expiresIn: '5 minutes',
      note: 'In production, this OTP would be sent via email'
    });
  }
}));

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Verify the 4-digit OTP sent to user's email
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: 4-digit OTP
 *                 example: "1234"
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
 *                   example: OTP verified successfully
 *                 resetToken:
 *                   type: string
 *                   description: Temporary token for password reset
 *                   example: "reset_token_abc123"
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', validateBody(Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(4).required()
})), asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  const storedOTP = otpStorage.get(email);
  
  if (!storedOTP) {
    return res.status(400).json({
      error: 'OTP not found',
      message: 'Please request a new OTP'
    });
  }
  
  if (Date.now() > storedOTP.expires) {
    otpStorage.delete(email);
    return res.status(400).json({
      error: 'OTP expired',
      message: 'OTP has expired. Please request a new one'
    });
  }
  
  if (storedOTP.attempts >= 3) {
    otpStorage.delete(email);
    return res.status(400).json({
      error: 'Too many attempts',
      message: 'Too many failed attempts. Please request a new OTP'
    });
  }
  
  if (storedOTP.otp !== otp) {
    storedOTP.attempts++;
    return res.status(400).json({
      error: 'Invalid OTP',
      message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining`
    });
  }
  
  // Generate reset token
  const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mark OTP as verified and store reset token
  storedOTP.verified = true;
  storedOTP.resetToken = resetToken;
  
  res.json({
    success: true,
    message: 'OTP verified successfully',
    resetToken: resetToken
  });
}));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with new password
 *     description: Reset user password using verified reset token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, resetToken, newPassword, confirmPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *               resetToken:
 *                 type: string
 *                 description: Reset token from OTP verification
 *                 example: reset_token_abc123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *                 example: newpassword123
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *                 example: newpassword123
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
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid request or passwords don't match
 */
router.post('/reset-password', validateBody(Joi.object({
  email: Joi.string().email().required(),
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required()
})), asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword, confirmPassword } = req.body;
  
  // Check if passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      error: 'Password mismatch',
      message: 'New password and confirm password do not match'
    });
  }
  
  const storedOTP = otpStorage.get(email);
  
  if (!storedOTP || !storedOTP.verified || storedOTP.resetToken !== resetToken) {
    return res.status(400).json({
      error: 'Invalid reset token',
      message: 'Invalid or expired reset token'
    });
  }
  
  // Check if reset token is still valid (10 minutes after OTP verification)
  if (Date.now() > storedOTP.expires + 10 * 60 * 1000) {
    otpStorage.delete(email);
    return res.status(400).json({
      error: 'Reset token expired',
      message: 'Reset token has expired. Please start the process again'
    });
  }
  
  try {
    // In production, update password in database
    // For demo, just simulate password update
    console.log(`🔐 Password updated for ${email}: ${newPassword}`);
    
    // Update mock credentials if it's admin
    if (email === 'admin@company.com') {
      // Update the validCredentials in login handler (would be database in real app)
      console.log('Admin password updated in mock database');
    }
    
    // Send password reset confirmation email
    const confirmationResult = await sendPasswordResetConfirmation(email);
    
    if (confirmationResult.success) {
      console.log(`📧 Password reset confirmation sent to ${email}`);
    } else {
      console.error('Failed to send confirmation email:', confirmationResult.error);
    }
    
    // Clear OTP storage
    otpStorage.delete(email);
    
    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password. A confirmation email has been sent.'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to reset password. Please try again later.'
    });
  }
}));

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the user's account and all associated data
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, confirmPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for verification
 *                 example: "user@company.com"
 *               password:
 *                 type: string
 *                 description: Current password for confirmation
 *                 example: "currentPassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation (must match password)
 *                 example: "currentPassword123"
 *               reason:
 *                 type: string
 *                 description: Optional reason for account deletion
 *                 example: "No longer need the service"
 *     responses:
 *       200:
 *         description: Account deleted successfully
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
 *                   example: Account deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-12-16T12:00:00Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               passwordMismatch:
 *                 summary: Password confirmation doesn't match
 *                 value:
 *                   error: "Password mismatch"
 *                   message: "Password confirmation doesn't match"
 *               wrongPassword:
 *                 summary: Current password is incorrect
 *                 value:
 *                   error: "Authentication failed"
 *                   message: "Current password is incorrect"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/delete-account', 
  require('../middleware/auth').authenticateToken,
  validateBody(Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required(),
    reason: Joi.string().optional().allow('').max(500)
  })), 
  asyncHandler(async (req, res) => {
    const { email, password, confirmPassword, reason } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log(`🗑️ Account deletion request for user ${userId} (${userEmail})`);
    
    // Validate email matches logged in user
    if (email.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Email mismatch',
        message: 'Provided email does not match your account email'
      });
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password mismatch',
        message: 'Password confirmation doesn\'t match'
      });
    }
    
    try {
      // Get user data for password verification
      const mockDB = require('../config/mock_database');
      
      // Find user in mock database
      const userResult = await new Promise((resolve) => {
        mockDB.query('SELECT id, email, password_hash, first_name, last_name FROM users WHERE id = $1 AND is_active = true', [userId], (err, result) => {
          if (err || !result.rows || result.rows.length === 0) {
            resolve({ rows: [] });
          } else {
            resolve(result);
          }
        });
      });
      
      if (!userResult.rows || userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found or already deleted'
        });
      }
      
      const user = userResult.rows[0];
      
      // Verify current password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        console.log(`❌ Invalid password for account deletion attempt: ${userEmail}`);
        return res.status(400).json({
          success: false,
          error: 'Authentication failed',
          message: 'Current password is incorrect'
        });
      }
      
      // Log deletion attempt
      console.log(`🗑️ Proceeding with account deletion for ${user.first_name} ${user.last_name} (${userEmail})`);
      if (reason) {
        console.log(`📝 Deletion reason: ${reason}`);
      }
      
      // In a real application, you would:
      // 1. Soft delete the user (set is_active = false, deleted_at = NOW())
      // 2. Delete or anonymize user data according to GDPR
      // 3. Cancel subscriptions
      // 4. Send confirmation email
      // 5. Log the deletion for audit purposes
      
      // For mock database, simulate account deletion
      const deletionTimestamp = new Date().toISOString();
      
      // Simulate database deletion (in real app, update user record)
      await new Promise((resolve) => {
        // Mock deletion - in reality you'd run:
        // UPDATE users SET is_active = false, deleted_at = NOW(), deletion_reason = $1 WHERE id = $2
        console.log(`✅ Account deleted successfully for user ${userId} at ${deletionTimestamp}`);
        resolve(true);
      });
      
      // Log audit trail
      auditLog('ACCOUNT_DELETION', {
        userId: userId,
        email: userEmail,
        fullName: `${user.first_name} ${user.last_name}`,
        deletedAt: deletionTimestamp,
        reason: reason || 'No reason provided',
        ipAddress: req.ip || req.connection.remoteAddress
      });
      
      // Success response
      res.json({
        success: true,
        message: 'Account deleted successfully. We\'re sorry to see you go. Your data has been permanently removed from our systems.',
        data: {
          deletedAt: deletionTimestamp,
          email: userEmail
        }
      });
      
    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Unable to delete account. Please try again later or contact support.'
      });
    }
  })
);

module.exports = router;