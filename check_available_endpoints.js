// Test to see all available endpoints on the live deployment
const https = require('https');

const BASE_URL = 'apilayer-g96ty5q9d-soludoo.vercel.app';

function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: BASE_URL,
      path: path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ path, status: res.statusCode, exists: res.statusCode !== 404 });
      });
    });

    req.on('error', () => {
      resolve({ path, status: 'ERROR', exists: false });
    });

    req.end();
  });
}

async function checkAllEndpoints() {
  console.log('🔍 CHECKING AVAILABLE ENDPOINTS');
  console.log('🌐 URL: https://' + BASE_URL);
  console.log('=' .repeat(50));

  const endpointsToCheck = [
    '/api/health',
    '/api/auth/login', 
    '/api/employees',
    '/api/employees/invite',
    '/api/employees/roles',
    '/api/employees/departments',
    '/api/employees/working-models',
    '/api-docs',
    '/swagger.json'
  ];

  console.log('📋 Testing endpoints...');
  
  for (const endpoint of endpointsToCheck) {
    const result = await testEndpoint(endpoint);
    const status = result.exists ? '✅' : '❌';
    console.log(`${status} ${endpoint} - Status: ${result.status}`);
  }

  console.log('\\n🎯 FIGMA UI REQUIREMENTS:');
  console.log('📊 Required for Invite Employee Form:');
  console.log('1. POST /api/employees/invite - Main form submission');
  console.log('2. GET /api/employees/roles - Role dropdown data');
  console.log('3. GET /api/employees/departments - Department dropdown data');
  console.log('4. GET /api/employees/working-models - Working model dropdown data');
  
  // Test actual 404 response to see available endpoints
  console.log('\\n🔍 Checking what endpoints are actually available...');
  const notFoundReq = https.request({
    hostname: BASE_URL,
    path: '/api/nonexistent',
    method: 'GET'
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.available_endpoints) {
          console.log('\\n📋 Available endpoints from server:');
          response.available_endpoints.forEach((endpoint, index) => {
            console.log(`${index + 1}. ${endpoint}`);
          });
        }
      } catch (e) {
        console.log('Could not parse 404 response');
      }
    });
  });

  notFoundReq.on('error', (e) => {
    console.log('Error checking available endpoints:', e.message);
  });

  notFoundReq.end();
}

checkAllEndpoints();