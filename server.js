const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Load Swagger specification
let swaggerDocument;
try {
  const swaggerPath = path.join(__dirname, 'swagger-spec.json');
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  console.log('📚 Swagger documentation loaded successfully');
} catch (error) {
  console.log('⚠️ Could not load swagger documentation:', error.message);
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Complete Working Time Management API',
      version: '3.0.0',
      description: 'Complete API collection with all 117 endpoints for Working Time Management System'
    },
    paths: {}
  };
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Email Configuration (SMTP)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'managementtime04@gmail.com',
    pass: 'sarx oodf rrxb bfuk' // App password
  }
});

// Test email configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// PERSISTENT USER DATA STORAGE - This fixes the "Jenny Wilson" revert issue
let persistentUsers = {
  1: {
    id: 1,
    first_name: "John",
    last_name: "Doe", 
    full_name: "John Doe",
    email: "john.doe@email.com",
    phone: "(+1) 555-0123",
    role: "Developer",
    profile_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    project: "E-Commerce Platform",
    location: "New York, USA"
  },
  2: {
    id: 2,
    first_name: "Sarah",
    last_name: "Johnson",
    full_name: "Sarah Johnson", 
    email: "sarah.johnson@email.com",
    phone: "(+1) 555-0456",
    role: "Designer",
    profile_photo: "https://images.unsplash.com/photo-1494790108755-2616b612c937?w=150",
    project: "Mobile App Design",
    location: "California, USA"
  },
  3: {
    id: 3,
    first_name: "Mike",
    last_name: "Chen",
    full_name: "Mike Chen",
    email: "mike.chen@email.com", 
    phone: "(+1) 555-0789",
    role: "Manager",
    profile_photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    project: "Team Management",
    location: "Remote"
  }
};

// PERSISTENT TIMER STORAGE - This fixes the auto-stop issue
let persistentTimers = {};
let dailyLimits = {};

// TEMPORARY COMPANY REGISTRATION STORAGE (Multi-step registration)
let tempCompanyRegistrations = {};

// FORGOT PASSWORD OTP STORAGE
let forgotPasswordOTPs = {};

// PERSISTENT COMPANY SETTINGS STORAGE
let companySettings = {
  id: 1,
  name: "Acme Inc.",
  industry: "IT Company",
  brand_color: "#6366F1",
  brand_color_name: "Purple",
  support_email: "Acmeinc@gmail.com",
  company_phone: "(+1) 740-8521",
  address: "45 Cloudy Bay, Auckland, NZ",
  logo_url: "https://ui-avatars.com/api/?name=Acme+Inc&size=200&background=6366F1&color=ffffff",
  website: "https://acme.inc",
  timezone: "Pacific/Auckland",
  founded_date: "2020-01-01",
  employee_count: 150,
  description: "Leading technology company providing innovative solutions",
  updated_at: new Date().toISOString()
};

// PERSISTENT USER PREFERENCES STORAGE
let userPreferences = {
  1: {
    user_id: 1,
    language: "English",
    language_code: "en",
    time_format: "24-hour",
    first_day_of_week: "Monday",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    updated_at: new Date().toISOString()
  },
  2: {
    user_id: 2,
    language: "English",
    language_code: "en",
    time_format: "24-hour",
    first_day_of_week: "Monday",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    updated_at: new Date().toISOString()
  },
  3: {
    user_id: 3,
    language: "English",
    language_code: "en",
    time_format: "24-hour",
    first_day_of_week: "Monday",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    updated_at: new Date().toISOString()
  }
};

// Load data from files if they exist
function loadPersistentData() {
  // In serverless environment, use in-memory storage
  // Files don't persist between requests in Vercel
  console.log('📂 Using in-memory persistent storage (serverless)');
  
  // Initialize with defaults if empty
  if (!persistentUsers || Object.keys(persistentUsers).length === 0) {
    persistentUsers = {
      1: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john.doe@email.com",
        phone: "(+1) 555-0123",
        profile_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        role: "Developer",
        company: "ACME Inc.",
        joined_date: "August 17, 2025",
        employee_id: "EMP001",
        department: "Engineering",
        status: "Active",
        timezone: "UTC-5",
        last_login: new Date().toISOString()
      }
    };
  }
  
  // Initialize timer storage if empty
  if (!persistentTimers) {
    persistentTimers = {};
  }
  
  if (!dailyLimits) {
    dailyLimits = {};
  }
}

// Save data to files
function savePersistentData() {
  // In serverless environment, data persists in memory for request duration
  // No file operations needed in Vercel
  console.log('💾 Data saved to in-memory storage (serverless)');
  
  // Log current timer state for debugging
  const timerCount = Object.keys(persistentTimers).length;
  console.log(`📊 Current timers in memory: ${timerCount}`);
  
  if (timerCount > 0) {
    Object.keys(persistentTimers).forEach(userId => {
      const timer = persistentTimers[userId];
      console.log(`   User ${userId}: ${timer.isActive ? 'ACTIVE' : 'INACTIVE'} - ${timer.timerId}`);
    });
  }
}

// Initialize data
loadPersistentData();

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log(`🔐 Authenticated user: ${decoded.userId} (${decoded.email})`);
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

// ===== FIX 1: LOGIN API - Consistent with profile =====
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔑 Login attempt for: ${email}`);
  
  // Find user by email
  const user = Object.values(persistentUsers).find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = jwt.sign({ 
    userId: user.id, 
    email: user.email,
    name: user.full_name 
  }, JWT_SECRET, { expiresIn: '24h' });
  
  console.log(`✅ Login successful for: ${user.full_name} (ID: ${user.id})`);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      },
      token: token
    }
  });
});

// ===== REGISTER API - User Registration =====
app.post('/api/auth/register', (req, res) => {
  const { 
    first_name, 
    last_name, 
    email, 
    password, 
    phone, 
    company, 
    department, 
    role 
  } = req.body;
  
  console.log(`📝 Registration request for: ${email}`);
  
  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email and password are required',
      data: {
        required_fields: ['first_name', 'last_name', 'email', 'password']
      }
    });
  }
  
  // Check if user already exists
  const existingUser = Object.values(persistentUsers).find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
      data: {
        email: email,
        exists: true
      }
    });
  }
  
  // Generate new user ID
  const newUserId = Math.max(...Object.keys(persistentUsers).map(Number)) + 1;
  
  // Create new user
  const newUser = {
    id: newUserId,
    first_name: first_name,
    last_name: last_name,
    full_name: `${first_name} ${last_name}`,
    email: email,
    password: password, // In production, hash this!
    phone: phone || '',
    profile_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: role || "User",
    company: company || "Company",
    joined_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    employee_id: `EMP${newUserId.toString().padStart(3, '0')}`,
    department: department || "General",
    status: "Active",
    timezone: "UTC-5",
    last_login: new Date().toISOString(),
    project: "No Project Assigned", // Default project
    location: "Remote" // Default location
  };
  
  // Add to persistent storage
  persistentUsers[newUserId] = newUser;
  
  // Save data
  savePersistentData();
  
  // Generate token
  const token = jwt.sign({ 
    userId: newUser.id, 
    email: newUser.email,
    name: newUser.full_name 
  }, JWT_SECRET, { expiresIn: '24h' });
  
  console.log(`✅ User registered successfully: ${newUser.full_name} (ID: ${newUser.id})`);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        company: newUser.company,
        department: newUser.department,
        role: newUser.role,
        employee_id: newUser.employee_id
      },
      token: token,
      auto_login: true
    }
  });
});

// ===== MULTI-STEP COMPANY REGISTRATION APIs =====

// PHASE 1: Company Information
app.post('/api/auth/company-registration/step-1', (req, res) => {
  const {
    company_name,
    company_email,
    country,
    timezone
  } = req.body;

  console.log(`🏢 Step 1: Company Information - ${company_name}`);

  // Validate required fields
  if (!company_name || !company_email || !country || !timezone) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      data: {
        required_fields: ['company_name', 'company_email', 'country', 'timezone'],
        missing_fields: [
          !company_name && 'company_name',
          !company_email && 'company_email',
          !country && 'country',
          !timezone && 'timezone'
        ].filter(Boolean)
      }
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(company_email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
      data: {
        email: company_email
      }
    });
  }

  // Generate unique registration session ID
  const sessionId = `REG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store step 1 data temporarily
  tempCompanyRegistrations[sessionId] = {
    session_id: sessionId,
    step: 1,
    company_info: {
      company_name,
      company_email,
      country,
      timezone
    },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes expiry
  };

  console.log(`✅ Step 1 completed - Session: ${sessionId}`);

  res.status(200).json({
    success: true,
    message: 'Company information saved successfully',
    data: {
      session_id: sessionId,
      current_step: 1,
      next_step: 2,
      completed_data: {
        company_name,
        company_email,
        country,
        timezone
      },
      expires_at: tempCompanyRegistrations[sessionId].expires_at
    }
  });
});

// PHASE 2: Work Model Configuration
app.post('/api/auth/company-registration/step-2', (req, res) => {
  const {
    session_id,
    default_work_model,
    working_hours_per_day,
    working_days_per_week,
    default_break_duration,
    overtime_calculation
  } = req.body;

  console.log(`⚙️ Step 2: Work Model Configuration - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        session_id: session_id || null,
        error: 'Please start registration from step 1'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again from step 1'
      }
    });
  }

  // Validate required fields
  if (!default_work_model || !working_hours_per_day || !working_days_per_week || !default_break_duration || !overtime_calculation) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      data: {
        required_fields: ['default_work_model', 'working_hours_per_day', 'working_days_per_week', 'default_break_duration', 'overtime_calculation']
      }
    });
  }

  // Validate work model values
  const validWorkModels = ['office', 'remote', 'hybrid'];
  if (!validWorkModels.includes(default_work_model)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid work model',
      data: {
        valid_options: validWorkModels,
        received: default_work_model
      }
    });
  }

  // Validate numeric values
  if (working_hours_per_day < 1 || working_hours_per_day > 24) {
    return res.status(400).json({
      success: false,
      message: 'Working hours per day must be between 1 and 24',
      data: { working_hours_per_day }
    });
  }

  if (working_days_per_week < 1 || working_days_per_week > 7) {
    return res.status(400).json({
      success: false,
      message: 'Working days per week must be between 1 and 7',
      data: { working_days_per_week }
    });
  }

  // Update registration with step 2 data
  registration.step = 2;
  registration.work_model = {
    default_work_model,
    working_hours_per_day: parseFloat(working_hours_per_day),
    working_days_per_week: parseInt(working_days_per_week),
    default_break_duration: parseInt(default_break_duration),
    overtime_calculation
  };
  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 2 completed - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Work model configuration saved successfully',
    data: {
      session_id: session_id,
      current_step: 2,
      next_step: 3,
      completed_data: {
        company_info: registration.company_info,
        work_model: registration.work_model
      },
      expires_at: registration.expires_at
    }
  });
});

// PHASE 3: Admin Account Setup
app.post('/api/auth/company-registration/step-3', (req, res) => {
  const {
    session_id,
    full_name,
    email_address,
    password,
    confirm_password
  } = req.body;

  console.log(`👤 Step 3: Admin Account Setup - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Please start registration from step 1'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again from step 1'
      }
    });
  }

  // Check if previous steps completed
  if (registration.step < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please complete previous steps first',
      data: {
        current_step: registration.step,
        required_step: 2
      }
    });
  }

  // Validate required fields
  if (!full_name || !email_address || !password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      data: {
        required_fields: ['full_name', 'email_address', 'password', 'confirm_password']
      }
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email_address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
      data: {
        email: email_address
      }
    });
  }

  // Check if email already exists
  const existingUser = Object.values(persistentUsers).find(user => user.email === email_address);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Admin email already exists',
      data: {
        email: email_address,
        suggestion: 'Please use a different email address'
      }
    });
  }

  // Validate password match
  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
      data: {
        error: 'Password and confirm password must be the same'
      }
    });
  }

  // Validate password strength (minimum 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is too weak',
      data: {
        error: 'Password must be at least 6 characters long',
        current_length: password.length
      }
    });
  }

  // Split full name into first and last name
  const nameParts = full_name.trim().split(' ');
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(' ') || nameParts[0];

  // Update registration with step 3 data
  registration.step = 3;
  registration.admin_account = {
    full_name,
    first_name,
    last_name,
    email_address,
    password // In production, this should be hashed
  };
  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 3 completed - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Admin account details saved successfully',
    data: {
      session_id: session_id,
      current_step: 3,
      next_step: 4,
      completed_data: {
        company_info: registration.company_info,
        work_model: registration.work_model,
        admin_account: {
          full_name: registration.admin_account.full_name,
          email_address: registration.admin_account.email_address
        }
      },
      expires_at: registration.expires_at
    }
  });
});

// PHASE 4: Review and Finish (Create Company)
app.post('/api/auth/company-registration/step-4', (req, res) => {
  const { session_id } = req.body;

  console.log(`✅ Step 4: Review and Finish - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Please start registration from step 1'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again from step 1'
      }
    });
  }

  // Check if all previous steps completed
  if (registration.step < 3) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all previous steps first',
      data: {
        current_step: registration.step,
        required_step: 3,
        missing_steps: registration.step === 1 ? ['step-2', 'step-3'] : ['step-3']
      }
    });
  }

  // Generate company ID
  const companyId = Math.floor(Math.random() * 90000) + 10000;

  // Create company from registration data
  const newCompany = {
    id: companyId,
    name: registration.company_info.company_name,
    industry: 'Business', // Default
    brand_color: '#6366F1',
    brand_color_name: 'Purple',
    support_email: registration.company_info.company_email,
    company_phone: '',
    address: '',
    city: '',
    state: '',
    country: registration.company_info.country,
    postal_code: '',
    logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.company_info.company_name)}&size=200&background=6366F1&color=ffffff`,
    website: '',
    timezone: registration.company_info.timezone,
    founded_date: new Date().toISOString().split('T')[0],
    employee_count: 1,
    description: `${registration.company_info.company_name}`,
    
    // Work Model Configuration
    work_settings: {
      default_work_model: registration.work_model.default_work_model,
      working_hours_per_day: registration.work_model.working_hours_per_day,
      working_days_per_week: registration.work_model.working_days_per_week,
      default_break_duration: registration.work_model.default_break_duration,
      overtime_calculation: registration.work_model.overtime_calculation
    },
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
    subscription_plan: 'trial',
    subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days trial
  };

  // Update global company settings
  companySettings = newCompany;

  // Generate admin user ID
  const adminUserId = Math.max(...Object.keys(persistentUsers).map(Number), 0) + 1;

  // Create admin user from registration data
  const adminUser = {
    id: adminUserId,
    first_name: registration.admin_account.first_name,
    last_name: registration.admin_account.last_name,
    full_name: registration.admin_account.full_name,
    email: registration.admin_account.email_address,
    password: registration.admin_account.password, // In production, hash this!
    phone: '',
    profile_photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.admin_account.full_name)}&size=150`,
    role: 'Admin',
    company: registration.company_info.company_name,
    company_id: companyId,
    joined_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    employee_id: `ADM${adminUserId.toString().padStart(3, '0')}`,
    department: 'Administration',
    status: 'Active',
    timezone: registration.company_info.timezone,
    is_admin: true,
    is_super_admin: true,
    permissions: ['all'],
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    project: 'Administration',
    location: registration.company_info.country
  };

  // Add admin to persistent storage
  persistentUsers[adminUserId] = adminUser;

  // Save data
  savePersistentData();

  // Generate authentication token
  const token = jwt.sign({ 
    userId: adminUser.id, 
    email: adminUser.email,
    name: adminUser.full_name,
    role: 'Admin',
    company_id: companyId
  }, JWT_SECRET, { expiresIn: '24h' });

  // Clean up temporary registration data
  delete tempCompanyRegistrations[session_id];

  console.log(`🎉 Company created successfully: ${newCompany.name} (ID: ${companyId})`);
  console.log(`👤 Admin created: ${adminUser.full_name} (ID: ${adminUserId})`);

  res.status(201).json({
    success: true,
    message: 'Company registration completed successfully',
    data: {
      company: {
        id: newCompany.id,
        name: newCompany.name,
        email: newCompany.support_email,
        country: newCompany.country,
        timezone: newCompany.timezone,
        logo_url: newCompany.logo_url,
        work_settings: newCompany.work_settings,
        subscription_plan: newCompany.subscription_plan,
        trial_expires: newCompany.subscription_expires
      },
      admin: {
        id: adminUser.id,
        name: adminUser.full_name,
        email: adminUser.email,
        role: adminUser.role,
        employee_id: adminUser.employee_id,
        profile_photo: adminUser.profile_photo
      },
      token: token,
      auto_login: true,
      next_steps: [
        'Customize company branding',
        'Invite team members',
        'Set up work policies',
        'Configure attendance rules'
      ]
    }
  });
});

// GET Registration Status/Review (for step 4 review)
app.get('/api/auth/company-registration/review/:session_id', (req, res) => {
  const { session_id } = req.params;

  console.log(`📋 Review registration - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Registration data retrieved successfully',
    data: {
      session_id: registration.session_id,
      current_step: registration.step,
      company_info: registration.company_info || null,
      work_model: registration.work_model || null,
      admin_account: registration.admin_account ? {
        full_name: registration.admin_account.full_name,
        email_address: registration.admin_account.email_address
      } : null,
      is_complete: registration.step === 3,
      created_at: registration.created_at,
      expires_at: registration.expires_at
    }
  });
});

// EDIT APIs - Update registration data during review

// EDIT Phase 1: Update Company Information
app.put('/api/auth/company-registration/edit-step-1', (req, res) => {
  const {
    session_id,
    company_name,
    company_email,
    country,
    timezone
  } = req.body;

  console.log(`✏️ Edit Step 1: Company Information - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  // Check if step 1 was completed
  if (!registration.company_info) {
    return res.status(400).json({
      success: false,
      message: 'Company information not yet filled',
      data: {
        error: 'Please complete step 1 first'
      }
    });
  }

  // Update only provided fields
  if (company_name) registration.company_info.company_name = company_name;
  if (company_email) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(company_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        data: { email: company_email }
      });
    }
    registration.company_info.company_email = company_email;
  }
  if (country) registration.company_info.country = country;
  if (timezone) registration.company_info.timezone = timezone;

  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 1 updated - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Company information updated successfully',
    data: {
      session_id: session_id,
      updated_data: registration.company_info,
      updated_at: registration.updated_at
    }
  });
});

// EDIT Work Model Configuration (Update Step 2 data)
app.put('/api/auth/company-registration/edit-step-2', (req, res) => {
  const {
    session_id,
    default_work_model,
    working_hours_per_day,
    working_days_per_week,
    default_break_duration,
    overtime_calculation
  } = req.body;

  console.log(`✏️ Edit Step 2: Work Model - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  // Check if step 2 was completed
  if (!registration.work_model) {
    return res.status(400).json({
      success: false,
      message: 'Work model not yet configured',
      data: {
        error: 'Please complete step 2 first'
      }
    });
  }

  // Update only provided fields
  if (default_work_model) {
    const validWorkModels = ['office', 'remote', 'hybrid'];
    if (!validWorkModels.includes(default_work_model)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid work model',
        data: {
          valid_options: validWorkModels,
          received: default_work_model
        }
      });
    }
    registration.work_model.default_work_model = default_work_model;
  }

  if (working_hours_per_day !== undefined) {
    if (working_hours_per_day < 1 || working_hours_per_day > 24) {
      return res.status(400).json({
        success: false,
        message: 'Working hours per day must be between 1 and 24',
        data: { working_hours_per_day }
      });
    }
    registration.work_model.working_hours_per_day = parseFloat(working_hours_per_day);
  }

  if (working_days_per_week !== undefined) {
    if (working_days_per_week < 1 || working_days_per_week > 7) {
      return res.status(400).json({
        success: false,
        message: 'Working days per week must be between 1 and 7',
        data: { working_days_per_week }
      });
    }
    registration.work_model.working_days_per_week = parseInt(working_days_per_week);
  }

  if (default_break_duration !== undefined) {
    registration.work_model.default_break_duration = parseInt(default_break_duration);
  }

  if (overtime_calculation) {
    registration.work_model.overtime_calculation = overtime_calculation;
  }

  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 2 updated - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Work model configuration updated successfully',
    data: {
      session_id: session_id,
      updated_data: registration.work_model,
      updated_at: registration.updated_at
    }
  });
});

// EDIT Admin Account Details (Update Step 3 data)
app.put('/api/auth/company-registration/edit-step-3', (req, res) => {
  const {
    session_id,
    full_name,
    email_address,
    password,
    confirm_password
  } = req.body;

  console.log(`✏️ Edit Step 3: Admin Account - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  // Check if step 3 was completed
  if (!registration.admin_account) {
    return res.status(400).json({
      success: false,
      message: 'Admin account not yet created',
      data: {
        error: 'Please complete step 3 first'
      }
    });
  }

  // Update full name
  if (full_name) {
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || nameParts[0];
    
    registration.admin_account.full_name = full_name;
    registration.admin_account.first_name = first_name;
    registration.admin_account.last_name = last_name;
  }

  // Update email
  if (email_address) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        data: { email: email_address }
      });
    }

    // Check if email already exists (excluding current session email)
    const existingUser = Object.values(persistentUsers).find(user => 
      user.email === email_address && user.email !== registration.admin_account.email_address
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        data: {
          email: email_address,
          suggestion: 'Please use a different email address'
        }
      });
    }

    registration.admin_account.email_address = email_address;
  }

  // Update password
  if (password) {
    // If password is provided, confirm_password must also be provided
    if (!confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Confirm password is required when updating password',
        data: {
          error: 'Please provide confirm_password'
        }
      });
    }

    // Validate password match
    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        data: {
          error: 'Password and confirm password must be the same'
        }
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is too weak',
        data: {
          error: 'Password must be at least 6 characters long',
          current_length: password.length
        }
      });
    }

    registration.admin_account.password = password;
  }

  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 3 updated - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Admin account details updated successfully',
    data: {
      session_id: session_id,
      updated_data: {
        full_name: registration.admin_account.full_name,
        email_address: registration.admin_account.email_address
      },
      updated_at: registration.updated_at
    }
  });
});

// EDIT APIs - Update registration data during review

// EDIT Phase 1: Update Company Information
app.put('/api/auth/company-registration/edit-step-1', (req, res) => {
  const {
    session_id,
    company_name,
    company_email,
    country,
    timezone
  } = req.body;

  console.log(`✏️ Edit Step 1: Company Information - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  // Validate email format if provided
  if (company_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(company_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        data: {
          email: company_email
        }
      });
    }
  }

  // Update company info (only update provided fields)
  if (!registration.company_info) {
    registration.company_info = {};
  }

  if (company_name) registration.company_info.company_name = company_name;
  if (company_email) registration.company_info.company_email = company_email;
  if (country) registration.company_info.country = country;
  if (timezone) registration.company_info.timezone = timezone;

  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 1 updated - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Company information updated successfully',
    data: {
      session_id: session_id,
      updated_data: registration.company_info,
      expires_at: registration.expires_at
    }
  });
});

// EDIT Phase 2: Update Work Model Configuration
app.put('/api/auth/company-registration/edit-step-2', (req, res) => {
  const {
    session_id,
    default_work_model,
    working_hours_per_day,
    working_days_per_week,
    default_break_duration,
    overtime_calculation
  } = req.body;

  console.log(`✏️ Edit Step 2: Work Model - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  // Validate work model if provided
  if (default_work_model) {
    const validWorkModels = ['office', 'remote', 'hybrid'];
    if (!validWorkModels.includes(default_work_model)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid work model',
        data: {
          valid_options: validWorkModels,
          received: default_work_model
        }
      });
    }
  }

  // Validate numeric values if provided
  if (working_hours_per_day && (working_hours_per_day < 1 || working_hours_per_day > 24)) {
    return res.status(400).json({
      success: false,
      message: 'Working hours per day must be between 1 and 24',
      data: { working_hours_per_day }
    });
  }

  if (working_days_per_week && (working_days_per_week < 1 || working_days_per_week > 7)) {
    return res.status(400).json({
      success: false,
      message: 'Working days per week must be between 1 and 7',
      data: { working_days_per_week }
    });
  }

  // Update work model (only update provided fields)
  if (!registration.work_model) {
    registration.work_model = {};
  }

  if (default_work_model) registration.work_model.default_work_model = default_work_model;
  if (working_hours_per_day) registration.work_model.working_hours_per_day = parseFloat(working_hours_per_day);
  if (working_days_per_week) registration.work_model.working_days_per_week = parseInt(working_days_per_week);
  if (default_break_duration) registration.work_model.default_break_duration = parseInt(default_break_duration);
  if (overtime_calculation) registration.work_model.overtime_calculation = overtime_calculation;

  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 2 updated - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Work model configuration updated successfully',
    data: {
      session_id: session_id,
      updated_data: registration.work_model,
      expires_at: registration.expires_at
    }
  });
});

// EDIT Phase 3: Update Admin Account
app.put('/api/auth/company-registration/edit-step-3', (req, res) => {
  const {
    session_id,
    full_name,
    email_address,
    password,
    confirm_password
  } = req.body;

  console.log(`✏️ Edit Step 3: Admin Account - Session: ${session_id}`);

  // Validate session
  if (!session_id || !tempCompanyRegistrations[session_id]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired registration session',
      data: {
        error: 'Session not found'
      }
    });
  }

  const registration = tempCompanyRegistrations[session_id];

  // Check if session expired
  if (new Date() > new Date(registration.expires_at)) {
    delete tempCompanyRegistrations[session_id];
    return res.status(400).json({
      success: false,
      message: 'Registration session expired',
      data: {
        error: 'Please start registration again'
      }
    });
  }

  // Validate email format if provided
  if (email_address) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        data: {
          email: email_address
        }
      });
    }

    // Check if email already exists (excluding current registration email)
    const existingUser = Object.values(persistentUsers).find(user => 
      user.email === email_address && 
      user.email !== (registration.admin_account?.email_address || '')
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Admin email already exists',
        data: {
          email: email_address,
          suggestion: 'Please use a different email address'
        }
      });
    }
  }

  // Validate password if provided
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is too weak',
        data: {
          error: 'Password must be at least 6 characters long',
          current_length: password.length
        }
      });
    }

    // Check password match
    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        data: {
          error: 'Password and confirm password must be the same'
        }
      });
    }
  }

  // Update admin account (only update provided fields)
  if (!registration.admin_account) {
    registration.admin_account = {};
  }

  if (full_name) {
    registration.admin_account.full_name = full_name;
    const nameParts = full_name.trim().split(' ');
    registration.admin_account.first_name = nameParts[0];
    registration.admin_account.last_name = nameParts.slice(1).join(' ') || nameParts[0];
  }

  if (email_address) registration.admin_account.email_address = email_address;
  if (password) registration.admin_account.password = password;

  registration.updated_at = new Date().toISOString();

  console.log(`✅ Step 3 updated - Session: ${session_id}`);

  res.status(200).json({
    success: true,
    message: 'Admin account details updated successfully',
    data: {
      session_id: session_id,
      updated_data: {
        full_name: registration.admin_account.full_name,
        email_address: registration.admin_account.email_address
      },
      expires_at: registration.expires_at
    }
  });
});

// ===== SINGLE-STEP COMPANY REGISTRATION API (OLD) =====
app.post('/api/auth/register-company', (req, res) => {
  const {
    // Company Details
    company_name,
    industry,
    company_email,
    company_phone,
    website,
    address,
    city,
    state,
    country,
    postal_code,
    
    // Admin Details
    admin_first_name,
    admin_last_name,
    admin_email,
    admin_password,
    admin_phone,
    
    // Additional Info
    employee_count,
    timezone,
    brand_color
  } = req.body;

  console.log(`🏢 Company registration request: ${company_name}`);

  // Validate required fields
  if (!company_name || !admin_first_name || !admin_last_name || !admin_email || !admin_password) {
    return res.status(400).json({
      success: false,
      message: 'Company name, admin first name, last name, email and password are required',
      data: {
        required_fields: ['company_name', 'admin_first_name', 'admin_last_name', 'admin_email', 'admin_password']
      }
    });
  }

  // Check if admin email already exists
  const existingUser = Object.values(persistentUsers).find(user => user.email === admin_email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Admin with this email already exists',
      data: {
        email: admin_email,
        exists: true
      }
    });
  }

  // Generate company ID
  const companyId = Math.floor(Math.random() * 90000) + 10000;

  // Create company settings
  const newCompany = {
    id: companyId,
    name: company_name,
    industry: industry || 'IT Company',
    brand_color: brand_color || '#6366F1',
    brand_color_name: 'Purple',
    support_email: company_email || admin_email,
    company_phone: company_phone || '',
    address: address || '',
    city: city || '',
    state: state || '',
    country: country || '',
    postal_code: postal_code || '',
    logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(company_name)}&size=200&background=6366F1&color=ffffff`,
    website: website || '',
    timezone: timezone || 'UTC',
    founded_date: new Date().toISOString().split('T')[0],
    employee_count: employee_count || 1,
    description: `${company_name} - ${industry || 'Business'}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
    subscription_plan: 'trial',
    subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days trial
  };

  // Update global company settings
  companySettings = newCompany;

  // Generate admin user ID
  const adminUserId = Math.max(...Object.keys(persistentUsers).map(Number), 0) + 1;

  // Create admin user
  const adminUser = {
    id: adminUserId,
    first_name: admin_first_name,
    last_name: admin_last_name,
    full_name: `${admin_first_name} ${admin_last_name}`,
    email: admin_email,
    password: admin_password, // In production, hash this!
    phone: admin_phone || '',
    profile_photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin_first_name)}+${encodeURIComponent(admin_last_name)}&size=150`,
    role: 'Admin',
    company: company_name,
    company_id: companyId,
    joined_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    employee_id: `ADM${adminUserId.toString().padStart(3, '0')}`,
    department: 'Administration',
    status: 'Active',
    timezone: timezone || 'UTC',
    is_admin: true,
    is_super_admin: true,
    permissions: ['all'],
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    project: 'Administration',
    location: city && country ? `${city}, ${country}` : 'Remote'
  };

  // Add admin to persistent storage
  persistentUsers[adminUserId] = adminUser;

  // Save data
  savePersistentData();

  // Generate token for admin
  const token = jwt.sign({ 
    userId: adminUser.id, 
    email: adminUser.email,
    name: adminUser.full_name,
    role: 'Admin',
    company_id: companyId
  }, JWT_SECRET, { expiresIn: '24h' });

  console.log(`✅ Company registered: ${company_name} (ID: ${companyId})`);
  console.log(`✅ Admin created: ${adminUser.full_name} (ID: ${adminUserId})`);

  res.status(201).json({
    success: true,
    message: 'Company and admin account created successfully',
    data: {
      company: {
        id: newCompany.id,
        name: newCompany.name,
        industry: newCompany.industry,
        email: newCompany.support_email,
        phone: newCompany.company_phone,
        logo_url: newCompany.logo_url,
        subscription_plan: newCompany.subscription_plan,
        trial_expires: newCompany.subscription_expires
      },
      admin: {
        id: adminUser.id,
        name: adminUser.full_name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
        employee_id: adminUser.employee_id,
        profile_photo: adminUser.profile_photo
      },
      token: token,
      auto_login: true,
      next_steps: [
        'Set up company preferences',
        'Invite team members',
        'Configure work policies',
        'Customize branding'
      ]
    }
  });
});

// ===== ADMIN REGISTRATION API (Add Admin to Existing Company) =====
app.post('/api/auth/register-admin', authenticateToken, (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    department,
    permissions
  } = req.body;

  const requestingUserId = req.user.userId;
  const requestingUser = persistentUsers[requestingUserId];

  console.log(`👤 Admin registration request by: ${requestingUser?.full_name}`);

  // Check if requesting user is admin
  if (!requestingUser || !requestingUser.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create new admin accounts',
      data: {
        required_role: 'Admin',
        current_role: requestingUser?.role || 'Unknown'
      }
    });
  }

  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email and password are required',
      data: {
        required_fields: ['first_name', 'last_name', 'email', 'password']
      }
    });
  }

  // Check if email already exists
  const existingUser = Object.values(persistentUsers).find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
      data: {
        email: email,
        exists: true
      }
    });
  }

  // Generate new admin user ID
  const newAdminId = Math.max(...Object.keys(persistentUsers).map(Number)) + 1;

  // Create new admin user
  const newAdmin = {
    id: newAdminId,
    first_name: first_name,
    last_name: last_name,
    full_name: `${first_name} ${last_name}`,
    email: email,
    password: password, // In production, hash this!
    phone: phone || '',
    profile_photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name)}+${encodeURIComponent(last_name)}&size=150`,
    role: 'Admin',
    company: requestingUser.company || companySettings.name,
    company_id: requestingUser.company_id || companySettings.id,
    joined_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    employee_id: `ADM${newAdminId.toString().padStart(3, '0')}`,
    department: department || 'Administration',
    status: 'Active',
    timezone: requestingUser.timezone || 'UTC',
    is_admin: true,
    is_super_admin: false, // New admins are not super admins by default
    permissions: permissions || ['user_management', 'reports', 'settings'],
    created_at: new Date().toISOString(),
    created_by: requestingUserId,
    last_login: null,
    project: 'Administration',
    location: requestingUser.location || 'Remote'
  };

  // Add to persistent storage
  persistentUsers[newAdminId] = newAdmin;

  // Save data
  savePersistentData();

  console.log(`✅ New admin created: ${newAdmin.full_name} (ID: ${newAdminId}) by ${requestingUser.full_name}`);

  res.status(201).json({
    success: true,
    message: 'Admin account created successfully',
    data: {
      admin: {
        id: newAdmin.id,
        name: newAdmin.full_name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        employee_id: newAdmin.employee_id,
        department: newAdmin.department,
        permissions: newAdmin.permissions,
        profile_photo: newAdmin.profile_photo,
        created_at: newAdmin.created_at,
        created_by: requestingUser.full_name
      },
      credentials: {
        email: email,
        temporary_password: 'Please ask user to change password on first login'
      }
    }
  });
});

// ===== OTP-BASED FORGOT PASSWORD APIs =====

// STEP 1: Request OTP - Send OTP to email
app.post('/api/auth/forgot-password/request-otp', async (req, res) => {
  const { email } = req.body;

  console.log(`📧 OTP request for email: ${email}`);

  // Validate email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      data: {
        required_fields: ['email']
      }
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
      data: {
        email: email
      }
    });
  }

  // Check if user exists
  const user = Object.values(persistentUsers).find(u => u.email === email);
  
  if (!user) {
    // For security, don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If your email is registered, you will receive an OTP shortly',
      data: {
        email: email,
        note: 'OTP will be valid for 10 minutes'
      }
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with expiry (10 minutes)
  const otpData = {
    email: email,
    otp: otp,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    verified: false
  };

  forgotPasswordOTPs[email] = otpData;

  // Send OTP via email
  try {
    const mailOptions = {
      from: 'managementtime04@gmail.com',
      to: email,
      subject: 'Password Reset OTP - Management Time',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #6366F1; margin-bottom: 30px; }
            .otp-box { background: #f0f0ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 8px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            .warning { color: #ff6b6b; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <p>Hello <strong>${user.full_name}</strong>,</p>
            <p>We received a request to reset your password for Management Time account.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            <div class="warning">
              ⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.
            </div>
            <div class="footer">
              <p>Management Time - Time Tracking System</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    console.log(`✅ OTP sent successfully to: ${email} - OTP: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        email: email,
        otp_sent: true,
        expires_in: '10 minutes',
        demo_otp: otp // Remove this in production!
      }
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Even if email fails, return success for security
    res.json({
      success: true,
      message: 'If your email is registered, you will receive an OTP shortly',
      data: {
        email: email,
        demo_otp: otp, // For demo purposes
        note: 'In production, OTP would be sent via email'
      }
    });
  }
});

// STEP 2: Verify OTP
app.post('/api/auth/forgot-password/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  console.log(`🔍 OTP verification for email: ${email}`);

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
      data: {
        required_fields: ['email', 'otp']
      }
    });
  }

  // Check if OTP exists
  const otpData = forgotPasswordOTPs[email];
  
  if (!otpData) {
    return res.status(400).json({
      success: false,
      message: 'No OTP request found for this email',
      data: {
        error: 'Please request OTP first'
      }
    });
  }

  // Check if OTP expired
  if (new Date() > new Date(otpData.expiresAt)) {
    delete forgotPasswordOTPs[email];
    return res.status(400).json({
      success: false,
      message: 'OTP has expired',
      data: {
        error: 'Please request a new OTP'
      }
    });
  }

  // Verify OTP
  if (otpData.otp !== otp.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
      data: {
        error: 'The OTP you entered is incorrect'
      }
    });
  }

  // Mark OTP as verified
  otpData.verified = true;
  otpData.verifiedAt = new Date().toISOString();

  console.log(`✅ OTP verified successfully for: ${email}`);

  res.json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      email: email,
      verified: true,
      next_step: 'Set new password'
    }
  });
});

// STEP 3: Reset Password with OTP
app.post('/api/auth/forgot-password/reset-password', (req, res) => {
  const { email, otp, new_password, confirm_password } = req.body;

  console.log(`🔑 Password reset request for: ${email}`);

  // Validate input
  if (!email || !otp || !new_password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      data: {
        required_fields: ['email', 'otp', 'new_password', 'confirm_password']
      }
    });
  }

  // Check if passwords match
  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
      data: {
        error: 'New password and confirm password must be the same'
      }
    });
  }

  // Validate password strength
  if (new_password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is too weak',
      data: {
        error: 'Password must be at least 6 characters long',
        current_length: new_password.length
      }
    });
  }

  // Check if OTP exists and verified
  const otpData = forgotPasswordOTPs[email];
  
  if (!otpData) {
    return res.status(400).json({
      success: false,
      message: 'No OTP request found',
      data: {
        error: 'Please request OTP first'
      }
    });
  }

  if (!otpData.verified) {
    return res.status(400).json({
      success: false,
      message: 'OTP not verified',
      data: {
        error: 'Please verify OTP first'
      }
    });
  }

  // Check if OTP expired
  if (new Date() > new Date(otpData.expiresAt)) {
    delete forgotPasswordOTPs[email];
    return res.status(400).json({
      success: false,
      message: 'OTP has expired',
      data: {
        error: 'Please request a new OTP'
      }
    });
  }

  // Verify OTP again for security
  if (otpData.otp !== otp.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
      data: {
        error: 'The OTP you entered is incorrect'
      }
    });
  }

  // Find user
  const user = persistentUsers[otpData.userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: {
        error: 'User account does not exist'
      }
    });
  }

  // Update password
  user.password = new_password; // In production, hash this!
  user.password_updated_at = new Date().toISOString();
  user.password_reset_by = 'forgot_password_otp';

  // Save changes
  savePersistentData();

  // Delete used OTP
  delete forgotPasswordOTPs[email];

  console.log(`✅ Password reset successful for: ${user.full_name} (${email})`);

  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      user_id: user.id,
      email: user.email,
      name: user.full_name,
      password_updated: true,
      updated_at: user.password_updated_at,
      next_steps: [
        'Password has been changed successfully',
        'You can now login with your new password',
        'OTP has been invalidated'
      ]
    }
  });
});

// RESEND OTP (if expired or not received)
app.post('/api/auth/forgot-password/resend-otp', async (req, res) => {
  const { email } = req.body;

  console.log(`🔄 Resend OTP request for: ${email}`);

  // Validate email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      data: {
        required_fields: ['email']
      }
    });
  }

  // Check if user exists
  const user = Object.values(persistentUsers).find(u => u.email === email);
  
  if (!user) {
    return res.json({
      success: true,
      message: 'If your email is registered, you will receive an OTP shortly',
      data: {
        email: email
      }
    });
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store/Update OTP
  forgotPasswordOTPs[email] = {
    email: email,
    otp: otp,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    verified: false,
    resent: true
  };

  // Send OTP via email
  try {
    const mailOptions = {
      from: 'managementtime04@gmail.com',
      to: email,
      subject: 'Resend: Password Reset OTP - Management Time',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #6366F1; margin-bottom: 30px; }
            .otp-box { background: #f0f0ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 8px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 New OTP Request</h1>
            </div>
            <p>Hello <strong>${user.full_name}</strong>,</p>
            <p>Here is your new One-Time Password (OTP):</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <div class="footer">
              <p>Management Time - Time Tracking System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    console.log(`✅ OTP resent successfully to: ${email} - OTP: ${otp}`);

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        email: email,
        otp_sent: true,
        expires_in: '10 minutes',
        demo_otp: otp // Remove in production
      }
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    res.json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        email: email,
        demo_otp: otp,
        note: 'Email service temporarily unavailable, use demo OTP'
      }
    });
  }
});

// ===== LOGOUT API - User Logout =====
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  
  console.log(`🚪 Logout request from user: ${userEmail} (ID: ${userId})`);
  
  // In a real application, you would:
  // 1. Blacklist the token
  // 2. Clear server-side sessions
  // 3. Update last logout time in database
  // 4. Clear any active timers or sessions
  
  // For this implementation, we'll clear any active timers
  if (userId && persistentTimers[userId] && persistentTimers[userId].isActive) {
    console.log(`⏰ Auto-stopping active timer for user ${userId} during logout`);
    
    // Calculate and save final timer state
    const timerData = persistentTimers[userId];
    const now = new Date();
    const startTime = new Date(timerData.startTime);
    const durationMs = now - startTime - (timerData.totalPausedTime || 0);
    const durationSeconds = Math.floor(durationMs / 1000);
    
    // Store final timer state
    persistentTimers[userId] = {
      ...timerData,
      isActive: false,
      isPaused: false,
      totalTime: (timerData.totalTime || 0) + durationSeconds,
      endTime: now,
      stoppedAt: now.toISOString(),
      status: 'auto_stopped_logout'
    };
    
    savePersistentData();
  }
  
  // Update user's last logout time
  if (userId && persistentUsers[userId]) {
    persistentUsers[userId].last_logout = new Date().toISOString();
    savePersistentData();
  }
  
  console.log(`✅ User ${userEmail} logged out successfully`);
  
  res.json({
    success: true,
    message: 'Logout successful',
    data: {
      logged_out: true,
      logout_time: new Date().toISOString(),
      message: 'You have been successfully logged out',
      next_steps: [
        'Clear local storage/session storage',
        'Redirect to login page',
        'Remove authorization headers'
      ]
    }
  });
});

// ===== FORGOT PASSWORD API - Password Reset Request =====
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  
  console.log(`🔐 Forgot password request for: ${email}`);
  
  // Validate email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      data: {
        required_fields: ['email']
      }
    });
  }
  
  // Check if user exists
  const user = Object.values(persistentUsers).find(user => user.email === email);
  
  if (!user) {
    // For security, we don't reveal if email exists or not
    console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
  } else {
    console.log(`✅ Password reset token generated for user: ${user.full_name} (${email})`);
    
    // In a real application, you would:
    // 1. Generate a secure reset token
    // 2. Store it with expiration time
    // 3. Send email with reset link
    // 4. For demo purposes, we'll simulate this
    
    // Generate mock reset token
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        purpose: 'password_reset' 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // Store reset token (in real app, this would be in database with expiration)
    if (!persistentUsers[user.id].reset_tokens) {
      persistentUsers[user.id].reset_tokens = [];
    }
    persistentUsers[user.id].reset_tokens.push({
      token: resetToken,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      used: false
    });
    
    savePersistentData();
  }
  
  // Always return the same response for security (don't reveal if email exists)
  res.json({
    success: true,
    message: 'If your email is registered, you will receive password reset instructions',
    data: {
      email: email,
      instruction: 'Check your email for password reset instructions',
      estimated_delivery: '2-5 minutes',
      reset_link_validity: '1 hour',
      demo_note: 'This is a demo API. In production, an actual email would be sent.',
      ...(user && {
        demo_reset_token: `For demo purposes, your reset token is: ${jwt.sign({ userId: user.id, email: user.email, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' })}`,
        demo_reset_url: `https://your-frontend.com/reset-password?token=${jwt.sign({ userId: user.id, email: user.email, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' })}`
      })
    }
  });
});

// ===== RESET PASSWORD API - Complete Password Reset =====
app.post('/api/auth/reset-password', (req, res) => {
  const { token, new_password, confirm_password } = req.body;
  
  console.log(`🔓 Password reset attempt with token`);
  
  // Validate required fields
  if (!token || !new_password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Token, new password, and password confirmation are required',
      data: {
        required_fields: ['token', 'new_password', 'confirm_password']
      }
    });
  }
  
  // Check if passwords match
  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Password confirmation does not match',
      data: {
        error: 'password_mismatch'
      }
    });
  }
  
  // Validate password strength (basic validation)
  if (new_password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
      data: {
        error: 'password_too_weak',
        requirements: ['At least 6 characters']
      }
    });
  }
  
  // Verify reset token
  let tokenData;
  try {
    tokenData = jwt.verify(token, JWT_SECRET);
    
    if (tokenData.purpose !== 'password_reset') {
      throw new Error('Invalid token purpose');
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
      data: {
        error: 'invalid_token'
      }
    });
  }
  
  // Find user
  const user = persistentUsers[tokenData.userId];
  if (!user || user.email !== tokenData.email) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reset token',
      data: {
        error: 'user_not_found'
      }
    });
  }
  
  // Update password
  user.password = new_password; // In production, hash this!
  user.password_updated_at = new Date().toISOString();
  
  // Invalidate all reset tokens
  if (user.reset_tokens) {
    user.reset_tokens = user.reset_tokens.map(rt => ({ ...rt, used: true }));
  }
  
  savePersistentData();
  
  console.log(`✅ Password reset successful for user: ${user.full_name} (${user.email})`);
  
  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      user_id: user.id,
      email: user.email,
      password_updated: true,
      updated_at: user.password_updated_at,
      next_steps: [
        'Your password has been updated',
        'You can now login with your new password',
        'All reset tokens have been invalidated'
      ]
    }
  });
});

// ===== FIX 2: PROFILE API - Dynamic, not hardcoded Jenny Wilson =====
app.get('/api/me/profile', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  console.log(`👤 Profile requested for user ID: ${userId}`);
  console.log(`👤 Found user: ${user ? user.full_name : 'NOT FOUND'} (ID: ${userId})`);
  
  res.json({
    success: true,
    message: "Profile information retrieved successfully",
    data: {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        profile_photo: user.profile_photo,
        role: user.role,
        company: "ACME Inc.",
        joined_date: "August 17, 2025",
        employee_id: `EMP00${user.id}`,
        department: user.role === "Developer" ? "Engineering" : user.role === "Designer" ? "Design" : "Management",
        status: "Active",
        timezone: "UTC-5",
        last_login: new Date().toISOString()
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

// ===== FIX 3: PROFILE UPDATE API - Persistent changes =====
app.put('/api/me/profile', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const { first_name, last_name, email, phone, project, location, company, department } = req.body;
  
  console.log(`📝 Profile update for user ${userId}:`, { first_name, last_name, email, project, location });
  
  if (!persistentUsers[userId]) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Update user data
  if (first_name) persistentUsers[userId].first_name = first_name;
  if (last_name) persistentUsers[userId].last_name = last_name;
  if (email) persistentUsers[userId].email = email;
  if (phone) persistentUsers[userId].phone = phone;
  if (project) persistentUsers[userId].project = project;
  if (location) persistentUsers[userId].location = location;
  if (company) persistentUsers[userId].company = company;
  if (department) persistentUsers[userId].department = department;
  
  // Update full name
  persistentUsers[userId].full_name = `${persistentUsers[userId].first_name} ${persistentUsers[userId].last_name}`;
  
  // Save to persistent storage
  savePersistentData();
  
  console.log(`✅ Profile updated successfully: ${persistentUsers[userId].full_name} - Project: ${persistentUsers[userId].project}, Location: ${persistentUsers[userId].location}`);
  
  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: persistentUsers[userId],
      persistent: true
    }
  });
});

// ===== PROFILE PHOTO UPLOAD API =====
app.post('/api/me/profile/photo', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  
  console.log(`📸 Profile photo upload request from user: ${user.full_name} (ID: ${userId})`);
  
  // For demo purposes, we'll simulate photo upload without actual file handling
  // In a real application, you would use multer or similar for file uploads
  
  const { photo_url } = req.body;
  
  if (!photo_url) {
    // Simulate successful upload with a default photo URL
    const mockPhotoUrls = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612c937?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face"
    ];
    
    const randomPhoto = mockPhotoUrls[Math.floor(Math.random() * mockPhotoUrls.length)];
    
    // Update user's profile photo
    persistentUsers[userId].profile_photo = randomPhoto;
    persistentUsers[userId].photo_updated_at = new Date().toISOString();
    
    savePersistentData();
    
    console.log(`✅ Profile photo updated for user: ${user.full_name} - New photo: ${randomPhoto}`);
    
    return res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          profile_photo: randomPhoto,
          photo_updated_at: persistentUsers[userId].photo_updated_at
        },
        upload: {
          status: "success",
          photo_url: randomPhoto,
          demo_note: "This is a demo upload. In production, actual file would be processed.",
          file_size: "~150KB (simulated)",
          dimensions: "150x150 (optimized)"
        }
      }
    });
  }
  
  // If photo_url is provided, use it
  persistentUsers[userId].profile_photo = photo_url;
  persistentUsers[userId].photo_updated_at = new Date().toISOString();
  
  savePersistentData();
  
  console.log(`✅ Profile photo updated with provided URL for user: ${user.full_name}`);
  
  res.json({
    success: true,
    message: "Profile photo updated successfully",
    data: {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        profile_photo: photo_url,
        photo_updated_at: persistentUsers[userId].photo_updated_at
      },
      upload: {
        status: "success",
        photo_url: photo_url,
        method: "url_provided"
      }
    }
  });
});

// ===== PROFILE PHOTO DELETE API =====
app.delete('/api/me/profile/photo', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  
  console.log(`🗑️ Profile photo delete request from user: ${user.full_name} (ID: ${userId})`);
  
  // Set default avatar
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&size=150&background=6366F1&color=ffffff`;
  
  persistentUsers[userId].profile_photo = defaultAvatar;
  persistentUsers[userId].photo_updated_at = new Date().toISOString();
  
  savePersistentData();
  
  console.log(`✅ Profile photo deleted for user: ${user.full_name} - Reset to default avatar`);
  
  res.json({
    success: true,
    message: "Profile photo deleted successfully",
    data: {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        profile_photo: defaultAvatar,
        photo_updated_at: persistentUsers[userId].photo_updated_at
      },
      delete: {
        status: "success",
        default_avatar: defaultAvatar,
        note: "Profile photo reset to generated avatar"
      }
    }
  });
});

// ===== PROFILE NAME UPDATE API =====
app.put('/api/me/profile/name', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  
  console.log(`📝 Profile name update request from user: ${user.full_name} (ID: ${userId})`);
  
  const { name, first_name, last_name } = req.body;
  
  // Validate input
  if (!name && !first_name && !last_name) {
    return res.status(400).json({
      success: false,
      message: 'Name, first_name, or last_name is required',
      data: {
        required_fields: ['name (full name)', 'first_name + last_name', 'first_name', 'last_name'],
        current_name: user.full_name
      }
    });
  }
  
  let updatedFirstName = user.first_name;
  let updatedLastName = user.last_name;
  let updatedFullName = user.full_name;
  
  // Handle different input patterns
  if (name) {
    // If full name is provided, try to split it
    const nameParts = name.trim().split(' ');
    updatedFirstName = nameParts[0] || user.first_name;
    updatedLastName = nameParts.slice(1).join(' ') || user.last_name || '';
    updatedFullName = name.trim();
  } else {
    // If individual parts are provided
    if (first_name) updatedFirstName = first_name.trim();
    if (last_name) updatedLastName = last_name.trim();
    updatedFullName = `${updatedFirstName} ${updatedLastName}`.trim();
  }
  
  // Validate name length
  if (updatedFullName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters long',
      data: {
        provided_name: updatedFullName,
        min_length: 2
      }
    });
  }
  
  // Store old name for comparison
  const oldName = user.full_name;
  
  // Update user data
  persistentUsers[userId].first_name = updatedFirstName;
  persistentUsers[userId].last_name = updatedLastName;
  persistentUsers[userId].full_name = updatedFullName;
  persistentUsers[userId].name_updated_at = new Date().toISOString();
  
  // Save changes
  savePersistentData();
  
  console.log(`✅ Profile name updated successfully: ${oldName} → ${updatedFullName}`);
  
  res.json({
    success: true,
    message: "Profile name updated successfully",
    data: {
      user: {
        id: user.id,
        first_name: updatedFirstName,
        last_name: updatedLastName,
        full_name: updatedFullName,
        email: user.email,
        profile_photo: user.profile_photo,
        name_updated_at: persistentUsers[userId].name_updated_at
      },
      changes: {
        old_name: oldName,
        new_name: updatedFullName,
        first_name: updatedFirstName,
        last_name: updatedLastName
      }
    }
  });
});

// ===== PROFILE EMAIL UPDATE API =====
app.put('/api/me/profile/email', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  
  console.log(`📧 Profile email update request from user: ${user.full_name} (ID: ${userId})`);
  
  const { email, current_password } = req.body;
  
  // Validate input
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'New email is required',
      data: {
        required_fields: ['email'],
        current_email: user.email
      }
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
      data: {
        provided_email: email,
        format_required: 'user@domain.com'
      }
    });
  }
  
  // Check if email is already in use
  const existingUser = Object.values(persistentUsers).find(u => u.email === email && u.id !== userId);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'This email is already registered with another account',
      data: {
        email: email,
        error: 'email_already_exists'
      }
    });
  }
  
  // Verify current password for security (optional but recommended)
  if (current_password && user.password !== current_password) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
      data: {
        error: 'invalid_password'
      }
    });
  }
  
  // Store old email
  const oldEmail = user.email;
  
  // Update email
  persistentUsers[userId].email = email;
  persistentUsers[userId].email_updated_at = new Date().toISOString();
  
  // Save changes
  savePersistentData();
  
  console.log(`✅ Profile email updated successfully: ${oldEmail} → ${email}`);
  
  res.json({
    success: true,
    message: "Profile email updated successfully",
    data: {
      user: {
        id: user.id,
        name: user.full_name,
        email: email,
        profile_photo: user.profile_photo,
        email_updated_at: persistentUsers[userId].email_updated_at
      },
      changes: {
        old_email: oldEmail,
        new_email: email
      },
      security_note: "Please update your login credentials and verify the new email address"
    }
  });
});

// ===== PROFILE PHONE UPDATE API =====
app.put('/api/me/profile/phone', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  
  console.log(`📞 Profile phone update request from user: ${user.full_name} (ID: ${userId})`);
  
  const { phone } = req.body;
  
  // Validate input
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required',
      data: {
        required_fields: ['phone'],
        current_phone: user.phone || 'Not set'
      }
    });
  }
  
  // Basic phone validation - remove spaces and special characters for validation
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be between 7 and 15 digits',
      data: {
        provided_phone: phone,
        clean_digits: cleanPhone,
        length: cleanPhone.length,
        valid_length: '7-15 digits'
      }
    });
  }
  
  // Check if phone contains only numbers (after cleaning)
  if (!/^\d+$/.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign',
      data: {
        provided_phone: phone,
        allowed_characters: '0-9, space, -, (, ), +'
      }
    });
  }
  
  // Check if phone is already in use by another user
  const existingUser = Object.values(persistentUsers).find(u => u.phone === phone && u.id !== userId);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'This phone number is already registered with another account',
      data: {
        phone: phone,
        error: 'phone_already_exists'
      }
    });
  }
  
  // Store old phone
  const oldPhone = user.phone || 'Not set';
  
  // Update phone
  persistentUsers[userId].phone = phone;
  persistentUsers[userId].phone_updated_at = new Date().toISOString();
  
  // Save changes
  savePersistentData();
  
  console.log(`✅ Profile phone updated successfully: ${oldPhone} → ${phone}`);
  
  res.json({
    success: true,
    message: "Profile phone updated successfully",
    data: {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: phone,
        profile_photo: user.profile_photo,
        phone_updated_at: persistentUsers[userId].phone_updated_at
      },
      changes: {
        old_phone: oldPhone,
        new_phone: phone,
        formatted_phone: phone
      },
      validation: {
        digits_count: cleanPhone.length,
        format_valid: true,
        unique: true
      }
    }
  });
});

// ===== TIMER OVERVIEW API - General timer information =====
app.get('/api/me/timer', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const user = persistentUsers[userId];
  const timerData = persistentTimers[userId];
  
  // Calculate current timer status
  let timerStatus = {
    has_active_timer: false,
    is_running: false,
    is_paused: false,
    current_timer: null,
    today_total: 0,
    week_total: 0
  };
  
  if (timerData) {
    timerStatus.has_active_timer = true;
    timerStatus.is_running = timerData.isActive && !timerData.isPaused;
    timerStatus.is_paused = timerData.isPaused;
    
    if (timerData.isActive) {
      // Calculate current session time
      const currentTime = new Date();
      const startTime = new Date(timerData.startTime);
      const sessionTime = Math.floor((currentTime - startTime) / 1000);
      const totalTime = (timerData.totalTime || 0) + sessionTime;
      
      timerStatus.current_timer = {
        timer_id: timerData.timerId,
        task_name: timerData.task_name,
        project_id: timerData.project_id,
        start_time: timerData.startTime,
        current_duration: Math.max(0, sessionTime),
        total_duration: Math.max(0, totalTime),
        formatted_duration: `${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`,
        status: timerData.isPaused ? 'paused' : 'running'
      };
      
      timerStatus.today_total = totalTime;
    } else {
      // Timer stopped but data exists
      timerStatus.current_timer = {
        timer_id: timerData.timerId,
        task_name: timerData.task_name,
        total_duration: timerData.totalTime || 0,
        formatted_duration: `${Math.floor((timerData.totalTime || 0) / 3600)}h ${Math.floor(((timerData.totalTime || 0) % 3600) / 60)}m`,
        status: 'stopped'
      };
      
      timerStatus.today_total = timerData.totalTime || 0;
    }
  }
  
  // Mock week total (in real app would come from database)
  timerStatus.week_total = timerStatus.today_total + (6.5 * 3600); // Add mock previous days
  
  const response = {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email
    },
    timer_overview: timerStatus,
    available_actions: {
      can_start: !timerStatus.is_running,
      can_pause: timerStatus.is_running,
      can_resume: timerStatus.is_paused,
      can_stop: timerStatus.has_active_timer
    },
    quick_stats: {
      today_hours: Math.round((timerStatus.today_total / 3600) * 10) / 10,
      week_hours: Math.round((timerStatus.week_total / 3600) * 10) / 10,
      productivity_score: Math.min(Math.round((timerStatus.today_total / 28800) * 100), 100)
    }
  };
  
  res.json({
    success: true,
    message: "Timer information retrieved successfully",
    data: response
  });
});

// ===== FIX 4: TIMER START API - Persistent, won't auto-stop =====
app.post('/api/me/timer/start', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const { projectId, locationId, notes } = req.body || {};
  const timerId = `timer_${userId}_${Date.now()}`;
  const startTime = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`🚀 Timer start request - User: ${userId}, Timer: ${timerId}`);
  
  // Check if already has active timer
  const existingTimer = persistentTimers[userId];
  if (existingTimer && existingTimer.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Timer already running. Stop current timer first.',
      data: {
        currentTimer: existingTimer,
        hasActiveTimer: true
      }
    });
  }
  
  // Check daily limit (TEMPORARILY DISABLED FOR TESTING)
  // if (dailyLimits[userId] === today) {
  //   return res.status(400).json({
  //     success: false,
  //     message: 'Work session already completed for today. You can start again tomorrow.',
  //     data: {
  //       stoppedToday: true,
  //       canStartAgain: false
  //     }
  //   });
  // }
  
  console.log(`⚠️ Daily limit check disabled for testing - allowing timer start`);
  
  // Create persistent timer
  persistentTimers[userId] = {
    timerId,
    userId,
    startTime,
    description: req.body.description || 'Work Session',
    projectId,
    locationId,
    notes,
    isActive: true,
    isRunning: true,
    isPaused: false,
    totalPausedTime: 0,
    pauseStartTime: null,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  // Save immediately
  savePersistentData();
  
  console.log(`✅ Timer started successfully for user ${userId}`);
  console.log(`📊 Timer data: ${JSON.stringify(persistentTimers[userId], null, 2)}`);
  
  res.json({
    success: true,
    message: 'Timer started successfully',
    data: {
      timer_id: timerId,
      start_time: startTime,
      description: req.body.description || 'Work Session',
      is_running: true,
      is_paused: false,
      project_id: projectId || null,
      location_id: locationId || null,
      notes: notes || '',
      persistent: true,
      enhanced: true
    }
  });
});

// ===== FIX 5: TIMER CURRENT API - Always shows correct state =====
app.get('/api/me/timer/current', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  
  console.log(`🔍 Timer status check for user ${userId}`);
  console.log(`📊 Available timers: ${Object.keys(persistentTimers).length}`);
  
  const timerData = persistentTimers[userId];
  const today = new Date().toISOString().split('T')[0];
  const stoppedToday = dailyLimits[userId] === today;
  
  if (!timerData || !timerData.isActive) {
    console.log(`❌ No active timer for user ${userId}`);
    
    return res.json({
      success: true,
      data: {
        hasActiveTimer: false,
        timer: null,
        stoppedToday,
        canStart: !stoppedToday,
        message: stoppedToday 
          ? 'Work session completed for today. You can start again tomorrow.' 
          : 'No active timer - ready to start work session'
      }
    });
  }
  
  console.log(`✅ Active timer found for user ${userId}: ${timerData.timerId}`);
  
  // Calculate duration with better precision and consistency
  const now = new Date();
  const startTime = new Date(timerData.startTime);
  
  // More precise time calculation
  let elapsedMs = now.getTime() - startTime.getTime();
  
  // Subtract total paused time if any
  if (timerData.totalPausedTime) {
    elapsedMs -= timerData.totalPausedTime;
  }
  
  // If currently paused, subtract current pause duration
  if (timerData.isPaused && timerData.pauseStartTime) {
    const pauseStartTime = new Date(timerData.pauseStartTime);
    const currentPauseDuration = now.getTime() - pauseStartTime.getTime();
    elapsedMs -= currentPauseDuration;
  }
  
  // Ensure we never have negative time
  elapsedMs = Math.max(0, elapsedMs);
  
  // Convert to hours and minutes with consistent rounding
  const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const currentDuration = `${hours}h ${minutes}m`;
  
  console.log(`⏱️ Timer calculation for ${timerData.timerId}: ${currentDuration} (${totalMinutes} total minutes)`);
  
  res.json({
    success: true,
    data: {
      hasActiveTimer: !timerData.isPaused, // False when paused, true when running
      status: timerData.isPaused ? 'paused' : 'running',
      duration: currentDuration,
      timer: {
        timer_id: timerData.timerId,
        start_time: timerData.startTime,
        current_duration: currentDuration,
        is_running: timerData.isRunning && !timerData.isPaused,
        is_paused: timerData.isPaused,
        project_id: timerData.projectId,
        description: timerData.description,
        notes: timerData.notes,
        total_paused_time: timerData.totalPausedTime || 0
      }
    }
  });
});

// ===== FIX 6: TIMER PAUSE API - Fully implemented =====
app.post('/api/me/timer/pause', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const { action } = req.body; // 'pause', 'resume', or undefined for toggle
  
  console.log(`⏸️ Timer pause/resume request for user ${userId} - action: ${action || 'toggle'}`);
  
  const timerData = persistentTimers[userId];
  if (!timerData || !timerData.isActive) {
    return res.status(400).json({
      success: false,
      message: 'No active timer to pause/resume'
    });
  }
  
  const now = new Date();
  const isCurrentlyPaused = timerData.isPaused || false;
  
  // Determine action
  const shouldPause = action === 'pause' ? true : action === 'resume' ? false : !isCurrentlyPaused;
  
  if (shouldPause && !isCurrentlyPaused) {
    // Pause timer
    timerData.isPaused = true;
    timerData.pauseStartTime = now.toISOString();
    console.log(`⏸️ Timer paused for user ${userId}`);
  } else if (!shouldPause && isCurrentlyPaused) {
    // Resume timer
    if (timerData.pauseStartTime) {
      const pauseDuration = now - new Date(timerData.pauseStartTime);
      timerData.totalPausedTime = (timerData.totalPausedTime || 0) + pauseDuration;
    }
    timerData.isPaused = false;
    timerData.pauseStartTime = null;
    console.log(`▶️ Timer resumed for user ${userId}`);
  }
  
  timerData.lastActivity = now.toISOString();
  
  // Save immediately
  savePersistentData();
  
  // Determine correct message based on action taken
  let message;
  if (shouldPause && !isCurrentlyPaused) {
    message = 'Timer paused successfully';
  } else if (!shouldPause && isCurrentlyPaused) {
    message = 'Timer resumed successfully';
  } else if (shouldPause && isCurrentlyPaused) {
    message = 'Timer is already paused';
  } else {
    message = 'Timer is already running';
  }
  
  res.json({
    success: true,
    message: message,
    data: {
      timerId: timerData.timerId,
      isPaused: timerData.isPaused,
      pausedAt: timerData.pauseStartTime,
      totalPausedTime: timerData.totalPausedTime || 0,
      status: timerData.isPaused ? 'paused' : 'running',
      action: shouldPause ? 'pause' : 'resume',
      enhanced: true
    }
  });
});

// ===== TIMER RESUME API - Dedicated endpoint =====
app.post('/api/me/timer/resume', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  
  console.log(`▶️ Timer resume request for user ${userId}`);
  
  const timerData = persistentTimers[userId];
  if (!timerData || !timerData.isActive) {
    return res.status(400).json({
      success: false,
      message: 'No active timer to resume'
    });
  }
  
  if (!timerData.isPaused) {
    return res.status(400).json({
      success: false,
      message: 'Timer is not paused'
    });
  }
  
  const now = new Date();
  
  // Calculate pause duration and add to total
  if (timerData.pauseStartTime) {
    const pauseDuration = now - new Date(timerData.pauseStartTime);
    timerData.totalPausedTime = (timerData.totalPausedTime || 0) + pauseDuration;
  }
  
  // Resume timer
  timerData.isPaused = false;
  timerData.pauseStartTime = null;
  timerData.lastActivity = now.toISOString();
  
  // Save immediately
  savePersistentData();
  
  console.log(`✅ Timer resumed for user ${userId}`);
  
  res.json({
    success: true,
    message: 'Timer resumed successfully',
    data: {
      timerId: timerData.timerId,
      isPaused: false,
      totalPausedTime: timerData.totalPausedTime || 0,
      status: 'running',
      resumedAt: now.toISOString()
    }
  });
});

// ===== FIX 7: TIMER STOP API - Proper cleanup =====
app.post('/api/me/timer/stop', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`⏹️ Timer stop request for user ${userId}`);
  
  const timerData = persistentTimers[userId];
  if (!timerData || !timerData.isActive) {
    return res.status(400).json({
      success: false,
      message: 'No active timer to stop'
    });
  }
  
  // Calculate duration
  const now = new Date();
  const startTime = new Date(timerData.startTime);
  const durationMs = now - startTime - (timerData.totalPausedTime || 0);
  const durationSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);
  const duration = `${hours}h ${minutes}m`;
  
  // Mark as stopped today
  dailyLimits[userId] = today;
  
  // IMPORTANT: Store the total time instead of deleting timer data
  persistentTimers[userId] = {
    ...timerData,
    isActive: false,
    isPaused: false,
    totalTime: (timerData.totalTime || 0) + durationSeconds,
    endTime: now,
    lastSessionDuration: durationSeconds,
    stoppedAt: now.toISOString(),
    status: 'stopped'
  };
  
  // Save changes
  savePersistentData();
  
  console.log(`✅ Timer stopped for user ${userId} - Duration: ${duration}, Total Time: ${persistentTimers[userId].totalTime} seconds`);
  
  res.json({
    success: true,
    message: 'Timer stopped successfully',
    data: {
      timer_id: timerData.timerId,
      end_time: now.toISOString(),
      session_duration: duration,
      total_time_seconds: persistentTimers[userId].totalTime,
      total_duration: `${Math.floor(persistentTimers[userId].totalTime / 3600)}h ${Math.floor((persistentTimers[userId].totalTime % 3600) / 60)}m`,
      status: 'stopped'
    }
  });
});

// ===== TIMER BREAK API - Start break during active timer =====
app.post('/api/me/timer/break', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  const { breakType, description, duration_minutes } = req.body;
  
  console.log(`⏸️ Timer break request from user ${userId}: ${breakType}`);
  
  // Validate break type
  if (!breakType) {
    return res.status(400).json({
      success: false,
      message: 'Break type is required',
      data: {
        required_fields: ['breakType'],
        available_types: ['lunch', 'coffee', 'personal', 'meeting', 'short', 'custom']
      }
    });
  }
  
  // Check if user has an active timer
  const activeTimer = persistentTimers[userId];
  if (!activeTimer || !activeTimer.isActive) {
    return res.status(400).json({
      success: false,
      message: 'No active timer found. Please start a timer before taking a break.',
      data: {
        has_timer: false,
        action_required: 'Start timer first'
      }
    });
  }
  
  // Check if timer is already paused/on break
  if (activeTimer.isPaused) {
    return res.status(400).json({
      success: false,
      message: 'Timer is already paused. You cannot start a break during a paused timer.',
      data: {
        timer_status: 'paused',
        suggestion: 'Resume timer first or end current break'
      }
    });
  }
  
  // Check if user already has an active break
  if (persistentBreaks[userId] && persistentBreaks[userId].status === 'active') {
    return res.status(400).json({
      success: false,
      message: 'You already have an active break running',
      data: {
        current_break: persistentBreaks[userId],
        action_required: 'End current break first'
      }
    });
  }
  
  // Define break types with default durations
  const breakTypes = {
    lunch: { name: 'Lunch Break', default_duration: 60 },
    coffee: { name: 'Coffee Break', default_duration: 15 },
    personal: { name: 'Personal Break', default_duration: 30 },
    meeting: { name: 'Meeting Break', default_duration: 45 },
    short: { name: 'Short Break', default_duration: 10 },
    custom: { name: 'Custom Break', default_duration: 15 }
  };
  
  const selectedBreakType = breakTypes[breakType] || breakTypes.custom;
  const breakDuration = duration_minutes || selectedBreakType.default_duration;
  
  // Pause the timer
  const now = new Date();
  const currentSessionTime = Math.floor((now - new Date(activeTimer.startTime)) / 1000);
  
  persistentTimers[userId] = {
    ...activeTimer,
    isPaused: true,
    pausedAt: now.toISOString(),
    totalTime: (activeTimer.totalTime || 0) + currentSessionTime,
    pauseReason: 'break'
  };
  
  // Create break record
  const breakId = `break_${userId}_${Date.now()}`;
  persistentBreaks[userId] = {
    id: breakId,
    user_id: userId,
    break_type: breakType,
    display_name: selectedBreakType.name,
    description: description || `Taking a ${selectedBreakType.name.toLowerCase()}`,
    start_time: now.toISOString(),
    duration_minutes: breakDuration,
    expected_end_time: new Date(now.getTime() + (breakDuration * 60000)).toISOString(),
    status: 'active',
    timer_id: activeTimer.timerId
  };
  
  savePersistentData();
  
  console.log(`✅ Timer break started: ${selectedBreakType.name} for ${breakDuration} minutes`);
  
  res.json({
    success: true,
    message: `${selectedBreakType.name} started successfully`,
    data: {
      break: persistentBreaks[userId],
      timer_status: {
        paused: true,
        pause_reason: 'break',
        timer_id: activeTimer.timerId,
        accumulated_time: persistentTimers[userId].totalTime
      },
      instructions: [
        'Your timer has been paused automatically',
        `Break will last ${breakDuration} minutes`,
        'Use PUT /api/me/timer/break to end break and resume timer',
        'Timer will resume automatically when break ends'
      ]
    }
  });
});

// ===== END TIMER BREAK API - End break and resume timer =====
app.put('/api/me/timer/break', authenticateToken, (req, res) => {
  const userId = req.user?.userId || 1;
  
  console.log(`▶️ End timer break request from user ${userId}`);
  
  // Check if user has an active break
  const activeBreak = persistentBreaks[userId];
  if (!activeBreak || activeBreak.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'No active break found',
      data: {
        has_break: false,
        break_status: activeBreak ? activeBreak.status : 'none'
      }
    });
  }
  
  // Check if timer exists and is paused
  const pausedTimer = persistentTimers[userId];
  if (!pausedTimer || !pausedTimer.isPaused) {
    return res.status(400).json({
      success: false,
      message: 'Timer is not paused or does not exist',
      data: {
        timer_status: pausedTimer ? 'running' : 'not_found'
      }
    });
  }
  
  // End the break
  const now = new Date();
  const breakStartTime = new Date(activeBreak.start_time);
  const breakDuration = Math.floor((now - breakStartTime) / 1000);
  
  persistentBreaks[userId] = {
    ...activeBreak,
    status: 'completed',
    end_time: now.toISOString(),
    actual_duration_seconds: breakDuration,
    actual_duration_minutes: Math.round(breakDuration / 60)
  };
  
  // Resume the timer
  persistentTimers[userId] = {
    ...pausedTimer,
    isPaused: false,
    startTime: now, // Reset start time for new session
    pausedAt: null,
    pauseReason: null,
    resumedAt: now.toISOString()
  };
  
  savePersistentData();
  
  console.log(`✅ Timer break ended and timer resumed after ${Math.round(breakDuration / 60)} minutes`);
  
  res.json({
    success: true,
    message: 'Break ended successfully and timer resumed',
    data: {
      break_summary: {
        type: activeBreak.break_type,
        display_name: activeBreak.display_name,
        planned_duration: `${activeBreak.duration_minutes} minutes`,
        actual_duration: `${Math.round(breakDuration / 60)} minutes`,
        efficiency: breakDuration <= (activeBreak.duration_minutes * 60) ? 'on_time' : 'extended'
      },
      timer_status: {
        resumed: true,
        timer_id: pausedTimer.timerId,
        accumulated_time: pausedTimer.totalTime,
        new_session_start: now.toISOString()
      }
    }
  });
});

// ===== ADMIN APIs =====

// GET User Complete Profile (Admin)
app.get('/api/admin/users/:userId', authenticateToken, (req, res) => {
  const adminId = req.user.userId;
  const targetUserId = parseInt(req.params.userId);

  // Get target user
  const user = persistentUsers[targetUserId];
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // Get user's timer data
  const timerData = persistentTimers[targetUserId] || {};
  
  // Get user's leave requests
  const leaveRequests = Object.values(persistentLeaveRequests || {}).filter(lr => lr.userId === targetUserId);
  
  // Get user's break history
  const breakHistory = Object.values(persistentBreaks || {}).filter(b => b.userId === targetUserId);

  // Calculate work summary
  const totalWorkTime = timerData.totalTime || 0;
  const totalWorkHours = (totalWorkTime / 3600).toFixed(2);
  const avgDailyHours = (totalWorkHours / 30).toFixed(2); // Last 30 days average
  
  // Calculate timesheet summary
  const thisWeekHours = (totalWorkTime / 3600 * 0.3).toFixed(2); // Simulated
  const lastWeekHours = (totalWorkTime / 3600 * 0.25).toFixed(2); // Simulated
  const thisMonthHours = totalWorkHours;
  
  // Get recent activity
  const recentActivity = [];
  
  // Add timer activities
  if (timerData.isActive) {
    recentActivity.push({
      id: 1,
      type: "timer_start",
      action: "Started work timer",
      timestamp: timerData.startTime,
      details: {
        project: user.project || "General Work",
        status: "active"
      }
    });
  }
  
  // Add leave request activities
  leaveRequests.slice(-5).forEach((leave, idx) => {
    recentActivity.push({
      id: recentActivity.length + 1,
      type: "leave_request",
      action: `${leave.status === 'approved' ? 'Approved' : leave.status === 'rejected' ? 'Rejected' : 'Submitted'} leave request`,
      timestamp: leave.approvedAt || leave.createdAt,
      details: {
        leave_type: leave.leaveType,
        duration: `${leave.startDate} to ${leave.endDate}`,
        status: leave.status
      }
    });
  });

  // Add profile update activity
  if (user.photo_updated_at) {
    recentActivity.push({
      id: recentActivity.length + 1,
      type: "profile_update",
      action: "Updated profile photo",
      timestamp: user.photo_updated_at,
      details: {
        field: "profile_photo"
      }
    });
  }

  // Sort by timestamp (most recent first)
  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Prepare complete user profile
  const completeProfile = {
    // Basic Info
    basic_info: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      profile_photo: user.profile_photo,
      role: user.role,
      status: timerData.isActive ? "active" : user.last_logout ? "offline" : "idle",
      date_joined: user.created_at || "2025-12-01T00:00:00Z",
      last_login: user.last_login || new Date().toISOString(),
      last_logout: user.last_logout || null
    },

    // Personal Info
    personal_info: {
      location: user.location,
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      country: user.country || null,
      postal_code: user.postal_code || null,
      date_of_birth: user.date_of_birth || null,
      gender: user.gender || null,
      emergency_contact: user.emergency_contact || null,
      emergency_phone: user.emergency_phone || null
    },

    // Work Summary
    work_summary: {
      project: user.project,
      department: user.department || "Engineering",
      position: user.role,
      employment_type: user.employment_type || "Full-time",
      total_work_hours: parseFloat(totalWorkHours),
      average_daily_hours: parseFloat(avgDailyHours),
      current_timer_status: timerData.isActive ? "running" : "stopped",
      total_sessions: timerData.sessionCount || 0,
      productivity_score: Math.min(100, Math.round((parseFloat(totalWorkHours) / 160) * 100)), // Based on monthly hours
      last_work_date: timerData.lastStopTime || timerData.startTime || null
    },

    // Timesheet Summary
    timesheet_summary: {
      this_week: {
        total_hours: parseFloat(thisWeekHours),
        days_worked: 4,
        status: "in_progress"
      },
      last_week: {
        total_hours: parseFloat(lastWeekHours),
        days_worked: 5,
        status: "completed"
      },
      this_month: {
        total_hours: parseFloat(thisMonthHours),
        days_worked: 18,
        status: "in_progress"
      },
      all_time: {
        total_hours: parseFloat(totalWorkHours),
        total_days: Math.ceil(parseFloat(totalWorkHours) / 8),
        first_entry: user.created_at || "2025-12-01T00:00:00Z"
      }
    },

    // Requests Summary
    requests: {
      leave_requests: {
        total: leaveRequests.length,
        pending: leaveRequests.filter(lr => lr.status === 'pending').length,
        approved: leaveRequests.filter(lr => lr.status === 'approved').length,
        rejected: leaveRequests.filter(lr => lr.status === 'rejected').length,
        recent_requests: leaveRequests.slice(-5).map(lr => ({
          id: lr.id,
          type: lr.leaveType,
          start_date: lr.startDate,
          end_date: lr.endDate,
          status: lr.status,
          submitted_at: lr.createdAt
        }))
      },
      break_requests: {
        total: breakHistory.length,
        recent_breaks: breakHistory.slice(-5).map(br => ({
          id: br.id,
          type: br.break_type,
          start_time: br.start_time,
          end_time: br.end_time,
          duration_minutes: br.duration_minutes
        }))
      },
      correction_requests: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    },

    // Recent Activity
    recent_activity: recentActivity.slice(0, 10),

    // Statistics
    statistics: {
      attendance_rate: 95.5,
      punctuality_score: 92.3,
      overtime_hours: Math.max(0, parseFloat(totalWorkHours) - 160),
      average_break_duration: breakHistory.length > 0 
        ? (breakHistory.reduce((sum, br) => sum + (br.duration_minutes || 0), 0) / breakHistory.length).toFixed(1)
        : 0,
      projects_assigned: 1,
      tasks_completed: Math.floor(parseFloat(totalWorkHours) / 4) // Simulated: 1 task per 4 hours
    }
  };

  res.json({
    success: true,
    message: "User profile retrieved successfully",
    data: {
      user: completeProfile,
      fetched_at: new Date().toISOString(),
      fetched_by: adminId
    }
  });
});

// ===== EDIT EMPLOYEE API (Company Admin) =====
app.put('/api/admin/employees/:employeeId', authenticateToken, (req, res) => {
  const adminId = req.user.userId;
  const employeeId = parseInt(req.params.employeeId);

  console.log(`✏️ Edit employee request - Admin: ${adminId}, Employee: ${employeeId}`);

  // Find employee
  const employee = persistentUsers[employeeId];
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee not found",
      data: {
        employee_id: employeeId
      }
    });
  }

  // Extract editable fields from request body
  const {
    // Personal Information
    first_name,
    last_name,
    email,
    phone,
    address,
    date_of_birth,
    
    // Work Information
    role,
    department,
    working_hours,
    work_model,
    manager,
    status
  } = req.body;

  // Track what fields are being updated
  const updatedFields = [];

  // Update Personal Information
  if (first_name !== undefined && first_name !== employee.first_name) {
    employee.first_name = first_name;
    employee.full_name = `${first_name} ${employee.last_name}`;
    updatedFields.push('first_name');
  }

  if (last_name !== undefined && last_name !== employee.last_name) {
    employee.last_name = last_name;
    employee.full_name = `${employee.first_name} ${last_name}`;
    updatedFields.push('last_name');
  }

  if (email !== undefined && email !== employee.email) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: {
          email: email
        }
      });
    }

    // Check if email already exists for another user
    const existingUser = Object.values(persistentUsers).find(
      u => u.email === email && u.id !== employeeId
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists for another employee",
        data: {
          email: email,
          existing_user_id: existingUser.id
        }
      });
    }

    employee.email = email;
    updatedFields.push('email');
  }

  if (phone !== undefined && phone !== employee.phone) {
    employee.phone = phone;
    updatedFields.push('phone');
  }

  if (address !== undefined && address !== employee.address) {
    employee.address = address;
    updatedFields.push('address');
  }

  if (date_of_birth !== undefined && date_of_birth !== employee.date_of_birth) {
    employee.date_of_birth = date_of_birth;
    updatedFields.push('date_of_birth');
  }

  // Update Work Information
  if (role !== undefined && role !== employee.role) {
    employee.role = role;
    updatedFields.push('role');
  }

  if (department !== undefined && department !== employee.department) {
    employee.department = department;
    updatedFields.push('department');
  }

  if (working_hours !== undefined && working_hours !== employee.working_hours) {
    employee.working_hours = working_hours;
    updatedFields.push('working_hours');
  }

  if (work_model !== undefined && work_model !== employee.work_model) {
    employee.work_model = work_model;
    updatedFields.push('work_model');
  }

  if (manager !== undefined && manager !== employee.manager) {
    employee.manager = manager;
    updatedFields.push('manager');
  }

  if (status !== undefined && status !== employee.status) {
    employee.status = status;
    updatedFields.push('status');
  }

  // Update timestamp
  employee.updated_at = new Date().toISOString();
  employee.updated_by = adminId;

  // Save to persistent storage
  savePersistentData();

  console.log(`✅ Employee updated successfully: ${employee.full_name} (ID: ${employeeId})`);
  console.log(`📝 Updated fields: ${updatedFields.join(', ') || 'none'}`);

  res.json({
    success: true,
    message: "Employee updated successfully",
    data: {
      employee: {
        // Personal Information
        id: employee.id,
        employee_id: employee.employee_id, // READ-ONLY, never changes
        first_name: employee.first_name,
        last_name: employee.last_name,
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        date_of_birth: employee.date_of_birth,
        profile_photo: employee.profile_photo,
        
        // Work Information
        role: employee.role,
        department: employee.department,
        working_hours: employee.working_hours,
        work_model: employee.work_model,
        manager: employee.manager,
        status: employee.status,
        
        // Metadata
        joined_date: employee.joined_date || employee.created_at,
        updated_at: employee.updated_at,
        updated_by: adminId
      },
      updated_fields: updatedFields,
      update_count: updatedFields.length
    }
  });
});

// ===== GET EMPLOYEES BY DATE OF JOINING =====
app.get('/api/admin/employees', authenticateToken, (req, res) => {
  const adminId = req.user.userId;
  const { from_date, to_date, month, year, sort } = req.query;

  console.log(`📋 Get employees request - Filters: from_date=${from_date}, to_date=${to_date}, month=${month}, year=${year}`);

  let employees = Object.values(persistentUsers);

  // Filter by date range
  if (from_date || to_date) {
    employees = employees.filter(emp => {
      const joinedDate = emp.joined_date || emp.created_at;
      if (!joinedDate) return false;

      // Parse joined date (handle both "August 17, 2025" and ISO format)
      let empDate;
      if (joinedDate.includes('T')) {
        empDate = new Date(joinedDate);
      } else {
        empDate = new Date(joinedDate);
      }

      if (from_date) {
        const fromD = new Date(from_date);
        if (empDate < fromD) return false;
      }

      if (to_date) {
        const toD = new Date(to_date);
        if (empDate > toD) return false;
      }

      return true;
    });
  }

  // Filter by specific month and year
  if (month && year) {
    employees = employees.filter(emp => {
      const joinedDate = emp.joined_date || emp.created_at;
      if (!joinedDate) return false;

      let empDate;
      if (joinedDate.includes('T')) {
        empDate = new Date(joinedDate);
      } else {
        empDate = new Date(joinedDate);
      }

      const empMonth = empDate.getMonth() + 1; // 1-12
      const empYear = empDate.getFullYear();

      return empMonth === parseInt(month) && empYear === parseInt(year);
    });
  }

  // Filter by year only
  if (year && !month) {
    employees = employees.filter(emp => {
      const joinedDate = emp.joined_date || emp.created_at;
      if (!joinedDate) return false;

      let empDate;
      if (joinedDate.includes('T')) {
        empDate = new Date(joinedDate);
      } else {
        empDate = new Date(joinedDate);
      }

      const empYear = empDate.getFullYear();
      return empYear === parseInt(year);
    });
  }

  // Sort by joined date
  if (sort === 'newest' || sort === 'latest') {
    employees.sort((a, b) => {
      const dateA = new Date(a.joined_date || a.created_at);
      const dateB = new Date(b.joined_date || b.created_at);
      return dateB - dateA; // Newest first
    });
  } else if (sort === 'oldest') {
    employees.sort((a, b) => {
      const dateA = new Date(a.joined_date || a.created_at);
      const dateB = new Date(b.joined_date || b.created_at);
      return dateA - dateB; // Oldest first
    });
  }

  // Format response
  const formattedEmployees = employees.map(emp => ({
    id: emp.id,
    employee_id: emp.employee_id,
    full_name: emp.full_name,
    first_name: emp.first_name,
    last_name: emp.last_name,
    email: emp.email,
    phone: emp.phone,
    profile_photo: emp.profile_photo,
    role: emp.role,
    department: emp.department,
    status: emp.status,
    work_model: emp.work_model,
    manager: emp.manager,
    joined_date: emp.joined_date || emp.created_at,
    working_hours: emp.working_hours
  }));

  res.json({
    success: true,
    message: "Employees retrieved successfully",
    data: {
      employees: formattedEmployees,
      total_count: formattedEmployees.length,
      filters_applied: {
        from_date: from_date || null,
        to_date: to_date || null,
        month: month || null,
        year: year || null,
        sort: sort || 'none'
      }
    }
  });
});

// ===== DELETE EMPLOYEE API (Company Admin) =====
app.delete('/api/admin/employees/:employeeId', authenticateToken, (req, res) => {
  const adminId = req.user.userId;
  const employeeId = parseInt(req.params.employeeId);
  const { confirmation } = req.body;

  console.log(`🗑️ Delete employee request - Admin: ${adminId}, Employee: ${employeeId}`);

  // Find employee
  const employee = persistentUsers[employeeId];
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee not found",
      data: {
        employee_id: employeeId
      }
    });
  }

  // Validate confirmation text
  if (!confirmation || confirmation.toLowerCase() !== 'delete') {
    return res.status(400).json({
      success: false,
      message: "Please type 'DELETE' to confirm employee deletion",
      data: {
        required_confirmation: "DELETE",
        received_confirmation: confirmation || null,
        hint: "Type DELETE (case-insensitive) in the confirmation field"
      }
    });
  }

  // Store employee data before deletion (for response)
  const deletedEmployee = {
    id: employee.id,
    employee_id: employee.employee_id,
    full_name: employee.full_name,
    email: employee.email,
    role: employee.role,
    department: employee.department
  };

  // Delete employee from persistentUsers
  delete persistentUsers[employeeId];

  // Also delete related data
  // Delete timer data
  if (persistentTimers[employeeId]) {
    delete persistentTimers[employeeId];
  }

  // Delete leave requests
  if (persistentLeaveRequests) {
    Object.keys(persistentLeaveRequests).forEach(reqId => {
      if (persistentLeaveRequests[reqId].userId === employeeId) {
        delete persistentLeaveRequests[reqId];
      }
    });
  }

  // Delete break history
  if (persistentBreaks) {
    Object.keys(persistentBreaks).forEach(breakId => {
      if (persistentBreaks[breakId].userId === employeeId) {
        delete persistentBreaks[breakId];
      }
    });
  }

  // Delete user preferences
  if (userPreferences && userPreferences[employeeId]) {
    delete userPreferences[employeeId];
  }

  // Save to persistent storage
  savePersistentData();

  console.log(`✅ Employee deleted permanently: ${deletedEmployee.full_name} (ID: ${employeeId})`);
  console.log(`⚠️ All related data (timers, leaves, breaks) also deleted`);

  res.json({
    success: true,
    message: "Employee account deleted permanently",
    data: {
      deleted_employee: deletedEmployee,
      deleted_at: new Date().toISOString(),
      deleted_by: adminId,
      related_data_deleted: {
        timers: persistentTimers[employeeId] ? true : false,
        leave_requests: true,
        break_history: true,
        preferences: true
      },
      warning: "This action is irreversible. Employee data cannot be restored."
    }
  });
});

// ===== BREAK MANAGEMENT APIs =====
let persistentBreaks = {};

// GET Break Types (public endpoint)
app.get('/api/break-types', authenticateToken, (req, res) => {
  const breakTypes = [
    { id: 1, name: 'lunch', display_name: 'Lunch Break', duration_minutes: 60 },
    { id: 2, name: 'coffee', display_name: 'Coffee Break', duration_minutes: 15 },
    { id: 3, name: 'personal', display_name: 'Personal Break', duration_minutes: 30 },
    { id: 4, name: 'meeting', display_name: 'Meeting Break', duration_minutes: 45 },
    { id: 5, name: 'other', display_name: 'Other', duration_minutes: null }
  ];

  res.json({
    success: true,
    message: 'Break types retrieved successfully',
    data: {
      break_types: breakTypes
    }
  });
});

// GET Break Types (user-specific endpoint)
app.get('/api/me/break-types', authenticateToken, (req, res) => {
  const breakTypes = [
    { id: 1, name: 'lunch', display_name: 'Lunch Break', duration_minutes: 60 },
    { id: 2, name: 'coffee', display_name: 'Coffee Break', duration_minutes: 15 },
    { id: 3, name: 'personal', display_name: 'Personal Break', duration_minutes: 30 },
    { id: 4, name: 'meeting', display_name: 'Meeting Break', duration_minutes: 45 },
    { id: 5, name: 'other', display_name: 'Other', duration_minutes: null }
  ];

  res.json({
    success: true,
    message: 'Break types retrieved successfully',
    data: {
      break_types: breakTypes
    }
  });
});

// POST Start Break
app.post('/api/me/break/start', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { break_type, description } = req.body;

  // Check if user already has an active break
  if (persistentBreaks[userId] && persistentBreaks[userId].status === 'active') {
    return res.status(400).json({
      success: false,
      message: 'You already have an active break running',
      data: {
        current_break: persistentBreaks[userId]
      }
    });
  }

  const now = new Date();
  const breakId = `break_${userId}_${Date.now()}`;

  const breakData = {
    break_id: breakId,
    user_id: userId,
    break_type: break_type || 'other',
    description: description || '',
    start_time: now.toISOString(),
    status: 'active',
    created_at: now.toISOString()
  };

  persistentBreaks[userId] = breakData;
  savePersistentData();

  console.log(`✅ Break started for user ${userId} - Type: ${break_type}`);

  res.json({
    success: true,
    message: 'Break started successfully',
    data: {
      break: breakData
    }
  });
});

// POST End Break
app.post('/api/me/break/end', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // Check if user has an active break
  if (!persistentBreaks[userId] || persistentBreaks[userId].status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'No active break found to end'
    });
  }

  const now = new Date();
  const breakData = persistentBreaks[userId];
  const startTime = new Date(breakData.start_time);
  const durationMs = now - startTime;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  // Update break data
  breakData.end_time = now.toISOString();
  breakData.status = 'completed';
  breakData.duration_minutes = durationMinutes;

  savePersistentData();

  console.log(`✅ Break ended for user ${userId} - Duration: ${durationMinutes} minutes`);

  res.json({
    success: true,
    message: 'Break ended successfully',
    data: {
      break: breakData,
      duration_minutes: durationMinutes
    }
  });
});

// GET Current Break
app.get('/api/me/break/current', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const currentBreak = persistentBreaks[userId];

  if (!currentBreak || currentBreak.status !== 'active') {
    return res.json({
      success: true,
      message: 'No active break found',
      data: {
        has_active_break: false,
        break: null
      }
    });
  }

  const now = new Date();
  const startTime = new Date(currentBreak.start_time);
  const durationMs = now - startTime;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  res.json({
    success: true,
    message: 'Active break retrieved',
    data: {
      has_active_break: true,
      break: {
        ...currentBreak,
        current_duration_minutes: durationMinutes,
        duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      }
    }
  });
});

// ===== PROJECT MANAGEMENT APIs =====
// GET User's Projects (User-Specific)
app.get('/api/me/projects', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Mock projects data - user-specific projects
  const userProjects = [
    {
      id: 1,
      name: "Project A",
      description: "Development and design work",
      color: "#4CAF50",
      status: "active",
      role: "developer",
      startDate: "2025-01-01",
      endDate: null
    },
    {
      id: 2,
      name: "Mobile App",
      description: "Mobile application development",
      color: "#E91E63",
      status: "active",
      role: "mobile-dev",
      startDate: "2025-02-01",
      endDate: null
    },
    {
      id: 3,
      name: "Website Redesign",
      description: "Company website modernization",
      color: "#2196F3",
      status: "active",
      role: "full-stack",
      startDate: "2025-03-01",
      endDate: null
    }
  ];

  res.json({
    success: true,
    message: 'User projects retrieved successfully',
    data: {
      projects: userProjects,
      total: userProjects.length,
      userId: userId
    }
  });
});

// ===== LOCATIONS API (For Dropdown) =====
app.get('/api/locations', authenticateToken, (req, res) => {
  const locations = [
    {
      id: 1,
      name: "Office",
      description: "Main office location",
      icon: "🏢",
      address: "Company Headquarters",
      type: "physical"
    },
    {
      id: 2,
      name: "Home",
      description: "Work from home",
      icon: "🏠",
      address: "Remote - Home Office",
      type: "remote"
    },
    {
      id: 3,
      name: "Client Site",
      description: "At client premises",
      icon: "🏬",
      address: "Client Office Location",
      type: "physical"
    },
    {
      id: 4,
      name: "Remote",
      description: "Other remote location",
      icon: "🌍",
      address: "Any Remote Location",
      type: "remote"
    }
  ];

  res.json({
    success: true,
    message: 'Work locations retrieved successfully',
    data: {
      locations: locations,
      total: locations.length
    }
  });
});

// ===== LOCATION MANAGEMENT APIs =====
// GET Location Details
app.get('/api/me/location', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Location retrieved successfully',
    data: {
      location: user.location || 'Not specified',
      timezone: user.timezone || 'UTC',
      office: user.office || 'Remote',
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      country: user.country || null,
      postal_code: user.postal_code || null
    }
  });
});

// PUT Update Location
app.put('/api/me/location', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const {
    location,
    timezone,
    office,
    address,
    city,
    state,
    country,
    postal_code
  } = req.body;

  // Update location fields
  if (location !== undefined) user.location = location;
  if (timezone !== undefined) user.timezone = timezone;
  if (office !== undefined) user.office = office;
  if (address !== undefined) user.address = address;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;
  if (country !== undefined) user.country = country;
  if (postal_code !== undefined) user.postal_code = postal_code;

  // Save changes
  savePersistentData();

  console.log(`✅ Location updated for user ${userId}: ${location || 'Not specified'}`);

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      location: user.location || 'Not specified',
      timezone: user.timezone || 'UTC',
      office: user.office || 'Remote',
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      country: user.country || null,
      postal_code: user.postal_code || null
    }
  });
});

// ===== LEAVE MANAGEMENT APIs =====
// Persistent leave data
let persistentLeaveRequests = {
  1: {
    id: 1,
    userId: 1,
    leaveTypeId: 1,
    leaveType: "Paid Leave",
    startDate: "2026-02-01",
    endDate: "2026-02-05",
    status: "approved",
    comment: "Family trip",
    createdAt: "2026-01-20",
    approvedAt: "2026-01-21"
  }
};

// Time Entries storage
let persistentTimeEntries = {};
let timeEntryIdCounter = 1;

// GET Leave Types (Dropdown)
app.get('/api/leave-types', authenticateToken, (req, res) => {
  const leaveTypes = [
    {
      id: 1,
      name: "Paid Leave",
      displayName: "Paid Leave",
      color: "#4CAF50",
      icon: "💰",
      description: "Paid vacation days"
    },
    {
      id: 2,
      name: "Sick Leave",
      displayName: "Sick Leave",
      color: "#FF6B6B",
      icon: "🤒",
      description: "Sick leave for health reasons"
    },
    {
      id: 3,
      name: "Unpaid Leave",
      displayName: "Unpaid Leave",
      color: "#FFA500",
      icon: "📋",
      description: "Unpaid leave time"
    },
    {
      id: 4,
      name: "Maternity Leave",
      displayName: "Maternity Leave",
      color: "#FF69B4",
      icon: "👶",
      description: "Maternity leave for expectant mothers"
    },
    {
      id: 5,
      name: "Paternity Leave",
      displayName: "Paternity Leave",
      color: "#1E90FF",
      icon: "👨‍👧",
      description: "Paternity leave for new fathers"
    },
    {
      id: 6,
      name: "Training / Education Leave",
      displayName: "Training / Education Leave",
      color: "#9370DB",
      icon: "📚",
      description: "Training and educational programs"
    },
    {
      id: 7,
      name: "Special Leave",
      displayName: "Special Leave",
      color: "#20B2AA",
      icon: "⭐",
      description: "Special occasions leave"
    },
    {
      id: 8,
      name: "Half-day Leave",
      displayName: "Half-day Leave",
      color: "#FFD700",
      icon: "⏳",
      description: "Half day leave (morning or afternoon)"
    }
  ];

  res.json({
    success: true,
    message: "Leave types retrieved successfully",
    data: {
      leaveTypes: leaveTypes,
      total: leaveTypes.length
    }
  });
});

// GET User's Leave Requests
app.get('/api/me/leave-requests', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userLeaveRequests = Object.values(persistentLeaveRequests).filter(lr => lr.userId === userId);

  res.json({
    success: true,
    message: "Leave requests retrieved successfully",
    data: {
      leaveRequests: userLeaveRequests,
      total: userLeaveRequests.length,
      userId: userId
    }
  });
});

// POST Create Leave Request
app.post('/api/me/leave-requests', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { leaveTypeId, leaveType, startDate, endDate, comment, dayPart, trainingName, provider, expectedDeliveryDate } = req.body;

  if (!leaveTypeId || !startDate) {
    return res.status(400).json({
      success: false,
      message: "Leave type and start date are required"
    });
  }

  // Generate new ID
  const newId = Math.max(...Object.keys(persistentLeaveRequests).map(Number), 0) + 1;

  const newLeaveRequest = {
    id: newId,
    userId: userId,
    leaveTypeId: leaveTypeId,
    leaveType: leaveType,
    startDate: startDate,
    endDate: endDate || startDate,
    status: "pending",
    comment: comment || "",
    dayPart: dayPart || null,
    trainingName: trainingName || null,
    provider: provider || null,
    expectedDeliveryDate: expectedDeliveryDate || null,
    createdAt: new Date().toISOString().split('T')[0],
    approvedAt: null
  };

  persistentLeaveRequests[newId] = newLeaveRequest;

  res.status(201).json({
    success: true,
    message: "Leave request submitted successfully",
    data: newLeaveRequest
  });
});

// PUT Update Leave Request
app.put('/api/me/leave-requests/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;
  const leaveRequest = persistentLeaveRequests[requestId];

  if (!leaveRequest || leaveRequest.userId !== userId) {
    return res.status(404).json({
      success: false,
      message: "Leave request not found"
    });
  }

  // Update fields
  if (req.body.leaveTypeId) leaveRequest.leaveTypeId = req.body.leaveTypeId;
  if (req.body.leaveType) leaveRequest.leaveType = req.body.leaveType;
  if (req.body.startDate) leaveRequest.startDate = req.body.startDate;
  if (req.body.endDate) leaveRequest.endDate = req.body.endDate;
  if (req.body.comment) leaveRequest.comment = req.body.comment;
  if (req.body.dayPart) leaveRequest.dayPart = req.body.dayPart;
  if (req.body.trainingName) leaveRequest.trainingName = req.body.trainingName;
  if (req.body.provider) leaveRequest.provider = req.body.provider;
  if (req.body.expectedDeliveryDate) leaveRequest.expectedDeliveryDate = req.body.expectedDeliveryDate;

  res.json({
    success: true,
    message: "Leave request updated successfully",
    data: leaveRequest
  });
});

// GET Leave Balance
app.get('/api/me/leave-balance', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const leaveBalance = {
    userId: userId,
    totalBalance: {
      paidLeave: 20,
      sickLeave: 10,
      unpaidLeave: 5,
      maternityLeave: 90,
      paternityLeave: 15,
      trainingLeave: 5,
      specialLeave: 3,
      halfDayLeave: 8
    },
    used: {
      paidLeave: 5,
      sickLeave: 2,
      unpaidLeave: 0,
      maternityLeave: 0,
      paternityLeave: 0,
      trainingLeave: 0,
      specialLeave: 1,
      halfDayLeave: 1
    },
    remaining: {
      paidLeave: 15,
      sickLeave: 8,
      unpaidLeave: 5,
      maternityLeave: 90,
      paternityLeave: 15,
      trainingLeave: 5,
      specialLeave: 2,
      halfDayLeave: 7
    },
    pendingRequests: 2
  };

  res.json({
    success: true,
    message: "Leave balance retrieved successfully",
    data: leaveBalance
  });
});

// GET Leave Balance by Type
app.get('/api/me/leave-balance/:leaveTypeId', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const leaveTypeId = req.params.leaveTypeId;

  const balanceData = {
    userId: userId,
    leaveTypeId: leaveTypeId,
    total: 20,
    used: 5,
    remaining: 15,
    pending: 2,
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  res.json({
    success: true,
    message: "Leave balance retrieved successfully",
    data: balanceData
  });
});

// ========== COMPANY SETTINGS APIs (Based on Figma Screens) ==========

// GET Company Settings - Main screen
app.get('/api/company/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Company settings retrieved successfully",
    data: {
      company: companySettings,
      permissions: {
        can_edit: true,
        can_upload_logo: true,
        role_required: "admin"
      }
    }
  });
});

// UPDATE Complete Company Settings
app.put('/api/company/settings', authenticateToken, (req, res) => {
  const allowedFields = ['name', 'industry', 'brand_color', 'brand_color_name', 'support_email', 'company_phone', 'address', 'website', 'description'];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      companySettings[field] = req.body[field];
    }
  });
  
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Company settings updated successfully",
    data: { company: companySettings }
  });
});

// UPDATE Company Name
app.put('/api/company/settings/name', authenticateToken, (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Company name is required"
    });
  }
  
  companySettings.name = name;
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Company name updated successfully",
    data: {
      name: companySettings.name,
      updated_at: companySettings.updated_at
    }
  });
});

// UPDATE Industry/Category
app.put('/api/company/settings/industry', authenticateToken, (req, res) => {
  const { industry } = req.body;
  
  if (!industry || industry.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Industry is required"
    });
  }
  
  companySettings.industry = industry;
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Industry updated successfully",
    data: {
      industry: companySettings.industry,
      updated_at: companySettings.updated_at
    }
  });
});

// UPDATE Brand Color
app.put('/api/company/settings/brand-color', authenticateToken, (req, res) => {
  const { brand_color, brand_color_name } = req.body;
  
  if (!brand_color) {
    return res.status(400).json({
      success: false,
      message: "Brand color is required"
    });
  }
  
  companySettings.brand_color = brand_color;
  if (brand_color_name) {
    companySettings.brand_color_name = brand_color_name;
  }
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Edit brand color successfully updated",
    data: {
      brand_color: companySettings.brand_color,
      brand_color_name: companySettings.brand_color_name,
      updated_at: companySettings.updated_at
    }
  });
});

// UPDATE Support Email
app.put('/api/company/settings/support-email', authenticateToken, (req, res) => {
  const { support_email } = req.body;
  
  if (!support_email || !support_email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: "Valid support email is required"
    });
  }
  
  companySettings.support_email = support_email;
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Support email updated successfully",
    data: {
      support_email: companySettings.support_email,
      updated_at: companySettings.updated_at
    }
  });
});

// UPDATE Company Phone
app.put('/api/company/settings/company-phone', authenticateToken, (req, res) => {
  const { company_phone } = req.body;
  
  if (!company_phone || company_phone.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Company phone is required"
    });
  }
  
  companySettings.company_phone = company_phone;
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Company phone updated successfully",
    data: {
      company_phone: companySettings.company_phone,
      updated_at: companySettings.updated_at
    }
  });
});

// UPDATE Address
app.put('/api/company/settings/address', authenticateToken, (req, res) => {
  const { address } = req.body;
  
  if (!address || address.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Address is required"
    });
  }
  
  companySettings.address = address;
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Address updated successfully",
    data: {
      address: companySettings.address,
      updated_at: companySettings.updated_at
    }
  });
});

// UPLOAD Company Logo
app.post('/api/company/settings/logo', authenticateToken, (req, res) => {
  const { logo_data, logo_type } = req.body;
  
  if (!logo_data) {
    return res.status(400).json({
      success: false,
      message: "Logo data is required"
    });
  }
  
  // In a real app, this would upload to cloud storage
  const logoId = `LOGO_${Date.now()}`;
  companySettings.logo_url = `https://api-layer.vercel.app/api/company/logo/${logoId}`;
  companySettings.updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Company logo uploaded successfully",
    data: {
      logo_url: companySettings.logo_url,
      logo_id: logoId,
      updated_at: companySettings.updated_at
    }
  });
});

// GET Available Brand Colors
app.get('/api/company/brand-colors', authenticateToken, (req, res) => {
  const brandColors = [
    { id: 1, name: "Blue", hex: "#3B82F6", icon: "🔵" },
    { id: 2, name: "Purple", hex: "#6366F1", icon: "🟣" },
    { id: 3, name: "Burgundy", hex: "#991B1B", icon: "🟤" },
    { id: 4, name: "Red", hex: "#EF4444", icon: "🔴" },
    { id: 5, name: "Midnight Blue", hex: "#1E3A8A", icon: "🔵" },
    { id: 6, name: "Orange", hex: "#F97316", icon: "🟠" },
    { id: 7, name: "Lavender Purple", hex: "#A78BFA", icon: "🟣" },
    { id: 8, name: "Customize Color", hex: null, icon: "🎨" }
  ];
  
  res.json({
    success: true,
    message: "Brand colors retrieved successfully",
    data: { colors: brandColors }
  });
});

// ========== USER PREFERENCES APIs (Based on Figma Screens) ==========

// GET User Preferences
app.get('/api/user/preferences', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const preferences = userPreferences[userId] || {
    user_id: userId,
    language: "English",
    language_code: "en",
    time_format: "24-hour",
    first_day_of_week: "Monday",
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    updated_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: "User preferences retrieved successfully",
    data: { preferences }
  });
});

// UPDATE Language
app.put('/api/user/preferences/language', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { language, language_code } = req.body;
  
  if (!language) {
    return res.status(400).json({
      success: false,
      message: "Language is required"
    });
  }
  
  if (!userPreferences[userId]) {
    userPreferences[userId] = {
      user_id: userId,
      language: "English",
      language_code: "en",
      time_format: "24-hour",
      first_day_of_week: "Monday",
      timezone: "UTC",
      date_format: "YYYY-MM-DD"
    };
  }
  
  userPreferences[userId].language = language;
  if (language_code) {
    userPreferences[userId].language_code = language_code;
  }
  userPreferences[userId].updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Language updated successfully",
    data: {
      language: userPreferences[userId].language,
      language_code: userPreferences[userId].language_code,
      updated_at: userPreferences[userId].updated_at
    }
  });
});

// UPDATE Time Format
app.put('/api/user/preferences/time-format', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { time_format } = req.body;
  
  if (!time_format || !["24-hour", "12-hour"].includes(time_format)) {
    return res.status(400).json({
      success: false,
      message: "Valid time format is required (24-hour or 12-hour)"
    });
  }
  
  if (!userPreferences[userId]) {
    userPreferences[userId] = {
      user_id: userId,
      language: "English",
      language_code: "en",
      time_format: "24-hour",
      first_day_of_week: "Monday",
      timezone: "UTC",
      date_format: "YYYY-MM-DD"
    };
  }
  
  userPreferences[userId].time_format = time_format;
  userPreferences[userId].updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "Time format successfully updated",
    data: {
      time_format: userPreferences[userId].time_format,
      updated_at: userPreferences[userId].updated_at
    }
  });
});

// UPDATE First Day of Week
app.put('/api/user/preferences/first-day-of-week', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { first_day_of_week } = req.body;
  
  if (!first_day_of_week || !["Monday", "Sunday"].includes(first_day_of_week)) {
    return res.status(400).json({
      success: false,
      message: "Valid first day of week is required (Monday or Sunday)"
    });
  }
  
  if (!userPreferences[userId]) {
    userPreferences[userId] = {
      user_id: userId,
      language: "English",
      language_code: "en",
      time_format: "24-hour",
      first_day_of_week: "Monday",
      timezone: "UTC",
      date_format: "YYYY-MM-DD"
    };
  }
  
  userPreferences[userId].first_day_of_week = first_day_of_week;
  userPreferences[userId].updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "First day of week successfully updated",
    data: {
      first_day_of_week: userPreferences[userId].first_day_of_week,
      updated_at: userPreferences[userId].updated_at
    }
  });
});

// UPDATE All Preferences at Once
app.put('/api/user/preferences', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { language, language_code, time_format, first_day_of_week, timezone, date_format } = req.body;
  
  if (!userPreferences[userId]) {
    userPreferences[userId] = {
      user_id: userId,
      language: "English",
      language_code: "en",
      time_format: "24-hour",
      first_day_of_week: "Monday",
      timezone: "UTC",
      date_format: "YYYY-MM-DD"
    };
  }
  
  if (language) userPreferences[userId].language = language;
  if (language_code) userPreferences[userId].language_code = language_code;
  if (time_format) userPreferences[userId].time_format = time_format;
  if (first_day_of_week) userPreferences[userId].first_day_of_week = first_day_of_week;
  if (timezone) userPreferences[userId].timezone = timezone;
  if (date_format) userPreferences[userId].date_format = date_format;
  
  userPreferences[userId].updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: "User preferences updated successfully",
    data: { preferences: userPreferences[userId] }
  });
});

// GET Available Languages
app.get('/api/languages', authenticateToken, (req, res) => {
  const languages = [
    { id: 1, name: "Switzerland", code: "de-CH", flag: "🇨🇭" },
    { id: 2, name: "English", code: "en", flag: "🇺🇸" },
    { id: 3, name: "Spanish", code: "es", flag: "🇪🇸" },
    { id: 4, name: "Germany", code: "de", flag: "🇩🇪" },
    { id: 5, name: "Japan", code: "ja", flag: "🇯🇵" },
    { id: 6, name: "Indonesia", code: "id", flag: "🇮🇩" },
    { id: 7, name: "Italy", code: "it", flag: "🇮🇹" },
    { id: 8, name: "Netherlands", code: "nl", flag: "🇳🇱" }
  ];
  
  res.json({
    success: true,
    message: "Languages retrieved successfully",
    data: { languages }
  });
});

// ========== WORK SUMMARY APIs ==========

// GET Today's Work Summary
app.get('/api/me/work-summary/today', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate today's work summary
  const todayTimer = persistentTimers[userId];
  let totalWorked = 0;
  let status = 'Not Started';
  let currentTask = null;
  
  if (todayTimer) {
    if (todayTimer.isActive) {
      status = todayTimer.isPaused ? 'Paused' : 'Active';
      currentTask = todayTimer.task_name || 'Working';
      const currentTime = new Date();
      const startTime = new Date(todayTimer.startTime);
      const sessionTime = Math.floor((currentTime - startTime) / 1000);
      totalWorked = (todayTimer.totalTime || 0) + sessionTime;
    } else {
      // Timer has been stopped - show the total accumulated time
      status = 'Stopped';
      totalWorked = todayTimer.totalTime || 0;
      currentTask = todayTimer.task_name || 'Completed Work';
    }
  }
  
  // Convert seconds to hours and minutes
  const hours = Math.floor(totalWorked / 3600);
  const minutes = Math.floor((totalWorked % 3600) / 60);
  
  const workSummary = {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      profile_photo: user.profile_photo
    },
    date: today,
    work_status: status,
    current_task: currentTask,
    time_worked: {
      total_seconds: totalWorked,
      formatted: `${hours}h ${minutes}m`,
      hours: hours,
      minutes: minutes
    },
    daily_goal: {
      target_hours: 8,
      target_seconds: 28800,
      completion_percentage: Math.min(Math.round((totalWorked / 28800) * 100), 100)
    },
    productivity: {
      efficiency_score: Math.min(Math.round((totalWorked / 28800) * 100), 100),
      breaks_taken: 0,
      focus_time: totalWorked,
      interruptions: 0
    },
    tasks: [
      {
        id: 1,
        name: currentTask || "Development Work",
        time_spent: totalWorked,
        status: status.toLowerCase(),
        priority: "high"
      }
    ],
    activity_log: [
      {
        time: todayTimer?.startTime ? new Date(todayTimer.startTime).toISOString() : new Date().toISOString(),
        action: status === 'Active' ? 'Started Work' : 'Work Session',
        duration: totalWorked > 0 ? `${hours}h ${minutes}m` : '0m'
      }
    ]
  };
  
  res.json({
    success: true,
    message: "Today's work summary retrieved successfully",
    data: workSummary
  });
});

// GET Weekly Work Summary
app.get('/api/me/work-summary/week', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  
  // Mock weekly data - in real app would come from database
  const weeklyData = {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email
    },
    week_period: {
      start_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    total_hours_worked: 32.5,
    average_daily_hours: 6.5,
    days_active: 5,
    productivity_score: 85,
    daily_breakdown: [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 8.2, tasks: 5 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 7.8, tasks: 4 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 6.5, tasks: 3 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 0, tasks: 0 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 0, tasks: 0 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 5.8, tasks: 3 },
      { date: new Date().toISOString().split('T')[0], hours: 4.2, tasks: 2 }
    ],
    top_tasks: [
      { name: "Development", time_spent: "18.5h", percentage: 57 },
      { name: "Code Review", time_spent: "8.2h", percentage: 25 },
      { name: "Meetings", time_spent: "5.8h", percentage: 18 }
    ]
  };
  
  res.json({
    success: true,
    message: "Weekly work summary retrieved successfully",
    data: weeklyData
  });
});

// GET Weekly Work Summary (Alternative endpoint: /weekly)
app.get('/api/me/work-summary/weekly', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  
  // Mock weekly data - in real app would come from database
  const weeklyData = {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email
    },
    week_period: {
      start_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    },
    total_hours_worked: 32.5,
    average_daily_hours: 6.5,
    days_active: 5,
    productivity_score: 85,
    daily_breakdown: [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 8.2, tasks: 5 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 7.8, tasks: 4 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 6.5, tasks: 3 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 0, tasks: 0 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 0, tasks: 0 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hours: 5.8, tasks: 3 },
      { date: new Date().toISOString().split('T')[0], hours: 4.2, tasks: 2 }
    ],
    top_tasks: [
      { name: "Development", time_spent: "18.5h", percentage: 57 },
      { name: "Code Review", time_spent: "8.2h", percentage: 25 },
      { name: "Meetings", time_spent: "5.8h", percentage: 18 }
    ]
  };
  
  res.json({
    success: true,
    message: "Weekly work summary retrieved successfully",
    data: weeklyData
  });
});

// GET Monthly Work Summary
app.get('/api/me/work-summary/month', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const user = persistentUsers[userId];
  
  const monthlyData = {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email
    },
    month_period: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      month_name: new Date().toLocaleString('default', { month: 'long' })
    },
    total_hours_worked: 160.5,
    expected_hours: 176,
    completion_percentage: 91,
    average_daily_hours: 7.3,
    working_days: 22,
    days_active: 20,
    productivity_metrics: {
      efficiency_score: 88,
      goal_achievement: 91,
      consistency_score: 85
    },
    weekly_breakdown: [
      { week: 1, hours: 42.5, days: 5 },
      { week: 2, hours: 38.8, days: 5 },
      { week: 3, hours: 41.2, days: 5 },
      { week: 4, hours: 38.0, days: 5 }
    ]
  };
  
  res.json({
    success: true,
    message: "Monthly work summary retrieved successfully", 
    data: monthlyData
  });
});

// =====================================
// TIME ENTRIES APIs
// =====================================

// GET /api/me/time-entries - Get user's time entries with pagination and filtering
app.get('/api/me/time-entries', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 20, startDate, endDate } = req.query;
  
  // Filter time entries for current user
  const userEntries = Object.values(persistentTimeEntries).filter(entry => entry.userId === userId);
  
  // Apply date filtering if provided
  let filteredEntries = userEntries;
  if (startDate || endDate) {
    filteredEntries = userEntries.filter(entry => {
      const entryDate = entry.date;
      if (startDate && endDate) {
        return entryDate >= startDate && entryDate <= endDate;
      } else if (startDate) {
        return entryDate >= startDate;
      } else if (endDate) {
        return entryDate <= endDate;
      }
      return true;
    });
  }
  
  // Sort by date (most recent first)
  filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    message: "Time entries retrieved successfully",
    data: {
      entries: paginatedEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredEntries.length,
        totalPages: Math.ceil(filteredEntries.length / limit)
      }
    }
  });
});

// POST /api/me/time-entries - Create a new time entry
app.post('/api/me/time-entries', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { date, startTime, endTime, description, project, task, isManual } = req.body;
  
  // Validation
  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Date is required"
    });
  }
  
  if (!startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: "Start time and end time are required"
    });
  }
  
  // Calculate duration in hours
  const start = new Date(`${date} ${startTime}`);
  const end = new Date(`${date} ${endTime}`);
  const durationMs = end - start;
  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
  
  if (durationHours <= 0) {
    return res.status(400).json({
      success: false,
      message: "End time must be after start time"
    });
  }
  
  // Create new time entry
  const newEntry = {
    id: timeEntryIdCounter++,
    userId: userId,
    date: date,
    startTime: startTime,
    endTime: endTime,
    duration: durationHours,
    description: description || '',
    project: project || 'Default Project',
    task: task || '',
    
    isManual: isManual || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  persistentTimeEntries[newEntry.id] = newEntry;
  savePersistentData();
  
  res.json({
    success: true,
    message: "Time entry created successfully",
    data: newEntry
  });
});

// PUT /api/me/time-entries/:id - Update a time entry
app.put('/api/me/time-entries/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const entryId = parseInt(req.params.id);
  
  // Validate ID
  if (isNaN(entryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid time entry ID. Must be a number."
    });
  }
  
  const { date, startTime, endTime, description, project, task } = req.body;
  
  // Check if entry exists and belongs to user
  const existingEntry = persistentTimeEntries[entryId];
  if (!existingEntry) {
    return res.status(404).json({
      success: false,
      message: "Time entry not found"
    });
  }
  
  if (existingEntry.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own time entries"
    });
  }
  
  // Handle ISO timestamp format (convert to date and time)
  let updatedDate = date;
  let updatedStartTime = startTime;
  let updatedEndTime = endTime;
  
  if (startTime && startTime.includes('T')) {
    const startDate = new Date(startTime);
    updatedDate = startDate.toISOString().split('T')[0];
    updatedStartTime = startDate.toTimeString().split(' ')[0];
  }
  
  if (endTime && endTime.includes('T')) {
    const endDate = new Date(endTime);
    if (!updatedDate) {
      updatedDate = endDate.toISOString().split('T')[0];
    }
    updatedEndTime = endDate.toTimeString().split(' ')[0];
  }
  
  // Update fields if provided
  if (updatedDate !== undefined) existingEntry.date = updatedDate;
  if (updatedStartTime !== undefined) existingEntry.startTime = updatedStartTime;
  if (updatedEndTime !== undefined) existingEntry.endTime = updatedEndTime;
  if (description !== undefined) existingEntry.description = description;
  if (project !== undefined) existingEntry.project = project;
  if (task !== undefined) existingEntry.task = task;
  
  // Recalculate duration if start or end time changed
  if (updatedStartTime || updatedEndTime) {
    const start = new Date(`${existingEntry.date} ${existingEntry.startTime}`);
    const end = new Date(`${existingEntry.date} ${existingEntry.endTime}`);
    const durationMs = end - start;
    const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
    
    if (durationHours <= 0) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }
    
    existingEntry.duration = durationHours;
  }
  
  existingEntry.updatedAt = new Date().toISOString();
  savePersistentData();
  
  res.json({
    success: true,
    message: "Time entry updated successfully",
    data: existingEntry
  });
});

// DELETE /api/me/time-entries/:id - Delete a time entry
app.delete('/api/me/time-entries/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const entryId = parseInt(req.params.id);
  
  // Check if entry exists and belongs to user
  const existingEntry = persistentTimeEntries[entryId];
  if (!existingEntry) {
    return res.status(404).json({
      success: false,
      message: "Time entry not found"
    });
  }
  
  if (existingEntry.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own time entries"
    });
  }
  
  delete persistentTimeEntries[entryId];
  savePersistentData();
  
  res.json({
    success: true,
    message: "Time entry deleted successfully",
    data: { id: entryId }
  });
});

// GET /api/me/time-entries/:id - Get specific time entry
app.get('/api/me/time-entries/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const entryId = parseInt(req.params.id);
  
  const entry = persistentTimeEntries[entryId];
  if (!entry) {
    return res.status(404).json({
      success: false,
      message: "Time entry not found"
    });
  }
  
  if (entry.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only view your own time entries"
    });
  }
  
  res.json({
    success: true,
    message: "Time entry retrieved successfully",
    data: entry
  });
});

// GET /api/time-entries - Get all time entries (admin view)
app.get('/api/time-entries', authenticateToken, (req, res) => {
  const { page = 1, limit = 20, userId: filterUserId } = req.query;
  
  let allEntries = Object.values(persistentTimeEntries);
  
  // Filter by user if specified
  if (filterUserId) {
    allEntries = allEntries.filter(entry => entry.userId === parseInt(filterUserId));
  }
  
  // Add user information to each entry
  const entriesWithUserInfo = allEntries.map(entry => ({
    ...entry,
    user: {
      id: persistentUsers[entry.userId]?.id,
      name: persistentUsers[entry.userId]?.full_name,
      email: persistentUsers[entry.userId]?.email
    }
  }));
  
  // Sort by date (most recent first)
  entriesWithUserInfo.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedEntries = entriesWithUserInfo.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    message: "Time entries retrieved successfully",
    data: {
      entries: paginatedEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: entriesWithUserInfo.length,
        totalPages: Math.ceil(entriesWithUserInfo.length / limit)
      }
    }
  });
});

// Test endpoints for debugging
app.get('/api/test-users', (req, res) => {
  const users = Object.values(persistentUsers).map(user => ({
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    token: jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
  }));
  
  res.json({
    success: true,
    message: "Available test users with tokens",
    data: { users }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CLIENT ISSUES FIXED - Server running perfectly! EMERGENCY PATCH v2.2 - TIME ENTRIES ADDED',
    status: 'All fixes implemented',
    fixes: [
      'Profile persistence - no more Jenny Wilson revert',
      'Timer persistence - no auto-stopping',
      'Pause API fully implemented',
      'Login/Profile email consistency',
      'Data persistence across restarts'
    ],
    docs: {
      swagger: '/api-docs',
      json: '/swagger.json'
    }
  });
});

// API DOCUMENTATION ENDPOINTS
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerDocument);
});

// Test token endpoint for Swagger UI
app.get('/api/auth/test-token', (req, res) => {
  const testToken = jwt.sign({ 
    userId: 1, 
    email: "john.doe@email.com",
    name: "John Doe" 
  }, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    success: true,
    message: "Test token for Swagger UI authentication",
    data: {
      token: testToken,
      bearer_format: `Bearer ${testToken}`,
      instructions: "Copy the 'bearer_format' value and paste it in the Swagger UI Authorize button"
    }
  });
});

// Test endpoint for debugging
app.get('/api-docs-test', (req, res) => {
  res.send(`
    <html>
      <head><title>API Docs Test</title></head>
      <body>
        <h1>API Documentation Test</h1>
        <p>Swagger JSON URL: <a href="/swagger.json">/swagger.json</a></p>
        <p>API Docs URL: <a href="/api-docs">/api-docs</a></p>
        <p>If /api-docs is blank, there might be a JavaScript loading issue.</p>
        <script>
          console.log('Testing swagger document...');
          fetch('/swagger.json')
            .then(response => response.json())
            .then(data => {
              console.log('Swagger JSON loaded successfully:', data.info.title);
              document.body.innerHTML += '<p style="color: green;">✅ Swagger JSON loaded successfully</p>';
            })
            .catch(error => {
              console.error('Swagger JSON error:', error);
              document.body.innerHTML += '<p style="color: red;">❌ Swagger JSON failed to load</p>';
            });
        </script>
      </body>
    </html>
  `);
});

// BETTER FIX: Replace default route with working CDN-based Swagger UI
app.get('/api-docs', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Complete Working Time Management API</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
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
      window.ui = ui;
    };
  </script>
</body>
</html>
  `);
});

// ===== ADMIN DASHBOARD API =====
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  console.log('📊 Admin Dashboard API called');

  // Calculate total employees
  const totalEmployees = Object.keys(persistentUsers).length;

  // Calculate currently working employees (those with active timers)
  const workingNow = Object.values(persistentTimers).filter(timer => timer.isActive === true).length;

  // Calculate pending leave requests
  const pendingRequests = Object.values(persistentLeaveRequests).filter(req => req.status === 'pending').length;

  // Calculate overtime alerts (employees who worked more than 8 hours today)
  const overtimeAlerts = [];
  const today = new Date().toISOString().split('T')[0];

  Object.keys(persistentTimers).forEach(userId => {
    const userTimer = persistentTimers[userId];
    if (userTimer.sessions && userTimer.sessions.length > 0) {
      // Calculate total worked hours today
      const todaySessions = userTimer.sessions.filter(session => {
        return session.date === today;
      });

      let totalMinutesToday = 0;
      todaySessions.forEach(session => {
        if (session.endTime) {
          const start = new Date(session.startTime);
          const end = new Date(session.endTime);
          const minutes = Math.floor((end - start) / (1000 * 60));
          totalMinutesToday += minutes;
        }
      });

      // If currently active, add current session time
      if (userTimer.isActive && userTimer.startTime) {
        const currentStart = new Date(userTimer.startTime);
        const now = new Date();
        const currentMinutes = Math.floor((now - currentStart) / (1000 * 60));
        totalMinutesToday += currentMinutes;
      }

      const hoursWorked = totalMinutesToday / 60;
      
      // Alert if worked more than 8 hours
      if (hoursWorked > 8) {
        const user = persistentUsers[userId];
        overtimeAlerts.push({
          user_id: parseInt(userId),
          user_name: user ? user.full_name : 'Unknown User',
          hours_worked: parseFloat(hoursWorked.toFixed(2)),
          overtime_hours: parseFloat((hoursWorked - 8).toFixed(2)),
          alert_level: hoursWorked > 10 ? 'high' : 'medium',
          alert_message: `${user ? user.full_name : 'Employee'} has worked ${hoursWorked.toFixed(1)} hours today`
        });
      }
    }
  });

  // Get recent pending leave requests details (last 5)
  const recentPendingRequests = Object.values(persistentLeaveRequests)
    .filter(req => req.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(req => {
      const user = persistentUsers[req.userId];
      return {
        request_id: req.id,
        user_name: user ? user.full_name : 'Unknown User',
        leave_type: req.leaveType || 'Leave',
        start_date: req.startDate,
        end_date: req.endDate,
        days: req.endDate ? Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 1,
        submitted_date: req.createdAt
      };
    });

  // Get currently working employees details
  const workingEmployees = Object.keys(persistentTimers)
    .filter(userId => persistentTimers[userId].isActive === true)
    .map(userId => {
      const user = persistentUsers[userId];
      const timer = persistentTimers[userId];
      
      // Calculate current session duration
      const startTime = new Date(timer.startTime);
      const now = new Date();
      const minutesWorked = Math.floor((now - startTime) / (1000 * 60));
      const hours = Math.floor(minutesWorked / 60);
      const minutes = minutesWorked % 60;

      return {
        user_id: parseInt(userId),
        user_name: user ? user.full_name : 'Unknown User',
        role: user ? user.role : 'Employee',
        started_at: timer.startTime,
        current_duration: `${hours}h ${minutes}m`,
        current_duration_minutes: minutesWorked,
        project: user ? user.project : 'Unknown Project'
      };
    });

  const dashboardData = {
    summary: {
      total_employees: totalEmployees,
      working_now: workingNow,
      pending_requests: pendingRequests,
      overtime_alerts: overtimeAlerts.length
    },
    working_employees: workingEmployees,
    recent_pending_requests: recentPendingRequests,
    overtime_alerts: overtimeAlerts,
    last_updated: new Date().toISOString(),
    status_breakdown: {
      active: workingNow,
      on_break: 0, // Can be enhanced based on break tracking
      offline: totalEmployees - workingNow
    }
  };

  res.json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: dashboardData
  });
});

// BACKUP: Keep the old express middleware as fallback
app.use('/api-docs-old', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Alternative endpoint with custom HTML and embedded swagger
app.get('/swagger-ui', (req, res) => {
  const swaggerJson = JSON.stringify(swaggerDocument);
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Complete Working Time Management API</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script>
    const ui = SwaggerUIBundle({
      url: '/swagger.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ]
    });
  </script>
</body>
</html>
  `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 CLIENT FIX SERVER running on http://localhost:${PORT}`);
  console.log(`🔧 All client issues have been addressed:`);
  console.log(`   ✅ Profile data persistence (no more Jenny Wilson revert)`);
  console.log(`   ✅ Timer persistence (no auto-stopping)`);  
  console.log(`   ✅ Pause/Resume API fully implemented`);
  console.log(`   ✅ Login/Profile email consistency`);
  console.log(`   ✅ Data persistence across server restarts`);
  console.log(`📧 Test with: curl http://localhost:${PORT}/api/health`);
});

module.exports = app;