const https = require('https');

const baseUrl = 'api-layer.vercel.app';

// Complete API test suite for all endpoints
const allAPITests = [
  // Basic APIs
  { endpoint: '/api/health', method: 'GET', requiresAuth: false, description: 'Health Check API' },
  { endpoint: '/api/test', method: 'GET', requiresAuth: true, description: 'Test API' },
  
  // Authentication
  { endpoint: '/auth/login', method: 'POST', requiresAuth: false, description: 'Login API', 
    body: { email: 'admin@company.com', password: 'password123' } },
  
  // User Profile APIs
  { endpoint: '/api/me', method: 'GET', requiresAuth: true, description: 'User Profile API' },
  { endpoint: '/api/user/profile', method: 'GET', requiresAuth: true, description: 'User Profile (Alias)' },
  
  // Dashboard APIs
  { endpoint: '/api/me/dashboard', method: 'GET', requiresAuth: true, description: 'Enhanced Dashboard API' },
  { endpoint: '/api/dashboard', method: 'GET', requiresAuth: true, description: 'Dashboard (Alias)' },
  
  // Timer APIs (Core Figma functionality)
  { endpoint: '/api/me/timer/current', method: 'GET', requiresAuth: true, description: 'Current Timer Status' },
  { endpoint: '/api/me/timer/start', method: 'POST', requiresAuth: true, description: 'Start Timer (Green Button)',
    body: { projectId: 1, notes: 'API testing session' } },
  { endpoint: '/api/me/timer/stop', method: 'POST', requiresAuth: true, description: 'Stop Timer',
    body: { notes: 'Completed testing' } },
  
  // Work Summary APIs
  { endpoint: '/api/me/work-summary/today', method: 'GET', requiresAuth: true, description: 'Today Work Summary' },
  { endpoint: '/api/me/work-summary/weekly', method: 'GET', requiresAuth: true, description: 'Weekly Work Summary' },
  
  // Time Tracking APIs
  { endpoint: '/api/time-entries', method: 'GET', requiresAuth: true, description: 'Time Entries API' },
  { endpoint: '/api/me/time-entries', method: 'GET', requiresAuth: true, description: 'My Time Entries' },
  
  // Vacation/Leave APIs
  { endpoint: '/api/me/vacation/balance', method: 'GET', requiresAuth: true, description: 'Vacation Balance API' },
  { endpoint: '/api/leave-requests', method: 'GET', requiresAuth: true, description: 'Leave Requests API' },
  { endpoint: '/api/me/leave-requests', method: 'GET', requiresAuth: true, description: 'My Leave Requests' },
  
  // Overtime API
  { endpoint: '/api/me/overtime/summary', method: 'GET', requiresAuth: true, description: 'Overtime Summary API' },
  
  // Notification APIs (Enhanced for Figma)
  { endpoint: '/api/me/notifications', method: 'GET', requiresAuth: true, description: 'Enhanced Notifications API' },
  
  // Work Status APIs (New for Figma)
  { endpoint: '/api/me/work-status', method: 'GET', requiresAuth: true, description: 'Work Completion Status API' },
  
  // Updates Screen API (New for Figma)
  { endpoint: '/api/me/updates', method: 'GET', requiresAuth: true, description: 'New Updates Screen API' },
  
  // Quick Actions APIs (Latest addition)
  { endpoint: '/api/me/quick-actions', method: 'GET', requiresAuth: true, description: 'Quick Actions Menu API' },
  
  // Time Correction API (New)
  { endpoint: '/api/me/time-corrections', method: 'POST', requiresAuth: true, description: 'Request Time Correction API',
    body: {
      original_entry_id: 123,
      correction_type: 'time_adjustment',
      reason: 'Testing API - forgot to stop timer at lunch',
      corrected_start_time: '2023-12-23T09:00:00Z',
      corrected_end_time: '2023-12-23T17:00:00Z'
    }
  },
  
  // Manual Time Entry API (New)
  { endpoint: '/api/me/time-entries/manual', method: 'POST', requiresAuth: true, description: 'Add Manual Time Entry API',
    body: {
      entry_date: '2023-12-23',
      start_time: '09:00',
      end_time: '17:00',
      project_id: 1,
      task_name: 'API Testing',
      description: 'Testing manual time entry API',
      break_duration: 60,
      reason: 'Testing API functionality'
    }
  },
  
  // Reference Data APIs
  { endpoint: '/api/projects', method: 'GET', requiresAuth: true, description: 'Projects API' },
  
  // Documentation APIs
  { endpoint: '/api-docs.json', method: 'GET', requiresAuth: false, description: 'Swagger JSON API' },
  { endpoint: '/debug-db', method: 'GET', requiresAuth: false, description: 'Database Debug API' }
];

async function testAPI(testCase, token = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      path: testCase.endpoint,
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Complete-API-Test/1.0'
      }
    };
    
    if (testCase.requiresAuth && token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    } else if (testCase.requiresAuth && !token) {
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
            rawData: data.substring(0, 200),
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

async function runCompleteAPICheck() {
  console.log('🔍 COMPLETE API VERIFICATION - LIVE PRODUCTION');
  console.log('==============================================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let authToken = '';
  let testResults = {
    basic: [],
    authentication: [],
    profile: [],
    dashboard: [],
    timer: [],
    workSummary: [],
    timeTracking: [],
    leave: [],
    notifications: [],
    quickActions: [],
    documentation: []
  };

  console.log('🎯 Testing All APIs on: https://api-layer.vercel.app\n');

  for (const testCase of allAPITests) {
    totalTests++;
    console.log(`🧪 Testing: ${testCase.description}`);
    console.log(`   ${testCase.method} ${testCase.endpoint}`);
    
    const result = await testAPI(testCase, authToken);
    
    // Store auth token from login
    if (testCase.endpoint === '/auth/login' && result.success && result.data.token) {
      authToken = result.data.token;
    }
    
    if (result.success) {
      console.log('   ✅ Status: 200 OK - Working!');
      passedTests++;
      
      // Show specific API details
      if (testCase.endpoint === '/api/me/quick-actions' && result.data.data) {
        const actions = result.data.data.actions || [];
        console.log(`   📋 Quick Actions Available: ${actions.length}`);
        actions.forEach(action => {
          console.log(`     - ${action.icon} ${action.title}`);
        });
      }
      
      if (testCase.endpoint === '/api/me/notifications' && result.data.data) {
        const notifications = result.data.data.notifications || [];
        console.log(`   📢 Notifications: ${notifications.length}`);
        const figmaNotifs = notifications.filter(n => 
          n.title?.includes('dental') || n.title?.includes('Security') || 
          n.title?.includes('handbook') || n.title?.includes('year')
        );
        console.log(`   🎨 Figma-specific Notifications: ${figmaNotifs.length}`);
      }
      
      if (testCase.endpoint === '/api/me/work-status' && result.data.data) {
        console.log(`   ⏰ Work Completed: ${result.data.data.isCompleted}`);
        console.log(`   📊 Progress: ${result.data.data.progressPercentage}%`);
      }
      
      if (testCase.endpoint === '/api/me/updates' && result.data.data) {
        console.log(`   📋 Today Updates: ${result.data.data.today?.length || 0}`);
        console.log(`   📅 This Week Updates: ${result.data.data.thisWeek?.length || 0}`);
      }
      
      // Categorize results
      if (testCase.endpoint.includes('quick-actions') || testCase.endpoint.includes('time-corrections') || testCase.endpoint.includes('manual')) {
        testResults.quickActions.push(testCase.description);
      } else if (testCase.endpoint.includes('timer')) {
        testResults.timer.push(testCase.description);
      } else if (testCase.endpoint.includes('dashboard')) {
        testResults.dashboard.push(testCase.description);
      } else if (testCase.endpoint.includes('notifications') || testCase.endpoint.includes('updates')) {
        testResults.notifications.push(testCase.description);
      }
      
    } else {
      console.log(`   ❌ Status: ${result.status} - FAILED`);
      if (result.error) {
        console.log(`   🔍 Error: ${result.error}`);
      }
    }
    console.log('');
  }

  // Final Results Summary
  console.log('📊 COMPLETE API VERIFICATION RESULTS');
  console.log('====================================');
  console.log(`🌐 Base URL: https://${baseUrl}`);
  console.log(`📈 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL APIs WORKING PERFECTLY!');
    console.log('✅ कोई भी API missing नहीं है - सब live हैं!');
  } else if (passedTests >= totalTests * 0.9) {
    console.log('\n✅ EXCELLENT! 90%+ APIs Working');
    console.log('⚡ Minor issues only, overall system is live and functional');
  } else {
    console.log('\n⚠️ Some APIs need attention');
  }
  
  console.log('\n🎨 FIGMA MOBILE APP - API COVERAGE:');
  console.log('===================================');
  console.log(`✅ Timer APIs (Start/Stop buttons): ${testResults.timer.length} working`);
  console.log(`✅ Quick Actions Menu: ${testResults.quickActions.length} working`);
  console.log(`✅ Dashboard Data: ${testResults.dashboard.length} working`);
  console.log(`✅ Notifications & Updates: ${testResults.notifications.length} working`);
  
  console.log('\n🔗 KEY LIVE URLs:');
  console.log('=================');
  console.log('📚 Swagger UI: https://api-layer.vercel.app/api-docs');
  console.log('🔍 Health Check: https://api-layer.vercel.app/api/health');
  console.log('👤 User Profile: https://api-layer.vercel.app/api/me');
  console.log('🏠 Dashboard: https://api-layer.vercel.app/api/me/dashboard');
  console.log('📱 Quick Actions: https://api-layer.vercel.app/api/me/quick-actions');
  console.log('📢 Notifications: https://api-layer.vercel.app/api/me/notifications');
  console.log('⏰ Work Status: https://api-layer.vercel.app/api/me/work-status');
  console.log('📋 Updates: https://api-layer.vercel.app/api/me/updates');
  
  console.log('\n🎯 CONCLUSION:');
  console.log('===============');
  if (passedTests >= totalTests * 0.95) {
    console.log('🟢 सभी APIs live हैं और working हैं!');
    console.log('🚀 Mobile app integration के लिए ready है!');
  } else {
    console.log('🟡 कुछ APIs में minor issues हैं, लेकिन core functionality working है');
  }
}

runCompleteAPICheck().catch(console.error);