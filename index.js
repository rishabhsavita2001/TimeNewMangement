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
    message: 'SWAGGER UI FIXED - v2.0 - index.js serving',
    domain: 'api-layer.vercel.app',
    swagger_url: '/api-docs'
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
// Swagger UI Documentation - UPDATED v2.0
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Documentation - v2.0</title>
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

// Test endpoint to verify deployment
app.get('/test-swagger', (req, res) => {
  res.json({ message: 'Swagger deployment test v2.0', timestamp: new Date().toISOString() });
});

// Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'Figma Employee API', version: '1.0.0' },
    servers: [{ url: 'https://api-layer.vercel.app' }],
    components: { securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer' } } },
    paths: {
      '/api/health': { get: { summary: 'Health Check', tags: ['System'], responses: { '200': { description: 'OK' } } } },
      '/api/auth/login': { post: { summary: 'Login', tags: ['Auth'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': { description: 'Login successful' } } } },
      '/api/employees': { get: { summary: 'Get Employees', tags: ['Employees'], security: [{ BearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/api/employees/invite': { post: { summary: 'Invite Employee', tags: ['Employees'], security: [{ BearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' }, department: { type: 'string' }, workingModel: { type: 'string' } } } } } }, responses: { '201': { description: 'Invited' } } } },
      '/api/employees/roles': { get: { summary: 'Get Roles', tags: ['Employees'], security: [{ BearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/api/employees/departments': { get: { summary: 'Get Departments', tags: ['Employees'], security: [{ BearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/api/employees/working-models': { get: { summary: 'Get Working Models', tags: ['Employees'], security: [{ BearerAuth: [] }], responses: { '200': { description: 'Success' } } } }
    }
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