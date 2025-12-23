const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
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
    message: 'Test endpoint working on correct domain!',
    domain: 'api-layer.vercel.app'
  });
});

// Get Token (for testing)
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

// User Profile
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
      status: 'active'
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
      tenantName: 'Demo Company'
    }
  });
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      weekly_hours: "40.5h",
      today_hours: "8.5h", 
      current_status: "Working",
      last_check_in: "09:00 AM",
      this_week: {
        total_hours: 40.5,
        total_minutes: 2430,
        days_worked: 5,
        average_daily_hours: 8.1
      },
      today: {
        clock_in: "09:00 AM",
        clock_out: null,
        break_time: "1h",
        active_hours: "7.5h",
        status: "Working"
      }
    }
  });
});

app.get('/api/me/dashboard', (req, res) => {
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
      status: 'active',
      project_id: req.body.project_id || null,
      task_description: req.body.task_description || ''
    }
  });
});

app.post('/api/me/timer/stop', (req, res) => {
  res.json({
    success: true,
    message: 'Timer stopped successfully', 
    data: {
      timer_id: 1,
      start_time: '2025-12-23T09:00:00Z',
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
      current_duration: '8h 30m',
      project_id: 1,
      task_description: 'Working on API development'
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
      break_time: 1,
      status: 'Completed',
      projects: [
        { name: 'API Development', hours: 6 },
        { name: 'Testing', hours: 2.5 }
      ]
    }
  });
});

app.get('/api/me/work-summary/weekly', (req, res) => {
  res.json({
    success: true,
    data: {
      week_start: '2025-12-23',
      week_end: '2025-12-29',
      total_hours: 40.5,
      days_worked: 5,
      average_daily_hours: 8.1,
      daily_breakdown: [
        { date: '2025-12-23', hours: 8.5 },
        { date: '2025-12-24', hours: 8.0 },
        { date: '2025-12-25', hours: 8.0 },
        { date: '2025-12-26', hours: 8.0 },
        { date: '2025-12-27', hours: 8.0 }
      ]
    }
  });
});

// Time Entries
app.get('/api/me/time-entries', (req, res) => {
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
          description: 'Working on time tracking APIs'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    }
  });
});

app.post('/api/me/time-entries', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Time entry created successfully',
    data: {
      entry: {
        id: Math.floor(Math.random() * 1000) + 1,
        ...req.body,
        created_at: new Date().toISOString()
      }
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
          is_read: false,
          priority: 'medium'
        },
        {
          id: 2,
          type: 'system',
          title: '🔔 System Notification',
          message: 'Your timesheet for this week is due',
          date: '2025-12-22', 
          is_read: false,
          priority: 'high'
        }
      ],
      unread_count: 2
    }
  });
});

// Corporate Updates
app.get('/api/updates', (req, res) => {
  res.json({
    success: true,
    data: {
      updates: [
        {
          id: 1,
          title: 'New Dental Plan Available',
          description: 'Comprehensive dental coverage now available for all employees',
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

app.post('/api/quick-actions/manual-time-entry', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Manual time entry submitted successfully',
    data: {
      entry_id: Math.floor(Math.random() * 1000) + 1,
      status: 'pending_approval',
      submitted_at: new Date().toISOString()
    }
  });
});

app.post('/api/quick-actions/time-correction', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Time correction request submitted successfully',
    data: {
      request_id: Math.floor(Math.random() * 1000) + 1,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'All APIs working on api-layer.vercel.app',
    domain: 'api-layer.vercel.app'
  });
});

// Leave Types API (for Figma screens)
app.get('/api/leave-types', (req, res) => {
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
      type: 'half_day',
      name: 'Half Day Leave',
      description: 'Half day off (morning or afternoon)',
      is_paid: true,
      max_days_per_year: 12,
      requires_approval: false,
      can_be_half_day: true,
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

// Get Leave Requests
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

// Dashboard API
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

// Basic Swagger documentation endpoint
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Documentation - api-layer.vercel.app</title>
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

// Swagger JSON specification - COMPLETE API DOCUMENTATION
app.get('/swagger.json', (req, res) => {
  const swaggerSpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "Complete Time Tracking API - All Figma APIs",
      "description": "Complete API for mobile time tracking app with all features: Dashboard, Timer, Work Status, Notifications, Updates, Quick Actions, Vacation/Leave Requests",
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
    "paths": {
      "/health": {
        "get": {
          "summary": "Health Check",
          "description": "Check API server health status",
          "responses": {
            "200": {
              "description": "Server is healthy",
              "content": {
                "application/json": {
                  "example": {
                    "status": "OK",
                    "timestamp": "2025-12-23T10:00:00Z",
                    "message": "All APIs working on api-layer.vercel.app",
                    "domain": "api-layer.vercel.app"
                  }
                }
              }
            }
          }
        }
      },
      "/test": {
        "get": {
          "summary": "Test Endpoint",
          "description": "Simple test endpoint to verify API connectivity",
          "responses": {
            "200": {
              "description": "Test successful",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "message": "Test endpoint working on correct domain!",
                    "domain": "api-layer.vercel.app"
                  }
                }
              }
            }
          }
        }
      },
      "/get-token": {
        "get": {
          "summary": "Get Test Token",
          "description": "Get a mock JWT token for testing authenticated endpoints",
          "responses": {
            "200": {
              "description": "Token generated successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      "user": {
                        "id": 1,
                        "tenantId": 1,
                        "email": "test@example.com",
                        "firstName": "Test",
                        "lastName": "User"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me": {
        "get": {
          "summary": "Get Current User Profile",
          "description": "Get current authenticated user's profile information",
          "responses": {
            "200": {
              "description": "User profile retrieved successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "id": 1,
                      "tenantId": 1,
                      "employeeNumber": "EMP001",
                      "firstName": "John",
                      "lastName": "Doe",
                      "email": "john.doe@company.com",
                      "tenantName": "Demo Company",
                      "department": "Engineering",
                      "position": "Software Developer",
                      "status": "active"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/profile": {
        "get": {
          "summary": "Get User Profile",
          "description": "Get user profile information (alias for /me)",
          "responses": {
            "200": {
              "description": "Profile retrieved successfully"
            }
          }
        }
      },
      "/dashboard": {
        "get": {
          "summary": "Get Dashboard Data",
          "description": "Get comprehensive dashboard data for time tracking overview (Figma Dashboard Screen)",
          "responses": {
            "200": {
              "description": "Dashboard data retrieved successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "weekly_hours": "40.5h",
                      "today_hours": "8.5h",
                      "current_status": "Working",
                      "last_check_in": "09:00 AM",
                      "this_week": {
                        "total_hours": 40.5,
                        "total_minutes": 2430,
                        "days_worked": 5,
                        "average_daily_hours": 8.1
                      },
                      "today": {
                        "clock_in": "09:00 AM",
                        "clock_out": null,
                        "break_time": "1h",
                        "active_hours": "7.5h",
                        "status": "Working"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me/dashboard": {
        "get": {
          "summary": "Get User Dashboard",
          "description": "Get personalized dashboard data for current user",
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
          "responses": {
            "200": {
              "description": "Dashboard summary retrieved successfully"
            }
          }
        }
      },
      "/me/timer/start": {
        "post": {
          "summary": "Start Timer",
          "description": "Start a new work timer (Figma Timer Start Screen)",
          "requestBody": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "project_id": {
                      "type": "integer",
                      "example": 1
                    },
                    "task_description": {
                      "type": "string",
                      "example": "Working on API development"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Timer started successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "message": "Timer started successfully",
                    "data": {
                      "timer_id": 123,
                      "start_time": "2025-12-23T09:00:00Z",
                      "status": "active",
                      "project_id": 1,
                      "task_description": "Working on API development"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me/timer/stop": {
        "post": {
          "summary": "Stop Timer",
          "description": "Stop the currently running timer (Figma Timer Stop Screen)",
          "responses": {
            "200": {
              "description": "Timer stopped successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "message": "Timer stopped successfully",
                    "data": {
                      "timer_id": 1,
                      "start_time": "2025-12-23T09:00:00Z",
                      "end_time": "2025-12-23T17:30:00Z",
                      "total_duration": "8h 30m",
                      "status": "completed"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me/timer/current": {
        "get": {
          "summary": "Get Current Timer Status",
          "description": "Get current timer status and duration",
          "responses": {
            "200": {
              "description": "Current timer status retrieved",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "is_active": true,
                      "timer_id": 1,
                      "start_time": "2025-12-23T09:00:00Z",
                      "current_duration": "8h 30m",
                      "project_id": 1,
                      "task_description": "Working on API development"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me/work-summary/today": {
        "get": {
          "summary": "Get Today's Work Summary",
          "description": "Get work summary for today (Figma Work Status Screen)",
          "responses": {
            "200": {
              "description": "Today's work summary retrieved",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "date": "2025-12-23",
                      "total_hours": 8.5,
                      "clock_in": "09:00 AM",
                      "clock_out": "05:30 PM",
                      "break_time": 1,
                      "status": "Completed",
                      "projects": [
                        { "name": "API Development", "hours": 6 },
                        { "name": "Testing", "hours": 2.5 }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me/work-summary/weekly": {
        "get": {
          "summary": "Get Weekly Work Summary",
          "description": "Get work summary for current week",
          "responses": {
            "200": {
              "description": "Weekly work summary retrieved",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "week_start": "2025-12-23",
                      "week_end": "2025-12-29",
                      "total_hours": 40.5,
                      "days_worked": 5,
                      "average_daily_hours": 8.1,
                      "daily_breakdown": [
                        { "date": "2025-12-23", "hours": 8.5 }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/me/time-entries": {
        "get": {
          "summary": "Get Time Entries",
          "description": "Get user's time entries with pagination",
          "responses": {
            "200": {
              "description": "Time entries retrieved successfully"
            }
          }
        },
        "post": {
          "summary": "Create Time Entry",
          "description": "Create a new time entry",
          "requestBody": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "date": { "type": "string", "format": "date", "example": "2025-12-23" },
                    "start_time": { "type": "string", "example": "09:00" },
                    "end_time": { "type": "string", "example": "17:30" },
                    "break_duration": { "type": "integer", "example": 60 },
                    "project_name": { "type": "string", "example": "API Development" },
                    "description": { "type": "string", "example": "Working on time tracking APIs" }
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
      "/notifications": {
        "get": {
          "summary": "Get Notifications",
          "description": "Get user notifications (Figma Notifications Screen)",
          "responses": {
            "200": {
              "description": "Notifications retrieved successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "notifications": [
                        {
                          "id": 1,
                          "type": "corporate_update",
                          "title": "📋 Corporate Updates",
                          "message": "New company policies updated",
                          "date": "2025-12-23",
                          "is_read": false,
                          "priority": "medium"
                        }
                      ],
                      "unread_count": 2
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/updates": {
        "get": {
          "summary": "Get Corporate Updates",
          "description": "Get corporate updates and announcements (Figma Updates Screen)",
          "responses": {
            "200": {
              "description": "Updates retrieved successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "updates": [
                        {
                          "id": 1,
                          "title": "New Dental Plan Available",
                          "description": "Comprehensive dental coverage now available for all employees",
                          "date": "2025-12-20",
                          "category": "benefits",
                          "is_important": true
                        }
                      ],
                      "total": 2
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/quick-actions": {
        "get": {
          "summary": "Get Quick Actions",
          "description": "Get available quick actions for user (Figma Quick Actions Menu)",
          "responses": {
            "200": {
              "description": "Quick actions retrieved successfully",
              "content": {
                "application/json": {
                  "example": {
                    "success": true,
                    "data": {
                      "actions": [
                        {
                          "id": "manual_time_entry",
                          "title": "Manual Time Entry",
                          "description": "Add time entry for missed clock-in/out",
                          "icon": "⏰",
                          "enabled": true
                        },
                        {
                          "id": "time_correction",
                          "title": "Time Correction",
                          "description": "Request correction for time entries",
                          "icon": "📝",
                          "enabled": true
                        },
                        {
                          "id": "leave_request",
                          "title": "Leave Request",
                          "description": "Apply for leave/vacation",
                          "icon": "🌴",
                          "enabled": true
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/quick-actions/manual-time-entry": {
        "post": {
          "summary": "Submit Manual Time Entry",
          "description": "Submit a manual time entry request (Figma Quick Actions)",
          "requestBody": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "date": { "type": "string", "format": "date" },
                    "start_time": { "type": "string" },
                    "end_time": { "type": "string" },
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
      },
      "/quick-actions/time-correction": {
        "post": {
          "summary": "Submit Time Correction Request",
          "description": "Submit a time correction request (Figma Quick Actions)",
          "responses": {
            "201": {
              "description": "Time correction request submitted successfully"
            }
          }
        }
      },
app.get('/swagger.json', (req, res) => {
  const swaggerSpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "Time Tracking API - Figma Implementation",
      "description": "Complete API for mobile time tracking app with vacation/leave request management",
      "version": "1.0.0",
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
    "paths": {
      "/health": {
        "get": {
          "summary": "Health Check",
          "description": "Check API server health status",
          "responses": {
            "200": {
              "description": "Server is healthy",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": { "type": "string", "example": "OK" },
                      "timestamp": { "type": "string", "format": "date-time" },
                      "message": { "type": "string", "example": "All APIs working on api-layer.vercel.app" },
                      "domain": { "type": "string", "example": "api-layer.vercel.app" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/leave-types": {
        "get": {
          "summary": "Get Leave Types",
          "description": "Get all available leave types for dropdown in new request form (Figma implementation)",
          "responses": {
            "200": {
              "description": "List of leave types",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "data": {
                        "type": "object",
                        "properties": {
                          "leave_types": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "type": { "type": "string", "example": "paid_leave" },
                                "name": { "type": "string", "example": "Paid Leave" },
                                "description": { "type": "string", "example": "Paid time off for vacation, personal time" },
                                "is_paid": { "type": "boolean", "example": true },
                                "max_days_per_year": { "type": "number", "example": 21 },
                                "requires_approval": { "type": "boolean", "example": true },
                                "can_be_half_day": { "type": "boolean", "example": false },
                                "color": { "type": "string", "example": "#4CAF50" },
                                "icon": { "type": "string", "example": "🌴" }
                              }
                            }
                          },
                          "default_type": { "type": "string", "example": "paid_leave" }
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
      "/me/leave-requests": {
        "get": {
          "summary": "Get Leave Requests",
          "description": "Get user's leave requests with filtering for Current/Past tabs (Figma implementation)",
          "parameters": [
            {
              "name": "period",
              "in": "query",
              "description": "Filter by time period (for Figma Current/Past tabs)",
              "schema": {
                "type": "string",
                "enum": ["current", "past"]
              }
            },
            {
              "name": "status",
              "in": "query", 
              "description": "Filter by request status",
              "schema": {
                "type": "string",
                "enum": ["pending", "approved", "rejected", "cancelled"]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of leave requests with Figma-matching format",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "data": {
                        "type": "object",
                        "properties": {
                          "requests": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "leave_request_id": { "type": "number", "example": 1 },
                                "title": { "type": "string", "example": "Family trip - Paid Leave" },
                                "leave_type": { "type": "string", "example": "paid_leave" },
                                "leave_type_name": { "type": "string", "example": "Paid Leave" },
                                "start_date": { "type": "string", "format": "date", "example": "2025-11-12" },
                                "end_date": { "type": "string", "format": "date", "example": "2025-11-14" },
                                "duration": { "type": "number", "example": 3 },
                                "reason": { "type": "string", "example": "Family trip 🌴" },
                                "status": { "type": "string", "example": "pending" },
                                "status_display": { "type": "string", "example": "Pending" },
                                "status_color": { "type": "string", "example": "#FFA500" },
                                "is_paid": { "type": "boolean", "example": true },
                                "is_half_day": { "type": "boolean", "example": false },
                                "date_display": { "type": "string", "example": "12-14 Nov 2025" }
                              }
                            }
                          },
                          "isEmpty": { "type": "boolean", "example": false },
                          "emptyStateMessage": { "type": "string", "example": "You haven't made any vacation requests yet." },
                          "emptyStateTitle": { "type": "string", "example": "No Current Requests" },
                          "totalCount": { "type": "number", "example": 1 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "post": {
          "summary": "Create Leave Request",
          "description": "Create new vacation request (Figma new request form implementation)",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["leave_type", "start_date", "end_date"],
                  "properties": {
                    "leave_type": {
                      "type": "string",
                      "enum": ["paid_leave", "sick_leave", "unpaid_leave", "half_day", "maternity_leave", "emergency_leave"],
                      "example": "paid_leave"
                    },
                    "start_date": {
                      "type": "string",
                      "format": "date",
                      "example": "2025-11-12"
                    },
                    "end_date": {
                      "type": "string", 
                      "format": "date",
                      "example": "2025-11-14"
                    },
                    "reason": {
                      "type": "string",
                      "example": "Family trip 🌴",
                      "maxLength": 500
                    },
                    "is_half_day": {
                      "type": "boolean",
                      "default": false,
                      "example": false
                    },
                    "half_day_period": {
                      "type": "string",
                      "enum": ["morning", "afternoon"],
                      "example": "morning"
                    }
                  }
                },
                "examples": {
                  "family_trip": {
                    "summary": "Family Trip Request",
                    "value": {
                      "leave_type": "paid_leave",
                      "start_date": "2025-11-12",
                      "end_date": "2025-11-14",
                      "reason": "Family trip 🌴",
                      "is_half_day": false
                    }
                  },
                  "half_day": {
                    "summary": "Half Day Request", 
                    "value": {
                      "leave_type": "half_day",
                      "start_date": "2025-12-15",
                      "end_date": "2025-12-15",
                      "reason": "Doctor appointment",
                      "is_half_day": true,
                      "half_day_period": "morning"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Vacation request created successfully (Figma success state: 'Vacation request sent ✅')",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "message": { "type": "string", "example": "Vacation request sent ✅" },
                      "data": {
                        "type": "object",
                        "properties": {
                          "request": {
                            "type": "object",
                            "properties": {
                              "leave_request_id": { "type": "number", "example": 105 },
                              "title": { "type": "string", "example": "paid leave - Family trip 🌴" },
                              "leave_type": { "type": "string", "example": "paid_leave" },
                              "status": { "type": "string", "example": "pending" },
                              "status_display": { "type": "string", "example": "Pending" },
                              "status_color": { "type": "string", "example": "#FFA500" }
                            }
                          },
                          "success_message": { "type": "string", "example": "Vacation request sent ✅" },
                          "success_title": { "type": "string", "example": "Request Submitted" }
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
      "/dashboard/summary": {
        "get": {
          "summary": "Dashboard Summary",
          "description": "Get dashboard data for time tracking overview",
          "responses": {
            "200": {
              "description": "Dashboard summary data",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true },
                      "data": {
                        "type": "object",
                        "properties": {
                          "weekly_hours": { "type": "string", "example": "40.5h" },
                          "today_hours": { "type": "string", "example": "8.5h" },
                          "current_status": { "type": "string", "example": "Working" },
                          "last_check_in": { "type": "string", "example": "09:00 AM" }
                        }
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
    "components": {
      "schemas": {
        "LeaveRequest": {
          "type": "object",
          "properties": {
            "leave_request_id": { "type": "number" },
            "title": { "type": "string" },
            "leave_type": { "type": "string" },
            "leave_type_name": { "type": "string" },
            "start_date": { "type": "string", "format": "date" },
            "end_date": { "type": "string", "format": "date" },
            "duration": { "type": "number" },
            "reason": { "type": "string" },
            "status": { "type": "string", "enum": ["pending", "approved", "rejected", "cancelled"] },
            "status_display": { "type": "string" },
            "status_color": { "type": "string" },
            "is_paid": { "type": "boolean" },
            "is_half_day": { "type": "boolean" },
            "date_display": { "type": "string" }
          }
        }
      }
    }
  };

  res.json(swaggerSpec);
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
    domain: 'api-layer.vercel.app'
  });
});

module.exports = app;