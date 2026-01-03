// Separate file for invite employee APIs
const express = require('express');

// Mock authentication middleware for testing
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
    lastName: 'Doe'
  };
  
  next();
};

function setupInviteEmployeeAPIs(app) {
  
  // Invite Employee API - Main Figma UI endpoint
  app.post('/api/employees/invite', authenticateToken, (req, res) => {
    console.log('📧 Invite Employee API called');
    
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

    // Validation
    if (!firstName || !lastName || !email || !role || !department || !workingHours || !workingModel || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: firstName, lastName, email, role, department, workingHours, workingModel, startDate",
        data: null
      });
    }

    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: null
      });
    }

    const employeeNumber = `EMP-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newEmployee = {
      id: Math.floor(Math.random() * 1000) + 100,
      employeeNumber,
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
      status: "Invited",
      invitationToken,
      invitationSent: new Date().toISOString(),
      dateJoined: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const invitationLink = `https://api-layer.vercel.app/accept-invitation?token=${invitationToken}`;

    res.status(201).json({
      success: true,
      message: "Employee invitation sent successfully",
      data: {
        employee: newEmployee,
        invitationLink: invitationLink,
        message: `Invitation email sent to ${email}. Employee will receive setup instructions.`
      }
    });
  });

  // Get Available Roles API
  app.get('/api/employees/roles', authenticateToken, (req, res) => {
    console.log('🔧 Roles API called');
    
    const roles = [
      { id: 1, name: "Employee", description: "Standard employee role" },
      { id: 2, name: "Team Lead", description: "Team leadership role" },
      { id: 3, name: "Manager", description: "Department manager" },
      { id: 4, name: "Senior Manager", description: "Senior management role" },
      { id: 5, name: "Director", description: "Director level" },
      { id: 6, name: "Admin", description: "System administrator" },
      { id: 7, name: "HR", description: "Human Resources" },
      { id: 8, name: "Developer", description: "Software developer" },
      { id: 9, name: "Designer", description: "UI/UX Designer" },
      { id: 10, name: "Analyst", description: "Business analyst" }
    ];

    res.json({
      success: true,
      message: "Available roles retrieved successfully",
      data: roles
    });
  });

  // Get Available Departments API
  app.get('/api/employees/departments', authenticateToken, (req, res) => {
    console.log('🏢 Departments API called');
    
    const departments = [
      { id: 1, name: "Engineering", employeeCount: 15, description: "Software development and engineering" },
      { id: 2, name: "Human Resources", employeeCount: 5, description: "HR operations and talent management" },
      { id: 3, name: "Marketing", employeeCount: 8, description: "Marketing and brand management" },
      { id: 4, name: "Sales", employeeCount: 12, description: "Sales and business development" },
      { id: 5, name: "Finance", employeeCount: 6, description: "Financial operations and accounting" },
      { id: 6, name: "Operations", employeeCount: 10, description: "Business operations and logistics" },
      { id: 7, name: "Design", employeeCount: 4, description: "UI/UX and graphic design" },
      { id: 8, name: "Product", employeeCount: 7, description: "Product management and strategy" },
      { id: 9, name: "Customer Support", employeeCount: 9, description: "Customer service and support" },
      { id: 10, name: "Legal", employeeCount: 3, description: "Legal affairs and compliance" }
    ];

    res.json({
      success: true,
      message: "Departments retrieved successfully",
      data: departments
    });
  });

  // Get Available Working Models API
  app.get('/api/employees/working-models', authenticateToken, (req, res) => {
    console.log('💼 Working Models API called');
    
    const workingModels = [
      { id: 1, name: "Office", description: "Full-time office work" },
      { id: 2, name: "Remote", description: "Full-time remote work" },
      { id: 3, name: "Hybrid", description: "Mix of office and remote work" },
      { id: 4, name: "Flexible", description: "Flexible working arrangements" },
      { id: 5, name: "Contract", description: "Contract-based work" },
      { id: 6, name: "Part-time", description: "Part-time employment" }
    ];

    res.json({
      success: true,
      message: "Working models retrieved successfully",
      data: workingModels
    });
  });

  console.log('🎨 Invite Employee APIs setup complete');
}

module.exports = { setupInviteEmployeeAPIs };