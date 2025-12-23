const https = require('https');

async function testSwaggerScenarios() {
  console.log('🔍 Swagger API Testing - Checking All Scenarios\n');
  
  const baseUrl = 'api-layer.vercel.app';
  
  const tests = [
    {
      name: 'Health Check (No Auth Required)',
      path: '/api/health',
      method: 'GET',
      expectSuccess: true,
      headers: {}
    },
    {
      name: 'API Test (No Auth Required)', 
      path: '/api/test',
      method: 'GET',
      expectSuccess: true,
      headers: {}
    },
    {
      name: 'Profile - No Authorization Header',
      path: '/api/me',
      method: 'GET', 
      expectSuccess: true, // Currently bypassed in production
      headers: {}
    },
    {
      name: 'Profile - Empty Authorization Header',
      path: '/api/me',
      method: 'GET',
      expectSuccess: true, // Currently bypassed in production  
      headers: { 'Authorization': '' }
    },
    {
      name: 'Profile - Bearer Token (Valid Format)',
      path: '/api/me',
      method: 'GET',
      expectSuccess: true,
      headers: { 'Authorization': 'Bearer mock-token-12345' }
    },
    {
      name: 'Profile - Bearer Token (Any Value)',
      path: '/api/me', 
      method: 'GET',
      expectSuccess: true,
      headers: { 'Authorization': 'Bearer anything123' }
    },
    {
      name: 'Profile - Invalid Token Format',
      path: '/api/me',
      method: 'GET', 
      expectSuccess: true, // Currently bypassed in production
      headers: { 'Authorization': 'Invalid token123' }
    },
    {
      name: 'Time Entries - Bearer Token',
      path: '/api/time-entries',
      method: 'GET',
      expectSuccess: true,
      headers: { 'Authorization': 'Bearer test123' }
    },
    {
      name: 'Projects - Bearer Token', 
      path: '/api/projects',
      method: 'GET',
      expectSuccess: true,
      headers: { 'Authorization': 'Bearer test123' }
    },
    {
      name: 'Leave Requests - Bearer Token',
      path: '/api/leave-requests',
      method: 'GET', 
      expectSuccess: true,
      headers: { 'Authorization': 'Bearer test123' }
    }
  ];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`  ${test.method} ${test.path}`);
    
    try {
      const result = await makeRequest(baseUrl, test.path, test.method, test.headers);
      
      if (result.success) {
        console.log(`  ✅ SUCCESS (${result.statusCode})`);
        
        // Show relevant data
        if (result.data) {
          if (result.data.status) console.log(`     Status: ${result.data.status}`);
          if (result.data.data && result.data.data.firstName) {
            console.log(`     User: ${result.data.data.firstName} ${result.data.data.lastName}`);
          }
          if (result.data.data && result.data.data.entries) {
            console.log(`     Entries: ${result.data.data.entries.length}`);
          }
          if (result.data.data && result.data.data.projects) {
            console.log(`     Projects: ${result.data.data.projects.length}`);
          }
          if (result.data.data && result.data.data.requests) {
            console.log(`     Requests: ${result.data.data.requests.length}`);
          }
        }
      } else {
        console.log(`  ❌ FAILED (${result.statusCode})`);
        console.log(`     Error: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`  ❌ EXCEPTION: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('📋 SWAGGER TESTING GUIDE:');
  console.log('1. Open: https://api-layer.vercel.app/api-docs');
  console.log('2. Click "Authorize" button (lock icon)'); 
  console.log('3. Enter: Bearer mock-token-12345');
  console.log('4. Click "Authorize" then "Close"');
  console.log('5. Test any endpoint with "Try it out"');
  console.log('');
  console.log('🎯 Current Status: Authentication bypassed in production');
  console.log('   → All APIs work regardless of token');
  console.log('   → Swagger UI fully functional for testing');
}

function makeRequest(hostname, path, method, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Swagger-Test/1.0',
        ...headers
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: null,
            error: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        statusCode: 0,
        error: error.message
      });
    });
    
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({
        success: false,
        statusCode: 0,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

testSwaggerScenarios().catch(console.error);