const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Skip auth for public endpoints
  const publicPaths = [
    '/api/health', 
    '/api/get-token', 
    '/api/auth/login', 
    '/api/auth/register', 
    '/swagger.json', 
    '/api-docs',
    '/api/test',
    '/health',
    '/get-token',
    '/auth/login',
    '/auth/register'
  ];
  
  // Check both full path and relative path
  const fullPath = req.originalUrl || req.url;
  const path = req.path;
  
  if (publicPaths.includes(path) || publicPaths.includes(fullPath) || fullPath.startsWith('/api-docs')) {
    return next();
  }

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

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Apply authentication to all API routes
app.use('/api', authenticateToken);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'All APIs working on api-layer.vercel.app',
    domain: 'api-layer.vercel.app'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working!',
    domain: 'api-layer.vercel.app'
  });
});

// User Profile APIs
app.get('/api/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      tenantId: 1,
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      tenantName: 'Demo Company',
      department: 'Engineering',
      position: 'Software Developer',
      status: 'active',
      profile_image: null,
      phone: '+1-555-0123',
      manager: 'Jane Smith'
    }
  });
});

app.get('/api/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      tenantId: 1,
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      tenantName: 'Demo Company',
      profile_image: null
    }
  });
});

// Additional Profile Routes (from routes/api.js)
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      tenantName: 'Demo Company'
    }
  });
});

// Profile Image Management APIs
app.put('/api/profile/image', (req, res) => {
  res.json({
    success: true,
    message: 'Profile image updated successfully',
    data: {
      profile_image_url: 'data:image/png;base64,mock-base64-string'
    }
  });
});

app.get('/api/profile/image', (req, res) => {
  res.json({
    success: true,
    data: {
      profile_image: null,
      has_image: false
    }
  });
});

app.delete('/api/profile/image', (req, res) => {
  res.json({
    success: true,
    message: 'Profile image deleted successfully'
  });
});

// Authentication APIs
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, tenantName, employeeNumber } = req.body;
  
  // Mock user creation (in real app, save to database)
  const newUser = {
    id: Math.floor(Math.random() * 1000) + 1,
    tenantId: 1,
    employeeNumber: employeeNumber || 'EMP001',
    firstName,
    lastName,
    email,
    tenantName: tenantName || 'Demo Company'
  };
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: newUser.id,
      tenantId: newUser.tenantId,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: newUser,
      token,
      access_token: token
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication (in real app, verify against database)
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  const user = {
    id: 1,
    tenantId: 1,
    employeeNumber: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email,
    tenantName: 'Demo Company'
  };
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
      access_token: token
    }
  });
});

// Get Token API (for testing)
app.get('/api/get-token', (req, res) => {
  const testUser = {
    userId: 1,
    tenantId: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };
  
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    success: true,
    message: 'Test token generated successfully',
    data: {
      token,
      access_token: token,
      user: testUser,
      expires_in: '24h',
      token_type: 'Bearer',
      usage: 'Copy this token and use it in Swagger UI Authorization header as: Bearer <token>'
    }
  });
});

// Timer Pause/Resume API
app.post('/api/me/timer/pause', (req, res) => {
  res.json({
    success: true,
    message: 'Timer paused/resumed successfully',
    data: {
      timerId: 'timer_123',
      isPaused: true,
      pausedAt: new Date().toISOString(),
      elapsedTime: 7200000, // 2 hours in ms
      status: 'paused'
    }
  });
});

// Dashboard alias route
app.get('/api/user/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        name: 'John Doe',
        status: 'Available',
        avatar: null
      },
      timer: {
        isRunning: false,
        currentTask: null,
        elapsedTime: 0
      },
      todaysSummary: {
        totalHours: 0,
        hoursTarget: 8,
        breakTime: 0,
        tasksCompleted: 0
      },
      quickStats: {
        weekTotal: 32.5,
        monthTotal: 140.25
      }
    }
  });
});

// Time Entries CRUD Operations
app.get('/api/time-entries', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  res.json({
    success: true,
    data: {
      entries: [
        {
          id: 1,
          date: '2025-12-23',
          start_time: '09:00',
          end_time: '17:30',
          break_duration: 60,
          total_hours: 8.5,
          project_name: 'API Development',
          status: 'completed'
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1,
        totalPages: 1
      }
    }
  });
});

app.put('/api/me/time-entries/:id', (req, res) => {
  const entryId = parseInt(req.params.id);
  
  // Validate ID
  if (isNaN(entryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid time entry ID. Must be a number."
    });
  }
  
  const { startTime, endTime, description, start_time, end_time, break_duration } = req.body;
  
  // Support both camelCase and snake_case
  const finalStartTime = startTime || start_time;
  const finalEndTime = endTime || end_time;
  
  // Handle ISO timestamp format (convert to time string)
  let processedStartTime = finalStartTime;
  let processedEndTime = finalEndTime;
  
  if (finalStartTime && finalStartTime.includes('T')) {
    const startDate = new Date(finalStartTime);
    processedStartTime = startDate.toTimeString().split(' ')[0];
  }
  
  if (finalEndTime && finalEndTime.includes('T')) {
    const endDate = new Date(finalEndTime);
    processedEndTime = endDate.toTimeString().split(' ')[0];
  }
  
  // Calculate total hours
  let totalHours = 8.5; // default
  if (processedStartTime && processedEndTime) {
    const start = new Date(`2024-01-01 ${processedStartTime}`);
    const end = new Date(`2024-01-01 ${processedEndTime}`);
    const durationMs = end - start;
    totalHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
  }
  
  res.json({
    success: true,
    message: 'Time entry updated successfully',
    data: {
      entry: {
        id: entryId,
        start_time: processedStartTime || start_time,
        end_time: processedEndTime || end_time,
        description: description || '',
        break_duration: break_duration || 0,
        total_hours: totalHours,
        updated_at: new Date().toISOString()
      }
    }
  });
});

app.delete('/api/me/time-entries/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Time entry deleted successfully',
    data: {
      deleted_id: parseInt(id)
    }
  });
});

// Time Entries APIs
app.get('/api/me/time-entries', (req, res) => {
  const { page = 1, limit = 20, startDate, endDate } = req.query;
  
  res.json({
    success: true,
    data: {
      entries: [
        {
          id: 1,
          date: '2025-12-23',
          start_time: '09:00',
          end_time: '17:30',
          break_duration: 60,
          total_hours: 8.5,
          project_id: 1,
          project_name: 'API Development',
          task_name: 'Time Tracking APIs',
          description: 'Working on Figma implementation',
          status: 'completed',
          created_at: '2025-12-23T09:00:00Z'
        },
        {
          id: 2,
          date: '2025-12-22',
          start_time: '09:15',
          end_time: '17:45',
          break_duration: 45,
          total_hours: 8.25,
          project_id: 2,
          project_name: 'Testing',
          task_name: 'API Testing',
          description: 'Testing all endpoints',
          status: 'completed',
          created_at: '2025-12-22T09:15:00Z'
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      summary: {
        total_hours_this_period: 16.75,
        total_entries: 2,
        average_daily_hours: 8.375
      }
    }
  });
});

app.post('/api/me/time-entries', (req, res) => {
  const { date, start_time, end_time, project_id, task_name, description, break_duration = 0 } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Time entry created successfully',
    data: {
      entry: {
        id: Math.floor(Math.random() * 1000) + 1,
        date,
        start_time,
        end_time,
        project_id,
        task_name,
        description,
        break_duration,
        total_hours: 8.5, // calculated
        status: 'pending',
        created_at: new Date().toISOString()
      }
    }
  });
});

// Projects API
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: {
      projects: [
        {
          id: 1,
          name: 'API Development',
          description: 'Time tracking API development',
          client: 'Internal',
          status: 'active',
          color: '#4CAF50',
          start_date: '2025-01-01',
          end_date: null,
          total_hours_logged: 120.5
        },
        {
          id: 2,
          name: 'Testing',
          description: 'API testing and QA',
          client: 'Internal',
          status: 'active',
          color: '#2196F3',
          start_date: '2025-01-15',
          end_date: null,
          total_hours_logged: 45.25
        },
        {
          id: 3,
          name: 'Documentation',
          description: 'API documentation and guides',
          client: 'Internal',
          status: 'active',
          color: '#FF9800',
          start_date: '2025-02-01',
          end_date: null,
          total_hours_logged: 12.0
        }
      ],
      total: 3
    }
  });
});

// Vacation Balance APIs
app.get('/api/me/vacation/balance', (req, res) => {
  res.json({
    success: true,
    data: {
      balance: {
        available_days: 15.5,
        used_days: 9.5,
        total_allocated: 25,
        pending_requests: 2,
        expires_on: '2025-12-31'
      },
      by_type: {
        paid_leave: { available: 20, used: 5 },
        sick_leave: { available: 10, used: 2 },
        personal_leave: { available: 5, used: 2.5 }
      },
      year: 2025
    }
  });
});

app.get('/api/me/vacation-balance', (req, res) => {
  res.json({
    success: true,
    data: {
      total_available: 25,
      used: 9.5,
      remaining: 15.5,
      pending: 2,
      year: 2025
    }
  });
});

// Overtime Summary
app.get('/api/me/overtime/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      current_month: {
        overtime_hours: 12.5,
        overtime_days: 5,
        compensation_type: 'time_off',
        pending_approval: 2.5
      },
      year_to_date: {
        total_overtime: 45.5,
        compensated: 40,
        pending: 5.5
      },
      recent_overtime: [
        {
          date: '2025-12-20',
          hours: 2.5,
          reason: 'Project deadline',
          status: 'approved'
        }
      ]
    }
  });
});

// Work Status API
app.get('/api/me/work-status', (req, res) => {
  res.json({
    success: true,
    data: {
      current_status: 'working',
      work_session: {
        started_at: '2025-12-23T09:00:00Z',
        current_task: 'API Development',
        elapsed_time: '4h 30m',
        productivity_score: 85,
        breaks_taken: 2,
        last_activity: '2025-12-23T13:25:00Z'
      },
      daily_progress: {
        target_hours: 8,
        completed_hours: 4.5,
        progress_percentage: 56.25,
        remaining_hours: 3.5
      },
      mood_tracker: {
        energy_level: 'high',
        focus_level: 'good',
        last_updated: '2025-12-23T13:00:00Z'
      }
    }
  });
});

// Detailed Notifications API
app.get('/api/me/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [
        {
          id: 1,
          title: 'Timer Reminder',
          message: 'You have been working for 4 hours. Consider taking a break!',
          type: 'reminder',
          priority: 'medium',
          timestamp: '2025-12-23T13:00:00Z',
          read: false,
          actionable: true,
          action_url: '/timer/pause'
        },
        {
          id: 2,
          title: 'Leave Request Approved',
          message: 'Your vacation request for Dec 25-30 has been approved by your manager.',
          type: 'approval',
          priority: 'high',
          timestamp: '2025-12-22T14:30:00Z',
          read: false,
          actionable: false
        },
        {
          id: 3,
          title: 'Weekly Timesheet Due',
          message: 'Please submit your timesheet for the week ending Dec 22.',
          type: 'reminder',
          priority: 'high',
          timestamp: '2025-12-22T09:00:00Z',
          read: true,
          actionable: true,
          action_url: '/timesheet/submit'
        }
      ],
      unreadCount: 2,
      totalCount: 3,
      hasMore: false
    }
  });
});

// Mark Notification as Read
app.post('/api/me/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification_id: parseInt(id),
      read: true,
      read_at: new Date().toISOString()
    }
  });
});

// Mark All Notifications as Read
app.post('/api/me/notifications/mark-all-read', (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      marked_count: 5,
      marked_at: new Date().toISOString()
    }
  });
});

// Company Updates (detailed version)
app.get('/api/me/updates', (req, res) => {
  res.json({
    success: true,
    data: {
      announcements: [
        {
          id: 1,
          title: '🎄 Holiday Schedule Update',
          content: 'Office will be closed from December 25th to January 1st. Happy Holidays!',
          type: 'announcement',
          priority: 'high',
          published_date: '2025-12-20',
          expires_date: '2025-01-02',
          author: 'HR Department',
          read: false
        },
        {
          id: 2,
          title: '🚀 New Feature Release',
          content: 'We have released new time tracking features including timer pause/resume and better reporting.',
          type: 'product_update',
          priority: 'medium',
          published_date: '2025-12-18',
          expires_date: null,
          author: 'Development Team',
          read: true
        },
        {
          id: 3,
          title: '📊 Monthly Performance Review',
          content: 'Performance review cycle for December is now open. Please complete your self-assessment by Dec 30.',
          type: 'action_required',
          priority: 'high',
          published_date: '2025-12-15',
          expires_date: '2025-12-30',
          author: 'Management',
          read: false
        }
      ],
      company_news: [
        {
          id: 4,
          title: 'Team Achievement Award',
          content: 'Congratulations to the development team for delivering the Q4 project ahead of schedule!',
          category: 'achievement',
          published_date: '2025-12-22'
        }
      ],
      unread_count: 2,
      total_count: 4
    }
  });
});

// Project Tasks API
app.get('/api/projects/:id/tasks', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      project_id: parseInt(id),
      tasks: [
        {
          id: 1,
          name: 'API Development',
          description: 'Develop REST APIs for time tracking',
          status: 'in_progress',
          priority: 'high',
          estimated_hours: 40,
          logged_hours: 25.5,
          assigned_to: 'John Doe',
          due_date: '2025-12-31'
        },
        {
          id: 2,
          name: 'Database Schema',
          description: 'Design and implement database schema',
          status: 'completed',
          priority: 'high',
          estimated_hours: 16,
          logged_hours: 18.5,
          assigned_to: 'John Doe',
          completed_date: '2025-12-20'
        }
      ],
      total_tasks: 2,
      project_progress: 65
    }
  });
});

// Setup Sample Tasks
app.post('/api/setup-sample-tasks', (req, res) => {
  res.json({
    success: true,
    message: 'Sample tasks created successfully',
    data: {
      tasks_created: 10,
      projects_updated: 3,
      sample_data: {
        'API Development': 4,
        'Testing': 3,
        'Documentation': 3
      }
    }
  });
});

// Quick Actions APIs
app.get('/api/me/quick-actions', (req, res) => {
  res.json({
    success: true,
    data: {
      quick_actions: [
        {
          id: 1,
          title: 'Request Time Correction',
          description: 'Correct missed clock-in or clock-out',
          icon: 'clock_edit',
          color: '#FF9800',
          action: 'time_correction',
          requires_form: true
        },
        {
          id: 2,
          title: 'Add Manual Entry',
          description: 'Add time entry for work done offline',
          icon: 'add_task',
          color: '#4CAF50',
          action: 'manual_entry',
          requires_form: true
        },
        {
          id: 3,
          title: 'Request Vacation',
          description: 'Submit new vacation request',
          icon: 'beach_access',
          color: '#2196F3',
          action: 'vacation_request',
          requires_form: true
        },
        {
          id: 4,
          title: 'Report Issue',
          description: 'Report technical or time tracking issue',
          icon: 'report_problem',
          color: '#F44336',
          action: 'report_issue',
          requires_form: true
        }
      ],
      total_actions: 4
    }
  });
});

// Time Corrections API
app.post('/api/me/time-corrections', (req, res) => {
  const { original_entry_id, correction_type, reason, corrected_start_time, corrected_end_time } = req.body;
  
  res.json({
    success: true,
    message: 'Time correction request submitted successfully',
    data: {
      correction_id: Math.floor(Math.random() * 1000) + 1,
      original_entry_id,
      correction_type,
      reason,
      status: 'pending_approval',
      submitted_at: new Date().toISOString(),
      estimated_processing_time: '24-48 hours'
    }
  });
});

// Manual Time Entry API
app.post('/api/me/time-entries/manual', (req, res) => {
  const { date, start_time, end_time, task_description, reason } = req.body;
  
  res.json({
    success: true,
    message: 'Manual time entry submitted successfully',
    data: {
      entry_id: Math.floor(Math.random() * 1000) + 1,
      date,
      start_time,
      end_time,
      task_description,
      reason,
      status: 'pending_approval',
      submitted_at: new Date().toISOString(),
      requires_manager_approval: true
    }
  });
});

// Weekly Summary API
app.get('/api/me/work-summary/weekly', (req, res) => {
  res.json({
    success: true,
    data: {
      week_start: '2025-12-23',
      week_end: '2025-12-29',
      total_hours: 40.5,
      days_worked: 5,
      average_daily_hours: 8.1,
      target_hours: 40.0,
      overtime_hours: 0.5,
      daily_breakdown: [
        { date: '2025-12-23', hours: 8.5, status: 'completed' },
        { date: '2025-12-24', hours: 8.0, status: 'completed' },
        { date: '2025-12-25', hours: 0, status: 'holiday' },
        { date: '2025-12-26', hours: 8.0, status: 'completed' },
        { date: '2025-12-27', hours: 8.0, status: 'completed' },
        { date: '2025-12-28', hours: 8.0, status: 'planned' },
        { date: '2025-12-29', hours: 0, status: 'weekend' }
      ],
      projects_breakdown: [
        { project_name: 'API Development', hours: 25.5 },
        { project_name: 'Testing', hours: 10.0 },
        { project_name: 'Documentation', hours: 5.0 }
      ]
    }
  });
});

// Quick Action Implementations
app.post('/api/quick-actions/manual-time-entry', (req, res) => {
  const { date, start_time, end_time, project_id, reason } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Manual time entry request submitted successfully',
    data: {
      request_id: Math.floor(Math.random() * 1000) + 1,
      type: 'manual_time_entry',
      status: 'pending_approval',
      submitted_at: new Date().toISOString(),
      estimated_processing_time: '1-2 business days',
      next_steps: 'Your manager will review and approve this request'
    }
  });
});

app.post('/api/quick-actions/time-correction', (req, res) => {
  const { original_entry_id, correction_type, reason, corrected_start_time, corrected_end_time } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Time correction request submitted successfully',
    data: {
      request_id: Math.floor(Math.random() * 1000) + 1,
      type: 'time_correction',
      original_entry_id,
      correction_type,
      reason,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      estimated_processing_time: '24-48 hours'
    }
  });
});

// Report APIs
app.get('/api/reports/timesheet', (req, res) => {
  const { startDate = '2025-12-01', endDate = '2025-12-31', format = 'json' } = req.query;
  
  res.json({
    success: true,
    data: {
      period: {
        start_date: startDate,
        end_date: endDate
      },
      summary: {
        total_hours: 160.5,
        total_days: 20,
        average_daily_hours: 8.025,
        overtime_hours: 0.5,
        leave_days: 0,
        sick_days: 0
      },
      entries: [
        {
          date: '2025-12-23',
          clock_in: '09:00 AM',
          clock_out: '05:30 PM',
          break_time: '1h',
          total_hours: 8.5,
          projects: ['API Development (6h)', 'Testing (2.5h)']
        }
      ],
      export_formats: ['json', 'csv', 'pdf'],
      generated_at: new Date().toISOString()
    }
  });
});

// Missing Dashboard and other endpoints
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        name: 'John Doe',
        status: 'Available',
        avatar: null
      },
      timer: {
        isRunning: false,
        currentTask: null,
        elapsedTime: 0
      },
      todaysSummary: {
        totalHours: 0,
        hoursTarget: 8,
        breakTime: 0,
        tasksCompleted: 0
      },
      recentActivity: [],
      quickStats: {
        weekTotal: 32.5,
        monthTotal: 140.25,
        weekTarget: 40,
        monthTarget: 160
      }
    }
  });
});

app.get('/api/user/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        name: 'John Doe',
        status: 'Available',
        avatar: null
      },
      timer: {
        isRunning: false,
        currentTask: null,
        elapsedTime: 0
      },
      todaysSummary: {
        totalHours: 0,
        hoursTarget: 8,
        breakTime: 0,
        tasksCompleted: 0
      },
      quickStats: {
        weekTotal: 32.5,
        monthTotal: 140.25
      }
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working perfectly!',
    timestamp: new Date().toISOString(),
    domain: 'api-layer.vercel.app'
  });
});

app.get('/api/updates', (req, res) => {
  res.json({
    success: true,
    data: {
      updates: [
        {
          id: 1,
          title: '🎉 New Time Tracking Features',
          message: 'We have added new timer controls and better reporting features.',
          type: 'feature',
          date: '2025-12-23',
          priority: 'medium',
          read: false
        },
        {
          id: 2,
          title: '🏢 Office Holiday Schedule',
          message: 'Office will be closed from Dec 25-Jan 1 for holidays.',
          type: 'announcement',
          date: '2025-12-22', 
          priority: 'high',
          read: false
        },
        {
          id: 3,
          title: '📊 Monthly Reports Available',
          message: 'December monthly reports are now available for download.',
          type: 'notification',
          date: '2025-12-21',
          priority: 'low',
          read: true
        }
      ],
      unreadCount: 2,
      totalCount: 3
    }
  });
});

// Detailed Notifications API
app.get('/api/me/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [
        {
          id: 1,
          title: 'Timer Reminder',
          message: 'You have been working for 4 hours. Consider taking a break!',
          type: 'reminder',
          priority: 'medium',
          timestamp: '2025-12-23T13:00:00Z',
          read: false,
          actionable: true,
          action_url: '/timer/pause'
        },
        {
          id: 2,
          title: 'Leave Request Approved',
          message: 'Your vacation request for Dec 25-30 has been approved by your manager.',
          type: 'approval',
          priority: 'high',
          timestamp: '2025-12-22T14:30:00Z',
          read: false,
          actionable: false
        },
        {
          id: 3,
          title: 'Weekly Timesheet Due',
          message: 'Please submit your timesheet for the week ending Dec 22.',
          type: 'reminder',
          priority: 'high',
          timestamp: '2025-12-22T09:00:00Z',
          read: true,
          actionable: true,
          action_url: '/timesheet/submit'
        }
      ],
      unreadCount: 2,
      totalCount: 3,
      hasMore: false
    }
  });
});

// Mark Notification as Read
app.post('/api/me/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification_id: parseInt(id),
      read: true,
      read_at: new Date().toISOString()
    }
  });
});

// Mark All Notifications as Read
app.post('/api/me/notifications/mark-all-read', (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      marked_count: 5,
      marked_at: new Date().toISOString()
    }
  });
});

app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [
        {
          id: 1,
          title: 'Timer Reminder',
          message: 'Don\'t forget to start your timer when you begin work!',
          type: 'reminder',
          timestamp: '2025-12-23T09:00:00Z',
          read: false,
          actionable: true
        },
        {
          id: 2,
          title: 'Leave Request Approved',
          message: 'Your vacation request for Dec 25-30 has been approved.',
          type: 'approval',
          timestamp: '2025-12-22T14:30:00Z',
          read: false,
          actionable: false
        },
        {
          id: 3,
          title: 'Weekly Report Ready',
          message: 'Your weekly timesheet report is ready for review.',
          type: 'report',
          timestamp: '2025-12-21T17:00:00Z',
          read: true,
          actionable: true
        }
      ],
      unreadCount: 2,
      totalCount: 3
    }
  });
});

app.get('/api/quick-actions', (req, res) => {
  res.json({
    success: true,
    data: {
      actions: [
        {
          id: 1,
          title: 'Manual Time Entry',
          description: 'Add time entry for missed clock-in/out',
          icon: 'clock',
          color: '#4CAF50',
          endpoint: '/api/quick-actions/manual-time-entry',
          requiresForm: true
        },
        {
          id: 2,
          title: 'Time Correction',
          description: 'Request correction for existing time entry',
          icon: 'edit',
          color: '#FF9800',
          endpoint: '/api/quick-actions/time-correction',
          requiresForm: true
        },
        {
          id: 3,
          title: 'Leave Request',
          description: 'Submit new leave/vacation request',
          icon: 'calendar',
          color: '#2196F3',
          endpoint: '/api/leave-requests',
          requiresForm: true
        },
        {
          id: 4,
          title: 'Report Issue',
          description: 'Report technical or time tracking issue',
          icon: 'alert',
          color: '#F44336',
          endpoint: '/api/support/report-issue',
          requiresForm: true
        }
      ],
      totalActions: 4
    }
  });
});

// Vacation Balance APIs
app.get('/api/me/vacation/balance', (req, res) => {
  res.json({
    success: true,
    data: {
      balance: {
        available_days: 15.5,
        used_days: 9.5,
        total_allocated: 25,
        pending_requests: 2,
        expires_on: '2025-12-31'
      },
      by_type: {
        paid_leave: { available: 20, used: 5 },
        sick_leave: { available: 10, used: 2 },
        personal_leave: { available: 5, used: 2.5 }
      },
      year: 2025
    }
  });
});

app.get('/api/me/vacation-balance', (req, res) => {
  res.json({
    success: true,
    data: {
      total_available: 25,
      used: 9.5,
      remaining: 15.5,
      pending: 2,
      year: 2025
    }
  });
});

// Overtime Summary
app.get('/api/me/overtime/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      current_month: {
        overtime_hours: 12.5,
        overtime_days: 5,
        compensation_type: 'time_off',
        pending_approval: 2.5
      },
      year_to_date: {
        total_overtime: 45.5,
        compensated: 40,
        pending: 5.5
      },
      recent_overtime: [
        {
          date: '2025-12-20',
          hours: 2.5,
          reason: 'Project deadline',
          status: 'approved'
        }
      ]
    }
  });
});

app.get('/api/leave-types', (req, res) => {
  res.json({
    success: true,
    data: {
      leave_types: [
        {
          id: 'paid_leave',
          name: 'Paid Leave',
          description: 'Standard paid time off',
          color: '#4CAF50',
          max_days: 25,
          requires_approval: true
        },
        {
          id: 'sick_leave',
          name: 'Sick Leave',
          description: 'Medical leave',
          color: '#FF5722',
          max_days: 12,
          requires_approval: true
        },
        {
          id: 'half_day',
          name: 'Half Day',
          description: 'Half day leave',
          color: '#FF9800',
          max_days: null,
          requires_approval: true
        },
        {
          id: 'personal_leave',
          name: 'Personal Leave',
          description: 'Personal time off',
          color: '#9C27B0',
          max_days: 5,
          requires_approval: true
        },
        {
          id: 'maternity_leave',
          name: 'Maternity Leave',
          description: 'Maternity leave',
          color: '#E91E63',
          max_days: 90,
          requires_approval: true
        }
      ],
      totalTypes: 5
    }
  });
});

app.get('/api/me/timer/current', (req, res) => {
  res.json({
    success: true,
    data: {
      is_active: false,
      current_task: null,
      start_time: null,
      elapsed_time: 0,
      formatted_time: '00:00:00',
      project_id: null,
      project_name: null,
      last_activity: null,
      break_status: {
        on_break: false,
        break_start: null,
        break_duration: 0
      }
    }
  });
});

// Work Status API
app.get('/api/me/work-status', (req, res) => {
  res.json({
    success: true,
    data: {
      current_status: 'working',
      work_session: {
        started_at: '2025-12-23T09:00:00Z',
        current_task: 'API Development',
        elapsed_time: '4h 30m',
        productivity_score: 85,
        breaks_taken: 2,
        last_activity: '2025-12-23T13:25:00Z'
      },
      daily_progress: {
        target_hours: 8,
        completed_hours: 4.5,
        progress_percentage: 56.25,
        remaining_hours: 3.5
      },
      mood_tracker: {
        energy_level: 'high',
        focus_level: 'good',
        last_updated: '2025-12-23T13:00:00Z'
      }
    }
  });
});

// Company Updates (detailed version)
app.get('/api/me/updates', (req, res) => {
  res.json({
    success: true,
    data: {
      announcements: [
        {
          id: 1,
          title: '🎄 Holiday Schedule Update',
          content: 'Office will be closed from December 25th to January 1st. Happy Holidays!',
          type: 'announcement',
          priority: 'high',
          published_date: '2025-12-20',
          expires_date: '2025-01-02',
          author: 'HR Department',
          read: false
        },
        {
          id: 2,
          title: '🚀 New Feature Release',
          content: 'We have released new time tracking features including timer pause/resume and better reporting.',
          type: 'product_update',
          priority: 'medium',
          published_date: '2025-12-18',
          expires_date: null,
          author: 'Development Team',
          read: true
        },
        {
          id: 3,
          title: '📊 Monthly Performance Review',
          content: 'Performance review cycle for December is now open. Please complete your self-assessment by Dec 30.',
          type: 'action_required',
          priority: 'high',
          published_date: '2025-12-15',
          expires_date: '2025-12-30',
          author: 'Management',
          read: false
        }
      ],
      company_news: [
        {
          id: 4,
          title: 'Team Achievement Award',
          content: 'Congratulations to the development team for delivering the Q4 project ahead of schedule!',
          category: 'achievement',
          published_date: '2025-12-22'
        }
      ],
      unread_count: 2,
      total_count: 4
    }
  });
});

app.get('/api/me/work-summary/today', (req, res) => {
  res.json({
    success: true,
    data: {
      date: new Date().toISOString().split('T')[0],
      total_hours: 0,
      target_hours: 8,
      hours_remaining: 8,
      progress_percentage: 0,
      break_time: 0,
      tasks_completed: 0,
      current_status: 'Not Started',
      time_entries: [],
      productivity_score: 0,
      summary: {
        early_start: false,
        on_time: true,
        break_compliance: true,
        overtime: false
      },
      next_action: 'Start your first timer to begin tracking time'
    }
  });
});
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      weekly_hours: "40.5h",
      today_hours: "8.5h",
      current_status: "Working",
      last_check_in: "09:00 AM"
    }
  });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      weekly_hours: "40.5h",
      today_hours: "8.5h", 
      current_status: "Working",
      last_check_in: "09:00 AM"
    }
  });
});

// Timer APIs
app.post('/api/me/timer/start', (req, res) => {
  res.json({
    success: true,
    message: 'Timer started successfully',
    data: {
      timer_id: Math.floor(Math.random() * 1000) + 1,
      start_time: new Date().toISOString(),
      status: 'active'
    }
  });
});

app.post('/api/me/timer/stop', (req, res) => {
  res.json({
    success: true,
    message: 'Timer stopped successfully',
    data: {
      timer_id: 1,
      end_time: new Date().toISOString(),
      total_duration: '8h 30m',
      status: 'completed'
    }
  });
});

app.get('/api/me/timer/current', (req, res) => {
  res.json({
    success: true,
    data: {
      is_active: true,
      timer_id: 1,
      start_time: '2025-12-23T09:00:00Z',
      current_duration: '8h 30m'
    }
  });
});

// Work Summary
app.get('/api/me/work-summary/today', (req, res) => {
  res.json({
    success: true,
    data: {
      date: new Date().toISOString().split('T')[0],
      total_hours: 8.5,
      clock_in: '09:00 AM',
      clock_out: '05:30 PM',
      status: 'Completed'
    }
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [
        {
          id: 1,
          type: 'corporate_update',
          title: '📋 Corporate Updates',
          message: 'New company policies updated',
          date: '2025-12-23',
          is_read: false
        },
        {
          id: 2,
          type: 'system',
          title: '🔔 System Notification', 
          message: 'Your timesheet for this week is due',
          date: '2025-12-22',
          is_read: false
        }
      ],
      unread_count: 2
    }
  });
});

// Updates
app.get('/api/updates', (req, res) => {
  res.json({
    success: true,
    data: {
      updates: [
        {
          id: 1,
          title: 'New Dental Plan Available',
          description: 'Comprehensive dental coverage now available',
          date: '2025-12-20',
          category: 'benefits',
          is_important: true
        },
        {
          id: 2,
          title: 'Updated Security Policy',
          description: 'New security guidelines for remote work',
          date: '2025-12-18',
          category: 'policy',
          is_important: true
        }
      ],
      total: 2
    }
  });
});

// Quick Actions
app.get('/api/quick-actions', (req, res) => {
  res.json({
    success: true,
    data: {
      actions: [
        {
          id: 'manual_time_entry',
          title: 'Manual Time Entry',
          description: 'Add time entry for missed clock-in/out',
          icon: '⏰',
          enabled: true
        },
        {
          id: 'time_correction',
          title: 'Time Correction',
          description: 'Request correction for time entries',
          icon: '📝',
          enabled: true
        },
        {
          id: 'leave_request',
          title: 'Leave Request', 
          description: 'Apply for leave/vacation',
          icon: '🌴',
          enabled: true
        }
      ]
    }
  });
});

// Leave Types (for Figma screens)
app.get('/api/leave-types', (req, res) => {
  const leaveTypes = [
    {
      type: 'paid_leave',
      name: 'Paid Leave',
      description: 'Paid time off for vacation, personal time',
      is_paid: true,
      max_days_per_year: 21,
      color: '#4CAF50',
      icon: '🌴'
    },
    {
      type: 'sick_leave',
      name: 'Sick Leave',
      description: 'Medical leave for illness or health issues',
      is_paid: true,
      max_days_per_year: 10,
      color: '#FF9800',
      icon: '🏥'
    },
    {
      type: 'half_day',
      name: 'Half Day Leave',
      description: 'Half day off (morning or afternoon)',
      is_paid: true,
      max_days_per_year: 12,
      color: '#2196F3',
      icon: '🕐'
    }
  ];

  res.json({
    success: true,
    data: {
      leave_types: leaveTypes,
      default_type: 'paid_leave'
    }
  });
});

// Leave Requests
app.get('/api/me/leave-requests', (req, res) => {
  const { period, status } = req.query;
  
  const mockRequests = [
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
      date_display: '10 Dec 2025'
    }
  ];

  let filteredRequests = mockRequests;
  
  if (status) {
    filteredRequests = filteredRequests.filter(req => req.status === status);
  }
  
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

  const isEmpty = filteredRequests.length === 0;

  res.json({
    success: true,
    data: {
      requests: filteredRequests,
      isEmpty,
      emptyStateMessage: isEmpty ? "You haven't made any vacation requests yet." : "",
      emptyStateTitle: isEmpty ? 'No Current Requests' : null,
      totalCount: filteredRequests.length
    }
  });
});

// Create Leave Request
app.post('/api/me/leave-requests', (req, res) => {
  const { leave_type, start_date, end_date, reason = '', is_half_day = false } = req.body;

  const newRequest = {
    leave_request_id: Math.floor(Math.random() * 1000) + 100,
    title: `${leave_type.replace('_', ' ')} - ${reason}`,
    leave_type,
    leave_type_name: leave_type.replace('_', ' '),
    start_date,
    end_date,
    duration: is_half_day ? 0.5 : Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1,
    reason,
    status: 'pending',
    status_display: 'Pending',
    status_color: '#FFA500',
    is_paid: leave_type !== 'unpaid_leave',
    is_half_day,
    date_display: start_date === end_date ? start_date : `${start_date} - ${end_date}`
  };

  res.status(201).json({
    success: true,
    message: 'Vacation request sent ✅',
    data: {
      request: newRequest,
      success_message: 'Vacation request sent ✅',
      success_title: 'Request Submitted'
    }
  });
});

// GET /api/correction-requests - Get all correction requests (Admin/Manager view)
app.get('/api/correction-requests', (req, res) => {
  const { status, issue, employee, date_range } = req.query;
  
  const mockCorrectionRequests = [
    {
      request_id: 'CR-001',
      employee_name: 'Jenny Wilson',
      employee_id: 'EMP001',
      department: 'Product Design',
      issue: 'Add missing work entry',
      issue_type: 'missing_work_entry',
      date: '2024-01-28',
      original: '09:00 - 18:00',
      corrected: '-',
      submitted: 'Today',
      submitted_at: new Date().toISOString(),
      status: 'pending',
      reason: 'Forgot to clock in and clock out',
      time_impact: 'Before: - After: 8h 00m'
    },
    {
      request_id: 'CR-002',
      employee_name: 'Michael Kim',
      employee_id: 'EMP002',
      department: 'Engineering',
      issue: 'Wrong clock-in time',
      issue_type: 'wrong_clock_in',
      date: '2024-01-27',
      original: '09:30',
      corrected: '08:30',
      submitted: 'Yesterday',
      submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved',
      reason: 'Internet connection issue',
      time_impact: 'Before: 7h 30m After: 8h 00m'
    },
    {
      request_id: 'CR-003',
      employee_name: 'Sarah Anderson',
      employee_id: 'EMP003',
      department: 'HR',
      issue: 'Missing clock-out',
      issue_type: 'missing_clock_out',
      date: '2024-01-26',
      original: '-',
      corrected: '17:40',
      submitted: '2 days ago',
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'reject',
      reason: 'Forgot to clock out',
      time_impact: 'Before: - After: 8h 00m'
    }
  ];

  // Apply filters
  let filteredRequests = mockCorrectionRequests;
  
  if (status && status !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.status === status);
  }
  
  if (issue && issue !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.issue_type === issue);
  }
  
  if (employee) {
    filteredRequests = filteredRequests.filter(req => 
      req.employee_name.toLowerCase().includes(employee.toLowerCase())
    );
  }

  const statusCounts = {
    all: mockCorrectionRequests.length,
    pending: mockCorrectionRequests.filter(r => r.status === 'pending').length,
    approved: mockCorrectionRequests.filter(r => r.status === 'approved').length,
    reject: mockCorrectionRequests.filter(r => r.status === 'reject').length
  };

  res.json({
    success: true,
    data: {
      correction_requests: filteredRequests,
      total_count: filteredRequests.length,
      status_counts: statusCounts
    }
  });
});

// POST /api/correction-requests/:id/approve - Approve correction request
app.post('/api/correction-requests/:id/approve', (req, res) => {
  const requestId = req.params.id;
  const { comment = '' } = req.body;
  
  res.json({
    success: true,
    message: 'Correction request approved successfully',
    data: {
      request_id: requestId,
      status: 'approved',
      approved_at: new Date().toISOString(),
      admin_comment: comment
    }
  });
});

// POST /api/correction-requests/:id/reject - Reject correction request
app.post('/api/correction-requests/:id/reject', (req, res) => {
  const requestId = req.params.id;
  const { reason = '' } = req.body;
  
  res.json({
    success: true,
    message: 'Correction request rejected',
    data: {
      request_id: requestId,
      status: 'reject',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason
    }
  });
});

// GET /api/time-correction-types - Get time correction issue types
app.get('/api/time-correction-types', (req, res) => {
  res.json({
    success: true,
    message: "Time correction types retrieved successfully",
    data: [
      {
        id: 'missing_work_entry',
        name: 'Add missing work entry',
        description: 'Request to add missing clock-in/out for a work day',
        icon: 'clock-plus',
        color: '#4CAF50'
      },
      {
        id: 'wrong_clock_time',
        name: 'Wrong clock-in/out time',
        description: 'Correct incorrect clock-in or clock-out time',
        icon: 'clock-edit',
        color: '#FF9800'
      },
      {
        id: 'missing_break',
        name: 'Missing break entry',
        description: 'Add missing break time entry',
        icon: 'coffee',
        color: '#2196F3'
      },
      {
        id: 'overtime_request',
        name: 'Overtime work request',
        description: 'Request approval for overtime work',
        icon: 'clock-plus-outline',
        color: '#9C27B0'
      },
      {
        id: 'wrong_clock_in',
        name: 'Wrong clock-in time',
        description: 'Correct incorrect clock-in time',
        icon: 'clock-in',
        color: '#00BCD4'
      },
      {
        id: 'wrong_clock_out',
        name: 'Wrong clock-out time',
        description: 'Correct incorrect clock-out time',
        icon: 'clock-out',
        color: '#FF5722'
      },
      {
        id: 'missing_clock_in',
        name: 'Missing clock-in',
        description: 'Add missing clock-in entry',
        icon: 'login',
        color: '#8BC34A'
      },
      {
        id: 'missing_clock_out',
        name: 'Missing clock-out',
        description: 'Add missing clock-out entry',
        icon: 'logout',
        color: '#FFC107'
      }
    ]
  });
});

// GET /api/me/time-corrections - Get user's time correction requests
app.get('/api/me/time-corrections', (req, res) => {
  res.json({
    success: true,
    message: "Time correction requests retrieved successfully",
    data: {
      requests: [
        {
          id: 1,
          type: 'missing_work_entry',
          date: '2024-01-25',
          status: 'pending',
          requested_time_in: '09:00:00',
          requested_time_out: '17:00:00',
          reason: 'Forgot to clock in and out',
          submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          issue_description: 'Missing work entry for full day'
        },
        {
          id: 2,
          type: 'wrong_clock_time',
          date: '2024-01-24',
          status: 'approved',
          actual_time_in: '08:45:00',
          requested_time_in: '09:00:00',
          reason: 'Clock-in time was incorrect',
          submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      total_count: 2,
      pending_count: 1,
      approved_count: 1
    }
  });
});

// POST /api/me/time-corrections - Create new time correction request
app.post('/api/me/time-corrections', (req, res) => {
  const {
    type,
    date,
    requested_time_in,
    requested_time_out,
    actual_time_in,
    actual_time_out,
    reason,
    issue_description,
    additional_notes
  } = req.body;

  const newRequest = {
    id: Math.floor(Math.random() * 10000),
    type,
    date,
    status: 'pending',
    reason,
    issue_description,
    additional_notes,
    requested_time_in,
    requested_time_out,
    actual_time_in,
    actual_time_out,
    submitted_at: new Date().toISOString(),
    estimated_processing_time: '24-48 hours'
  };

  res.json({
    success: true,
    message: "Time correction request submitted successfully",
    data: newRequest
  });
});

// GET /api/me/time-corrections/history - Get time correction history
app.get('/api/me/time-corrections/history', (req, res) => {
  res.json({
    success: true,
    message: "Time correction history retrieved successfully",
    data: {
      history: [
        {
          id: 1,
          type: 'missing_work_entry',
          date: '2024-01-20',
          status: 'approved',
          requested_time_in: '09:00:00',
          requested_time_out: '17:00:00',
          submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          approved_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          approved_by: 'Manager Name'
        }
      ],
      total_count: 1
    }
  });
});

// Swagger Documentation
app.get('/swagger.json', (req, res) => {
  const swaggerSpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "Time Tracking API - Complete Implementation with Bearer Token Auth",
      "description": "Complete API for mobile time tracking app with all Figma screens implemented. Use /api/get-token to get a Bearer token for authentication.",
      "version": "2.0.0",
      "contact": {
        "name": "API Support",
        "url": "https://api-layer.vercel.app"
      }
    },
    "servers": [
      {
        "url": "https://api-layer.vercel.app/api",
        "description": "Production server"
      }
    ],
    "security": [
      {
        "BearerAuth": []
      }
    ],
    "components": {
      "securitySchemes": {
        "BearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "description": "Enter JWT token obtained from /get-token endpoint. Format: Bearer <token>"
        }
      },
      "schemas": {
        "Error": {
          "type": "object",
          "properties": {
            "success": { "type": "boolean", "example": false },
            "message": { "type": "string" },
            "code": { "type": "string" }
          }
        },
        "User": {
          "type": "object",
          "properties": {
            "id": { "type": "integer", "example": 1 },
            "tenantId": { "type": "integer", "example": 1 },
            "firstName": { "type": "string", "example": "John" },
            "lastName": { "type": "string", "example": "Doe" },
            "email": { "type": "string", "format": "email", "example": "john.doe@example.com" },
            "employeeNumber": { "type": "string", "example": "EMP001" },
            "tenantName": { "type": "string", "example": "Demo Company" }
          }
        }
      }
    },
    "paths": {
      "/health": {
        "get": {
          "summary": "Health Check",
          "description": "Check API server health status",
          "tags": ["System"],
          "responses": {
            "200": {
              "description": "Server is healthy"
            }
          }
        }
      },
      "/auth/register": {
        "post": {
          "summary": "User Registration",
          "description": "Register a new user account",
          "tags": ["Authentication"],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["firstName", "lastName", "email", "password"],
                  "properties": {
                    "firstName": { "type": "string", "example": "John" },
                    "lastName": { "type": "string", "example": "Doe" },
                    "email": { "type": "string", "format": "email", "example": "john.doe@example.com" },
                    "password": { "type": "string", "minLength": 6, "example": "password123" },
                    "tenantName": { "type": "string", "example": "Demo Company" },
                    "employeeNumber": { "type": "string", "example": "EMP001" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User registered successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "message": { "type": "string", "example": "User registered successfully" },
                      "data": {
                        "type": "object",
                        "properties": {
                          "user": { "$ref": "#/components/schemas/User" },
                          "token": { "type": "string", "description": "JWT Bearer token" },
                          "access_token": { "type": "string", "description": "Same as token" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "summary": "User Login",
          "description": "Authenticate user and get JWT Bearer token",
          "tags": ["Authentication"],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["email", "password"],
                  "properties": {
                    "email": { "type": "string", "format": "email", "example": "john.doe@example.com" },
                    "password": { "type": "string", "example": "password123" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Login successful",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "message": { "type": "string", "example": "Login successful" },
                      "data": {
                        "type": "object",
                        "properties": {
                          "user": { "$ref": "#/components/schemas/User" },
                          "token": { "type": "string", "description": "JWT Bearer token" },
                          "access_token": { "type": "string", "description": "Same as token" }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Missing email or password",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/Error" }
                }
              }
            }
          }
        }
      },
      "/me": {
        "get": {
          "summary": "Get Current User Profile",
          "description": "Get detailed information about the current authenticated user",
          "tags": ["User Profile"],
          "security": [{ "BearerAuth": [] }],
          "responses": {
            "200": {
              "description": "User profile retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "data": { "$ref": "#/components/schemas/User" }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - Bearer token required",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/Error" }
                }
              }
            },
            "403": {
              "description": "Forbidden - Invalid or expired token",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/Error" }
                }
              }
            }
          }
        }
      },
      "/profile": {
        "get": {
          "summary": "Get User Profile",
          "description": "Get basic user profile data",
          "tags": ["User Profile"],
          "responses": {
            "200": {
              "description": "Profile retrieved successfully"
            }
          }
        }
      },
      "/get-token": {
        "get": {
          "summary": "Get Test JWT Token",
          "description": "Get a test JWT Bearer token for API authentication. Copy the token and use it in the 'Authorize' button above.",
          "tags": ["Authentication"],
          "security": [],
          "responses": {
            "200": {
              "description": "Token generated successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "message": { "type": "string", "example": "Test token generated successfully" },
                      "data": {
                        "type": "object",
                        "properties": {
                          "token": { "type": "string", "description": "JWT Bearer token" },
                          "access_token": { "type": "string", "description": "Same as token" },
                          "expires_in": { "type": "string", "example": "24h" },
                          "token_type": { "type": "string", "example": "Bearer" },
                          "usage": { "type": "string", "example": "Copy this token and use it in Swagger UI Authorization" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/dashboard": {
        "get": {
          "summary": "Get Dashboard Data",
          "description": "Get complete dashboard data for Figma dashboard screen",
          "tags": ["Dashboard"],
          "responses": {
            "200": {
              "description": "Dashboard data retrieved successfully"
            }
          }
        }
      },
      "/dashboard/summary": {
        "get": {
          "summary": "Get Dashboard Summary",
          "description": "Get summarized dashboard data",
          "tags": ["Dashboard"],
          "responses": {
            "200": {
              "description": "Dashboard summary retrieved successfully"
            }
          }
        }
      },
      "/me/dashboard": {
        "get": {
          "summary": "Get User Dashboard",
          "description": "Get user-specific dashboard data",
          "tags": ["Dashboard"],
          "responses": {
            "200": {
              "description": "User dashboard data retrieved successfully"
            }
          }
        }
      },
      "/me/timer/start": {
        "post": {
          "summary": "Start Timer",
          "description": "Start a new work timer (Figma Timer Screen)",
          "tags": ["Timer"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "task_name": { "type": "string" },
                    "project_id": { "type": "integer" },
                    "description": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Timer started successfully"
            }
          }
        }
      },
      "/me/timer/stop": {
        "post": {
          "summary": "Stop Timer",
          "description": "Stop the currently running timer",
          "tags": ["Timer"],
          "responses": {
            "200": {
              "description": "Timer stopped successfully"
            }
          }
        }
      },
      "/timer/start": {
        "post": {
          "summary": "Start Timer (Alternative)",
          "description": "Alternative endpoint to start timer",
          "tags": ["Timer"],
          "responses": {
            "200": {
              "description": "Timer started successfully"
            }
          }
        }
      },
      "/timer/stop": {
        "post": {
          "summary": "Stop Timer (Alternative)",
          "description": "Alternative endpoint to stop timer",
          "tags": ["Timer"],
          "responses": {
            "200": {
              "description": "Timer stopped successfully"
            }
          }
        }
      },
      "/timer/status": {
        "get": {
          "summary": "Get Timer Status",
          "description": "Get current timer status and active session",
          "tags": ["Timer"],
          "responses": {
            "200": {
              "description": "Timer status retrieved successfully"
            }
          }
        }
      },
      "/me/time-entries": {
        "get": {
          "summary": "Get Time Entries",
          "description": "Get user time entries with pagination",
          "tags": ["Time Entries"],
          "parameters": [
            {
              "name": "page",
              "in": "query",
              "schema": { "type": "integer", "default": 1 }
            },
            {
              "name": "limit", 
              "in": "query",
              "schema": { "type": "integer", "default": 20 }
            }
          ],
          "responses": {
            "200": {
              "description": "Time entries retrieved successfully"
            }
          }
        },
        "post": {
          "summary": "Create Time Entry",
          "description": "Create a new time entry",
          "tags": ["Time Entries"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["date", "start_time", "end_time"],
                  "properties": {
                    "date": { "type": "string", "format": "date" },
                    "start_time": { "type": "string", "format": "time" },
                    "end_time": { "type": "string", "format": "time" },
                    "task_name": { "type": "string" },
                    "description": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Time entry created successfully"
            }
          }
        }
      },
      "/projects": {
        "get": {
          "summary": "Get Projects",
          "description": "Get list of all available projects",
          "tags": ["Projects"],
          "responses": {
            "200": {
              "description": "Projects retrieved successfully"
            }
          }
        }
      },
      "/me/work-summary/weekly": {
        "get": {
          "summary": "Get Weekly Work Summary",
          "description": "Get weekly work summary and breakdown",
          "tags": ["Reports"],
          "responses": {
            "200": {
              "description": "Weekly summary retrieved successfully"
            }
          }
        }
      },
      "/leave-requests": {
        "get": {
          "summary": "Get Leave Requests",
          "description": "Get list of leave requests",
          "tags": ["Leave Management"],
          "parameters": [
            {
              "name": "page",
              "in": "query", 
              "schema": { "type": "integer", "default": 1 }
            },
            {
              "name": "limit",
              "in": "query",
              "schema": { "type": "integer", "default": 10 }
            },
            {
              "name": "status",
              "in": "query",
              "schema": { "type": "string", "enum": ["pending", "approved", "rejected"] }
            }
          ],
          "responses": {
            "200": {
              "description": "Leave requests retrieved successfully"
            }
          }
        },
        "post": {
          "summary": "Create Leave Request", 
          "description": "Submit a new leave request",
          "tags": ["Leave Management"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["leave_type", "start_date", "end_date"],
                  "properties": {
                    "leave_type": { "type": "string", "enum": ["vacation", "sick", "personal"] },
                    "start_date": { "type": "string", "format": "date" },
                    "end_date": { "type": "string", "format": "date" },
                    "reason": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Leave request created successfully"
            }
          }
        }
      },
      "/me/leave-requests": {
        "get": {
          "summary": "Get My Leave Requests",
          "description": "Get user's own leave requests",
          "tags": ["Leave Management"],
          "responses": {
            "200": {
              "description": "User leave requests retrieved successfully"
            }
          }
        },
        "post": {
          "summary": "Create My Leave Request",
          "description": "Create a new leave request for current user",
          "tags": ["Leave Management"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["leave_type", "start_date", "end_date"],
                  "properties": {
                    "leave_type": { "type": "string" },
                    "start_date": { "type": "string", "format": "date" },
                    "end_date": { "type": "string", "format": "date" },
                    "reason": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Leave request submitted successfully"
            }
          }
        }
      },
      "/leave-balances": {
        "get": {
          "summary": "Get Leave Balances",
          "description": "Get current leave balances",
          "tags": ["Leave Management"],
          "responses": {
            "200": {
              "description": "Leave balances retrieved successfully"
            }
          }
        }
      },
      "/quick-actions/manual-time-entry": {
        "post": {
          "summary": "Manual Time Entry Request",
          "description": "Submit manual time entry request",
          "tags": ["Quick Actions"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["date", "start_time", "end_time", "reason"],
                  "properties": {
                    "date": { "type": "string", "format": "date" },
                    "start_time": { "type": "string", "format": "time" },
                    "end_time": { "type": "string", "format": "time" },
                    "reason": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Manual time entry request submitted"
            }
          }
        }
      },
      "/quick-actions/time-correction": {
        "post": {
          "summary": "Time Correction Request",
          "description": "Submit time correction request",
          "tags": ["Quick Actions"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["original_entry_id", "correction_type", "reason"],
                  "properties": {
                    "original_entry_id": { "type": "integer" },
                    "correction_type": { "type": "string" },
                    "reason": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Time correction request submitted"
            }
          }
        }
      },
      "/reports/timesheet": {
        "get": {
          "summary": "Generate Timesheet Report",
          "description": "Generate detailed timesheet report",
          "tags": ["Reports"],
          "parameters": [
            {
              "name": "startDate",
              "in": "query",
              "schema": { "type": "string", "format": "date" }
            },
            {
              "name": "endDate", 
              "in": "query",
              "schema": { "type": "string", "format": "date" }
            },
            {
              "name": "format",
              "in": "query",
              "schema": { "type": "string", "enum": ["json", "csv", "pdf"] }
            }
          ],
          "responses": {
            "200": {
              "description": "Timesheet report generated successfully"
            }
          }
        }
      },
      "/test": {
        "get": {
          "summary": "Test Endpoint",
          "description": "Simple test endpoint to verify API connectivity",
          "tags": ["Testing"],
          "responses": {
            "200": {
              "description": "Test successful"
            }
          }
        }
      },
      "/dashboard/summary": {
        "get": {
          "summary": "Get Dashboard Summary",
          "description": "Get summarized dashboard data",
          "tags": ["Dashboard"],
          "responses": {
            "200": {
              "description": "Dashboard summary retrieved successfully"
            }
          }
        }
      },
      "/me/timer/current": {
        "get": {
          "summary": "Get Current Timer Status",
          "description": "Get current timer status and session details",
          "tags": ["Timer"],
          "responses": {
            "200": {
              "description": "Current timer status retrieved"
            }
          }
        }
      },
      "/me/work-summary/today": {
        "get": {
          "summary": "Get Today's Work Summary",
          "description": "Get work summary for today (Figma Work Status Screen)",
          "tags": ["Reports"],
          "responses": {
            "200": {
              "description": "Today's work summary retrieved"
            }
          }
        }
      },
      "/notifications": {
        "get": {
          "summary": "Get Notifications",
          "description": "Get user notifications (Figma Notifications Screen)",
          "tags": ["Notifications"],
          "responses": {
            "200": {
              "description": "Notifications retrieved successfully"
            }
          }
        }
      },
      "/updates": {
        "get": {
          "summary": "Get Company Updates",
          "description": "Get company updates and announcements",
          "tags": ["Notifications"],
          "responses": {
            "200": {
              "description": "Company updates retrieved successfully"
            }
          }
        }
      },
      "/quick-actions": {
        "get": {
          "summary": "Get Quick Actions",
          "description": "Get available quick actions for user",
          "tags": ["Quick Actions"],
          "responses": {
            "200": {
              "description": "Quick actions retrieved successfully"
            }
          }
        }
      },
      "/leave-types": {
        "get": {
          "summary": "Get Leave Types",
          "description": "Get available leave types",
          "tags": ["Leave Management"],
          "responses": {
            "200": {
              "description": "Leave types retrieved successfully"
            }
          }
        }
      },
      "/user/profile": {
        "get": {
          "summary": "Get User Profile (Alias)",
          "description": "Get user profile information (alternative route)",
          "tags": ["User Profile"],
          "responses": {
            "200": {
              "description": "User profile retrieved successfully"
            }
          }
        }
      },
      "/profile/image": {
        "get": {
          "summary": "Get Profile Image",
          "description": "Get user's profile image",
          "tags": ["User Profile"],
          "responses": {
            "200": {
              "description": "Profile image retrieved successfully"
            }
          }
        },
        "put": {
          "summary": "Update Profile Image",
          "description": "Upload or update user profile image",
          "tags": ["User Profile"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "image": { "type": "string", "description": "Base64 encoded image" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Profile image updated successfully"
            }
          }
        },
        "delete": {
          "summary": "Delete Profile Image",
          "description": "Remove user's profile image",
          "tags": ["User Profile"],
          "responses": {
            "200": {
              "description": "Profile image deleted successfully"
            }
          }
        }
      },
      "/user/dashboard": {
        "get": {
          "summary": "Get User Dashboard (Alias)",
          "description": "Get dashboard data (alternative route)",
          "tags": ["Dashboard"],
          "responses": {
            "200": {
              "description": "Dashboard data retrieved successfully"
            }
          }
        }
      },
      "/me/timer/pause": {
        "post": {
          "summary": "Pause/Resume Timer",
          "description": "Pause or resume the current timer",
          "tags": ["Timer"],
          "responses": {
            "200": {
              "description": "Timer paused/resumed successfully"
            }
          }
        }
      },
      "/time-entries": {
        "get": {
          "summary": "Get Time Entries (Alias)",
          "description": "Get time entries (alternative route)",
          "tags": ["Time Entries"],
          "parameters": [
            {
              "name": "page",
              "in": "query",
              "schema": { "type": "integer", "default": 1 }
            },
            {
              "name": "limit",
              "in": "query",
              "schema": { "type": "integer", "default": 20 }
            }
          ],
          "responses": {
            "200": {
              "description": "Time entries retrieved successfully"
            }
          }
        }
      },
      "/me/time-entries/{id}": {
        "put": {
          "summary": "Update Time Entry",
          "description": "Update an existing time entry",
          "tags": ["Time Entries"],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "integer" }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "start_time": { "type": "string", "format": "time" },
                    "end_time": { "type": "string", "format": "time" },
                    "description": { "type": "string" },
                    "break_duration": { "type": "integer" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Time entry updated successfully"
            }
          }
        },
        "delete": {
          "summary": "Delete Time Entry",
          "description": "Delete a time entry",
          "tags": ["Time Entries"],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "integer" }
            }
          ],
          "responses": {
            "200": {
              "description": "Time entry deleted successfully"
            }
          }
        }
      },
      "/me/vacation/balance": {
        "get": {
          "summary": "Get Vacation Balance",
          "description": "Get detailed vacation balance information",
          "tags": ["Leave Management"],
          "responses": {
            "200": {
              "description": "Vacation balance retrieved successfully"
            }
          }
        }
      },
      "/me/vacation-balance": {
        "get": {
          "summary": "Get Vacation Balance (Simple)",
          "description": "Get simple vacation balance overview",
          "tags": ["Leave Management"],
          "responses": {
            "200": {
              "description": "Vacation balance retrieved successfully"
            }
          }
        }
      },
      "/me/overtime/summary": {
        "get": {
          "summary": "Get Overtime Summary",
          "description": "Get overtime hours summary and compensation details",
          "tags": ["Reports"],
          "responses": {
            "200": {
              "description": "Overtime summary retrieved successfully"
            }
          }
        }
      },
      "/me/work-status": {
        "get": {
          "summary": "Get Work Status",
          "description": "Get current work session status and productivity metrics",
          "tags": ["Reports"],
          "responses": {
            "200": {
              "description": "Work status retrieved successfully"
            }
          }
        }
      },
      "/me/notifications": {
        "get": {
          "summary": "Get User Notifications",
          "description": "Get detailed user notifications with priority and actions",
          "tags": ["Notifications"],
          "responses": {
            "200": {
              "description": "Notifications retrieved successfully"
            }
          }
        }
      },
      "/me/notifications/{id}/read": {
        "post": {
          "summary": "Mark Notification as Read",
          "description": "Mark a specific notification as read",
          "tags": ["Notifications"],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "integer" }
            }
          ],
          "responses": {
            "200": {
              "description": "Notification marked as read"
            }
          }
        }
      },
      "/me/notifications/mark-all-read": {
        "post": {
          "summary": "Mark All Notifications as Read",
          "description": "Mark all user notifications as read",
          "tags": ["Notifications"],
          "responses": {
            "200": {
              "description": "All notifications marked as read"
            }
          }
        }
      },
      "/me/updates": {
        "get": {
          "summary": "Get Company Updates",
          "description": "Get detailed company announcements and updates",
          "tags": ["Notifications"],
          "responses": {
            "200": {
              "description": "Company updates retrieved successfully"
            }
          }
        }
      },
      "/projects/{id}/tasks": {
        "get": {
          "summary": "Get Project Tasks",
          "description": "Get tasks for a specific project",
          "tags": ["Projects"],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "integer" }
            }
          ],
          "responses": {
            "200": {
              "description": "Project tasks retrieved successfully"
            }
          }
        }
      },
      "/setup-sample-tasks": {
        "post": {
          "summary": "Setup Sample Tasks",
          "description": "Create sample tasks for testing and demonstration",
          "tags": ["Projects"],
          "responses": {
            "201": {
              "description": "Sample tasks created successfully"
            }
          }
        }
      },
      "/me/quick-actions": {
        "get": {
          "summary": "Get Quick Actions",
          "description": "Get available quick actions for the user",
          "tags": ["Quick Actions"],
          "responses": {
            "200": {
              "description": "Quick actions retrieved successfully"
            }
          }
        }
      },
      "/me/time-corrections": {
        "post": {
          "summary": "Submit Time Correction",
          "description": "Submit a time correction request",
          "tags": ["Quick Actions"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["original_entry_id", "correction_type", "reason"],
                  "properties": {
                    "original_entry_id": { "type": "integer" },
                    "correction_type": { "type": "string" },
                    "reason": { "type": "string" },
                    "corrected_start_time": { "type": "string", "format": "time" },
                    "corrected_end_time": { "type": "string", "format": "time" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Time correction request submitted successfully"
            }
          }
        }
      },
      "/me/time-entries/manual": {
        "post": {
          "summary": "Add Manual Time Entry",
          "description": "Submit a manual time entry request",
          "tags": ["Quick Actions"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["date", "start_time", "end_time", "task_description", "reason"],
                  "properties": {
                    "date": { "type": "string", "format": "date" },
                    "start_time": { "type": "string", "format": "time" },
                    "end_time": { "type": "string", "format": "time" },
                    "task_description": { "type": "string" },
                    "reason": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Manual time entry submitted successfully"
            }
          }
        }
      }
    }
  };

  res.json(swaggerSpec);
});

// Swagger UI
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Complete API Documentation - api-layer.vercel.app</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: '/swagger.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
    </html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'API endpoint not found',
    domain: 'api-layer.vercel.app',
    available_endpoints: [
      '/api/health',
      '/api/test', 
      '/api/dashboard',
      '/api/me/timer/start',
      '/api/me/timer/stop',
      '/api/me/timer/current',
      '/api/me/work-summary/today',
      '/api/notifications',
      '/api/updates',
      '/api/quick-actions',
      '/api/leave-types',
      '/api/me/leave-requests',
      '/api-docs',
      '/swagger.json'
    ]
  });
});

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Get Token: http://localhost:${PORT}/api/get-token`);
  });
}

module.exports = app;