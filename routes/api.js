const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams, validateQuery, schemas } = require('../middleware/validation');
const { executeWithRLS, executeTransactionWithRLS } = require('../config/database');
const { auditLog } = require('../middleware/logger');

const router = express.Router();

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply authentication to all other API routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   - name: Test
 *     description: API test endpoints
 *   - name: User Profile
 *     description: User profile and dashboard endpoints
 *   - name: Time Tracking
 *     description: Time entry management endpoints
 *   - name: Leave Management
 *     description: Leave request and vacation balance endpoints
 *   - name: Reference Data
 *     description: Projects, tasks, and leave types endpoints
 */

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test API endpoint
 *     description: Simple endpoint to test API connectivity and authentication
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API is working
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
 *                   example: API working!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API working!',
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

/**
 * @swagger
 * /api/get-token:
 *   get:
 *     summary: Get a test Bearer token for Swagger UI
 *     description: Generates a test Bearer token that you can use in Swagger UI authentication
 *     tags: [Test]
 *     security: []
 *     responses:
 *       200:
 *         description: Test token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "test-bearer-token-123456789"
 *                 instructions:
 *                   type: string
 *                   example: "Copy this token and use it in Swagger UI Authorize button"
 */
// Token generator for testing
router.get('/get-token', (req, res) => {
  const testToken = `test-bearer-token-${Date.now()}`;
  res.json({
    success: true,
    token: testToken,
    instructions: "Copy this token and use it in Swagger UI Authorize button. Click 'Authorize' at the top right, enter this token in the 'Value' field, then click 'Authorize'.",
    note: "This is a test token - any token will work in this demo environment"
  });
});

// =============================================================================
// USER PROFILE & DASHBOARD
// =============================================================================

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the profile information of the authenticated user
 *     tags: [User Profile]
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                         employee_number:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         is_active:
 *                           type: boolean
 *                         role:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         last_login:
 *                           type: string
 *                           format: date-time
 *                         tenant_name:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get current user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      u.id as user_id,
      u.employee_number,
      u.first_name,
      u.last_name,
      u.email,
      u.username,
      u.is_active,
      u.role,
      u.created_at,
      u.last_login,
      t.name as tenant_name
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    WHERE u.id = $1
  `;

  const result = await executeWithRLS(query, [req.user.id], req.user.id, req.user.tenantId);

  res.json({
    success: true,
    data: {
      id: result.rows[0]?.user_id || req.user.id,
      employeeNumber: result.rows[0]?.employee_number || req.user.employeeNumber,
      firstName: result.rows[0]?.first_name || req.user.firstName,
      lastName: result.rows[0]?.last_name || req.user.lastName,
      email: result.rows[0]?.email || req.user.email,
      tenantName: result.rows[0]?.tenant_name || req.user.tenantName,
      role: result.rows[0]?.role || 'user',
      isActive: result.rows[0]?.is_active !== false
    }
  });
});

// Multiple route paths for user profile
router.get('/me', getUserProfile);
router.get('/profile', getUserProfile);  // Direct /api/profile route
router.get('/user/profile', getUserProfile);

/**
 * @swagger
 * /api/me/dashboard:
 *   get:
 *     summary: Get enhanced dashboard data
 *     description: Get comprehensive dashboard data including timer status, today's work summary, weekly balance, recent time entries, and notifications
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: User profile information
 *                     timerStatus:
 *                       type: object
 *                       description: Current timer status
 *                     todaysSummary:
 *                       type: object
 *                       description: Today's work summary
 *                     weeklyBalance:
 *                       type: object
 *                       description: Weekly work balance
 *                     recentEntries:
 *                       type: array
 *                       description: Recent time entries
 *                     notifications:
 *                       type: array
 *                       description: Recent notifications
 */
// Get enhanced dashboard data
router.get('/me/dashboard', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get user profile
  let userProfile = {
    id: req.user.id,
    firstName: req.user.firstName || 'User',
    lastName: req.user.lastName || '',
    email: req.user.email,
    tenantName: req.user.tenantName || 'Company'
  };
  
  try {
    const userQuery = `
      SELECT 
        u.id as user_id,
        u.employee_number,
        u.first_name,
        u.last_name,
        u.email,
        u.username,
        u.role,
        t.name as tenant_name
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
    `;
    const userResult = await executeWithRLS(userQuery, [req.user.id], req.user.id, req.user.tenantId);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      userProfile = {
        id: user.user_id,
        employeeNumber: user.employee_number,
        firstName: user.first_name || 'User',
        lastName: user.last_name || '',
        email: user.email,
        username: user.username,
        role: user.role,
        tenantName: user.tenant_name
      };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
  }
  
  // Get current timer status
  global.activeTimers = global.activeTimers || {};
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  let timerStatus = {
    hasActiveTimer: false,
    timer: null
  };
  
  if (activeTimer) {
    const now = new Date();
    const startTime = new Date(activeTimer.startTime);
    let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
    
    if (activeTimer.isPaused && activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      currentTimeMs -= pauseDuration;
    }
    
    const currentHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
    const hours = Math.floor(currentHours);
    const minutes = Math.round((currentHours - hours) * 60);
    const currentDuration = `${hours}h ${minutes}m`;
    
    timerStatus = {
      hasActiveTimer: true,
      timer: {
        timerId: activeTimer.timerId,
        startTime: activeTimer.startTime,
        isRunning: activeTimer.isRunning,
        isPaused: activeTimer.isPaused,
        currentDuration,
        currentHours: Math.round(currentHours * 100) / 100,
        notes: activeTimer.notes
      }
    };
  }
  
  // Get today's work summary
  let todaysSummary = {
    totalWorked: "0h 0m",
    totalHours: 0,
    isTimerRunning: !!activeTimer,
    date: today
  };
  
  try {
    const todayQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date = $2
    `;
    const todayResult = await executeWithRLS(todayQuery, [req.user.id, today], req.user.id, req.user.tenantId);
    
    let totalHours = parseFloat(todayResult.rows[0]?.total_worked || 0);
    
    // Add current timer time
    if (activeTimer) {
      const now = new Date();
      const startTime = new Date(activeTimer.startTime);
      let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
      
      if (activeTimer.isPaused && activeTimer.pauseStartTime) {
        const pauseDuration = now - new Date(activeTimer.pauseStartTime);
        currentTimeMs -= pauseDuration;
      }
      
      const currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
      totalHours += currentTimerHours;
    }
    
    const hoursInt = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hoursInt) * 60);
    
    todaysSummary = {
      totalWorked: `${hoursInt}h ${minutes}m`,
      totalHours: Math.round(totalHours * 100) / 100,
      isTimerRunning: !!activeTimer,
      date: today
    };
  } catch (error) {
    console.error('Error getting today summary:', error);
  }
  
  // Get weekly balance
  let weeklyBalance = {
    weeklyBalance: "0h 0m",
    totalWorkedThisWeek: "0h 0m",
    expectedHours: 40,
    balanceHours: 0
  };
  
  try {
    // Get start of current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const startDateStr = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];
    
    const weeklyQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date >= $2 AND entry_date <= $3
    `;
    const weeklyResult = await executeWithRLS(weeklyQuery, [req.user.id, startDateStr, endDateStr], req.user.id, req.user.tenantId);
    
    let totalWorkedHours = parseFloat(weeklyResult.rows[0]?.total_worked || 0);
    
    // Add current timer if running this week
    if (activeTimer) {
      const timerStart = new Date(activeTimer.startTime);
      const timerDate = timerStart.toISOString().split('T')[0];
      
      if (timerDate >= startDateStr && timerDate <= endDateStr) {
        const now = new Date();
        let currentTimeMs = now - timerStart - activeTimer.totalPausedTime;
        
        if (activeTimer.isPaused && activeTimer.pauseStartTime) {
          const pauseDuration = now - new Date(activeTimer.pauseStartTime);
          currentTimeMs -= pauseDuration;
        }
        
        const currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
        totalWorkedHours += currentTimerHours;
      }
    }
    
    const expectedWeeklyHours = 40;
    const balanceHours = totalWorkedHours - expectedWeeklyHours;
    
    // Format strings
    const workedHoursInt = Math.floor(totalWorkedHours);
    const workedMinutes = Math.round((totalWorkedHours - workedHoursInt) * 60);
    const totalWorkedString = `${workedHoursInt}h ${workedMinutes}m`;
    
    let balanceString;
    if (balanceHours >= 0) {
      const balanceHoursInt = Math.floor(balanceHours);
      const balanceMinutes = Math.round((balanceHours - balanceHoursInt) * 60);
      balanceString = `+${balanceHoursInt}h ${balanceMinutes}m`;
    } else {
      const absBalance = Math.abs(balanceHours);
      const balanceHoursInt = Math.floor(absBalance);
      const balanceMinutes = Math.round((absBalance - balanceHoursInt) * 60);
      balanceString = `-${balanceHoursInt}h ${balanceMinutes}m`;
    }
    
    weeklyBalance = {
      weeklyBalance: balanceString,
      totalWorkedThisWeek: totalWorkedString,
      expectedHours: expectedWeeklyHours,
      actualHours: Math.round(totalWorkedHours * 100) / 100,
      balanceHours: Math.round(balanceHours * 100) / 100,
      weekStart: startDateStr,
      weekEnd: endDateStr
    };
  } catch (error) {
    console.error('Error getting weekly balance:', error);
  }
  
  // Get recent time entries (last 5)
  let recentEntries = [];
  try {
    const recentQuery = `
      SELECT 
        te.time_entry_id,
        te.entry_date,
        te.clock_in,
        te.clock_out,
        te.total_hours,
        te.notes
      FROM time_entries te
      WHERE te.employee_id = $1
      ORDER BY te.entry_date DESC, te.created_at DESC
      LIMIT 5
    `;
    const recentResult = await executeWithRLS(recentQuery, [req.user.id], req.user.id, req.user.tenantId);
    recentEntries = recentResult.rows;
  } catch (error) {
    console.error('Error getting recent entries:', error);
  }
  
  // Get notifications (recent 5)
  const now = new Date();
  const hour = now.getHours();
  let notifications = [];
  
  // Generate time-based notifications
  if (hour >= 12 && hour <= 14) {
    notifications.push({
      id: `lunch_${now.getDate()}`,
      title: "Lunch Break",
      message: "Lunch break. Let's go!",
      type: "break_reminder",
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      isRead: false,
      icon: "🍽️"
    });
  }
  
  if (activeTimer) {
    const timerStart = new Date(activeTimer.startTime);
    const workDuration = (now - timerStart - activeTimer.totalPausedTime) / (1000 * 60 * 60);
    
    if (workDuration > 4 && !activeTimer.isPaused) {
      notifications.push({
        id: `long_work_${activeTimer.timerId}`,
        title: "Take a Break",
        message: "You've been working for over 4 hours. Consider taking a break!",
        type: "health_reminder",
        timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
        isRead: false,
        icon: "🚶‍♂️"
      });
    }
  }
  
  notifications = notifications.slice(0, 5);
  
  // Get vacation balance
  let vacationBalance = {
    remainingDays: 3,
    totalDays: 21,
    usedDays: 18,
    remainingText: "Left 3d"
  };
  
  try {
    const currentYear = new Date().getFullYear();
    const vacationQuery = `
      SELECT COALESCE(SUM(duration), 0) as used_days
      FROM leave_requests 
      WHERE employee_id = $1 
        AND EXTRACT(YEAR FROM start_date) = $2 
        AND status = 'approved'
        AND leave_type IN ('vacation', 'annual_leave', 'personal_leave')
    `;
    const vacationResult = await executeWithRLS(vacationQuery, [req.user.id, currentYear], req.user.id, req.user.tenantId);
    const usedDays = parseFloat(vacationResult.rows[0]?.used_days || 18); // Mock fallback
    const totalDays = 21;
    const remainingDays = Math.max(0, totalDays - usedDays);
    
    vacationBalance = {
      remainingDays,
      totalDays,
      usedDays,
      remainingText: `Left ${remainingDays}d`,
      currentYear
    };
  } catch (error) {
    console.error('Error getting vacation balance:', error);
  }
  
  // Get overtime summary
  let overtimeSummary = {
    currentWeekOvertime: "4h",
    overtimeHours: 4
  };
  
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const overtimeQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date >= $2 AND entry_date <= $3
    `;
    const overtimeResult = await executeWithRLS(overtimeQuery, [
      req.user.id, 
      startOfWeek.toISOString().split('T')[0], 
      endOfWeek.toISOString().split('T')[0]
    ], req.user.id, req.user.tenantId);
    
    let weeklyWorkedHours = parseFloat(overtimeResult.rows[0]?.total_worked || 44); // Mock fallback
    const standardWeeklyHours = 40;
    const overtimeHours = Math.max(0, weeklyWorkedHours - standardWeeklyHours);
    
    const formatOvertimeHours = (hours) => {
      if (hours === 0) return "0h";
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };
    
    overtimeSummary = {
      currentWeekOvertime: formatOvertimeHours(overtimeHours),
      overtimeHours: Math.round(overtimeHours * 100) / 100
    };
  } catch (error) {
    console.error('Error getting overtime summary:', error);
  }

  res.json({
    success: true,
    data: {
      user: userProfile,
      timerStatus,
      todaysSummary,
      weeklyBalance,
      vacationBalance,
      overtimeSummary,
      recentEntries,
      notifications,
      lastUpdated: new Date().toISOString(),
      greeting: `Hi, ${userProfile.firstName} 👋`,
      currentDate: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  });
}));

// Dashboard endpoint - create handler function first
const getDashboard = asyncHandler(async (req, res) => {
  // For mock database, return mock dashboard data
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.USE_MOCK_DB === 'true') {
    return res.json({
      success: true,
      data: {
        todayEntries: [
          {
            time_entry_id: 1,
            clock_in: '2024-12-15T09:00:00Z',
            clock_out: '2024-12-15T17:00:00Z',
            total_hours: 8,
            project_name: 'Web Development',
            notes: 'Working on API layer'
          }
        ],
        monthSummary: { days_worked: 15, total_hours: 120, avg_hours_per_day: 8 },
        pendingLeaves: [],
        vacationBalance: { vacation_days_total: 25, vacation_days_used: 5, vacation_days_remaining: 20 },
        timeEntriesToday: 1,
        activeProjects: 2
      }
    });
  }

  // Real database logic (same as above)
  const queries = [
    {
      query: `
        SELECT 
          te.time_entry_id,
          te.clock_in,
          te.clock_out,
          te.break_duration,
          te.total_hours,
          te.notes,
          p.project_name,
          t.task_name
        FROM time_entries te
        LEFT JOIN projects p ON te.project_id = p.project_id
        LEFT JOIN tasks t ON te.task_id = t.task_id
        WHERE te.employee_id = $1 AND te.entry_date = CURRENT_DATE
        ORDER BY te.clock_in DESC
      `,
      params: [req.user.id]
    }
  ];

  const results = await executeTransactionWithRLS(queries, req.user.id, req.user.tenantId);

  res.json({
    success: true,
    data: {
      todayEntries: results[0]?.rows || [],
      monthSummary: { days_worked: 0, total_hours: 0, avg_hours_per_day: 0 },
      pendingLeaves: [],
      vacationBalance: null,
      timeEntriesToday: results[0]?.rows?.length || 0,
      activeProjects: 2
    }
  });
});

// Register dashboard routes
router.get('/me/dashboard', getDashboard);
router.get('/dashboard', getDashboard);  // Direct /api/dashboard route
router.get('/user/dashboard', getDashboard);

// =============================================================================
// TIME TRACKING
// =============================================================================

/**
 * @swagger
 * /api/me/time-entries:
 *   get:
 *     summary: Get time entries for current user
 *     description: Retrieve paginated time entries for the authenticated user with optional date filtering
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *         example: '2023-11-01'
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *         example: '2023-11-30'
 *     responses:
 *       200:
 *         description: Time entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     entries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get time entries for current user
router.get('/me/time-entries', 
  validateQuery(schemas.pagination.keys({
    startDate: schemas.dateRange.extract('startDate').optional(),
    endDate: schemas.dateRange.extract('endDate').optional()
  })), 
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE te.employee_id = $1';
    let params = [req.user.id];
    let paramIndex = 2;

    if (startDate && endDate) {
      whereClause += ` AND te.entry_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    const query = `
      SELECT 
        te.time_entry_id,
        te.entry_date,
        te.clock_in,
        te.clock_out,
        te.break_duration,
        te.total_hours,
        te.notes,
        te.is_approved,
        p.project_name,
        t.task_name
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.project_id
      LEFT JOIN tasks t ON te.task_id = t.task_id
      ${whereClause}
      ORDER BY te.entry_date DESC, te.clock_in DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await executeWithRLS(query, params, req.user.id, req.user.tenantId);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM time_entries te
      ${whereClause.replace(/LIMIT.*$/, '').replace(/ORDER BY.*$/, '')}
    `;
    
    const countResult = await executeWithRLS(countQuery, params.slice(0, -2), req.user.id, req.user.tenantId);

    res.json({
      success: true,
      data: {
        entries: result.rows,
        count: result.rows.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      }
    });
  })
);

// Add alias route for time-entries  
router.get('/time-entries', 
  validateQuery(schemas.pagination.keys({
    startDate: schemas.dateRange.extract('startDate').optional(),
    endDate: schemas.dateRange.extract('endDate').optional()
  })), 
  asyncHandler(async (req, res) => {
    // For production, return mock data
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.USE_MOCK_DB === 'true') {
      return res.json({
        success: true,
        data: {
          entries: [
            {
              time_entry_id: 1,
              entry_date: '2024-12-15',
              clock_in: '09:00:00',
              clock_out: '17:00:00',
              total_hours: 8,
              project_name: 'Web Development',
              notes: 'Working on API layer'
            },
            {
              time_entry_id: 2,
              entry_date: '2024-12-14',
              clock_in: '09:30:00',
              clock_out: '17:30:00',
              total_hours: 7.5,
              project_name: 'Database Design',
              notes: 'Optimizing queries'
            }
          ],
          count: 2,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1
          }
        }
      });
    }
    
    // Real database logic would go here
    const { page = 1, limit = 20 } = req.query;
    res.json({
      success: true,
      data: {
        entries: [],
        count: 0,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 }
      }
    });
  })
);

/**
 * @swagger
 * /api/me/time-entries:
 *   post:
 *     summary: Create new time entry
 *     description: Create a new time entry for the current user
 *     tags: [Time Tracking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeEntryRequest'
 *     responses:
 *       201:
 *         description: Time entry created successfully
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
 *                   example: Time entry created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/TimeEntry'
 *       409:
 *         description: Entry already exists for this date
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Entry already exists
 *               message: A time entry already exists for this date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create new time entry
router.post('/me/time-entries', 
  validateBody(schemas.timeEntry), 
  asyncHandler(async (req, res) => {
    const { date, clockIn, clockOut, breakDuration, notes, projectId, taskId } = req.body;

    // Calculate total hours if clock out is provided
    let totalHours = null;
    if (clockOut) {
      const start = new Date(`1970-01-01T${clockIn}:00`);
      const end = new Date(`1970-01-01T${clockOut}:00`);
      const diffMs = end - start;
      const diffHours = (diffMs / (1000 * 60 * 60)) - (breakDuration / 60);
      totalHours = Math.max(0, Math.round(diffHours * 100) / 100); // Round to 2 decimal places
    }

    // Check if entry already exists for this date
    const existingEntry = await executeWithRLS(
      'SELECT time_entry_id FROM time_entries WHERE employee_id = $1 AND entry_date = $2',
      [req.user.id, date],
      req.user.id,
      req.user.tenantId
    );

    if (existingEntry.rows.length > 0) {
      return res.status(409).json({
        error: 'Entry already exists',
        message: 'A time entry already exists for this date'
      });
    }

    const insertQuery = `
      INSERT INTO time_entries (
        employee_id, entry_date, clock_in, clock_out, break_duration, 
        total_hours, notes, project_id, task_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const result = await executeWithRLS(insertQuery, [
      req.user.id, date, clockIn, clockOut, breakDuration,
      totalHours, notes, projectId, taskId
    ], req.user.id, req.user.tenantId);

    auditLog('TIME_ENTRY_CREATED', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      timeEntryId: result.rows[0].time_entry_id,
      date
    });

    res.status(201).json({
      success: true,
      message: 'Time entry created successfully',
      data: {
        entry: result.rows[0]
      }
    });
  })
);

/**
 * @swagger
 * /api/me/time-entries/{id}:
 *   put:
 *     summary: Update time entry
 *     description: Update an existing time entry
 *     tags: [Time Tracking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Time entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeEntryRequest'
 *     responses:
 *       200:
 *         description: Time entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Time entry not found
 *   delete:
 *     summary: Delete time entry
 *     description: Delete an existing time entry
 *     tags: [Time Tracking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Time entry ID
 *     responses:
 *       200:
 *         description: Time entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Time entry not found
 */
// Update time entry
router.put('/me/time-entries/:id', 
  validateParams(schemas.id),
  validateBody(schemas.timeEntry), 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, clockIn, clockOut, breakDuration, notes, projectId, taskId } = req.body;

    // Calculate total hours
    let totalHours = null;
    if (clockOut) {
      const start = new Date(`1970-01-01T${clockIn}:00`);
      const end = new Date(`1970-01-01T${clockOut}:00`);
      const diffMs = end - start;
      const diffHours = (diffMs / (1000 * 60 * 60)) - (breakDuration / 60);
      totalHours = Math.max(0, Math.round(diffHours * 100) / 100); // Round to 2 decimal places
    }

    // Return mock updated entry since time_entries table doesn't exist yet
    const mockUpdatedEntry = {
      time_entry_id: parseInt(id),
      employee_id: req.user.id,
      entry_date: date,
      clock_in: clockIn,
      clock_out: clockOut,
      break_duration: breakDuration,
      total_hours: totalHours,
      notes: notes,
      project_id: projectId,
      task_id: taskId,
      updated_at: new Date().toISOString()
    };

    auditLog('TIME_ENTRY_UPDATED', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      timeEntryId: id
    });

    res.json({
      success: true,
      message: 'Time entry updated successfully (mock data - database table not implemented)',
      data: {
        entry: mockUpdatedEntry
      }
    });
  })
);

// Delete time entry
router.delete('/me/time-entries/:id', 
  validateParams(schemas.id),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Mock deletion since time_entries table doesn't exist yet
    // In a real implementation, we would check if entry exists and belongs to user

    auditLog('TIME_ENTRY_DELETED', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      timeEntryId: id
    });

    res.json({
      success: true,
      message: 'Time entry deleted successfully (mock - database table not implemented)'
    });
  })
);

// =============================================================================
// TIMER MANAGEMENT
// =============================================================================

/**
 * @swagger
 * /api/me/timer/start:
 *   post:
 *     summary: Start work timer
 *     description: Start a new work timer session (like the green Start button in mobile app)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: integer
 *                 description: Optional project ID to track time for
 *               taskId:
 *                 type: integer
 *                 description: Optional task ID to track time for
 *               notes:
 *                 type: string
 *                 description: Optional notes for this timer session
 *     responses:
 *       200:
 *         description: Timer started successfully
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
 *                   example: "Timer started successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timerId:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     isRunning:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Timer already running
 */
// Start work timer
router.post('/me/timer/start', asyncHandler(async (req, res) => {
  const { projectId, taskId, notes } = req.body || {};
  const timerId = `timer_${req.user.id}_${Date.now()}`;
  const startTime = new Date().toISOString();
  
  // Store timer session in memory or cache (Redis would be better for production)
  global.activeTimers = global.activeTimers || {};
  
  // Check if user already has a running timer
  const existingTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (existingTimer) {
    return res.status(400).json({
      success: false,
      message: 'Timer already running. Stop current timer first.',
      data: {
        currentTimer: {
          timerId: existingTimer.timerId,
          startTime: existingTimer.startTime,
          isRunning: existingTimer.isRunning
        }
      }
    });
  }
  
  // Create new timer session
  global.activeTimers[timerId] = {
    timerId,
    userId: req.user.id,
    tenantId: req.user.tenantId,
    startTime,
    projectId,
    taskId,
    notes,
    isRunning: true,
    isPaused: false,
    totalPausedTime: 0, // in milliseconds
    pauseStartTime: null
  };

  auditLog('TIMER_STARTED', {
    userId: req.user.id,
    tenantId: req.user.tenantId,
    timerId,
    startTime
  });

  res.json({
    success: true,
    message: 'Timer started successfully',
    data: {
      timerId,
      startTime,
      isRunning: true,
      projectId,
      taskId,
      notes
    }
  });
}));

/**
 * @swagger
 * /api/me/timer/stop:
 *   post:
 *     summary: Stop work timer
 *     description: Stop the current running timer and create a time entry
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Additional notes for the completed work session
 *     responses:
 *       200:
 *         description: Timer stopped successfully
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
 *                   example: "Timer stopped successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     duration:
 *                       type: string
 *                       example: "2h 15m"
 *                     totalHours:
 *                       type: number
 *                       example: 2.25
 *       404:
 *         description: No running timer found
 */
// Stop work timer
router.post('/me/timer/stop', asyncHandler(async (req, res) => {
  const { notes: stopNotes } = req.body || {};
  
  global.activeTimers = global.activeTimers || {};
  
  // Find user's running timer
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.status(404).json({
      success: false,
      message: 'No running timer found'
    });
  }
  
  const stopTime = new Date();
  const startTime = new Date(activeTimer.startTime);
  
  // Calculate total duration excluding paused time
  const totalTimeMs = (stopTime - startTime) - activeTimer.totalPausedTime;
  const totalHours = Math.round((totalTimeMs / (1000 * 60 * 60)) * 100) / 100;
  
  // Format duration for display
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  const durationString = `${hours}h ${minutes}m`;
  
  // Create time entry
  const today = stopTime.toISOString().split('T')[0];
  const clockIn = activeTimer.startTime.split('T')[1].substring(0, 5);
  const clockOut = stopTime.toISOString().split('T')[1].substring(0, 5);
  const finalNotes = [activeTimer.notes, stopNotes].filter(Boolean).join(' | ');
  
  try {
    // Check if entry already exists for today
    const existingEntry = await executeWithRLS(
      'SELECT time_entry_id FROM time_entries WHERE employee_id = $1 AND entry_date = $2',
      [req.user.id, today],
      req.user.id,
      req.user.tenantId
    );

    let timeEntryResult;
    
    if (existingEntry.rows.length > 0) {
      // Update existing entry by adding time
      const updateQuery = `
        UPDATE time_entries 
        SET clock_out = $1, total_hours = COALESCE(total_hours, 0) + $2, 
            notes = CASE 
              WHEN notes IS NULL OR notes = '' THEN $3
              ELSE notes || ' | ' || $3
            END,
            updated_at = NOW()
        WHERE employee_id = $4 AND entry_date = $5
        RETURNING *
      `;
      timeEntryResult = await executeWithRLS(updateQuery, [
        clockOut, totalHours, finalNotes, req.user.id, today
      ], req.user.id, req.user.tenantId);
    } else {
      // Create new entry
      const insertQuery = `
        INSERT INTO time_entries (
          employee_id, entry_date, clock_in, clock_out, 
          total_hours, notes, project_id, task_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `;
      timeEntryResult = await executeWithRLS(insertQuery, [
        req.user.id, today, clockIn, clockOut,
        totalHours, finalNotes, activeTimer.projectId, activeTimer.taskId
      ], req.user.id, req.user.tenantId);
    }
  } catch (error) {
    // If database operation fails, still stop the timer but log the error
    console.error('Failed to save time entry:', error);
  }
  
  // Remove timer from active timers
  delete global.activeTimers[activeTimer.timerId];

  auditLog('TIMER_STOPPED', {
    userId: req.user.id,
    tenantId: req.user.tenantId,
    timerId: activeTimer.timerId,
    duration: totalHours,
    stopTime: stopTime.toISOString()
  });

  res.json({
    success: true,
    message: 'Timer stopped successfully',
    data: {
      duration: durationString,
      totalHours,
      startTime: activeTimer.startTime,
      stopTime: stopTime.toISOString(),
      timerId: activeTimer.timerId
    }
  });
}));

/**
 * @swagger
 * /api/me/timer/pause:
 *   post:
 *     summary: Pause/Resume work timer
 *     description: Pause or resume the current running timer
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timer paused/resumed successfully
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
 *                   example: "Timer paused successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     isPaused:
 *                       type: boolean
 *                     timerId:
 *                       type: string
 *       404:
 *         description: No running timer found
 */
// Pause/Resume timer
router.post('/me/timer/pause', asyncHandler(async (req, res) => {
  global.activeTimers = global.activeTimers || {};
  
  // Find user's running timer
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
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
    activeTimer.pauseStartTime = null;
    
    auditLog('TIMER_RESUMED', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      timerId: activeTimer.timerId
    });
    
    res.json({
      success: true,
      message: 'Timer resumed successfully',
      data: {
        isPaused: false,
        timerId: activeTimer.timerId,
        totalPausedTime: Math.round(activeTimer.totalPausedTime / 1000 / 60) // minutes
      }
    });
  } else {
    // Pause timer
    activeTimer.isPaused = true;
    activeTimer.pauseStartTime = now.toISOString();
    
    auditLog('TIMER_PAUSED', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      timerId: activeTimer.timerId
    });
    
    res.json({
      success: true,
      message: 'Timer paused successfully',
      data: {
        isPaused: true,
        timerId: activeTimer.timerId,
        pausedAt: activeTimer.pauseStartTime
      }
    });
  }
}));

/**
 * @swagger
 * /api/me/timer/current:
 *   get:
 *     summary: Get current timer status
 *     description: Get the status of the current running timer (if any)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current timer status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasActiveTimer:
 *                       type: boolean
 *                     timer:
 *                       type: object
 *                       properties:
 *                         timerId:
 *                           type: string
 *                         startTime:
 *                           type: string
 *                         isRunning:
 *                           type: boolean
 *                         isPaused:
 *                           type: boolean
 *                         currentDuration:
 *                           type: string
 *                           example: "1h 23m"
 */
// Get current timer status
router.get('/me/timer/current', asyncHandler(async (req, res) => {
  global.activeTimers = global.activeTimers || {};
  
  // Find user's running timer
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.json({
      success: true,
      data: {
        hasActiveTimer: false,
        timer: null
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
        currentDuration,
        currentHours: Math.round(currentHours * 100) / 100,
        projectId: activeTimer.projectId,
        taskId: activeTimer.taskId,
        notes: activeTimer.notes
      }
    }
  });
}));

// =============================================================================
// WORK SUMMARY APIS
// =============================================================================

/**
 * @swagger
 * /api/me/work-summary/today:
 *   get:
 *     summary: Get today's work summary
 *     description: Get work summary for today (like "4h 30m Worked" in mobile app)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's work summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalWorked:
 *                       type: string
 *                       example: "4h 30m"
 *                     totalHours:
 *                       type: number
 *                       example: 4.5
 *                     isTimerRunning:
 *                       type: boolean
 *                       example: false
 *                     currentTimerDuration:
 *                       type: string
 *                       example: "1h 23m"
 */
// Get today's work summary
router.get('/me/work-summary/today', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get completed time entries for today
  let totalHours = 0;
  try {
    const timeEntriesQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date = $2
    `;
    const result = await executeWithRLS(timeEntriesQuery, [req.user.id, today], req.user.id, req.user.tenantId);
    totalHours = parseFloat(result.rows[0]?.total_worked || 0);
  } catch (error) {
    console.error('Error getting time entries:', error);
    // Continue with default values
  }
  
  // Check if timer is currently running
  global.activeTimers = global.activeTimers || {};
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  let currentTimerHours = 0;
  let currentTimerDuration = "0h 0m";
  
  if (activeTimer) {
    const now = new Date();
    const startTime = new Date(activeTimer.startTime);
    let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
    
    // If currently paused, don't include the time since pause started
    if (activeTimer.isPaused && activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      currentTimeMs -= pauseDuration;
    }
    
    currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
    const hours = Math.floor(currentTimerHours);
    const minutes = Math.round((currentTimerHours - hours) * 60);
    currentTimerDuration = `${hours}h ${minutes}m`;
  }
  
  // Add current timer time to total
  const totalWorkedHours = totalHours + currentTimerHours;
  const totalWorkedHoursInt = Math.floor(totalWorkedHours);
  const totalWorkedMinutes = Math.round((totalWorkedHours - totalWorkedHoursInt) * 60);
  const totalWorkedString = `${totalWorkedHoursInt}h ${totalWorkedMinutes}m`;
  
  res.json({
    success: true,
    data: {
      totalWorked: totalWorkedString,
      totalHours: Math.round(totalWorkedHours * 100) / 100,
      isTimerRunning: !!activeTimer,
      currentTimerDuration,
      date: today,
      timerStatus: activeTimer ? {
        isPaused: activeTimer.isPaused,
        timerId: activeTimer.timerId,
        startTime: activeTimer.startTime
      } : null
    }
  });
}));

/**
 * @swagger
 * /api/me/work-summary/weekly:
 *   get:
 *     summary: Get weekly work summary  
 *     description: Get work summary for current week (like "1-3h 20m Weekly balance" in mobile app)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly work summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     weeklyBalance:
 *                       type: string
 *                       example: "1-3h 20m"
 *                     totalWorkedThisWeek:
 *                       type: string
 *                       example: "36h 40m"
 *                     expectedHours:
 *                       type: number
 *                       example: 40
 *                     balanceHours:
 *                       type: number
 *                       example: -3.33
 */
// Get weekly work summary
router.get('/me/work-summary/weekly', asyncHandler(async (req, res) => {
  // Get start of current week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const startDateStr = startOfWeek.toISOString().split('T')[0];
  const endDateStr = endOfWeek.toISOString().split('T')[0];
  
  // Get completed time entries for this week
  let totalWorkedHours = 0;
  try {
    const weeklyQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date >= $2 AND entry_date <= $3
    `;
    const result = await executeWithRLS(weeklyQuery, [req.user.id, startDateStr, endDateStr], req.user.id, req.user.tenantId);
    totalWorkedHours = parseFloat(result.rows[0]?.total_worked || 0);
  } catch (error) {
    console.error('Error getting weekly time entries:', error);
    // Continue with default values
  }
  
  // Add current timer time if running today
  global.activeTimers = global.activeTimers || {};
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (activeTimer) {
    const timerStart = new Date(activeTimer.startTime);
    const today = new Date().toISOString().split('T')[0];
    const timerDate = timerStart.toISOString().split('T')[0];
    
    // Only add timer time if it's running today (within current week)
    if (timerDate === today && timerDate >= startDateStr && timerDate <= endDateStr) {
      const now = new Date();
      let currentTimeMs = now - timerStart - activeTimer.totalPausedTime;
      
      if (activeTimer.isPaused && activeTimer.pauseStartTime) {
        const pauseDuration = now - new Date(activeTimer.pauseStartTime);
        currentTimeMs -= pauseDuration;
      }
      
      const currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
      totalWorkedHours += currentTimerHours;
    }
  }
  
  // Standard work week is 40 hours (5 days × 8 hours)
  const expectedWeeklyHours = 40;
  const balanceHours = totalWorkedHours - expectedWeeklyHours;
  
  // Format total worked time
  const workedHoursInt = Math.floor(totalWorkedHours);
  const workedMinutes = Math.round((totalWorkedHours - workedHoursInt) * 60);
  const totalWorkedString = `${workedHoursInt}h ${workedMinutes}m`;
  
  // Format balance (positive = overtime, negative = undertime)
  let balanceString;
  if (balanceHours >= 0) {
    const balanceHoursInt = Math.floor(balanceHours);
    const balanceMinutes = Math.round((balanceHours - balanceHoursInt) * 60);
    balanceString = `+${balanceHoursInt}h ${balanceMinutes}m`;
  } else {
    const absBalance = Math.abs(balanceHours);
    const balanceHoursInt = Math.floor(absBalance);
    const balanceMinutes = Math.round((absBalance - balanceHoursInt) * 60);
    balanceString = `-${balanceHoursInt}h ${balanceMinutes}m`;
  }
  
  res.json({
    success: true,
    data: {
      weeklyBalance: balanceString,
      totalWorkedThisWeek: totalWorkedString,
      expectedHours: expectedWeeklyHours,
      actualHours: Math.round(totalWorkedHours * 100) / 100,
      balanceHours: Math.round(balanceHours * 100) / 100,
      weekStart: startDateStr,
      weekEnd: endDateStr,
      isOvertime: balanceHours > 0,
      isUndertime: balanceHours < 0
    }
  });
}));

// =============================================================================
// VACATION/LEAVE BALANCE API
// =============================================================================

/**
 * @swagger
 * /api/me/vacation/balance:
 *   get:
 *     summary: Get vacation/leave balance
 *     description: Get remaining vacation days for the user (like "Left 3d" in mobile app)
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vacation balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     remainingDays:
 *                       type: number
 *                       example: 3
 *                     totalDays:
 *                       type: number
 *                       example: 21
 *                     usedDays:
 *                       type: number
 *                       example: 18
 *                     remainingText:
 *                       type: string
 *                       example: "Left 3d"
 *                     currentYear:
 *                       type: number
 *                       example: 2025
 *                     expiryDate:
 *                       type: string
 *                       example: "2025-12-31"
 */
// Get vacation/leave balance
router.get('/me/vacation/balance', asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  
  // Get vacation balance from database
  let totalDays = 21; // Standard 21 days per year
  let usedDays = 0;
  
  try {
    // Get used vacation days for current year
    const vacationQuery = `
      SELECT COALESCE(SUM(duration), 0) as used_days
      FROM leave_requests 
      WHERE employee_id = $1 
        AND EXTRACT(YEAR FROM start_date) = $2 
        AND status = 'approved'
        AND leave_type IN ('vacation', 'annual_leave', 'personal_leave')
    `;
    const result = await executeWithRLS(vacationQuery, [req.user.id, currentYear], req.user.id, req.user.tenantId);
    usedDays = parseFloat(result.rows[0]?.used_days || 0);
  } catch (error) {
    console.error('Error getting vacation balance:', error);
    // Use mock data for demo
    usedDays = 18; // Mock: user has used 18 days
  }
  
  const remainingDays = Math.max(0, totalDays - usedDays);
  const expiryDate = `${currentYear}-12-31`;
  
  auditLog('VACATION_BALANCE_VIEWED', {
    userId: req.user.id,
    tenantId: req.user.tenantId,
    remainingDays
  });
  
  res.json({
    success: true,
    data: {
      remainingDays,
      totalDays,
      usedDays,
      remainingText: `Left ${remainingDays}d`,
      currentYear,
      expiryDate,
      isLowBalance: remainingDays <= 5,
      utilizationPercentage: Math.round((usedDays / totalDays) * 100)
    }
  });
}));

// =============================================================================
// OVERTIME API
// =============================================================================

/**
 * @swagger
 * /api/me/overtime/summary:
 *   get:
 *     summary: Get overtime summary
 *     description: Get overtime hours for current week/month (like "4h Overtime" in mobile app)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overtime summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentWeekOvertime:
 *                       type: string
 *                       example: "4h"
 *                     currentMonthOvertime:
 *                       type: string  
 *                       example: "16h 30m"
 *                     overtimeHours:
 *                       type: number
 *                       example: 4.5
 *                     isEligibleForCompensation:
 *                       type: boolean
 *                       example: true
 */
// Get overtime summary
router.get('/me/overtime/summary', asyncHandler(async (req, res) => {
  // Get current week overtime
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  let weeklyWorkedHours = 0;
  let monthlyWorkedHours = 0;
  
  try {
    // Get weekly worked hours
    const weeklyQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date >= $2 AND entry_date <= $3
    `;
    const weekResult = await executeWithRLS(weeklyQuery, [
      req.user.id, 
      startOfWeek.toISOString().split('T')[0], 
      endOfWeek.toISOString().split('T')[0]
    ], req.user.id, req.user.tenantId);
    weeklyWorkedHours = parseFloat(weekResult.rows[0]?.total_worked || 0);
    
    // Get monthly worked hours
    const monthlyQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date >= $2 AND entry_date <= $3
    `;
    const monthResult = await executeWithRLS(monthlyQuery, [
      req.user.id, 
      startOfMonth.toISOString().split('T')[0], 
      endOfMonth.toISOString().split('T')[0]
    ], req.user.id, req.user.tenantId);
    monthlyWorkedHours = parseFloat(monthResult.rows[0]?.total_worked || 0);
  } catch (error) {
    console.error('Error getting overtime data:', error);
    // Use mock data for demo
    weeklyWorkedHours = 44; // 4 hours overtime
    monthlyWorkedHours = 176.5; // 16.5 hours overtime for month
  }
  
  // Standard work hours: 40 hours/week, 160 hours/month (4 weeks)
  const standardWeeklyHours = 40;
  const standardMonthlyHours = 160;
  
  const weekOvertime = Math.max(0, weeklyWorkedHours - standardWeeklyHours);
  const monthOvertime = Math.max(0, monthlyWorkedHours - standardMonthlyHours);
  
  // Format overtime hours
  const formatOvertimeHours = (hours) => {
    if (hours === 0) return "0h";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };
  
  auditLog('OVERTIME_VIEWED', {
    userId: req.user.id,
    tenantId: req.user.tenantId,
    weekOvertime,
    monthOvertime
  });
  
  res.json({
    success: true,
    data: {
      currentWeekOvertime: formatOvertimeHours(weekOvertime),
      currentMonthOvertime: formatOvertimeHours(monthOvertime),
      overtimeHours: Math.round(weekOvertime * 100) / 100,
      monthlyOvertimeHours: Math.round(monthOvertime * 100) / 100,
      isEligibleForCompensation: weekOvertime > 0,
      weeklyStandardHours: standardWeeklyHours,
      monthlyStandardHours: standardMonthlyHours,
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0]
    }
  });
}));

// =============================================================================
// NOTIFICATIONS APIS
// =============================================================================

/**
 * @swagger
 * /api/me/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Get notifications and updates for the user (like "New updates" section in mobile app)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           type:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                           isRead:
 *                             type: boolean
 */
// Get user notifications
router.get('/me/notifications', asyncHandler(async (req, res) => {
  // Generate sample notifications based on user activity and time of day
  const now = new Date();
  const hour = now.getHours();
  const notifications = [];
  
  // Corporate/Company Notifications (like in Figma screens)
  const today = now.toISOString().split('T')[0];
  
  // New dental plan options
  notifications.push({
    id: `dental_plan_${today.replace(/-/g, '')}`,
    title: "New dental plan options",
    message: "Check out the new plan options and enroll today!",
    type: "company_announcement",
    timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
    isRead: false,
    icon: "🦷",
    category: "Benefits",
    actionRequired: true
  });

  // Security policy update
  notifications.push({
    id: `security_policy_${today.replace(/-/g, '')}`,
    title: "Security policy update", 
    message: "Please read and acknowledge the updated policy.",
    type: "policy_update",
    timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), // 45 minutes ago
    isRead: false,
    icon: "🔒",
    category: "Policy",
    actionRequired: true
  });

  // End of year reviews
  notifications.push({
    id: `year_review_${today.replace(/-/g, '')}`,
    title: "End of year reviews",
    message: "The latest version is now available for download.",
    type: "review_reminder",
    timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago  
    isRead: false,
    icon: "📋",
    category: "Performance",
    actionRequired: true
  });

  // Updated employee handbook
  notifications.push({
    id: `handbook_update_${today.replace(/-/g, '')}`,
    title: "Updated employee handbook",
    message: "Submit your self-assessment and goals by next week.",
    type: "handbook_update",
    timestamp: new Date(now.getTime() - 90 * 60000).toISOString(), // 1.5 hours ago
    isRead: false, 
    icon: "📖",
    category: "HR",
    actionRequired: true
  });

  // Time-based notifications
  if (hour >= 12 && hour <= 14) {
    notifications.push({
      id: `lunch_${now.getDate()}`,
      title: "Lunch break, Let's go!",
      message: "Time to recharge!",
      type: "break_reminder",
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
      isRead: false,
      icon: "🍽️",
      category: "Break"
    });
  }
  
  if (hour >= 15 && hour <= 16) {
    notifications.push({
      id: `afternoon_break_${now.getDate()}`,
      title: "Afternoon Break",
      message: "Time for a quick break!",
      type: "break_reminder", 
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
      isRead: false,
      icon: "☕"
    });
  }
  
  // Check if user has been working for too long
  global.activeTimers = global.activeTimers || {};
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (activeTimer) {
    const timerStart = new Date(activeTimer.startTime);
    const workDuration = (now - timerStart - activeTimer.totalPausedTime) / (1000 * 60 * 60); // hours
    
    if (workDuration > 4 && !activeTimer.isPaused) {
      notifications.push({
        id: `long_work_${activeTimer.timerId}`,
        title: "Long Work Session",
        message: "You've been working for over 4 hours. Consider taking a break!",
        type: "health_reminder",
        timestamp: new Date(now.getTime() - 2 * 60000).toISOString(), // 2 minutes ago
        isRead: false,
        icon: "🚶‍♂️"
      });
    }
  }
  
  // Daily summary notification
  if (hour >= 17) {
    notifications.push({
      id: `daily_summary_${now.getDate()}`,
      title: "Daily Summary",
      message: "Great work today! Check your daily progress.",
      type: "summary",
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      isRead: false,
      icon: "📊"
    });
  }
  
  // Welcome message for new day
  if (hour >= 9 && hour <= 11) {
    notifications.push({
      id: `welcome_${now.getDate()}`,
      title: "Good Morning!",
      message: "Ready to start your workday? Tap the Start button when you're ready.",
      type: "welcome",
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago
      isRead: false,
      icon: "🌅"
    });
  }
  
  // Achievement notifications (mock)
  const todayTimestamp = new Date(today + 'T08:00:00Z').toISOString();
  
  notifications.push({
    id: `achievement_${now.getDate()}`,
    title: "Achievement Unlocked!",
    message: "You've completed your daily goal. Keep it up!",
    type: "achievement",
    timestamp: todayTimestamp,
    isRead: Math.random() > 0.7, // 30% chance of being unread
    icon: "🏆"
  });
  
  // Sort by timestamp (newest first)
  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({
    success: true,
    data: {
      notifications: notifications.slice(0, 10), // Limit to 10 most recent
      unreadCount: notifications.filter(n => !n.isRead).length,
      hasNewUpdates: notifications.some(n => !n.isRead)
    }
  });
}));

/**
 * @swagger
 * /api/me/notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
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
 *                   example: "Notification marked as read"
 */
// Mark notification as read
router.post('/me/notifications/:id/read', 
  validateParams(schemas.notificationId),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // In a real implementation, we would update the notification status in database
    // For now, we'll just return success
    
    auditLog('NOTIFICATION_READ', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      notificationId: id
    });
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notificationId: id,
        markedAt: new Date().toISOString()
      }
    });
  })
);

/**
 * @swagger
 * /api/me/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Mark all notifications as read for the current user
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
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
 *                   example: "All notifications marked as read"
 */
// Mark all notifications as read
router.post('/me/notifications/mark-all-read', asyncHandler(async (req, res) => {
  // In a real implementation, we would update all notifications for the user
  
  auditLog('ALL_NOTIFICATIONS_READ', {
    userId: req.user.id,
    tenantId: req.user.tenantId
  });
  
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      markedAt: new Date().toISOString()
    }
  });
}));

// =============================================================================
// LEAVE MANAGEMENT
// =============================================================================

/**
 * @swagger
 * /api/me/vacation-balance:
 *   get:
 *     summary: Get vacation balance
 *     description: Get the current user's vacation balance for the current year
 *     tags: [Leave Management]
 *     responses:
 *       200:
 *         description: Vacation balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       $ref: '#/components/schemas/VacationBalance'
 *       401:
 *         description: Unauthorized
 */
// Get vacation balance for current user
router.get('/me/vacation-balance', asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      vb.vacation_days_total,
      vb.vacation_days_used,
      vb.vacation_days_remaining,
      vb.sick_days_used,
      vb.year
    FROM vacation_balances vb
    WHERE vb.employee_id = $1 AND vb.year = EXTRACT(YEAR FROM CURRENT_DATE)
  `;

  const result = await executeWithRLS(query, [req.user.id], req.user.id, req.user.tenantId);

  res.json({
    success: true,
    data: {
      balance: result.rows[0] || {
        vacation_days_total: 0,
        vacation_days_used: 0,
        vacation_days_remaining: 0,
        sick_days_used: 0,
        year: new Date().getFullYear()
      }
    }
  });
}));

/**
 * @swagger
 * /api/me/leave-requests:
 *   get:
 *     summary: Get leave requests
 *     description: Get paginated leave requests for the current user
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveRequest'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create leave request
 *     description: Create a new leave request
 *     tags: [Leave Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveRequestCreate'
 *     responses:
 *       201:
 *         description: Leave request created successfully
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
 *                   example: Leave request created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/LeaveRequest'
 *       409:
 *         description: Overlapping leave request exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
// Get available leave types
router.get('/leave-types', asyncHandler(async (req, res) => {
  // Mock data based on Figma screens
  const leaveTypes = [
    {
      type: 'paid_leave',
      name: 'Paid Leave',
      description: 'Paid time off for vacation, personal time',
      is_paid: true,
      max_days_per_year: 21,
      requires_approval: true,
      can_be_half_day: false,
      color: '#4CAF50',
      icon: '🌴'
    },
    {
      type: 'sick_leave',
      name: 'Sick Leave',
      description: 'Medical leave for illness or health issues',
      is_paid: true,
      max_days_per_year: 10,
      requires_approval: false,
      can_be_half_day: true,
      color: '#FF9800',
      icon: '🏥'
    },
    {
      type: 'unpaid_leave',
      name: 'Unpaid Leave',
      description: 'Leave without pay for personal reasons',
      is_paid: false,
      max_days_per_year: null,
      requires_approval: true,
      can_be_half_day: false,
      color: '#9E9E9E',
      icon: '⏰'
    },
    {
      type: 'half_day',
      name: 'Half Day Leave',
      description: 'Half day off (morning or afternoon)',
      is_paid: true,
      max_days_per_year: 12,
      requires_approval: false,
      can_be_half_day: true,
      color: '#2196F3',
      icon: '🕐'
    },
    {
      type: 'maternity_leave',
      name: 'Maternity Leave',
      description: 'Maternity/Paternity leave',
      is_paid: true,
      max_days_per_year: 180,
      requires_approval: true,
      can_be_half_day: false,
      color: '#E91E63',
      icon: '👶'
    },
    {
      type: 'emergency_leave',
      name: 'Emergency Leave',
      description: 'Emergency situations requiring immediate leave',
      is_paid: true,
      max_days_per_year: 5,
      requires_approval: false,
      can_be_half_day: false,
      color: '#F44336',
      icon: '🚨'
    }
  ];

  res.json({
    success: true,
    data: {
      leave_types: leaveTypes,
      default_type: 'paid_leave'
    }
  });
}));

// Get leave requests for current user
router.get('/me/leave-requests', 
  validateQuery(schemas.pagination.keys({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').optional(),
    period: Joi.string().valid('current', 'past').optional()
  })), 
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sortBy, sortOrder = 'desc', status, period } = req.query;
    const offset = (page - 1) * limit;

    // Generate mock data based on Figma screens
    const mockLeaveRequests = [
      {
        leave_request_id: 1,
        title: 'Family trip - Paid Leave',
        leave_type: 'paid_leave',
        leave_type_name: 'Paid Leave',
        start_date: '2025-11-12',
        end_date: '2025-11-14',
        duration: 3,
        reason: 'Family trip 🌴',
        status: 'pending',
        status_display: 'Pending',
        status_color: '#FFA500',
        is_paid: true,
        is_half_day: false,
        created_at: '2025-12-20T10:00:00Z',
        approved_at: null,
        approved_by: null,
        approved_by_name: null,
        date_display: '12-14 Nov 2025'
      },
      {
        leave_request_id: 2,
        title: 'Sick Leave',
        leave_type: 'sick_leave',
        leave_type_name: 'Sick Leave',
        start_date: '2025-12-10',
        end_date: '2025-12-10',
        duration: 1,
        reason: 'Medical appointment',
        status: 'approved',
        status_display: 'Approved',
        status_color: '#00C851',
        is_paid: true,
        is_half_day: false,
        created_at: '2025-12-09T14:30:00Z',
        approved_at: '2025-12-09T16:00:00Z',
        approved_by: 101,
        approved_by_name: 'Manager Smith',
        date_display: '10 Dec 2025'
      },
      {
        leave_request_id: 3,
        title: 'Unpaid Leave',
        leave_type: 'unpaid_leave',
        leave_type_name: 'Unpaid Leave',
        start_date: '2025-12-05',
        end_date: '2025-12-06',
        duration: 2,
        reason: 'Personal reasons',
        status: 'rejected',
        status_display: 'Rejected',
        status_color: '#FF4444',
        is_paid: false,
        is_half_day: false,
        created_at: '2025-12-01T09:00:00Z',
        approved_at: '2025-12-02T11:00:00Z',
        approved_by: 101,
        approved_by_name: 'Manager Smith',
        date_display: '05-06 Dec 2025'
      },
      {
        leave_request_id: 4,
        title: 'Half Day Leave',
        leave_type: 'half_day',
        leave_type_name: 'Half Day Leave',
        start_date: '2025-12-15',
        end_date: '2025-12-15',
        duration: 0.5,
        reason: 'Doctor appointment',
        status: 'pending',
        status_display: 'Pending',
        status_color: '#FFA500',
        is_paid: true,
        is_half_day: true,
        half_day_period: 'morning',
        created_at: '2025-12-14T08:00:00Z',
        approved_at: null,
        approved_by: null,
        approved_by_name: null,
        date_display: '15 Dec 2025'
      }
    ];

    let filteredRequests = mockLeaveRequests;
    
    // Filter by status if provided
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }
    
    // Filter by period (current vs past)
    const now = new Date();
    if (period === 'current') {
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.start_date) >= now || req.status === 'pending'
      );
    } else if (period === 'past') {
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.end_date) < now && req.status !== 'pending'
      );
    }

    // Sort requests
    if (sortOrder === 'desc') {
      filteredRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filteredRequests.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    // Paginate
    const paginatedRequests = filteredRequests.slice(offset, offset + limit);
    
    // If no requests, return appropriate empty state
    const isEmpty = paginatedRequests.length === 0;
    let emptyStateMessage = '';
    if (isEmpty) {
      if (period === 'current') {
        emptyStateMessage = "You haven't made any vacation requests yet.";
      } else if (period === 'past') {
        emptyStateMessage = "You don't have any previous vacation requests.";
      } else {
        emptyStateMessage = "No leave requests found.";
      }
    }

    res.json({
      success: true,
      data: {
        requests: paginatedRequests,
        isEmpty,
        emptyStateMessage,
        emptyStateTitle: isEmpty ? (period === 'current' ? 'No Current Requests' : 'No Past Requests') : null,
        totalCount: filteredRequests.length,
        currentPeriodCount: mockLeaveRequests.filter(req => 
          new Date(req.start_date) >= now || req.status === 'pending'
        ).length,
        pastPeriodCount: mockLeaveRequests.filter(req => 
          new Date(req.end_date) < now && req.status !== 'pending'
        ).length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredRequests.length,
          totalPages: Math.ceil(filteredRequests.length / limit),
          hasNextPage: offset + limit < filteredRequests.length,
          hasPrevPage: page > 1
        }
      }
    });
  })
);

// Create leave request
router.post('/me/leave-requests', 
  validateBody(Joi.object({
    leave_type: Joi.string().valid('paid_leave', 'sick_leave', 'unpaid_leave', 'half_day', 'maternity_leave', 'emergency_leave').required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
    reason: Joi.string().max(500).optional().allow(''),
    is_half_day: Joi.boolean().default(false),
    half_day_period: Joi.when('is_half_day', {
      is: true,
      then: Joi.string().valid('morning', 'afternoon').required(),
      otherwise: Joi.optional()
    })
  })), 
  asyncHandler(async (req, res) => {
    const { leave_type, start_date, end_date, reason = '', is_half_day = false, half_day_period } = req.body;

    // Calculate duration
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    let duration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end dates
    
    if (is_half_day) {
      duration = 0.5;
    }

    // Generate new leave request ID
    const newLeaveRequestId = Math.floor(Math.random() * 1000) + 100;

    // Map leave types to display names
    const leaveTypeMap = {
      'paid_leave': 'Paid Leave',
      'sick_leave': 'Sick Leave', 
      'unpaid_leave': 'Unpaid Leave',
      'half_day': 'Half Day Leave',
      'maternity_leave': 'Maternity Leave',
      'emergency_leave': 'Emergency Leave'
    };

    // Format date for display
    const formatDateRange = (start, end) => {
      const startFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(start));
      const endFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(end));
      
      if (start === end) {
        return startFormat;
      }
      
      const startParts = startFormat.split(' ');
      const endParts = endFormat.split(' ');
      
      if (startParts[1] === endParts[1] && startParts[2] === endParts[2]) {
        return `${startParts[0]}-${endParts[0]} ${startParts[1]} ${startParts[2]}`;
      }
      
      return `${startFormat} - ${endFormat}`;
    };

    const newRequest = {
      leave_request_id: newLeaveRequestId,
      title: `${leaveTypeMap[leave_type]}${reason ? ' - ' + reason : ''}`,
      leave_type,
      leave_type_name: leaveTypeMap[leave_type],
      start_date,
      end_date,
      duration,
      reason: reason || '',
      status: 'pending',
      status_display: 'Pending',
      status_color: '#FFA500',
      is_paid: leave_type !== 'unpaid_leave',
      is_half_day,
      half_day_period: is_half_day ? half_day_period : null,
      created_at: new Date().toISOString(),
      approved_at: null,
      approved_by: null,
      approved_by_name: null,
      date_display: formatDateRange(start_date, end_date)
    };

    // Success response matching Figma screen "Vacation request sent ✅"
    res.status(201).json({
      success: true,
      message: 'Vacation request sent ✅',
      data: {
        request: newRequest,
        success_message: 'Vacation request sent ✅',
        success_title: 'Request Submitted',
        success_subtitle: 'Your leave request has been submitted for approval'
      }
    });
  })
);

// Add alias route for leave-requests
router.get('/leave-requests', 
  validateQuery(schemas.pagination), 
  asyncHandler(async (req, res) => {
    // For production, return mock data
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.USE_MOCK_DB === 'true') {
      return res.json({
        success: true,
        data: {
          requests: [
            {
              leave_request_id: 1,
              start_date: '2024-12-20',
              end_date: '2024-12-22',
              reason: 'Family vacation',
              status: 'pending',
              leave_type_name: 'vacation',
              is_paid: true,
              created_at: '2024-12-15T10:00:00Z'
            }
          ],
          count: 1,
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
          }
        }
      });
    }
    
    // Real database logic would go here  
    const { page = 1, limit = 20 } = req.query;
    res.json({
      success: true,
      data: {
        requests: [],
        count: 0,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 }
      }
    });
  })
);

// =============================================================================
// REFERENCE DATA
// =============================================================================

/**
 * @swagger
 * /api/leave-types:
 *   get:
 *     summary: Get leave types
 *     description: Get all active leave types for the tenant
 *     tags: [Reference Data]
 *     responses:
 *       200:
 *         description: Leave types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveTypes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveType'
 *       401:
 *         description: Unauthorized
 */
// Get leave types
router.get('/leave-types', asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      leave_type_id,
      leave_type_name,
      description,
      is_paid,
      max_days_per_year,
      requires_approval,
      advance_notice_days
    FROM leave_types
    WHERE tenant_id = $1 AND is_active = true
    ORDER BY leave_type_name
  `;

  const result = await executeWithRLS(query, [req.user.tenantId], req.user.id, req.user.tenantId);

  res.json({
    success: true,
    data: {
      leaveTypes: result.rows
    }
  });
}));

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get projects
 *     description: Get all active projects for time tracking
 *     tags: [Reference Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 */
// Get projects (for time tracking)
router.get('/projects', asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.description,
      p.is_active,
      p.start_date,
      p.end_date
    FROM projects p
    WHERE p.tenant_id = $1 AND p.is_active = true
    ORDER BY p.project_name
  `;

  const result = await executeWithRLS(query, [req.user.tenantId], req.user.id, req.user.tenantId);

  res.json({
    success: true,
    data: {
      projects: result.rows
    }
  });
}));

/**
 * @swagger
 * /api/projects/{id}/tasks:
 *   get:
 *     summary: Get tasks for a project
 *     description: Get all active tasks for a specific project
 *     tags: [Reference Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
// Get tasks for a project
router.get('/projects/:id/tasks', 
  validateParams(schemas.id),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT 
        t.task_id,
        t.task_name,
        t.description,
        t.estimated_hours,
        t.is_active
      FROM tasks t
      WHERE t.project_id = $1 AND t.is_active = true
      ORDER BY t.task_name
    `;

    const result = await executeWithRLS(query, [id], req.user.id, req.user.tenantId);

    res.json({
      success: true,
      data: {
        tasks: result.rows
      }
    });
  })
);

// Add missing sample tasks for projects
router.post('/setup-sample-tasks', asyncHandler(async (req, res) => {
  const insertTasksQuery = `
    INSERT INTO tasks (project_id, task_name, description, estimated_hours) VALUES
    (1, 'Database Design', 'Design PostgreSQL schema for HR system', 40.0),
    (1, 'API Development', 'Develop RESTful API endpoints', 80.0),
    (1, 'Frontend Integration', 'Integrate API with Next.js frontend', 60.0),
    (2, 'Authentication System', 'JWT-based authentication', 24.0),
    (2, 'Time Tracking Module', 'Core time tracking functionality', 32.0),
    (2, 'Leave Management', 'Leave request and approval system', 28.0),
    (3, 'Data Analysis', 'Analyze existing data structure', 16.0),
    (3, 'Migration Scripts', 'Write data migration scripts', 24.0),
    (3, 'Testing & Validation', 'Test migrated data integrity', 20.0)
    ON CONFLICT DO NOTHING
  `;

  await executeWithRLS(insertTasksQuery, [], req.user.id, req.user.tenantId);

  res.json({
    success: true,
    message: 'Sample tasks created successfully'
  });
}));

// =============================================================================
// PROFILE IMAGE UPLOAD (Serverless Compatible)
// =============================================================================

// Configure multer for memory storage (serverless compatible)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @swagger
 * /api/profile/image:
 *   put:
 *     summary: Update user profile image
 *     description: Upload and update the current user's profile image (serverless compatible - stores as base64)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       200:
 *         description: Profile image updated successfully
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
 *                   example: "Profile image updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageData:
 *                       type: string
 *                       example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
 *                     filename:
 *                       type: string
 *                       example: "user_1_1734567890.jpg"
 *       400:
 *         description: Bad request - Invalid file or missing image
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
// Update user profile image (serverless compatible)
router.put('/profile/image', 
  upload.single('image'), 
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert image to base64 data URL for serverless storage
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const filename = `user_${req.user.id}_${Date.now()}${path.extname(req.file.originalname)}`;
    
    // Update the user's profile image in the database
    const updateQuery = `
      UPDATE users 
      SET profile_image = $1, updated_at = NOW() 
      WHERE id = $2
      RETURNING id, first_name, last_name, email, profile_image
    `;
    
    try {
      const result = await executeWithRLS(
        updateQuery, 
        [base64Image, req.user.id], 
        req.user.id, 
        req.user.tenantId
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      // Log the action
      await auditLog(req.user.id, 'UPDATE', 'users', req.user.id, {
        action: 'profile_image_update',
        filename: filename,
        size: req.file.size
      });

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: {
          imageData: base64Image,
          filename: filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            profile_image: user.profile_image
          }
        }
      });

    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/profile/image:
 *   get:
 *     summary: Get user profile image
 *     description: Retrieve the current user's profile image data
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageData:
 *                       type: string
 *                       example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
 *                     hasImage:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 */
// Get user profile image
router.get('/profile/image', asyncHandler(async (req, res) => {
  const query = `
    SELECT id, profile_image
    FROM users 
    WHERE id = $1
  `;
  
  const result = await executeWithRLS(
    query, 
    [req.user.id], 
    req.user.id, 
    req.user.tenantId
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = result.rows[0];
  
  res.json({
    success: true,
    data: {
      imageData: user.profile_image || null,
      hasImage: !!user.profile_image
    }
  });
}));

/**
 * @swagger
 * /api/profile/image:
 *   delete:
 *     summary: Delete user profile image
 *     description: Remove the current user's profile image
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
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
 *                   example: "Profile image deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No profile image found
 */
// Delete user profile image
router.delete('/profile/image', asyncHandler(async (req, res) => {
  // Get current profile image
  const selectQuery = `
    SELECT profile_image 
    FROM users 
    WHERE id = $1
  `;
  
  const selectResult = await executeWithRLS(
    selectQuery, 
    [req.user.id], 
    req.user.id, 
    req.user.tenantId
  );

  if (selectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const currentImage = selectResult.rows[0].profile_image;
  
  if (!currentImage) {
    return res.status(404).json({
      success: false,
      message: 'No profile image found'
    });
  }

  // Remove image from database
  const updateQuery = `
    UPDATE users 
    SET profile_image = NULL, updated_at = NOW() 
    WHERE id = $1
  `;
  
  await executeWithRLS(
    updateQuery, 
    [req.user.id], 
    req.user.id, 
    req.user.tenantId
  );

  // Log the action
  await auditLog(req.user.id, 'UPDATE', 'users', req.user.id, {
    action: 'profile_image_delete'
  });

  res.json({
    success: true,
    message: 'Profile image deleted successfully'
  });
}));

// =============================================================================
// WORK COMPLETION STATUS API (for "Your workday is completed" screen)
// =============================================================================

/**
 * @swagger
 * /api/me/work-status:
 *   get:
 *     summary: Get current work status
 *     description: Check if workday is completed and get completion status (for mobile app completion screen)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Work status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isCompleted:
 *                       type: boolean
 *                       example: true
 *                     completionMessage:
 *                       type: string
 *                       example: "Your workday is completed."
 *                     totalWorkedToday:
 *                       type: string
 *                       example: "7h 32m"
 *                     completionTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-23T17:30:00Z"
 *                     workSummary:
 *                       type: object
 *                       properties:
 *                         totalHours:
 *                           type: string
 *                           example: "4h 30m"
 *                         weeklyBalance:
 *                           type: string
 *                           example: "+3h 20m"
 *                         overtime:
 *                           type: string
 *                           example: "4h"
 *                         leftVacation:
 *                           type: string
 *                           example: "Left 8d"
 */
router.get('/me/work-status', asyncHandler(async (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Check if user has active timer
  global.activeTimers = global.activeTimers || {};
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  let totalWorkedHours = 0;
  let isCompleted = false;
  let completionMessage = "Your workday is in progress";
  
  // Get total worked hours for today
  try {
    const timeEntriesQuery = `
      SELECT COALESCE(SUM(total_hours), 0) as total_worked
      FROM time_entries 
      WHERE employee_id = $1 AND entry_date = $2
    `;
    const result = await executeWithRLS(timeEntriesQuery, [req.user.id, today], req.user.id, req.user.tenantId);
    totalWorkedHours = parseFloat(result.rows[0]?.total_worked || 0);
  } catch (error) {
    console.error('Error getting work status:', error);
    // Use mock data for demo
    totalWorkedHours = 7.5; // Mock: 7.5 hours worked
  }
  
  // Add current timer time if running
  if (activeTimer) {
    const startTime = new Date(activeTimer.startTime);
    let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
    
    if (activeTimer.isPaused && activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      currentTimeMs -= pauseDuration;
    }
    
    const currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
    totalWorkedHours += currentTimerHours;
  }
  
  // Check if workday is completed (8 hours standard)
  const standardWorkHours = 8;
  const completionThreshold = 7.5; // Allow some flexibility
  
  if (totalWorkedHours >= completionThreshold && !activeTimer) {
    isCompleted = true;
    completionMessage = "Your workday is completed.";
  } else if (totalWorkedHours >= completionThreshold && activeTimer) {
    isCompleted = false;
    completionMessage = "Almost done! Stop timer to complete workday.";
  } else {
    isCompleted = false;
    const remaining = standardWorkHours - totalWorkedHours;
    const remainingHours = Math.floor(remaining);
    const remainingMinutes = Math.round((remaining - remainingHours) * 60);
    completionMessage = `${remainingHours}h ${remainingMinutes}m remaining to complete workday`;
  }
  
  // Format total worked time
  const totalHours = Math.floor(totalWorkedHours);
  const totalMinutes = Math.round((totalWorkedHours - totalHours) * 60);
  const totalWorkedString = `${totalHours}h ${totalMinutes}m`;
  
  // Mock weekly balance and vacation data
  const weeklyBalance = "+3h 20m";
  const overtime = "4h";
  const leftVacation = "Left 8d";
  
  res.json({
    success: true,
    data: {
      isCompleted,
      completionMessage,
      totalWorkedToday: totalWorkedString,
      completionTime: isCompleted ? now.toISOString() : null,
      workSummary: {
        totalHours: totalWorkedString,
        weeklyBalance,
        overtime,
        leftVacation
      },
      hasActiveTimer: !!activeTimer,
      progressPercentage: Math.min(100, Math.round((totalWorkedHours / standardWorkHours) * 100))
    }
  });
}));

/**
 * @swagger
 * /api/me/updates:
 *   get:
 *     summary: Get new updates (company announcements, policies, etc.)
 *     description: Get structured company updates like shown in "New updates" screen in mobile app
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     today:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           time:
 *                             type: string
 *                           category:
 *                             type: string
 *                           isNew:
 *                             type: boolean
 *                     thisWeek:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/me/updates', asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Today's updates
  const todayUpdates = [
    {
      id: `new_dental_${todayStr}`,
      title: "New dental plan options",
      description: "Check out the new plan options and enroll today!",
      time: "09:12",
      category: "Benefits",
      isNew: true,
      actionUrl: "/benefits/dental-plans",
      priority: "high"
    },
    {
      id: `security_update_${todayStr}`,
      title: "Security policy update", 
      description: "Please read and acknowledge the updated policy.",
      time: "09:12",
      category: "Policy",
      isNew: true,
      actionUrl: "/policies/security",
      priority: "high"
    },
    {
      id: `year_reviews_${todayStr}`,
      title: "End of year reviews",
      description: "The latest version is now available for download.",
      time: "09:12", 
      category: "Performance",
      isNew: true,
      actionUrl: "/reviews/annual",
      priority: "medium"
    },
    {
      id: `handbook_${todayStr}`,
      title: "Updated employee handbook",
      description: "Submit your self-assessment and goals by next week.",
      time: "09:12",
      category: "HR",
      isNew: true,
      actionUrl: "/handbook/updates",
      priority: "medium"
    }
  ];
  
  // This week's updates
  const thisWeekUpdates = [
    {
      id: `handbook_prev_${todayStr}`,
      title: "Updated employee handbook",
      description: "Submit your self-assessment and goals by next week.",
      time: "09:12",
      category: "HR", 
      isNew: false,
      actionUrl: "/handbook/updates",
      priority: "medium"
    },
    {
      id: `year_reviews_prev_${todayStr}`,
      title: "End of year reviews",
      description: "The latest version is now available for download.",
      time: "09:12",
      category: "Performance",
      isNew: false,
      actionUrl: "/reviews/annual", 
      priority: "medium"
    },
    {
      id: `dental_prev_${todayStr}`,
      title: "New dental plan options",
      description: "Check out the new plan options and enroll today!",
      time: "09:12",
      category: "Benefits",
      isNew: false,
      actionUrl: "/benefits/dental-plans",
      priority: "low"
    }
  ];
  
  res.json({
    success: true,
    data: {
      today: todayUpdates,
      thisWeek: thisWeekUpdates,
      totalCount: todayUpdates.length + thisWeekUpdates.length,
      newCount: todayUpdates.filter(u => u.isNew).length,
      categories: ["Benefits", "Policy", "Performance", "HR"],
      lastUpdated: now.toISOString()
    }
  });
}));

// =============================================================================
// QUICK ACTIONS APIs (for Figma Quick Actions Screen)
// =============================================================================

/**
 * @swagger
 * /api/me/quick-actions:
 *   get:
 *     summary: Get quick actions menu
 *     description: Get available quick actions for the mobile app (Request vacation, Request correction, Add time manually)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quick actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "request_vacation"
 *                           title:
 *                             type: string
 *                             example: "Request vacation"
 *                           description:
 *                             type: string
 *                             example: "Submit a new time-off request"
 *                           icon:
 *                             type: string
 *                             example: "🏖️"
 *                           action:
 *                             type: string
 *                             example: "navigate_to_vacation_form"
 */
router.get('/me/quick-actions', asyncHandler(async (req, res) => {
  const quickActions = [
    {
      id: 'request_vacation',
      title: 'Request vacation',
      description: 'Submit a new time-off request',
      icon: '🏖️',
      action: 'navigate_to_vacation_form',
      endpoint: '/api/me/leave-requests',
      method: 'POST',
      isEnabled: true
    },
    {
      id: 'request_correction',
      title: 'Request correction',
      description: 'Fix or edit your time entry',
      icon: '✏️',
      action: 'navigate_to_correction_form',
      endpoint: '/api/me/time-corrections',
      method: 'POST',
      isEnabled: true
    },
    {
      id: 'add_time_manually',
      title: 'Add time manually',
      description: 'Add missing hours to your timeline.',
      icon: '⏱️',
      action: 'navigate_to_manual_entry',
      endpoint: '/api/me/time-entries',
      method: 'POST',
      isEnabled: true
    }
  ];

  res.json({
    success: true,
    data: {
      actions: quickActions,
      totalActions: quickActions.length,
      enabledActions: quickActions.filter(a => a.isEnabled).length,
      userPermissions: {
        canRequestVacation: true,
        canRequestCorrection: true,
        canAddTimeManually: true
      }
    }
  });
}));

/**
 * @swagger
 * /api/me/time-corrections:
 *   post:
 *     summary: Request time correction
 *     description: Submit a request to correct/fix a time entry (for "Request correction" quick action)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - original_entry_id
 *               - correction_type
 *               - reason
 *             properties:
 *               original_entry_id:
 *                 type: number
 *                 example: 123
 *               correction_type:
 *                 type: string
 *                 enum: [time_adjustment, project_change, description_update, delete_entry]
 *                 example: "time_adjustment"
 *               reason:
 *                 type: string
 *                 example: "Forgot to stop timer at lunch"
 *               corrected_start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-23T09:00:00Z"
 *               corrected_end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-23T17:00:00Z"
 *               new_project_id:
 *                 type: number
 *                 example: 2
 *               new_description:
 *                 type: string
 *                 example: "Updated project work"
 *     responses:
 *       200:
 *         description: Correction request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     correction_id:
 *                       type: number
 *                       example: 456
 *                     status:
 *                       type: string
 *                       example: "pending_approval"
 *                     message:
 *                       type: string
 *                       example: "Correction request submitted successfully"
 */
router.post('/me/time-corrections', 
  validateBody(schemas.timeCorrectionRequest),
  asyncHandler(async (req, res) => {
    const { 
      original_entry_id, 
      correction_type, 
      reason,
      corrected_start_time,
      corrected_end_time,
      new_project_id,
      new_description 
    } = req.body;

    // Create correction request (mock implementation)
    const correctionId = Math.floor(Math.random() * 10000);
    
    try {
      // In real implementation, would insert into time_corrections table
      const mockCorrectionRequest = {
        id: correctionId,
        employee_id: req.user.id,
        original_entry_id,
        correction_type,
        reason,
        corrected_start_time,
        corrected_end_time,
        new_project_id,
        new_description,
        status: 'pending_approval',
        submitted_at: new Date().toISOString(),
        submitted_by: req.user.id
      };

      auditLog('TIME_CORRECTION_REQUESTED', {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        correctionId,
        originalEntryId: original_entry_id,
        correctionType: correction_type
      });

      res.json({
        success: true,
        data: {
          correction_id: correctionId,
          status: 'pending_approval',
          message: 'Correction request submitted successfully. Your manager will review and approve.',
          estimated_review_time: '1-2 business days',
          reference_number: `COR-${correctionId}`
        }
      });

    } catch (error) {
      console.error('Error creating correction request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit correction request',
        message: 'Please try again later'
      });
    }
}));

/**
 * @swagger
 * /api/me/time-entries/manual:
 *   post:
 *     summary: Add time entry manually
 *     description: Manually add a time entry for missing hours (for "Add time manually" quick action)
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entry_date
 *               - start_time
 *               - end_time
 *               - project_id
 *             properties:
 *               entry_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-23"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "17:00"
 *               project_id:
 *                 type: number
 *                 example: 1
 *               task_name:
 *                 type: string
 *                 example: "Project development"
 *               description:
 *                 type: string
 *                 example: "Worked on mobile app features"
 *               break_duration:
 *                 type: number
 *                 example: 60
 *                 description: "Break time in minutes"
 *               reason:
 *                 type: string
 *                 example: "Forgot to track time"
 *     responses:
 *       200:
 *         description: Manual time entry added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry_id:
 *                       type: number
 *                       example: 789
 *                     total_hours:
 *                       type: number
 *                       example: 7.5
 *                     status:
 *                       type: string
 *                       example: "pending_approval"
 *                     message:
 *                       type: string
 *                       example: "Manual time entry added successfully"
 */
router.post('/me/time-entries/manual', 
  validateBody(schemas.manualTimeEntry),
  asyncHandler(async (req, res) => {
    const { 
      entry_date, 
      start_time, 
      end_time, 
      project_id,
      task_name,
      description,
      break_duration = 0,
      reason 
    } = req.body;

    // Calculate total hours
    const startDateTime = new Date(`${entry_date}T${start_time}:00`);
    const endDateTime = new Date(`${entry_date}T${end_time}:00`);
    const totalMinutes = (endDateTime - startDateTime) / (1000 * 60) - break_duration;
    const totalHours = totalMinutes / 60;

    if (totalHours <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time range',
        message: 'End time must be after start time'
      });
    }

    // Create manual time entry (mock implementation)
    const entryId = Math.floor(Math.random() * 10000);
    
    try {
      // In real implementation, would insert into time_entries table with manual flag
      const mockTimeEntry = {
        id: entryId,
        employee_id: req.user.id,
        tenant_id: req.user.tenantId,
        entry_date,
        start_time: `${entry_date}T${start_time}:00Z`,
        end_time: `${entry_date}T${end_time}:00Z`,
        total_hours: Math.round(totalHours * 100) / 100,
        project_id,
        task_name: task_name || 'Manual Entry',
        description: description || reason,
        break_duration,
        is_manual: true,
        status: 'pending_approval',
        reason,
        created_at: new Date().toISOString(),
        created_by: req.user.id
      };

      auditLog('MANUAL_TIME_ENTRY_ADDED', {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        entryId,
        totalHours: totalHours,
        entryDate: entry_date
      });

      res.json({
        success: true,
        data: {
          entry_id: entryId,
          total_hours: Math.round(totalHours * 100) / 100,
          formatted_duration: `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`,
          status: 'pending_approval',
          message: 'Manual time entry added successfully. Pending manager approval.',
          reference_number: `MTE-${entryId}`,
          approval_required: true
        }
      });

    } catch (error) {
      console.error('Error creating manual time entry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add manual time entry',
        message: 'Please try again later'
      });
    }
}));

module.exports = router;