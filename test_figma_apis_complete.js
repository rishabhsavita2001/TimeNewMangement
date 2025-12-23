const axios = require('axios');
const colors = require('colors');

// Test configuration
const BASE_URL = 'http://localhost:3002';
const TEST_USER = {
  email: 'admin@company.com',
  password: 'password123'
};

let authToken = '';

// Helper function for API calls
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// Test functions for Figma Screen APIs
async function testLogin() {
  console.log('\n🔐 Testing Login...'.cyan);
  try {
    const response = await makeRequest('POST', '/auth/login', TEST_USER);
    authToken = response.token || response.data?.token;
    console.log('✅ Login successful'.green);
    return true;
  } catch (error) {
    console.log(`❌ Login failed: ${error.message}`.red);
    return false;
  }
}

async function testNotificationsAPI() {
  console.log('\n📢 Testing Notifications API (Figma: New Updates)...'.cyan);
  
  try {
    const response = await makeRequest('GET', '/api/me/notifications');
    console.log('✅ Notifications API successful'.green);
    console.log(`   - Total notifications: ${response.data.notifications.length}`.blue);
    console.log(`   - Unread count: ${response.data.unreadCount}`.blue);
    
    // Check for specific Figma notifications
    const notifications = response.data.notifications;
    const dentalPlan = notifications.find(n => n.title.includes('dental plan'));
    const securityPolicy = notifications.find(n => n.title.includes('Security policy'));
    const yearReviews = notifications.find(n => n.title.includes('End of year reviews'));
    const handbook = notifications.find(n => n.title.includes('employee handbook'));
    
    if (dentalPlan) console.log('   ✅ Dental plan notification found'.green);
    if (securityPolicy) console.log('   ✅ Security policy notification found'.green);
    if (yearReviews) console.log('   ✅ Year reviews notification found'.green);
    if (handbook) console.log('   ✅ Employee handbook notification found'.green);
    
    return true;
  } catch (error) {
    console.log(`❌ Notifications API failed: ${error.message}`.red);
    return false;
  }
}

async function testUpdatesAPI() {
  console.log('\n📋 Testing Updates API (Figma: New Updates Screen)...'.cyan);
  
  try {
    const response = await makeRequest('GET', '/api/me/updates');
    console.log('✅ Updates API successful'.green);
    console.log(`   - Today updates: ${response.data.today.length}`.blue);
    console.log(`   - This week updates: ${response.data.thisWeek.length}`.blue);
    console.log(`   - New count: ${response.data.newCount}`.blue);
    
    // Show today's updates
    console.log('   📋 Today\'s Updates:'.blue);
    response.data.today.forEach(update => {
      console.log(`     - ${update.title} (${update.time})`.gray);
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Updates API failed: ${error.message}`.red);
    return false;
  }
}

async function testWorkStatusAPI() {
  console.log('\n⏰ Testing Work Status API (Figma: Work Completion)...'.cyan);
  
  try {
    const response = await makeRequest('GET', '/api/me/work-status');
    console.log('✅ Work Status API successful'.green);
    console.log(`   - Is completed: ${response.data.isCompleted}`.blue);
    console.log(`   - Message: ${response.data.completionMessage}`.blue);
    console.log(`   - Total worked: ${response.data.totalWorkedToday}`.blue);
    console.log(`   - Progress: ${response.data.progressPercentage}%`.blue);
    
    if (response.data.workSummary) {
      console.log('   📊 Work Summary:'.blue);
      console.log(`     - Weekly balance: ${response.data.workSummary.weeklyBalance}`.gray);
      console.log(`     - Overtime: ${response.data.workSummary.overtime}`.gray);
      console.log(`     - Vacation left: ${response.data.workSummary.leftVacation}`.gray);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Work Status API failed: ${error.message}`.red);
    return false;
  }
}

async function testTimerAPIs() {
  console.log('\n⏱️ Testing Timer APIs (Figma: Continue/Stop buttons)...'.cyan);
  
  try {
    // Test current timer status
    let response = await makeRequest('GET', '/api/me/timer/current');
    console.log('✅ Timer Current Status API successful'.green);
    console.log(`   - Has active timer: ${response.data.hasActiveTimer}`.blue);
    
    // Test start timer
    response = await makeRequest('POST', '/api/me/timer/start', {
      project_id: 1,
      task_name: 'Testing Figma APIs'
    });
    console.log('✅ Timer Start API successful'.green);
    console.log(`   - Timer ID: ${response.data.timerId}`.blue);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test stop timer
    response = await makeRequest('POST', '/api/me/timer/stop', {
      time_entry: {
        project_id: 1,
        task_name: 'Testing Figma APIs',
        description: 'API testing session'
      }
    });
    console.log('✅ Timer Stop API successful'.green);
    console.log(`   - Duration: ${response.data.duration}`.blue);
    
    return true;
  } catch (error) {
    console.log(`❌ Timer APIs failed: ${error.message}`.red);
    return false;
  }
}

async function testDashboardAPI() {
  console.log('\n📊 Testing Dashboard API (Figma: Dashboard screen)...'.cyan);
  
  try {
    const response = await makeRequest('GET', '/api/me/dashboard');
    console.log('✅ Dashboard API successful'.green);
    console.log(`   - Timer status: ${response.data.timer?.status || 'inactive'}`.blue);
    console.log(`   - Today worked: ${response.data.todaysSummary?.totalWorked}`.blue);
    console.log(`   - Weekly balance: ${response.data.weeklyBalance?.balance}`.blue);
    console.log(`   - Recent entries: ${response.data.recentTimeEntries?.length || 0}`.blue);
    console.log(`   - Notifications: ${response.data.notifications?.length || 0}`.blue);
    
    return true;
  } catch (error) {
    console.log(`❌ Dashboard API failed: ${error.message}`.red);
    return false;
  }
}

async function testWorkSummaryAPI() {
  console.log('\n📈 Testing Work Summary API (Figma: Work Summary widgets)...'.cyan);
  
  try {
    const response = await makeRequest('GET', '/api/me/work-summary/today');
    console.log('✅ Today\'s Work Summary API successful'.green);
    console.log(`   - Total worked: ${response.data.totalWorked}`.blue);
    console.log(`   - Timer running: ${response.data.isTimerRunning}`.blue);
    console.log(`   - Current timer: ${response.data.currentTimerDuration}`.blue);
    
    return true;
  } catch (error) {
    console.log(`❌ Work Summary API failed: ${error.message}`.red);
    return false;
  }
}

// Main test runner
async function runFigmaAPITests() {
  console.log('🎨 FIGMA SCREEN APIs TEST SUITE'.rainbow);
  console.log('=====================================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test login first
  totalTests++;
  if (await testLogin()) {
    passedTests++;
    
    // Run all API tests
    const tests = [
      testNotificationsAPI,
      testUpdatesAPI,
      testWorkStatusAPI,
      testTimerAPIs,
      testDashboardAPI,
      testWorkSummaryAPI
    ];
    
    for (const test of tests) {
      totalTests++;
      if (await test()) {
        passedTests++;
      }
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Results
  console.log('\n📊 FIGMA APIs TEST SUMMARY'.cyan);
  console.log('==========================');
  console.log(`Total Tests: ${totalTests}`.white);
  console.log(`Passed: ${passedTests}`.green);
  console.log(`Failed: ${totalTests - passedTests}`.red);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL FIGMA APIs WORKING!'.green.bold);
    console.log('\n✅ Your Figma screens are fully supported by the APIs'.green);
  } else {
    console.log('\n⚠️  Some APIs need attention'.yellow);
  }
  
  console.log('\n🔗 Available Figma API Endpoints:'.cyan);
  console.log('- GET /api/me/notifications (New Updates notifications)');
  console.log('- GET /api/me/updates (New Updates screen)');
  console.log('- GET /api/me/work-status (Work completion status)');
  console.log('- GET /api/me/dashboard (Dashboard screen)');
  console.log('- GET /api/me/work-summary/today (Work summary widgets)');
  console.log('- POST /api/me/timer/start (Continue work)');
  console.log('- POST /api/me/timer/stop (Stop work)');
  console.log('- GET /api/me/timer/current (Current timer status)');
}

// Set environment to production for mock data
process.env.NODE_ENV = 'production';

// Run tests
runFigmaAPITests().catch(console.error);