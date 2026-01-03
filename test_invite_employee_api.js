// Test script for Invite Employee API functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data matching Figma UI
const inviteEmployeeData = {
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@company.com",
  phone: "+1234567890",
  dateOfBirth: "1990-05-15",
  address: "123 Main Street, New York, NY 10001",
  role: "Developer",
  department: "Engineering", 
  manager: "Jane Smith",
  workingHours: "09:00 - 05:00 PM",
  workingModel: "Hybrid",
  startDate: "2025-01-15",
  profilePhoto: "https://example.com/profile.jpg"
};

let authToken = '';

async function login() {
  try {
    console.log('🔑 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: 'admin@company.com',
      password: 'password123',
      tenantName: 'TechCorp'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInviteEmployeeAPI() {
  try {
    console.log('\n🧪 Testing Invite Employee API...');
    const response = await axios.post(`${BASE_URL}/api/employees/invite`, inviteEmployeeData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Invite Employee API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Invite Employee API failed:');
    console.log(error.response?.data || error.message);
    return false;
  }
}

async function testGetRoles() {
  try {
    console.log('\n🧪 Testing Get Roles API...');
    const response = await axios.get(`${BASE_URL}/api/employees/roles`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Roles API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Roles API failed:');
    console.log(error.response?.data || error.message);
    return false;
  }
}

async function testGetDepartments() {
  try {
    console.log('\n🧪 Testing Get Departments API...');
    const response = await axios.get(`${BASE_URL}/api/employees/departments`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Departments API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Departments API failed:');
    console.log(error.response?.data || error.message);
    return false;
  }
}

async function testGetWorkingModels() {
  try {
    console.log('\n🧪 Testing Get Working Models API...');
    const response = await axios.get(`${BASE_URL}/api/employees/working-models`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Working Models API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Working Models API failed:');
    console.log(error.response?.data || error.message);
    return false;
  }
}

async function testAcceptInvitation() {
  try {
    console.log('\n🧪 Testing Accept Invitation API...');
    const response = await axios.post(`${BASE_URL}/api/employees/accept-invitation`, {
      token: 'sample_invitation_token',
      password: 'newemployee123'
    });

    console.log('✅ Accept Invitation API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Accept Invitation API failed:');
    console.log(error.response?.data || error.message);
    return false;
  }
}

async function testValidationErrors() {
  try {
    console.log('\n🧪 Testing Validation Errors...');
    
    // Test with missing required fields
    const response = await axios.post(`${BASE_URL}/api/employees/invite`, {
      firstName: "John"
      // Missing required fields
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('❌ Validation should have failed');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working correctly:');
      console.log(JSON.stringify(error.response.data, null, 2));
      return true;
    }
    console.log('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Invite Employee API Tests...');
  console.log('=' .repeat(50));

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Run all tests
  const tests = [
    testGetRoles,
    testGetDepartments,  
    testGetWorkingModels,
    testInviteEmployeeAPI,
    testValidationErrors,
    testAcceptInvitation
  ];

  let passedTests = 0;
  const totalTests = tests.length;

  for (const test of tests) {
    const result = await test();
    if (result) passedTests++;
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Invite Employee API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);