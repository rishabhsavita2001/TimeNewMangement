const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }
  
  // Mock user data
  req.user = {
    userId: 1,
    tenantId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@company.com'
  };
  
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Invite Employee API working on api-layer.vercel.app',
    domain: 'api-layer.vercel.app'
  });
});

// Login API
app.post('/api/auth/login', (req, res) => {
  const { email, password, tenantName } = req.body;
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  // Mock successful login
  const token = 'mock-jwt-token-' + Date.now();
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: 1,
        tenantId: 1,
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        tenantName: tenantName || 'Demo Company'
      },
      token: token,
      access_token: token
    }
  });
});

// ===== FIGMA INVITE EMPLOYEE APIS =====

// Get all roles (for dropdown)
app.get('/api/employees/roles', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      'Software Developer',
      'Senior Developer',
      'Team Lead',
      'Product Manager',
      'Designer',
      'QA Engineer',
      'DevOps Engineer',
      'Business Analyst',
      'HR Manager',
      'Marketing Manager'
    ]
  });
});

// Get all departments (for dropdown)
app.get('/api/employees/departments', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      'Engineering',
      'Product',
      'Design',
      'Marketing',
      'Sales',
      'HR',
      'Finance',
      'Operations',
      'Customer Success',
      'Legal'
    ]
  });
});

// Get working models (for dropdown)
app.get('/api/employees/working-models', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      'Remote',
      'Hybrid',
      'On-site',
      'Flexible'
    ]
  });
});

// Main invite employee API (matches Figma UI exactly)
app.post('/api/employees/invite', authenticateToken, (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      role,
      department,
      manager,
      workingHours,
      workingModel,
      startDate,
      profilePhoto
    } = req.body;

    // Validation for required fields (as per Figma UI)
    if (!firstName || !lastName || !email || !role || !department || !workingHours || !workingModel || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required_fields: ['firstName', 'lastName', 'email', 'role', 'department', 'workingHours', 'workingModel', 'startDate']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Generate employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;

    // Mock invitation creation
    const newEmployee = {
      id: employeeId,
      firstName,
      lastName,
      email,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      role,
      department,
      manager: manager || null,
      workingHours,
      workingModel,
      startDate,
      profilePhoto: profilePhoto || null,
      status: 'invited',
      invitedBy: req.user.firstName + ' ' + req.user.lastName,
      invitedAt: new Date().toISOString(),
      tenantId: req.user.tenantId
    };

    // In a real app, save to database and send email invitation
    console.log('🎨 New employee invitation created:', newEmployee);

    res.status(201).json({
      success: true,
      message: 'Employee invitation sent successfully',
      data: {
        employee: newEmployee,
        invitation_status: 'sent',
        email_sent: true
      }
    });

  } catch (error) {
    console.error('❌ Error creating employee invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all employees
app.get('/api/employees', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      employees: [
        { 
          id: 'EMP001', 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john@company.com', 
          role: 'Software Developer', 
          department: 'Engineering',
          workingModel: 'Remote',
          status: 'active'
        },
        { 
          id: 'EMP002', 
          firstName: 'Jane', 
          lastName: 'Smith', 
          email: 'jane@company.com', 
          role: 'Product Manager', 
          department: 'Product',
          workingModel: 'Hybrid',
          status: 'active'
        }
      ],
      pagination: { page: 1, limit: 10, total: 2 }
    }
  });
});

// Swagger docs
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🎨 Figma Invite Employee API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { font-weight: bold; color: #2196F3; }
        .url { background: #333; color: white; padding: 5px 10px; border-radius: 3px; font-family: monospace; }
      </style>
    </head>
    <body>
      <h1>🎨 Figma Invite Employee API Documentation</h1>
      <p><strong>Domain:</strong> api-layer.vercel.app</p>
      <p><strong>Status:</strong> ✅ All Figma UI fields supported!</p>
      
      <h2>📋 Available Endpoints:</h2>
      
      <div class="endpoint">
        <div class="method">POST</div>
        <div class="url">/api/auth/login</div>
        <p>Login to get authentication token</p>
      </div>
      
      <div class="endpoint">
        <div class="method">POST</div>
        <div class="url">/api/employees/invite</div>
        <p><strong>🎨 Main Figma UI Endpoint!</strong> Complete invite employee form with all 13 fields</p>
        <p><strong>Fields:</strong> firstName, lastName, email, phone, dateOfBirth, address, role, department, manager, workingHours, workingModel, startDate, profilePhoto</p>
      </div>
      
      <div class="endpoint">
        <div class="method">GET</div>
        <div class="url">/api/employees/roles</div>
        <p>Get roles for dropdown (Figma UI)</p>
      </div>
      
      <div class="endpoint">
        <div class="method">GET</div>
        <div class="url">/api/employees/departments</div>
        <p>Get departments for dropdown (Figma UI)</p>
      </div>
      
      <div class="endpoint">
        <div class="method">GET</div>
        <div class="url">/api/employees/working-models</div>
        <p>Get working models for dropdown (Figma UI)</p>
      </div>
      
      <div class="endpoint">
        <div class="method">GET</div>
        <div class="url">/api/employees</div>
        <p>Get all employees list</p>
      </div>
      
      <h2>🔑 Authentication</h2>
      <p>Use Bearer token in Authorization header: <code>Authorization: Bearer YOUR_TOKEN</code></p>
      
      <h2>🧪 Testing</h2>
      <ol>
        <li>POST /api/auth/login with email/password to get token</li>
        <li>Use token to access protected endpoints</li>
        <li>POST /api/employees/invite with Figma form data</li>
      </ol>
      
      <p><a href="/swagger.json">📄 View Swagger JSON</a></p>
    </body>
    </html>
  `);
});

// Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Figma Invite Employee API',
      version: '1.0.0',
      description: 'Complete API matching Figma UI for invite employee functionality'
    },
    servers: [
      {
        url: 'https://api-layer.vercel.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Health Check',
          description: 'Check if the API service is running and healthy',
          tags: ['System'],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      timestamp: { type: 'string', format: 'date-time' },
                      message: { type: 'string', example: 'Invite Employee API working on api-layer.vercel.app' },
                      domain: { type: 'string', example: 'api-layer.vercel.app' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'User Login',
          description: 'Authenticate user and get JWT token for accessing protected endpoints',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@company.com' },
                    password: { type: 'string', example: 'password123' },
                    tenantName: { type: 'string', example: 'Demo Company' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Login successful' },
                      data: {
                        type: 'object',
                        properties: {
                          user: {
                            type: 'object',
                            properties: {
                              id: { type: 'number', example: 1 },
                              tenantId: { type: 'number', example: 1 },
                              employeeNumber: { type: 'string', example: 'EMP001' },
                              firstName: { type: 'string', example: 'John' },
                              lastName: { type: 'string', example: 'Doe' },
                              email: { type: 'string', example: 'admin@company.com' },
                              tenantName: { type: 'string', example: 'Demo Company' }
                            }
                          },
                          token: { type: 'string', example: 'mock-jwt-token-1234567890' },
                          access_token: { type: 'string', example: 'mock-jwt-token-1234567890' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Invalid credentials' }
          }
        }
      },
      '/api/employees/roles': {
        get: {
          summary: 'Get Employee Roles',
          description: 'Get list of available job roles for the Figma UI dropdown',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of roles retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['Software Developer', 'Senior Developer', 'Team Lead', 'Product Manager', 'Designer', 'QA Engineer', 'DevOps Engineer', 'Business Analyst', 'HR Manager', 'Marketing Manager']
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' }
          }
        }
      },
      '/api/employees/departments': {
        get: {
          summary: 'Get Departments',
          description: 'Get list of available departments for the Figma UI dropdown',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of departments retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Success', 'Legal']
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' }
          }
        }
      },
      '/api/employees/working-models': {
        get: {
          summary: 'Get Working Models',
          description: 'Get list of available working models for the Figma UI dropdown',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': { 
              description: 'List of working models retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['Remote', 'Hybrid', 'On-site', 'Flexible']
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' }
          }
        }
      },
      '/api/employees': {
        get: {
          summary: 'Get All Employees',
          description: 'Get paginated list of all employees',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Employees retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          employees: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: 'EMP001' },
                                firstName: { type: 'string', example: 'John' },
                                lastName: { type: 'string', example: 'Doe' },
                                email: { type: 'string', example: 'john@company.com' },
                                role: { type: 'string', example: 'Software Developer' },
                                department: { type: 'string', example: 'Engineering' },
                                workingModel: { type: 'string', example: 'Remote' },
                                status: { type: 'string', example: 'active' }
                              }
                            }
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              page: { type: 'number', example: 1 },
                              limit: { type: 'number', example: 10 },
                              total: { type: 'number', example: 2 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' }
          }
        }
      },
      '/api/employees/invite': {
        post: {
          summary: 'Invite New Employee (Figma UI)',
          description: 'Create invitation for new employee using complete Figma UI form data. Supports all 13 form fields from the Figma design.',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'role', 'department', 'workingHours', 'workingModel', 'startDate'],
                  properties: {
                    firstName: { type: 'string', example: 'John', description: 'Employee first name' },
                    lastName: { type: 'string', example: 'Doe', description: 'Employee last name' },
                    email: { type: 'string', format: 'email', example: 'john.doe@company.com', description: 'Employee email address' },
                    phone: { type: 'string', example: '+1234567890', description: 'Employee phone number (optional)' },
                    dateOfBirth: { type: 'string', format: 'date', example: '1990-01-15', description: 'Employee date of birth (optional)' },
                    address: { type: 'string', example: '123 Main St, City, State', description: 'Employee address (optional)' },
                    role: { type: 'string', example: 'Software Developer', description: 'Employee job role' },
                    department: { type: 'string', example: 'Engineering', description: 'Employee department' },
                    manager: { type: 'string', example: 'Jane Smith', description: 'Employee manager name (optional)' },
                    workingHours: { type: 'string', example: '40 hours/week', description: 'Working hours per week' },
                    workingModel: { type: 'string', example: 'Remote', description: 'Working model' },
                    startDate: { type: 'string', format: 'date', example: '2024-01-15', description: 'Employee start date' },
                    profilePhoto: { type: 'string', example: 'data:image/jpeg;base64,...', description: 'Profile photo as base64 (optional)' }
                  }
                },
                examples: {
                  complete_form: {
                    summary: 'Complete Figma form data',
                    value: {
                      firstName: 'John',
                      lastName: 'Doe',
                      email: 'john.doe@company.com',
                      phone: '+1234567890',
                      dateOfBirth: '1990-01-15',
                      address: '123 Main St, City',
                      role: 'Software Developer',
                      department: 'Engineering',
                      manager: 'Jane Smith',
                      workingHours: '40 hours/week',
                      workingModel: 'Remote',
                      startDate: '2024-02-01'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Employee invitation sent successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Employee invitation sent successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          employee: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'EMP123456' },
                              firstName: { type: 'string', example: 'John' },
                              lastName: { type: 'string', example: 'Doe' },
                              email: { type: 'string', example: 'john.doe@company.com' },
                              role: { type: 'string', example: 'Software Developer' },
                              department: { type: 'string', example: 'Engineering' },
                              status: { type: 'string', example: 'invited' },
                              invitedBy: { type: 'string', example: 'John Doe' },
                              invitedAt: { type: 'string', format: 'date-time' },
                              tenantId: { type: 'number', example: 1 }
                            }
                          },
                          invitation_status: { type: 'string', example: 'sent' },
                          email_sent: { type: 'boolean', example: true }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Missing required fields or validation error' },
            '401': { description: 'Authentication required' },
            '500': { description: 'Internal server error' }
          }
        }
      }
    },
    tags: [
      {
        name: 'System',
        description: 'System health and monitoring endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and token management'
      },
      {
        name: 'Employee Management',
        description: 'Employee invitation and management endpoints for Figma UI - Complete CRUD operations'
      }
    ]
  });
});

// Error handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'API endpoint not found',
    domain: 'api-layer.vercel.app',
    available_endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/employees',
      '/api/employees/invite',
      '/api/employees/roles', 
      '/api/employees/departments',
      '/api/employees/working-models',
      '/api-docs',
      '/swagger.json'
    ]
  });
});

// Start server
if (require.main === module && process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🎨 Invite Employee APIs ready for Figma UI`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;