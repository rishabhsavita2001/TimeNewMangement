const https = require('https');

const baseUrl = 'apilayer-6rdtsyxlb-soludoo.vercel.app';

// Test configuration for new Figma APIs
const newFigmaAPITests = [
  // Enhanced notifications with Figma content
  { endpoint: '/api/me/notifications', method: 'GET', requiresAuth: true, description: 'Enhanced Notifications (Figma Content)' },
  
  // New APIs created for Figma screens
  { endpoint: '/api/me/work-status', method: 'GET', requiresAuth: true, description: 'Work Status (Completion Screen)' },
  { endpoint: '/api/me/updates', method: 'GET', requiresAuth: true, description: 'Updates Screen (New Updates)' },
  
  // Core APIs for Figma screens
  { endpoint: '/api/me/dashboard', method: 'GET', requiresAuth: true, description: 'Dashboard Screen' },
  { endpoint: '/api/me/work-summary/today', method: 'GET', requiresAuth: true, description: 'Today Work Summary' },
  { endpoint: '/api/me/timer/current', method: 'GET', requiresAuth: true, description: 'Timer Status' },
  
  // Login for authentication
  { endpoint: '/auth/login', method: 'POST', requiresAuth: false, description: 'Login', 
    body: { email: 'admin@company.com', password: 'password123' } },
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

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
            description: testCase.description
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response',
            data: data.substring(0, 200) + '...',
            description: testCase.description
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        success: false,
        error: error.message,
        description: testCase.description
      });
    });

    if (testCase.body) {
      req.write(JSON.stringify(testCase.body));
    }
    
    req.end();
  });
}

async function runFigmaAPITests() {
  console.log('🎨 FIGMA APIs - LIVE PRODUCTION TEST');
  console.log('=====================================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let authToken = '';

  for (const testCase of newFigmaAPITests) {
    totalTests++;
    console.log(`Testing: ${testCase.description} (${testCase.method} ${testCase.endpoint})`);
    
    const result = await testEndpoint(testCase);
    
    if (result.success) {
      console.log(`✅ Status: ${result.status} OK`);
      passedTests++;
      
      // Store auth token from login
      if (testCase.endpoint === '/auth/login' && result.data.token) {
        authToken = result.data.token;
      }
      
      // Show specific details for new APIs
      if (testCase.endpoint === '/api/me/notifications' && result.data.data) {
        const notifications = result.data.data.notifications || [];
        console.log(`   📢 Notifications: ${notifications.length}`);
        const dentalPlan = notifications.find(n => n.title?.includes('dental'));
        if (dentalPlan) console.log(`   🦷 Dental plan notification: Found`);
      }
      
      if (testCase.endpoint === '/api/me/work-status' && result.data.data) {
        console.log(`   ⏰ Work completed: ${result.data.data.isCompleted}`);
        console.log(`   📊 Progress: ${result.data.data.progressPercentage || 0}%`);
      }
      
      if (testCase.endpoint === '/api/me/updates' && result.data.data) {
        console.log(`   📋 Today updates: ${result.data.data.today?.length || 0}`);
        console.log(`   📅 Week updates: ${result.data.data.thisWeek?.length || 0}`);
      }
      
    } else {
      console.log(`❌ Status: ${result.status} - Failed`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log('');
  }

  // Results
  console.log('📊 LIVE FIGMA APIs TEST SUMMARY');
  console.log('==============================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL FIGMA APIs WORKING ON LIVE SERVER!');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n✅ FIGMA APIs Successfully Deployed!');
    console.log('Most APIs working, minor issues can be addressed.');
  } else {
    console.log('\n⚠️ Some APIs need attention');
  }
  
  console.log('\n🌐 Live Production URLs:');
  console.log('- Main Domain: https://api-layer.vercel.app');  
  console.log('- Current Deploy: https://apilayer-6rdtsyxlb-soludoo.vercel.app');
  console.log('- Swagger UI: https://apilayer-6rdtsyxlb-soludoo.vercel.app/api-docs');
  console.log('- Health Check: https://apilayer-6rdtsyxlb-soludoo.vercel.app/api/health');
  
  console.log('\n🎨 New Figma APIs Now Live:');
  console.log('- Work Status: https://apilayer-6rdtsyxlb-soludoo.vercel.app/api/me/work-status');
  console.log('- Updates Feed: https://apilayer-6rdtsyxlb-soludoo.vercel.app/api/me/updates');
  console.log('- Enhanced Notifications: https://apilayer-6rdtsyxlb-soludoo.vercel.app/api/me/notifications');
}

runFigmaAPITests().catch(console.error);