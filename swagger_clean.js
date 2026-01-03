// Clean Swagger JSON endpoint
app.get('/swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Figma Invite Employee API',
      version: '1.0.0',
      description: 'Complete API matching Figma UI for invite employee functionality'
    },
    servers: [{ url: 'https://api-layer.vercel.app' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer' }
      }
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Health Check',
          tags: ['System'],
          responses: { '200': { description: 'Service is healthy' } }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@company.com' },
                    password: { type: 'string', example: 'password123' },
                    tenantName: { type: 'string', example: 'Demo Company' }
                  }
                }
              }
            }
          },
          responses: { '200': { description: 'Login successful' } }
        }
      },
      '/api/employees': {
        get: {
          summary: 'Get All Employees',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'Employees retrieved successfully' } }
        }
      },
      '/api/employees/roles': {
        get: {
          summary: 'Get Employee Roles',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'List of roles' } }
        }
      },
      '/api/employees/departments': {
        get: {
          summary: 'Get Departments',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'List of departments' } }
        }
      },
      '/api/employees/working-models': {
        get: {
          summary: 'Get Working Models',
          tags: ['Employee Management'],
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'List of working models' } }
        }
      },
      '/api/employees/invite': {
        post: {
          summary: 'Invite New Employee (Figma UI)',
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
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'john.doe@company.com' },
                    phone: { type: 'string', example: '+1234567890' },
                    role: { type: 'string', example: 'Software Developer' },
                    department: { type: 'string', example: 'Engineering' },
                    workingHours: { type: 'string', example: '40 hours/week' },
                    workingModel: { type: 'string', example: 'Remote' },
                    startDate: { type: 'string', example: '2024-02-01' }
                  }
                }
              }
            }
          },
          responses: { '201': { description: 'Employee invitation sent successfully' } }
        }
      }
    },
    tags: [
      { name: 'System', description: 'System health endpoints' },
      { name: 'Authentication', description: 'User authentication' },
      { name: 'Employee Management', description: 'Employee invitation and management' }
    ]
  });
});