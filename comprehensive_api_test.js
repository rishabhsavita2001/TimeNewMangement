const https = require('https');

const baseUrl = 'api-layer.vercel.app';

const testCases = [
  // Core API Tests
  { endpoint: '/api/health', method: 'GET', requiresAuth: false, description: 'Health Check' },
  { endpoint: '/api/test', method: 'GET', requiresAuth: false, description: 'API Test' },
  
  // Authentication Tests
  { endpoint: '/auth/login', method: 'POST', requiresAuth: false, description: 'Login', 
    body: { email: 'admin@company.com', password: 'password123' } },
  
  // User Profile Tests  
  { endpoint: '/api/me', method: 'GET', requiresAuth: true, description: 'Get Profile' },
  { endpoint: '/api/user/profile', method: 'GET', requiresAuth: true, description: 'Get Profile Alias' },
  { endpoint: '/api/user/dashboard', method: 'GET', requiresAuth: true, description: 'Get Dashboard' },
  
  // Time Tracking Tests
  { endpoint: '/api/time-entries', method: 'GET', requiresAuth: true, description: 'Get Time Entries' },
  { endpoint: '/api/me/time-entries', method: 'GET', requiresAuth: true, description: 'Get My Time Entries' },
  
  // Leave Management Tests
  { endpoint: '/api/leave-requests', method: 'GET', requiresAuth: true, description: 'Get Leave Requests' },
  { endpoint: '/api/me/leave-requests', method: 'GET', requiresAuth: true, description: 'Get My Leave Requests' },
  
  // Reference Data Tests
  { endpoint: '/api/projects', method: 'GET', requiresAuth: true, description: 'Get Projects' },
  
  // Additional Tests
  { endpoint: '/debug-db', method: 'GET', requiresAuth: false, description: 'Database Debug' },
  { endpoint: '/api-docs.json', method: 'GET', requiresAuth: false, description: 'Swagger JSON' }
];

async function testEndpoint(testCase) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      path: testCase.endpoint,
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test/1.0'
      }
    };
    
    // Add authorization if required
    if (testCase.requiresAuth) {
      options.headers['Authorization'] = 'Bearer mock-token-12345';
    }
    
    let postData = '';
    if (testCase.body) {
      postData = JSON.stringify(testCase.body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ...testCase,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          response: data,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ...testCase,
        statusCode: 0,
        statusMessage: 'Request Error',
        response: error.message,
        success: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        ...testCase,
        statusCode: 0,
        statusMessage: 'Timeout',
        response: 'Request timed out',
        success: false
      });
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 Comprehensive API Testing Started\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.description} (${testCase.method} ${testCase.endpoint})`);
    
    const result = await testEndpoint(testCase);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Status: ${result.statusCode} ${result.statusMessage}`);
      
      // Try to parse and show relevant data
      try {
        const jsonResponse = JSON.parse(result.response);
        if (jsonResponse.data && typeof jsonResponse.data === 'object') {
          if (jsonResponse.data.id) console.log(`   User ID: ${jsonResponse.data.id}`);
          if (jsonResponse.data.firstName) console.log(`   Name: ${jsonResponse.data.firstName} ${jsonResponse.data.lastName || ''}`);
          if (jsonResponse.data.entries) console.log(`   Entries: ${jsonResponse.data.entries.length}`);
          if (jsonResponse.data.projects) console.log(`   Projects: ${jsonResponse.data.projects.length}`);
          if (jsonResponse.data.requests) console.log(`   Requests: ${jsonResponse.data.requests.length}`);
        }
        if (jsonResponse.token) console.log(`   Token: ${jsonResponse.token.substring(0, 20)}...`);
        if (jsonResponse.status && testCase.endpoint === '/api/health') console.log(`   Status: ${jsonResponse.status}`);
      } catch (e) {
        // Non-JSON response
        const preview = result.response.substring(0, 100);
        if (preview.length > 0) console.log(`   Response: ${preview}${result.response.length > 100 ? '...' : ''}`);
      }
    } else {
      console.log(`❌ Status: ${result.statusCode} ${result.statusMessage}`);
      const errorPreview = result.response.substring(0, 150);
      console.log(`   Error: ${errorPreview}${result.response.length > 150 ? '...' : ''}`);
    }
    
    console.log('');
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${total - successful}`);
  
  if (successful === total) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.description}: ${r.statusCode} ${r.statusMessage}`);
    });
  }
  
  console.log('\n🌐 Live URLs:');
  console.log(`- Swagger UI: https://${baseUrl}/api-docs`);
  console.log(`- API Health: https://${baseUrl}/api/health`);
  console.log(`- Main API: https://${baseUrl}/api/me`);
}

runAllTests().catch(console.error);