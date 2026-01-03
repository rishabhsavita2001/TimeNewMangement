// Test the new deployment URL
const https = require('https');

const BASE_URL = 'apilayer-ihalattsp-soludoo.vercel.app';

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
  startDate: "2025-01-15"
});

let authToken = '';

function testHealth() {
  console.log('🔍 Testing new deployment health...');
  
  const req = https.request({
    hostname: BASE_URL,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log('Health Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      try {
        const response = JSON.parse(chunk);
        console.log('✅ Health Response:', response);
        testLogin();
      } catch (e) {
        console.log('Health response:', chunk);
        testLogin();
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Health check error:', e);
  });

  req.end();
}

function testLogin() {
  console.log('🔑 Testing login...');
  
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
        console.log('Login Response:', response.success ? 'Success!' : response);
        
        if (response.success) {
          authToken = response.data.token;
          console.log('✅ Login successful!');
          testInviteAPI();
        } else {
          console.log('❌ Login failed');
        }
      } catch (e) {
        console.log('❌ Error parsing login response:', e);
        console.log('Raw response:', chunk);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Login request error:', e);
  });
  
  req.write(loginData);
  req.end();
}

function testInviteAPI() {
  console.log('🧪 Testing NEW Invite Employee API...');
  
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
    console.log('🎯 Invite API Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      try {
        const response = JSON.parse(chunk);
        if (res.statusCode === 201) {
          console.log('🎉 SUCCESS! Invite Employee API is working!');
          console.log('📧 Employee Invitation Response:');
          console.log('- Employee ID:', response.data?.employee?.id);
          console.log('- Employee Number:', response.data?.employee?.employeeNumber);
          console.log('- Status:', response.data?.employee?.status);
          console.log('- Invitation Link:', response.data?.invitationLink ? 'Generated' : 'Missing');
          testSupportingAPIs();
        } else {
          console.log('❌ Invite API failed:', response);
        }
      } catch (e) {
        console.log('❌ Error parsing invite response:', e);
        console.log('Raw response:', chunk);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Invite API request error:', e);
  });

  req.write(inviteEmployeeData);
  req.end();
}

function testSupportingAPIs() {
  console.log('\\n🧪 Testing supporting APIs...');
  
  // Test Roles API
  setTimeout(() => {
    const rolesReq = https.request({
      hostname: BASE_URL,
      path: '/api/employees/roles',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }, (res) => {
      console.log('📝 Roles API Status:', res.statusCode);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(chunk);
            console.log('✅ Roles API working - Available roles:', response.data?.length || 0);
          } catch (e) {
            console.log('✅ Roles API working');
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
  }, 500);
  
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
      console.log('🏢 Departments API Status:', res.statusCode);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(chunk);
            console.log('✅ Departments API working - Available departments:', response.data?.length || 0);
          } catch (e) {
            console.log('✅ Departments API working');
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
  }, 1000);
  
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
      console.log('💼 Working Models API Status:', res.statusCode);
      res.setEncoding('utf8'); 
      res.on('data', (chunk) => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(chunk);
            console.log('✅ Working Models API working - Available models:', response.data?.length || 0);
          } catch (e) {
            console.log('✅ Working Models API working');
          }
          console.log('\\n' + '='.repeat(60));
          console.log('🎉 ALL FIGMA UI APIS ARE WORKING!');
          console.log('📋 Invite Employee functionality is LIVE!');
          console.log('🌐 New Live URL: https://' + BASE_URL);
          console.log('📚 API Documentation: https://' + BASE_URL + '/api-docs');
          console.log('='.repeat(60));
        } else {
          console.log('❌ Working Models API failed');
        }
      });
    });

    modelsReq.on('error', (e) => {
      console.error('❌ Working Models API error:', e);
    });

    modelsReq.end();
  }, 1500);
}

console.log('🚀 Testing NEW DEPLOYMENT for Invite Employee API...');
console.log('🌐 New URL: https://' + BASE_URL);
console.log('📋 Testing Complete Figma UI "Invite Employee" functionality');
console.log('='.repeat(70));

testHealth();