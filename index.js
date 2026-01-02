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
    '/api/test' // Making test endpoint public for now
  ];
  
  if (publicPaths.includes(req.path)) {
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

// Sign Out / Logout API
app.post('/api/auth/logout', (req, res) => {
  // Invalidate token (in real app, add to blacklist)
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
  const { id } = req.params;
  const { start_time, end_time, description, break_duration } = req.body;
  
  res.json({
    success: true,
    message: 'Time entry updated successfully',
    data: {
      entry: {
        id: parseInt(id),
        start_time,
        end_time,
        description,
        break_duration,
        total_hours: 8.5,
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
          title: '≡ƒÄä Holiday Schedule Update',
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
          title: '≡ƒÜÇ New Feature Release',
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
          title: '≡ƒôè Monthly Performance Review',
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

// Dashboard APIs
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        totalEmployees: 42,
        workingNow: 18,
        pendingRequests: 7,
        overtimeAlerts: 3
      },
      workforceActivity: {
        clockedInToday: 38,
        notClockedIn: 4,
        onBreak: 7,
        clockedOutToday: 34,
        lateArrivals: 3
      },
      recentActivity: [
        {
          id: 1,
          type: 'clock_in',
          employee: 'Jenny Wilson',
          message: 'clocked in',
          details: 'Started their shift at 08:12',
          time: '08:12',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'correction',
          employee: 'Michael Kim',
          message: 'requested a time correction',
          details: 'for 9 Nov',
          time: '08:04',
          timestamp: new Date().toISOString()
        },
        {
          id: 3,
          type: 'vacation_approved',
          employee: 'Admin',
          message: 'approved Sarah Anderson\'s vacation request',
          time: '08:04',
          timestamp: new Date().toISOString()
        },
        {
          id: 4,
          type: 'break_started',
          employee: 'Mark Evans',
          message: 'went on break',
          details: 'at 07:40',
          time: '07:40',
          timestamp: new Date().toISOString()
        },
        {
          id: 5,
          type: 'early_clock_out',
          employee: 'Kevin Hart',
          message: 'clocked out early',
          details: 'earlier than scheduled',
          time: '08:04',
          timestamp: new Date().toISOString()
        }
      ],
      monthTarget: 160
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
          title: '≡ƒÄë New Time Tracking Features',
          message: 'We have added new timer controls and better reporting features.',
          type: 'feature',
          date: '2025-12-23',
          priority: 'medium',
          read: false
        },
        {
          id: 2,
          title: '≡ƒÅó Office Holiday Schedule',
          message: 'Office will be closed from Dec 25-Jan 1 for holidays.',
          type: 'announcement',
          date: '2025-12-22', 
          priority: 'high',
          read: false
        },
        {
          id: 3,
          title: '≡ƒôè Monthly Reports Available',
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
          title: '≡ƒÄä Holiday Schedule Update',
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
          title: '≡ƒÜÇ New Feature Release',
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
          title: '≡ƒôè Monthly Performance Review',
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

// Dashboard Recent Requests API
app.get('/api/dashboard/recent-requests', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || 'all';
  const type = req.query.type || 'all';
  
  const allRequests = [
    {
      id: 1,
      employeeName: 'Jenny Wilson',
      type: 'Vacation',
      date: '12 - 14 Nov 2025',
      status: 'Pending',
      submitted: 'Today, 08:04',
      submittedDate: new Date().toISOString()
    },
    {
      id: 2,
      employeeName: 'Michael Kim',
      type: 'Vacation',
      date: '5 - 6 Nov 2025',
      status: 'Approved',
      submitted: 'Yesterday, 17:22',
      submittedDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      employeeName: 'Mark Evans',
      type: 'Correction',
      date: '9 Nov 2025',
      status: 'Pending',
      submitted: '2 days ago',
      submittedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 4,
      employeeName: 'Sarah Anderson',
      type: 'Correction',
      date: '2 Nov 2025',
      status: 'Reject',
      submitted: '2 days ago',
      submittedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 5,
      employeeName: 'Daniel Lee',
      type: 'Correction',
      date: '3 Nov 2025',
      status: 'Reject',
      submitted: 'Yesterday, 10:11',
      submittedDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 6,
      employeeName: 'Michael Chen',
      type: 'Vacation',
      date: '20 - 22 Dec 2025',
      status: 'Pending',
      submitted: 'Today, 09:45',
      submittedDate: new Date().toISOString()
    },
    {
      id: 7,
      employeeName: 'Olivia Carter',
      type: 'Vacation',
      date: '10 Nov 2025',
      status: 'Pending',
      submitted: 'Today, 06:04',
      submittedDate: new Date().toISOString()
    },
    {
      id: 8,
      employeeName: 'Joshua Kim',
      type: 'Vacation',
      date: '28 Nov 2025',
      status: 'Approved',
      submitted: '2 days ago',
      submittedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 9,
      employeeName: 'Emily Davis',
      type: 'Correction',
      date: '1 Nov 2025',
      status: 'Approved',
      submitted: '3 days ago',
      submittedDate: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 10,
      employeeName: 'Michelle Hart',
      type: 'Vacation',
      date: '18 - 19 Nov 2025',
      status: 'Pending',
      submitted: 'Today, 11:12',
      submittedDate: new Date().toISOString()
    }
  ];
  
  let filteredRequests = allRequests;
  
  if (status !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.status.toLowerCase() === status.toLowerCase());
  }
  
  if (type !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.type.toLowerCase() === type.toLowerCase());
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      requests: paginatedRequests,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(filteredRequests.length / limit),
        total_records: filteredRequests.length,
        per_page: limit
      },
      filters: {
        available_statuses: ['All Status', 'Pending', 'Approved', 'Reject'],
        available_types: ['All Types', 'Vacation', 'Correction'],
        current_status: status,
        current_type: type
      }
    }
  });
});

// Request Actions APIs
app.post('/api/requests/:id/approve', (req, res) => {
  const requestId = req.params.id;
  res.json({
    success: true,
    message: 'Request approved successfully',
    data: {
      requestId: requestId,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Admin'
    }
  });
});

app.post('/api/requests/:id/reject', (req, res) => {
  const requestId = req.params.id;
  const reason = req.body.reason || 'No reason provided';
  res.json({
    success: true,
    message: 'Request rejected successfully',
    data: {
      requestId: requestId,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'Admin',
      reason: reason
    }
  });
});

// Workforce Activity API
app.get('/api/dashboard/workforce-activity', (req, res) => {
  res.json({
    success: true,
    data: {
      todayStats: {
        clockedInToday: {
          count: 38,
          description: 'Employees who have started their shift',
          employees: ['John Doe', 'Jane Smith', 'Mike Johnson']
        },
        notClockedIn: {
          count: 4,
          description: 'Employees who haven\'t started their day yet',
          employees: ['Sarah Wilson', 'David Brown']
        },
        onBreak: {
          count: 7,
          description: 'Currently on break or paused',
          employees: ['Mark Evans', 'Lisa Wang']
        },
        clockedOutToday: {
          count: 34,
          description: 'Employees who have finished their shift',
          employees: ['Alex Chen', 'Maria Garcia']
        },
        lateArrivals: {
          count: 3,
          description: 'Clocked in after the scheduled start time',
          employees: ['Robert Taylor', 'Emma Davis', 'Chris Wilson']
        }
      },
      realTimeUpdates: {
        lastUpdated: new Date().toISOString(),
        refreshRate: '30 seconds'
      }
    }
  });
});

// Timer APIs
app.post('/api/me/timer/start', (req, res) => {
  const { force = false } = req.body;
  
  // Check if timer is already running
  const currentTimer = {
    is_active: true,
    timer_id: 1,
    start_time: '2025-12-31T09:00:00Z',
    duration: '02:15:30'
  };
  
  // If timer already running and not forcing restart
  if (currentTimer.is_active && !force) {
    return res.status(409).json({
      success: false,
      error: 'TIMER_ALREADY_RUNNING',
      message: 'Timer is already active. Please stop the current timer first or use force=true to restart.',
      currentTimer: {
        timer_id: currentTimer.timer_id,
        startedAt: currentTimer.start_time,
        duration: currentTimer.duration,
        status: 'active'
      },
      suggestions: [
        'Stop current timer first',
        'Use force=true to restart timer',
        'Check current timer status'
      ]
    });
  }
  
  // If forcing restart, stop previous timer first
  if (force && currentTimer.is_active) {
    // Logic to stop previous timer would go here
    console.log('Force stopping previous timer and starting new one');
  }
  
  res.json({
    success: true,
    message: force ? 'Timer restarted successfully' : 'Timer started successfully',
    data: {
      timer_id: Math.floor(Math.random() * 1000) + 1,
      start_time: new Date().toISOString(),
      status: 'active',
      force_restart: force
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
  // Check if user has an active timer (proper implementation would check database)
  // For now, simulating an active timer state that persists after start
  const now = new Date();
  const startTime = new Date(now.getTime() - (2 * 60 * 60 * 1000)); // 2 hours ago
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMins = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const elapsedSecs = Math.floor((elapsedMs % (1000 * 60)) / 1000);
  
  res.json({
    success: true,
    data: {
      is_active: true,
      current_task: 'API Development',
      start_time: startTime.toISOString(),
      elapsed_time: elapsedMs / 1000, // seconds
      formatted_time: `${String(elapsedHours).padStart(2, '0')}:${String(elapsedMins).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`,
      project_id: 1,
      project_name: 'API Layer Project',
      last_activity: now.toISOString(),
      break_status: {
        on_break: false,
        break_start: null,
        break_duration: 0
      }
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
          title: '≡ƒôï Corporate Updates',
          message: 'New company policies updated',
          date: '2025-12-23',
          is_read: false
        },
        {
          id: 2,
          type: 'system',
          title: '≡ƒöö System Notification', 
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
          icon: 'ΓÅ░',
          enabled: true
        },
        {
          id: 'time_correction',
          title: 'Time Correction',
          description: 'Request correction for time entries',
          icon: '≡ƒô¥',
          enabled: true
        },
        {
          id: 'leave_request',
          title: 'Leave Request', 
          description: 'Apply for leave/vacation',
          icon: '≡ƒî┤',
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
      icon: '≡ƒî┤'
    },
    {
      type: 'sick_leave',
      name: 'Sick Leave',
      description: 'Medical leave for illness or health issues',
      is_paid: true,
      max_days_per_year: 10,
      color: '#FF9800',
      icon: '≡ƒÅÑ'
    },
    {
      type: 'half_day',
      name: 'Half Day Leave',
      description: 'Half day off (morning or afternoon)',
      is_paid: true,
      max_days_per_year: 12,
      color: '#2196F3',
      icon: '≡ƒòÉ'
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
      reason: 'Family trip ≡ƒî┤',
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
    message: 'Vacation request sent Γ£à',
    data: {
      request: newRequest,
      success_message: 'Vacation request sent Γ£à',
      success_title: 'Request Submitted'
    }
  });
});

// Swagger Documentation
app.get('/swagger.json', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const swaggerPath = path.join(__dirname, 'swagger-spec.json');
    const swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    res.json(swaggerSpec);
  } catch (error) {
    console.error('Error loading swagger-spec.json:', error);
    res.status(500).json({ error: 'Failed to load API documentation' });
  }
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

// ========== Time Corrections API (Based on Figma Designs) ==========

// Get all time correction requests for current user
app.get('/api/me/time-corrections', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Time correction requests retrieved successfully",
    data: {
      requests: [
        {
          id: 1,
          type: 'missing_work_entry',
          date: '2024-12-20',
          status: 'pending',
          requested_time_in: '09:00:00',
          requested_time_out: '17:00:00',
          reason: 'Forgot to clock in and out',
          submitted_at: '2024-12-21T10:30:00Z',
          issue_description: 'Missing work entry for full day'
        },
        {
          id: 2,
          type: 'wrong_clock_time',
          date: '2024-12-19',
          status: 'approved',
          actual_time_in: '08:45:00',
          requested_time_in: '09:00:00',
          reason: 'Clock-in time was incorrect',
          submitted_at: '2024-12-20T14:15:00Z'
        }
      ],
      total_count: 2,
      pending_count: 1,
      approved_count: 1
    }
  });
});

// Get time correction issue types
app.get('/api/time-correction-types', authenticateToken, (req, res) => {
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
      }
    ]
  });
});

// Create new time correction request
app.post('/api/me/time-corrections', authenticateToken, (req, res) => {
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

  // Generate response based on issue type
  const newRequest = {
    id: Math.floor(Math.random() * 10000),
    type,
    date,
    status: 'pending',
    reason,
    issue_description,
    additional_notes,
    submitted_at: new Date().toISOString(),
    estimated_processing_time: '24-48 hours'
  };

  if (type === 'missing_work_entry') {
    newRequest.requested_time_in = requested_time_in;
    newRequest.requested_time_out = requested_time_out;
  } else if (type === 'wrong_clock_time') {
    newRequest.actual_time_in = actual_time_in;
    newRequest.actual_time_out = actual_time_out;
    newRequest.requested_time_in = requested_time_in;
    newRequest.requested_time_out = requested_time_out;
  }

  res.json({
    success: true,
    message: "Time correction request submitted successfully",
    data: newRequest
  });
});

// Update time correction status (for admin/manager)
app.put('/api/time-corrections/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, admin_comment } = req.body; // pending, approved, rejected
  
  res.json({
    success: true,
    message: `Time correction request ${status} successfully`,
    data: {
      id: parseInt(id),
      status,
      admin_comment,
      updated_at: new Date().toISOString(),
      processed_by: 'Manager Name'
    }
  });
});

// Get time correction history
app.get('/api/me/time-corrections/history', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Time correction history retrieved successfully",
    data: {
      history: [
        {
          id: 1,
          type: 'missing_work_entry',
          date: '2024-12-15',
          status: 'approved',
          reason: 'System was down',
          processed_at: '2024-12-16T09:00:00Z',
          processed_by: 'HR Manager'
        },
        {
          id: 2,
          type: 'wrong_clock_time',
          date: '2024-12-10',
          status: 'rejected',
          reason: 'Incorrect request details',
          processed_at: '2024-12-11T14:30:00Z',
          processed_by: 'Team Lead'
        }
      ],
      total_requests: 5,
      approved_requests: 3,
      rejected_requests: 1,
      pending_requests: 1
    }
  });
});

// ========== Company Management APIs (Based on Figma Company Settings - Admin/Owner) ==========

// Get company settings
app.get('/api/company/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Company settings retrieved successfully",
    data: {
      company: {
        id: 1,
        name: "ACME Inc.",
        logo_url: "https://api-layer.vercel.app/api/company/logo",
        industry: "IT Company",
        category: "Technology",
        brand_color: "#6366F1",
        brand_color_name: "Purple",
        support_email: "acmeinc@gmail.com",
        company_phone: "(+1) 740 - 8521",
        address: "45 Cloudy Bay, Auckland, NZ",
        founded_date: "2020-01-01",
        employee_count: 150,
        timezone: "Pacific/Auckland",
        website: "https://acme.inc",
        description: "Leading technology company providing innovative solutions"
      },
      branding: {
        primary_color: "#6366F1",
        secondary_color: "#8B5CF6", 
        accent_color: "#F59E0B",
        logo_variants: {
          light: "https://api-layer.vercel.app/api/company/logo/light",
          dark: "https://api-layer.vercel.app/api/company/logo/dark",
          icon: "https://api-layer.vercel.app/api/company/logo/icon"
        }
      },
      permissions: {
        can_edit_company: true,
        can_change_branding: true,
        can_upload_logo: true,
        role_required: "admin"
      }
    }
  });
});

// Update company settings (general)
app.put('/api/company/settings', authenticateToken, (req, res) => {
  const { name, industry, brand_color, support_email, company_phone, address, description } = req.body;
  
  res.json({
    success: true,
    message: "Company settings updated successfully",
    data: {
      company: {
        id: 1,
        name: name || "ACME Inc.",
        industry: industry || "IT Company",
        brand_color: brand_color || "#6366F1",
        support_email: support_email || "acmeinc@gmail.com",
        company_phone: company_phone || "(+1) 740 - 8521", 
        address: address || "45 Cloudy Bay, Auckland, NZ",
        description: description,
        updated_at: new Date().toISOString(),
        updated_by: "Admin User"
      }
    }
  });
});

// Upload company logo
app.post('/api/company/logo', authenticateToken, (req, res) => {
  const { logo_data, logo_type, variant } = req.body;
  
  res.json({
    success: true,
    message: "Company logo uploaded successfully",
    data: {
      logo_url: "https://api-layer.vercel.app/api/company/logo",
      variant: variant || "primary",
      logo_id: `LOGO_${Date.now()}`,
      upload_time: new Date().toISOString(),
      file_size: "3.2 MB",
      file_type: logo_type || "image/png",
      dimensions: "512x512",
      variants_generated: {
        light: "https://api-layer.vercel.app/api/company/logo/light",
        dark: "https://api-layer.vercel.app/api/company/logo/dark", 
        icon: "https://api-layer.vercel.app/api/company/logo/icon",
        favicon: "https://api-layer.vercel.app/api/company/logo/favicon"
      }
    }
  });
});

// Update company name
app.put('/api/company/name', authenticateToken, (req, res) => {
  const { company_name } = req.body;
  
  if (!company_name || company_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Company name is required",
      errors: {
        company_name: "Please enter a valid company name"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Company name updated successfully",
    data: {
      company_name: company_name.trim(),
      slug: company_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      updated_at: new Date().toISOString()
    }
  });
});

// Update industry/category
app.put('/api/company/industry', authenticateToken, (req, res) => {
  const { industry, category } = req.body;
  
  if (!industry) {
    return res.status(400).json({
      success: false,
      message: "Industry/category is required",
      errors: {
        industry: "Please select an industry"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Industry updated successfully",
    data: {
      industry,
      category: category || industry,
      industry_code: industry.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      updated_at: new Date().toISOString()
    }
  });
});

// Update brand color
app.put('/api/company/brand-color', authenticateToken, (req, res) => {
  const { brand_color, color_name, custom_color } = req.body;
  
  // Predefined colors matching Figma design
  const predefinedColors = {
    'Blue': '#3B82F6',
    'Purple': '#6366F1', 
    'Burgundy': '#991B1B',
    'Red': '#EF4444',
    'Midnight Blue': '#1E3A8A'
  };
  
  let finalColor = brand_color;
  let finalColorName = color_name;
  
  // If custom color is provided
  if (custom_color) {
    finalColor = custom_color;
    finalColorName = 'Custom Color';
  } else if (color_name && predefinedColors[color_name]) {
    finalColor = predefinedColors[color_name];
  }
  
  // Color validation
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexColorRegex.test(finalColor)) {
    return res.status(400).json({
      success: false,
      message: "Invalid color format",
      errors: {
        brand_color: "Please provide a valid hex color code"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Brand color updated successfully",
    data: {
      brand_color: finalColor,
      color_name: finalColorName,
      rgb: hexToRgb(finalColor),
      predefined_colors: predefinedColors,
      updated_at: new Date().toISOString()
    }
  });
});

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Update support email
app.put('/api/company/support-email', authenticateToken, (req, res) => {
  const { support_email } = req.body;
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!support_email || !emailRegex.test(support_email)) {
    return res.status(400).json({
      success: false,
      message: "Valid support email is required",
      errors: {
        support_email: "Please enter a valid email address"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Support email updated successfully",
    data: {
      support_email,
      email_verified: false,
      verification_sent: true,
      updated_at: new Date().toISOString()
    }
  });
});

// Update company phone
app.put('/api/company/phone', authenticateToken, (req, res) => {
  const { company_phone } = req.body;
  
  if (!company_phone) {
    return res.status(400).json({
      success: false,
      message: "Company phone number is required",
      errors: {
        company_phone: "Please enter a valid phone number"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Company phone updated successfully",
    data: {
      company_phone,
      formatted_phone: company_phone,
      country_code: "+1",
      phone_verified: false,
      updated_at: new Date().toISOString()
    }
  });
});

// Update company address
app.put('/api/company/address', authenticateToken, (req, res) => {
  const { address, city, state, country, postal_code } = req.body;
  
  if (!address) {
    return res.status(400).json({
      success: false,
      message: "Address is required",
      errors: {
        address: "Please enter a valid address"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Company address updated successfully",
    data: {
      address,
      city: city || "Auckland",
      state: state || "Auckland",
      country: country || "New Zealand",
      postal_code: postal_code || "1010",
      full_address: `${address}, ${city || "Auckland"}, ${country || "New Zealand"}`,
      coordinates: {
        latitude: -36.8485,
        longitude: 174.7633
      },
      updated_at: new Date().toISOString()
    }
  });
});

// ========== Profile Management APIs (Based on Figma Settings Screens) ==========

// Get user profile information
app.get('/api/me/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Profile information retrieved successfully",
    data: {
      user: {
        id: 1,
        first_name: "Jenny",
        last_name: "Wilson", 
        full_name: "Jenny Wilson",
        email: "jenny.wilson@email.com",
        phone: "(+1) 267 - 9041",
        profile_photo: "https://api-layer.vercel.app/api/me/profile/photo",
        role: "Employee",
        company: "ACME Inc.",
        joined_date: "August 17, 2025",
        employee_id: "EMP001",
        department: "Engineering",
        status: "Active",
        timezone: "UTC-5",
        last_login: "2024-12-24T09:41:00Z"
      },
      permissions: {
        can_edit_profile: true,
        can_change_password: true,
        can_delete_account: true,
        can_upload_photo: true
      }
    }
  });
});

// Update profile information  
app.put('/api/me/profile', authenticateToken, (req, res) => {
  const { first_name, last_name, email, phone, timezone } = req.body;
  
  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: 1,
        first_name: first_name || "Jenny",
        last_name: last_name || "Wilson",
        full_name: `${first_name || "Jenny"} ${last_name || "Wilson"}`,
        email: email || "jenny.wilson@email.com", 
        phone: phone || "(+1) 267 - 9041",
        timezone: timezone || "UTC-5",
        updated_at: new Date().toISOString()
      }
    }
  });
});

// Upload profile photo
app.post('/api/me/profile/photo', authenticateToken, (req, res) => {
  const { photo_data, photo_type } = req.body;
  
  res.json({
    success: true,
    message: "Profile photo uploaded successfully",
    data: {
      photo_url: "https://api-layer.vercel.app/api/me/profile/photo",
      photo_id: Math.floor(Math.random() * 10000),
      upload_time: new Date().toISOString(),
      file_size: "2.3 MB",
      file_type: photo_type || "image/jpeg",
      thumbnail_url: "https://api-layer.vercel.app/api/me/profile/photo/thumb"
    }
  });
});

// Update name specifically  
app.put('/api/me/profile/name', authenticateToken, (req, res) => {
  const { first_name, last_name } = req.body;
  
  // Validation
  if (!first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: "First name and last name are required",
      errors: {
        first_name: !first_name ? "First name is required" : null,
        last_name: !last_name ? "Last name is required" : null
      }
    });
  }
  
  res.json({
    success: true,
    message: "Name updated successfully",
    data: {
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`,
      updated_at: new Date().toISOString()
    }
  });
});

// Update email specifically
app.put('/api/me/profile/email', authenticateToken, (req, res) => {
  const { email } = req.body;
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email address is required",
      errors: {
        email: "Please enter a valid email address"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Email updated successfully",
    data: {
      email,
      email_verified: false,
      verification_sent: true,
      updated_at: new Date().toISOString()
    }
  });
});

// Update phone number specifically
app.put('/api/me/profile/phone', authenticateToken, (req, res) => {
  const { phone } = req.body;
  
  // Phone validation
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
      errors: {
        phone: "Please enter a valid phone number"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Phone number updated successfully", 
    data: {
      phone,
      phone_verified: false,
      verification_sent: true,
      updated_at: new Date().toISOString()
    }
  });
});

// Change password
app.put('/api/me/profile/password', authenticateToken, (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  
  // Password validation
  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: "All password fields are required",
      errors: {
        current_password: !current_password ? "Current password is required" : null,
        new_password: !new_password ? "New password is required" : null,
        confirm_password: !confirm_password ? "Please confirm your new password" : null
      }
    });
  }
  
  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
      errors: {
        confirm_password: "Passwords do not match"
      }
    });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
      errors: {
        new_password: "Password must be at least 6 characters long"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Password changed successfully",
    data: {
      password_changed: true,
      changed_at: new Date().toISOString(),
      logout_other_sessions: true
    }
  });
});

// Delete account
app.delete('/api/me/profile', authenticateToken, (req, res) => {
  const { confirmation_text, password } = req.body;
  
  // Validation for delete confirmation
  if (!confirmation_text || confirmation_text.toLowerCase() !== 'delete') {
    return res.status(400).json({
      success: false,
      message: "Please type 'DELETE' to confirm account deletion",
      errors: {
        confirmation: "Type 'DELETE' to confirm"
      }
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required to delete account",
      errors: {
        password: "Please enter your password to confirm"
      }
    });
  }
  
  res.json({
    success: true,
    message: "Account deletion initiated successfully",
    data: {
      deletion_initiated: true,
      deletion_id: `DEL_${Date.now()}`,
      initiated_at: new Date().toISOString(),
      completion_time: "24-48 hours",
      cancellation_deadline: new Date(Date.now() + 24*60*60*1000).toISOString(),
      warning: "This action cannot be undone. Your profile and all related data will be permanently removed."
    }
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
      '/api/me/time-corrections',
      '/api/time-correction-types',
      '/api/me/time-corrections/history',
      '/api/company/settings',
      '/api/company/logo',
      '/api/company/name',
      '/api/company/industry',
      '/api/company/brand-color',
      '/api/company/support-email',
      '/api/company/phone',
      '/api/company/address',
      '/api/me/profile',
      '/api/me/profile/photo',
      '/api/me/profile/name',
      '/api/me/profile/email',
      '/api/me/profile/phone',
      '/api/me/profile/password',
      '/api-docs',
      '/swagger.json'
    ]
  });
});

// Start server for local development
const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel environment
// Dashboard Recent Requests API
app.get('/api/dashboard/recent-requests', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || 'all';
  const type = req.query.type || 'all';
  
  const allRequests = [
    {
      id: 1,
      employeeName: 'Jenny Wilson',
      type: 'Vacation',
      date: '12 - 14 Nov 2025',
      status: 'Pending',
      submitted: 'Today, 08:04',
      submittedDate: new Date().toISOString()
    },
    {
      id: 2,
      employeeName: 'Michael Kim',
      type: 'Vacation',
      date: '5 - 6 Nov 2025',
      status: 'Approved',
      submitted: 'Yesterday, 17:22',
      submittedDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      employeeName: 'Mark Evans',
      type: 'Correction',
      date: '9 Nov 2025',
      status: 'Pending',
      submitted: '2 days ago',
      submittedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 4,
      employeeName: 'Sarah Anderson',
      type: 'Correction',
      date: '2 Nov 2025',
      status: 'Reject',
      submitted: '2 days ago',
      submittedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 5,
      employeeName: 'Daniel Lee',
      type: 'Correction',
      date: '3 Nov 2025',
      status: 'Reject',
      submitted: 'Yesterday, 10:11',
      submittedDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 6,
      employeeName: 'Michael Chen',
      type: 'Vacation',
      date: '20 - 22 Dec 2025',
      status: 'Pending',
      submitted: 'Today, 09:45',
      submittedDate: new Date().toISOString()
    },
    {
      id: 7,
      employeeName: 'Olivia Carter',
      type: 'Vacation',
      date: '10 Nov 2025',
      status: 'Pending',
      submitted: 'Today, 06:04',
      submittedDate: new Date().toISOString()
    },
    {
      id: 8,
      employeeName: 'Joshua Kim',
      type: 'Vacation',
      date: '28 Nov 2025',
      status: 'Approved',
      submitted: '2 days ago',
      submittedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 9,
      employeeName: 'Emily Davis',
      type: 'Correction',
      date: '1 Nov 2025',
      status: 'Approved',
      submitted: '3 days ago',
      submittedDate: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 10,
      employeeName: 'Michelle Hart',
      type: 'Vacation',
      date: '18 - 19 Nov 2025',
      status: 'Pending',
      submitted: 'Today, 11:12',
      submittedDate: new Date().toISOString()
    }
  ];
  
  let filteredRequests = allRequests;
  
  if (status !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.status.toLowerCase() === status.toLowerCase());
  }
  
  if (type !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.type.toLowerCase() === type.toLowerCase());
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      requests: paginatedRequests,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(filteredRequests.length / limit),
        total_records: filteredRequests.length,
        per_page: limit
      },
      filters: {
        available_statuses: ['All Status', 'Pending', 'Approved', 'Reject'],
        available_types: ['All Types', 'Vacation', 'Correction'],
        current_status: status,
        current_type: type
      }
    }
  });
});

// Request Actions APIs
app.post('/api/requests/:id/approve', (req, res) => {
  const requestId = req.params.id;
  res.json({
    success: true,
    message: 'Request approved successfully',
    data: {
      requestId: requestId,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Admin'
    }
  });
});

app.post('/api/requests/:id/reject', (req, res) => {
  const requestId = req.params.id;
  const reason = req.body.reason || 'No reason provided';
  res.json({
    success: true,
    message: 'Request rejected successfully',
    data: {
      requestId: requestId,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'Admin',
      reason: reason
    }
  });
});

// Workforce Activity API
app.get('/api/dashboard/workforce-activity', (req, res) => {
  res.json({
    success: true,
    data: {
      todayStats: {
        clockedInToday: {
          count: 38,
          description: 'Employees who have started their shift',
          employees: ['John Doe', 'Jane Smith', 'Mike Johnson']
        },
        notClockedIn: {
          count: 4,
          description: 'Employees who haven\'t started their day yet',
          employees: ['Sarah Wilson', 'David Brown']
        },
        onBreak: {
          count: 7,
          description: 'Currently on break or paused',
          employees: ['Mark Evans', 'Lisa Wang']
        },
        clockedOutToday: {
          count: 34,
          description: 'Employees who have finished their shift',
          employees: ['Alex Chen', 'Maria Garcia']
        },
        lateArrivals: {
          count: 3,
          description: 'Clocked in after the scheduled start time',
          employees: ['Robert Taylor', 'Emma Davis', 'Chris Wilson']
        }
      },
      realTimeUpdates: {
        lastUpdated: new Date().toISOString(),
        refreshRate: '30 seconds'
      }
    }
  });
});

// Employee Stats API
app.get('/api/dashboard/employees', (req, res) => {
  res.json({
    success: true,
    data: {
      totalEmployees: 42,
      activeEmployees: 39,
      onLeave: 3,
      categories: {
        fullTime: 35,
        partTime: 7,
        contractors: 0
      },
      departments: {
        engineering: 18,
        marketing: 8,
        sales: 10,
        hr: 4,
        finance: 2
      }
    }
  });
});

// Get All Employees API
app.get('/api/employees', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || 'all';
  const role = req.query.role || 'all';
  const department = req.query.department || 'all';
  const search = req.query.search || '';
  const dateJoined = req.query.dateJoined || 'all';

  const allEmployees = [
    {
      id: 1,
      name: "Jenny Wilson",
      firstName: "Jenny",
      lastName: "Wilson",
      email: "jenny.wilson@email.com",
      phone: "+1 234 567 890",
      address: "42 Sunset Road, Westfield, NY",
      role: "Employee",
      department: "Design",
      status: "Active",
      dateJoined: "2024-08-17",
      workingHours: "09:00 - 17:00",
      workModel: "Hybrid",
      manager: "Mark Evans",
      employeeId: "EMP - 0232",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612c937?w=150"
    },
    {
      id: 2,
      name: "Michael Kim",
      firstName: "Michael",
      lastName: "Kim",
      email: "michael.kim@email.com",
      phone: "+1 234 567 891",
      address: "123 Oak Street, Boston, MA",
      role: "Employee",
      department: "Engineering",
      status: "Active",
      dateJoined: "2025-01-02",
      workingHours: "09:00 - 18:00",
      workModel: "Remote",
      manager: "Sarah Tech",
      employeeId: "EMP - 0233"
    },
    {
      id: 3,
      name: "Mark Evans",
      firstName: "Mark",
      lastName: "Evans",
      email: "mark.evans@email.com",
      phone: "+1 234 567 892",
      address: "456 Pine Avenue, Seattle, WA",
      role: "Manager",
      department: "Operations",
      status: "Active",
      dateJoined: "2023-10-10",
      workingHours: "08:00 - 17:00",
      workModel: "Onsite",
      manager: "CEO",
      employeeId: "EMP - 0234"
    },
    {
      id: 4,
      name: "Sarah Anderson",
      firstName: "Sarah",
      lastName: "Anderson",
      email: "sarah.anderson@email.com",
      phone: "+1 234 567 893",
      address: "789 Elm Street, Portland, OR",
      role: "Employee",
      department: "HR",
      status: "Inactive",
      dateJoined: "2023-03-03",
      workingHours: "09:00 - 17:00",
      workModel: "Hybrid",
      manager: "HR Director",
      employeeId: "EMP - 0235"
    },
    {
      id: 5,
      name: "Daniel Lee",
      firstName: "Daniel",
      lastName: "Lee",
      email: "daniel.lee@email.com",
      phone: "+1 234 567 894",
      address: "321 Maple Drive, Austin, TX",
      role: "Employee",
      department: "Finance",
      status: "Active",
      dateJoined: "2024-05-12",
      workingHours: "08:30 - 17:30",
      workModel: "Onsite",
      manager: "Finance Head",
      employeeId: "EMP - 0236"
    },
    {
      id: 6,
      name: "Michael Chen",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@email.com",
      phone: "+1 234 567 895",
      address: "654 Broadway, New York, NY",
      role: "Admin",
      department: "IT",
      status: "Active",
      dateJoined: "2022-01-01",
      workingHours: "07:00 - 16:00",
      workModel: "Hybrid",
      manager: "IT Director",
      employeeId: "EMP - 0237"
    },
    {
      id: 7,
      name: "Olivia Carter",
      firstName: "Olivia",
      lastName: "Carter",
      email: "olivia.carter@email.com",
      phone: "+1 234 567 896",
      address: "987 Fifth Avenue, Miami, FL",
      role: "Employee",
      department: "Marketing",
      status: "Active",
      dateJoined: "2024-09-09",
      workingHours: "10:00 - 18:00",
      workModel: "Remote",
      manager: "Marketing Lead",
      employeeId: "EMP - 0238"
    },
    {
      id: 8,
      name: "Joshua Kim",
      firstName: "Joshua",
      lastName: "Kim",
      email: "joshua.kim@email.com",
      phone: "+1 234 567 897",
      address: "159 Wall Street, Chicago, IL",
      role: "Employee",
      department: "Logistics",
      status: "Active",
      dateJoined: "2025-02-28",
      workingHours: "06:00 - 14:00",
      workModel: "Onsite",
      manager: "Operations Manager",
      employeeId: "EMP - 0239"
    },
    {
      id: 9,
      name: "Emily Davis",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@email.com",
      phone: "+1 234 567 898",
      address: "753 Ocean Drive, San Diego, CA",
      role: "Employee",
      department: "Sales",
      status: "Active",
      dateJoined: "2024-11-11",
      workingHours: "09:00 - 17:00",
      workModel: "Hybrid",
      manager: "Sales Director",
      employeeId: "EMP - 0240"
    },
    {
      id: 10,
      name: "Michelle Hart",
      firstName: "Michelle",
      lastName: "Hart",
      email: "michelle.hart@email.com",
      phone: "+1 234 567 899",
      address: "852 Lake Shore, Denver, CO",
      role: "Employee",
      department: "HR",
      status: "Active",
      dateJoined: "2024-04-14",
      workingHours: "08:00 - 16:00",
      workModel: "Onsite",
      manager: "HR Manager",
      employeeId: "EMP - 0241"
    }
  ];

  let filteredEmployees = allEmployees;

  // Apply search filter
  if (search) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply status filter
  if (status !== 'all') {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Apply role filter
  if (role !== 'all') {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.role.toLowerCase() === role.toLowerCase()
    );
  }

  // Apply department filter
  if (department !== 'all') {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.department.toLowerCase() === department.toLowerCase()
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      employees: paginatedEmployees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredEmployees.length / limit),
        totalEmployees: filteredEmployees.length,
        hasNextPage: endIndex < filteredEmployees.length,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get Single Employee API
app.get('/api/employees/:id', (req, res) => {
  const employeeId = parseInt(req.params.id);
  
  const employee = {
    id: employeeId,
    name: "Jenny Wilson",
    firstName: "Jenny",
    lastName: "Wilson",
    email: "jenny.wilson@email.com",
    phone: "+1 234 567 890",
    address: "42 Sunset Road, Westfield, NY",
    dateOfBirth: "1995-10-14",
    role: "Employee",
    department: "Design",
    status: "Active",
    dateJoined: "2024-08-17",
    workingHours: "09:00 - 17:00",
    workModel: "Hybrid",
    manager: "Mark Evans",
    employeeId: "EMP - 0232",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612c937?w=150",
    timesheetSummary: {
      hoursWorkedThisWeek: "38h 20m",
      averageDailyHours: "7h 40m",
      overtimeThisMonth: "4h 20m",
      lastClockIn: "Today, 08:12",
      lastClockOut: "Yesterday, 17:04"
    },
    recentRequests: [
      {
        id: 1,
        type: "Vacation Request",
        description: "Paid Leave 5-6 Nov 2025",
        status: "Pending",
        requestedDate: "2025-11-05",
        submittedAt: "2025-10-28"
      },
      {
        id: 2,
        type: "Correction Request", 
        description: "Incorrect clock-in time",
        status: "Approved",
        requestedDate: "2025-10-25",
        submittedAt: "2025-10-26"
      }
    ],
    recentActivity: [
      {
        id: 1,
        type: "Clock In",
        description: "Clocked in",
        time: "Today, 08:12"
      },
      {
        id: 2,
        type: "Vacation request submitted",
        description: "Requested 2 days off (5-6 Nov)",
        time: "Today, 08:04"
      }
    ]
  };

  res.json({
    success: true,
    data: employee
  });
});

// Create Employee API
app.post('/api/employees', (req, res) => {
  const newEmployee = {
    id: Math.floor(Math.random() * 1000) + 100,
    ...req.body,
    status: "Active",
    dateJoined: new Date().toISOString().split('T')[0],
    employeeId: `EMP - ${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
  };

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: newEmployee
  });
});

// Update Employee API
app.put('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  const updatedData = req.body;

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      id: employeeId,
      ...updatedData,
      updatedAt: new Date().toISOString()
    }
  });
});

// Deactivate Employee API
app.patch('/api/employees/:id/deactivate', (req, res) => {
  const employeeId = req.params.id;

  res.json({
    success: true,
    message: "Employee deactivated",
    data: {
      employeeId: employeeId,
      status: "Inactive",
      deactivatedAt: new Date().toISOString(),
      note: "Deactivated employees cannot log in, but their timesheets, requests, and history will be kept."
    }
  });
});

// Activate Employee API
app.patch('/api/employees/:id/activate', (req, res) => {
  const employeeId = req.params.id;

  res.json({
    success: true,
    message: "Employee activated",
    data: {
      employeeId: employeeId,
      status: "Active",
      activatedAt: new Date().toISOString(),
      note: "This employee can now log in and access the system based on their assigned role."
    }
  });
});

// Delete Employee API
app.delete('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  res.json({
    success: true,
    message: "Employee deleted",
    data: {
      employeeId: employeeId,
      deletedAt: new Date().toISOString(),
      note: "The employee account has been permanently removed from the system."
    }
  });
});

// Get Employee Timesheet API
app.get('/api/employees/:id/timesheet', (req, res) => {
  const employeeId = req.params.id;
  const period = req.query.period || 'weekly';

  res.json({
    success: true,
    data: {
      employeeId: employeeId,
      period: period,
      summary: {
        hoursWorkedThisWeek: "38h 20m",
        averageDailyHours: "7h 40m",
        overtimeThisMonth: "4h 20m",
        lastClockIn: "Today, 08:12",
        lastClockOut: "Yesterday, 17:04"
      },
      entries: [
        {
          date: "2025-12-30",
          clockIn: "08:12",
          clockOut: "17:04",
          totalHours: "8h 52m",
          status: "Regular"
        },
        {
          date: "2025-12-29", 
          clockIn: "08:05",
          clockOut: "17:10",
          totalHours: "9h 5m",
          status: "Overtime"
        }
      ]
    }
  });
});

// Get Employee Roles API
app.get('/api/employees/roles', (req, res) => {
  res.json({
    success: true,
    data: {
      roles: [
        { id: 1, name: "Employee", description: "Standard employee access" },
        { id: 2, name: "Manager", description: "Team management access" },
        { id: 3, name: "Admin", description: "Full system access" },
        { id: 4, name: "HR", description: "Human resources access" }
      ]
    }
  });
});

// Get Departments API
app.get('/api/employees/departments', (req, res) => {
  res.json({
    success: true,
    data: {
      departments: [
        { id: 1, name: "Engineering", employeeCount: 18 },
        { id: 2, name: "Design", employeeCount: 8 },
        { id: 3, name: "Marketing", employeeCount: 6 },
        { id: 4, name: "HR", employeeCount: 4 },
        { id: 5, name: "Finance", employeeCount: 3 },
        { id: 6, name: "Sales", employeeCount: 3 },
        { id: 7, name: "Operations", employeeCount: 2 },
        { id: 8, name: "IT", employeeCount: 2 }
      ]
    }
  });
});

if (require.main === module && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🔗 Swagger JSON: http://localhost:${PORT}/swagger.json`);
  });
}

module.exports = app;
