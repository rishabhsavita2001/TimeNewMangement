// Test the live Vercel API with correct endpoints
const https = require('https');

const BASE_URL = 'api-layer.vercel.app';

const inviteEmployeeData = JSON.stringify({
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
});

let authToken = '';

function testLogin() {
  console.log('🔑 Testing login with correct endpoint...');
  
  const loginData = JSON.stringify({
    email: 'admin@company.com',
    password: 'password123',
    tenantName: 'TechCorp'
  });
  
  const req = https.request({
    hostname: BASE_URL,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, (res) => {
    console.log('Login Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      try {
        const response = JSON.parse(chunk);
        console.log('Login Response:', response);
        
        if (response.success) {
          authToken = response.data.token;
          console.log('✅ Login successful!');
          testInviteAPI();
        } else {
          console.log('❌ Login failed:', response.message);
          testWithoutAuth();
        }
      } catch (e) {
        console.log('❌ Error parsing login response:', e);
        console.log('Raw response:', chunk);
        testWithoutAuth();
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Login request error:', e);
    testWithoutAuth();
  });
  
  req.write(loginData);
  req.end();
}

function testWithoutAuth() {
  console.log('🧪 Testing Invite Employee API without auth (checking if endpoint exists)...');
  
  const req = https.request({
    hostname: BASE_URL,
    path: '/api/employees/invite',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(inviteEmployeeData)
    }
  }, (res) => {
    console.log('Invite API Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      try {
        const response = JSON.parse(chunk);
        if (res.statusCode === 401) {
          console.log('✅ Invite Employee API endpoint exists (requires auth)');
        } else if (res.statusCode === 404) {
          console.log('❌ Invite Employee API endpoint not found');
          console.log('The API needs to be deployed');
        } else {
          console.log('📧 Response:', response);
        }
      } catch (e) {
        console.log('❌ Error parsing response:', e);
        console.log('Raw response:', chunk);
      }
      testSupportingAPIsWithoutAuth();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Invite API request error:', e);
  });

  req.write(inviteEmployeeData);
  req.end();
}

function testInviteAPI() {
  console.log('🧪 Testing Invite Employee API with auth...');
  
  const req = https.request({
    hostname: BASE_URL,
    path: '/api/employees/invite',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(inviteEmployeeData),
      'Authorization': `Bearer ${authToken}`
    }
  }, (res) => {
    console.log('Invite API Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      try {
        const response = JSON.parse(chunk);
        if (res.statusCode === 201) {
          console.log('✅ Invite Employee API working perfectly!');
          console.log('📧 Success Response:', response);
        } else {
          console.log('❌ Invite API failed:', response);
        }
      } catch (e) {
        console.log('❌ Error parsing invite response:', e);
        console.log('Raw response:', chunk);
      }
      testSupportingAPIs();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Invite API request error:', e);
  });

  req.write(inviteEmployeeData);
  req.end();
}

function testSupportingAPIsWithoutAuth() {
  console.log('🧪 Testing supporting APIs endpoints...');
  
  // Test Roles API
  const rolesReq = https.request({
    hostname: BASE_URL,
    path: '/api/employees/roles',
    method: 'GET'
  }, (res) => {
    console.log('Roles API Status:', res.statusCode);
    if (res.statusCode === 404) {
      console.log('❌ Roles API endpoint not found - needs deployment');
    } else if (res.statusCode === 401) {
      console.log('✅ Roles API endpoint exists (requires auth)');
    } else {
      console.log('✅ Roles API accessible');
    }
  });

  rolesReq.on('error', (e) => {
    console.error('❌ Roles API error:', e);
  });

  rolesReq.end();
}

function testSupportingAPIs() {
  console.log('🧪 Testing supporting APIs with auth...');
  
  // Test Roles API
  const rolesReq = https.request({
    hostname: BASE_URL,
    path: '/api/employees/roles',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  }, (res) => {
    console.log('Roles API Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      if (res.statusCode === 200) {
        console.log('✅ Roles API working');
        try {
          const response = JSON.parse(chunk);
          console.log('Roles count:', response.data?.length || 0);
        } catch (e) {
          console.log('Response received');
        }
      } else {
        console.log('❌ Roles API failed');
      }
    });
  });

  rolesReq.on('error', (e) => {
    console.error('❌ Roles API error:', e);
  });

  rolesReq.end();
  
  // Test Departments API
  setTimeout(() => {
    const deptReq = https.request({
      hostname: BASE_URL,
      path: '/api/employees/departments',
      method: 'GET', 
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }, (res) => {
      console.log('Departments API Status:', res.statusCode);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (res.statusCode === 200) {
          console.log('✅ Departments API working');
          try {
            const response = JSON.parse(chunk);
            console.log('Departments count:', response.data?.length || 0);
          } catch (e) {
            console.log('Response received');
          }
        } else {
          console.log('❌ Departments API failed');
        }
      });
    });

    deptReq.on('error', (e) => {
      console.error('❌ Departments API error:', e);
    });

    deptReq.end();
  }, 500);
  
  // Test Working Models API
  setTimeout(() => {
    const modelsReq = https.request({
      hostname: BASE_URL,
      path: '/api/employees/working-models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }, (res) => {
      console.log('Working Models API Status:', res.statusCode);
      res.setEncoding('utf8'); 
      res.on('data', (chunk) => {
        if (res.statusCode === 200) {
          console.log('✅ Working Models API working');
          try {
            const response = JSON.parse(chunk);
            console.log('Working models count:', response.data?.length || 0);
          } catch (e) {
            console.log('Response received');
          }
          console.log('🎉 All Invite Employee APIs tested!');
        } else {
          console.log('❌ Working Models API failed');
        }
      });
    });

    modelsReq.on('error', (e) => {
      console.error('❌ Working Models API error:', e);
    });

    modelsReq.end();
  }, 1000);
}

console.log('🚀 Testing Live Invite Employee API...');
console.log('🌐 URL: https://' + BASE_URL);
console.log('📋 Testing Figma UI "Invite Employee" functionality');
console.log('=' .repeat(60));

testLogin();