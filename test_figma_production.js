const https = require('https');

const baseUrl = 'api-layer.vercel.app';

const figmaAPITests = [
  // Core tests first
  { endpoint: '/api/health', method: 'GET', requiresAuth: false, description: 'Health Check' },
  { endpoint: '/auth/login', method: 'POST', requiresAuth: false, description: 'Login', 
    body: { email: 'admin@company.com', password: 'password123' } },
  
  // Figma specific APIs
  { endpoint: '/api/me/notifications', method: 'GET', requiresAuth: true, description: 'Notifications (New Updates)' },
  { endpoint: '/api/me/updates', method: 'GET', requiresAuth: true, description: 'Updates Screen' },
  { endpoint: '/api/me/work-status', method: 'GET', requiresAuth: true, description: 'Work Status (Completion)' },
  { endpoint: '/api/me/dashboard', method: 'GET', requiresAuth: true, description: 'Dashboard Screen' },
  { endpoint: '/api/me/work-summary/today', method: 'GET', requiresAuth: true, description: 'Today Work Summary' },
  { endpoint: '/api/me/timer/current', method: 'GET', requiresAuth: true, description: 'Current Timer Status' },
  
  // Timer actions
  { endpoint: '/api/me/timer/start', method: 'POST', requiresAuth: true, description: 'Start Timer (Continue)',
    body: { project_id: 1, task_name: 'Daily Work' } },
  { endpoint: '/api/me/timer/stop', method: 'POST', requiresAuth: true, description: 'Stop Timer',
    body: { time_entry: { project_id: 1, task_name: 'Daily Work', description: 'Work session' } } }
];

async function testEndpoint(testCase) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      path: testCase.endpoint,
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Figma-API-Test/1.0'
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
          const responseData = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            data: responseData,
            testCase
          });
        } catch (e) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            error: 'Invalid JSON response',
            raw: data,
            testCase
          });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({
        success: false,
        error: e.message,
        testCase
      });
    });
    
    // Send request body if needed
    if (testCase.body) {
      req.write(JSON.stringify(testCase.body));
    }
    
    req.end();
  });
}

async function runFigmaAPITests() {
  console.log('🎨 FIGMA SCREEN APIs TEST (Production)');
  console.log('=====================================\\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of figmaAPITests) {
    totalTests++;
    console.log(`Testing: ${testCase.description} (${testCase.method} ${testCase.endpoint})`);
    
    try {
      const result = await testEndpoint(testCase);
      
      if (result.success) {
        console.log(`✅ Status: ${result.statusCode} OK`);
        passedTests++;
        
        // Show relevant data for Figma screens
        if (testCase.endpoint === '/api/me/notifications' && result.data.data) {
          console.log(`   📢 Notifications: ${result.data.data.notifications?.length || 0}`);
          console.log(`   🔔 Unread: ${result.data.data.unreadCount || 0}`);
        }
        
        if (testCase.endpoint === '/api/me/updates' && result.data.data) {
          console.log(`   📋 Today Updates: ${result.data.data.today?.length || 0}`);
          console.log(`   📅 This Week: ${result.data.data.thisWeek?.length || 0}`);
        }
        
        if (testCase.endpoint === '/api/me/work-status' && result.data.data) {
          console.log(`   ⏰ Completed: ${result.data.data.isCompleted}`);
          console.log(`   📊 Progress: ${result.data.data.progressPercentage}%`);
        }
        
        if (testCase.endpoint === '/api/me/dashboard' && result.data.data) {
          console.log(`   🏠 Timer Active: ${result.data.data.timer?.status === 'active'}`);
          console.log(`   📈 Today Worked: ${result.data.data.todaysSummary?.totalWorked || 'N/A'}`);
        }
        
      } else {
        console.log(`❌ Status: ${result.statusCode} - ${result.error || 'Failed'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('📊 FIGMA APIs TEST SUMMARY');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    console.log('\\n🎉 ALL FIGMA APIs WORKING!');
    console.log('\\n✅ All Figma screens are fully supported:');
    console.log('   - Dashboard screen with work summary');
    console.log('   - Continue/Stop work buttons');
    console.log('   - Work completion status');
    console.log('   - New Updates screen with company announcements');
    console.log('   - Notifications system');
  } else {
    console.log(`\\n⚠️  ${totalTests - passedTests} API(s) need attention`);
  }
  
  console.log('\\n🌐 Live Production URLs:');
  console.log(`- Main API: https://${baseUrl}/api/me`);
  console.log(`- Swagger: https://${baseUrl}/api-docs`);
  console.log(`- Health: https://${baseUrl}/api/health`);
}

runFigmaAPITests().catch(console.error);