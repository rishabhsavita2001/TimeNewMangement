// Simple test to check if server is working
const http = require('http');

const postData = JSON.stringify({
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@company.com",
  role: "Developer",
  department: "Engineering", 
  workingHours: "09:00 - 05:00 PM",
  workingModel: "Hybrid",
  startDate: "2025-01-15"
});

// First test health check
const healthCheck = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET'
}, (res) => {
  console.log('Health Check Status:', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log('Health Response:', chunk);
    
    // If health check works, test login
    testLogin();
  });
});

function testLogin() {
  const loginData = JSON.stringify({
    email: 'admin@company.com',
    password: 'password123',
    tenantName: 'TechCorp'
  });
  
  const loginReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, (res) => {
    console.log('Login Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log('Login Response:', chunk);
      
      try {
        const response = JSON.parse(chunk);
        if (response.success) {
          testInviteAPI(response.data.token);
        } else {
          console.log('Login failed');
        }
      } catch (e) {
        console.log('Error parsing login response:', e);
      }
    });
  });
  
  loginReq.on('error', (e) => {
    console.error('Login request error:', e);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

function testInviteAPI(token) {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/employees/invite',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    console.log('Invite API Status:', res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log('Invite API Response:', chunk);
    });
  });

  req.on('error', (e) => {
    console.error('Invite API request error:', e);
  });

  req.write(postData);
  req.end();
}

healthCheck.on('error', (e) => {
  console.error('Health check failed:', e);
  console.log('Server might not be running. Starting server first...');
});

healthCheck.end();