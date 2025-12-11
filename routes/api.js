const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody, validateParams, validateQuery, schemas } = require('../middleware/validation');
const { executeWithRLS, executeTransactionWithRLS } = require('../config/database');
const { auditLog } = require('../middleware/logger');

const router = express.Router();

// Apply authentication to all API routes
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
router.get('/me', asyncHandler(async (req, res) => {
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
      user: result.rows[0]
    }
  });
}));

/**
 * @swagger
 * /api/me/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     description: Retrieve dashboard data including today's time entries, monthly summary, pending leaves, and vacation balance
 *     tags: [User Profile]
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
 *                     todayEntries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeEntry'
 *                     monthSummary:
 *                       type: object
 *                       properties:
 *                         days_worked:
 *                           type: integer
 *                         total_hours:
 *                           type: number
 *                         avg_hours_per_day:
 *                           type: number
 *                     pendingLeaves:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveRequest'
 *                     vacationBalance:
 *                       $ref: '#/components/schemas/VacationBalance'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get dashboard data for current user
router.get('/me/dashboard', asyncHandler(async (req, res) => {
  const queries = [
    // Today's time entries
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
    },
    // Current month summary
    {
      query: `
        SELECT 
          COUNT(*) as days_worked,
          COALESCE(SUM(total_hours), 0) as total_hours,
          COALESCE(AVG(total_hours), 0) as avg_hours_per_day
        FROM time_entries
        WHERE employee_id = $1 
        AND EXTRACT(MONTH FROM entry_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM entry_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      `,
      params: [req.user.id]
    },
    // Pending leave requests
    {
      query: `
        SELECT 
          lr.leave_request_id,
          lr.start_date,
          lr.end_date,
          lr.reason,
          lr.status,
          lt.leave_type_name
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
        WHERE lr.employee_id = $1 AND lr.status = 'pending'
        ORDER BY lr.start_date
        LIMIT 5
      `,
      params: [req.user.id]
    },
    // Vacation balance
    {
      query: `
        SELECT 
          vb.vacation_days_total,
          vb.vacation_days_used,
          vb.vacation_days_remaining,
          vb.sick_days_used,
          vb.year
        FROM vacation_balances vb
        WHERE vb.employee_id = $1 AND vb.year = EXTRACT(YEAR FROM CURRENT_DATE)
      `,
      params: [req.user.id]
    }
  ];

  const results = await executeTransactionWithRLS(queries, req.user.id, req.user.tenantId);

  res.json({
    success: true,
    data: {
      todayEntries: results[0].rows,
      monthSummary: results[1].rows[0] || { days_worked: 0, total_hours: 0, avg_hours_per_day: 0 },
      pendingLeaves: results[2].rows,
      vacationBalance: results[3].rows[0] || null
    }
  });
}));

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
// Get leave requests for current user
router.get('/me/leave-requests', 
  validateQuery(schemas.pagination), 
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        lr.id as leave_request_id,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.duration_type as is_half_day,
        NULL as half_day_period,
        lr.created_at,
        lr.approved_at,
        lr.approved_by,
        lr.leave_type as leave_type_name,
        true as is_paid,
        NULL as approved_by_name
      FROM leave_requests lr
      WHERE lr.employee_id = $1
      ORDER BY lr.created_at ${sortOrder}
      LIMIT $2 OFFSET $3
    `;

    const result = await executeWithRLS(query, [req.user.id, limit, offset], req.user.id, req.user.tenantId);

    // Get total count
    const countResult = await executeWithRLS(
      'SELECT COUNT(*) as total FROM leave_requests WHERE employee_id = $1',
      [req.user.id],
      req.user.id,
      req.user.tenantId
    );

    res.json({
      success: true,
      data: {
        requests: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      }
    });
  })
);

// Create leave request
router.post('/me/leave-requests', 
  validateBody(schemas.leaveRequest), 
  asyncHandler(async (req, res) => {
    const { leaveTypeId, startDate, endDate, reason, isHalfDay, halfDayPeriod } = req.body;

    // Check for overlapping requests
    const overlapQuery = `
      SELECT id as leave_request_id 
      FROM leave_requests 
      WHERE employee_id = $1 
      AND status IN ('pending', 'approved')
      AND (
        (start_date BETWEEN $2 AND $3) OR 
        (end_date BETWEEN $2 AND $3) OR 
        (start_date <= $2 AND end_date >= $3)
      )
    `;

    const overlapResult = await executeWithRLS(overlapQuery, [req.user.id, startDate, endDate], req.user.id, req.user.tenantId);

    if (overlapResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Overlapping request',
        message: 'You already have a leave request for this period'
      });
    }

    const insertQuery = `
      INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, reason,
        duration_type, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING *
    `;

    // Map leaveTypeId to leave_type enum value
    const leaveTypeMapping = {
      1: 'vacation',
      2: 'sick', 
      3: 'personal',
      4: 'maternity',
      5: 'paternity'
    };
    
    const leaveTypeEnum = leaveTypeMapping[leaveTypeId] || 'vacation';
    const durationType = isHalfDay ? 'half_day' : 'full_day';

    const result = await executeWithRLS(insertQuery, [
      req.user.id, leaveTypeEnum, startDate, endDate, reason, durationType
    ], req.user.id, req.user.tenantId);

    auditLog('LEAVE_REQUEST_CREATED', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      leaveRequestId: result.rows[0].leave_request_id,
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: {
        request: result.rows[0]
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

module.exports = router;