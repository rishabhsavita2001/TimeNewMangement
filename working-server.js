const express = require('express');
const cors = require('cors');

const app = express();

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

// Get Token API (for testing)
app.get('/api/get-token', (req, res) => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRlbmFudElkIjoxLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzM4NDk2MDF9.mock-jwt-token';
  res.json({
    success: true,
    data: {
      token: mockToken,
      access_token: mockToken,
      user: {
        id: 1,
        tenantId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
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

// Swagger Documentation
app.get('/swagger.json', (req, res) => {
  const swaggerSpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "Time Tracking API - Complete Figma Implementation",
      "description": "Complete API for mobile time tracking app with all Figma screens implemented",
      "version": "2.0.0"
    },
    "servers": [
      {
        "url": "https://api-layer.vercel.app/api",
        "description": "Production server"
      }
    ],
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
                    "password": { "type": "string", "minLength": 6 }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User registered successfully"
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "summary": "User Login",
          "description": "Authenticate user and get access token",
          "tags": ["Authentication"],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["email", "password"],
                  "properties": {
                    "email": { "type": "string", "format": "email" },
                    "password": { "type": "string" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Login successful"
            }
          }
        }
      },
      "/me": {
        "get": {
          "summary": "Get Current User Profile",
          "description": "Get detailed profile information for current user",
          "tags": ["User Profile"],
          "responses": {
            "200": {
              "description": "User profile retrieved successfully"
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
          "summary": "Get Test Token",
          "description": "Get a test JWT token for API testing",
          "tags": ["Testing"],
          "responses": {
            "200": {
              "description": "Token generated successfully"
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

module.exports = app;