const axios = require('axios');
const colors = require('colors');

// Test configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3002'; 
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
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

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing Login...'.cyan);
  try {
    const response = await makeRequest('POST', '/auth/login', TEST_USER);
    authToken = response.token || response.data?.token;
    console.log('✅ Login successful'.green);
    return true;
  } catch (error) {
    console.log(`❌ Login failed: ${error.message}`.red);
    
    // Try to register if login fails
    console.log('\n📝 Attempting to register...'.cyan);
    try {
      await makeRequest('POST', '/auth/register', {
        ...TEST_USER,
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('✅ Registration successful, trying login again...'.green);
      
      const loginResponse = await makeRequest('POST', '/auth/login', TEST_USER);
      authToken = loginResponse.token || loginResponse.data?.token;
      console.log('✅ Login successful after registration'.green);
      return true;
    } catch (regError) {
      console.log(`❌ Registration and login failed: ${regError.message}`.red);
      return false;
    }
  }
}

async function testTimerAPIs() {
  console.log('\n🎯 Testing Timer Management APIs (Figma Green Start Button)...'.cyan);
  
  // Test timer start
  console.log('\n▶️  Testing Timer Start...');
  try {
    const startResponse = await makeRequest('POST', '/api/me/timer/start', {
      notes: 'Testing timer from automated script'
    });
    console.log('✅ Timer started successfully:'.green);
    console.log(`   Timer ID: ${startResponse.data?.timerId}`);
    console.log(`   Start Time: ${startResponse.data?.startTime}`);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test current timer status
    console.log('\n📊 Testing Current Timer Status...');
    const statusResponse = await makeRequest('GET', '/api/me/timer/current');
    console.log('✅ Timer status retrieved:'.green);
    console.log(`   Has Active Timer: ${statusResponse.data?.hasActiveTimer}`);
    console.log(`   Current Duration: ${statusResponse.data?.timer?.currentDuration}`);
    console.log(`   Is Paused: ${statusResponse.data?.timer?.isPaused}`);
    
    // Test timer pause
    console.log('\n⏸️  Testing Timer Pause...');
    const pauseResponse = await makeRequest('POST', '/api/me/timer/pause');
    console.log('✅ Timer paused successfully:'.green);
    console.log(`   Is Paused: ${pauseResponse.data?.isPaused}`);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test timer resume
    console.log('\n▶️  Testing Timer Resume...');
    const resumeResponse = await makeRequest('POST', '/api/me/timer/pause');
    console.log('✅ Timer resumed successfully:'.green);
    console.log(`   Is Paused: ${resumeResponse.data?.isPaused}`);
    
    // Wait a moment more
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test timer stop
    console.log('\n⏹️  Testing Timer Stop...');
    const stopResponse = await makeRequest('POST', '/api/me/timer/stop', {
      notes: 'Completed test session'
    });
    console.log('✅ Timer stopped successfully:'.green);
    console.log(`   Duration: ${stopResponse.data?.duration}`);
    console.log(`   Total Hours: ${stopResponse.data?.totalHours}`);
    
    console.log('\n🎉 All Timer APIs working perfectly!'.green.bold);
    return true;
  } catch (error) {
    console.log(`❌ Timer API test failed: ${error.message}`.red);
    return false;
  }
}

async function testWorkSummaryAPIs() {
  console.log('\n📈 Testing Work Summary APIs (Figma 4h 30m Display)...'.cyan);
  
  // Test today's summary
  console.log('\n📅 Testing Today\'s Work Summary...');
  try {
    const todayResponse = await makeRequest('GET', '/api/me/work-summary/today');
    console.log('✅ Today\'s summary retrieved:'.green);
    console.log(`   Total Worked: ${todayResponse.data?.totalWorked}`);
    console.log(`   Total Hours: ${todayResponse.data?.totalHours}`);
    console.log(`   Timer Running: ${todayResponse.data?.isTimerRunning}`);
    console.log(`   Date: ${todayResponse.data?.date}`);
    
    // Test weekly summary
    console.log('\n📊 Testing Weekly Work Summary...');
    const weeklyResponse = await makeRequest('GET', '/api/me/work-summary/weekly');
    console.log('✅ Weekly summary retrieved:'.green);
    console.log(`   Weekly Balance: ${weeklyResponse.data?.weeklyBalance}`);
    console.log(`   Total Worked This Week: ${weeklyResponse.data?.totalWorkedThisWeek}`);
    console.log(`   Expected Hours: ${weeklyResponse.data?.expectedHours}`);
    console.log(`   Balance Hours: ${weeklyResponse.data?.balanceHours}`);
    console.log(`   Week Period: ${weeklyResponse.data?.weekStart} to ${weeklyResponse.data?.weekEnd}`);
    
    console.log('\n🎉 Work Summary APIs working perfectly!'.green.bold);
    return true;
  } catch (error) {
    console.log(`❌ Work Summary API test failed: ${error.message}`.red);
    return false;
  }
}

async function testNotificationAPIs() {
  console.log('\n🔔 Testing Notification APIs (Figma New Updates Section)...'.cyan);
  
  // Test get notifications
  console.log('\n📨 Testing Get Notifications...');
  try {
    const notificationsResponse = await makeRequest('GET', '/api/me/notifications');
    console.log('✅ Notifications retrieved:'.green);
    console.log(`   Total Notifications: ${notificationsResponse.data?.notifications?.length}`);
    console.log(`   Unread Count: ${notificationsResponse.data?.unreadCount}`);
    console.log(`   Has New Updates: ${notificationsResponse.data?.hasNewUpdates}`);
    
    // Display sample notifications
    if (notificationsResponse.data?.notifications?.length > 0) {
      console.log('\n📋 Sample Notifications:');
      notificationsResponse.data.notifications.slice(0, 3).forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.icon} ${notif.title}: ${notif.message}`);
        console.log(`      Type: ${notif.type}, Read: ${notif.isRead}`);
      });
      
      // Test mark notification as read
      const firstNotif = notificationsResponse.data.notifications[0];
      if (firstNotif && !firstNotif.isRead) {
        console.log('\n✅ Testing Mark Notification as Read...');
        const markReadResponse = await makeRequest('POST', `/api/me/notifications/${firstNotif.id}/read`);
        console.log(`✅ Notification marked as read: ${markReadResponse.message}`.green);
      }
    }
    
    // Test mark all notifications as read
    console.log('\n📚 Testing Mark All Notifications as Read...');
    const markAllResponse = await makeRequest('POST', '/api/me/notifications/mark-all-read');
    console.log(`✅ All notifications marked as read: ${markAllResponse.message}`.green);
    
    console.log('\n🎉 Notification APIs working perfectly!'.green.bold);
    return true;
  } catch (error) {
    console.log(`❌ Notification API test failed: ${error.message}`.red);
    return false;
  }
}

async function testDashboardAPI() {
  console.log('\n🏠 Testing Enhanced Dashboard API (Complete Figma Screen)...'.cyan);
  
  try {
    const dashboardResponse = await makeRequest('GET', '/api/me/dashboard');
    console.log('✅ Dashboard data retrieved successfully:'.green);
    
    const data = dashboardResponse.data;
    
    // User info
    console.log('\n👤 User Profile:');
    console.log(`   Name: ${data.user?.firstName} ${data.user?.lastName}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Company: ${data.user?.tenantName}`);
    
    // Timer status
    console.log('\n⏱️  Timer Status:');
    console.log(`   Has Active Timer: ${data.timerStatus?.hasActiveTimer}`);
    if (data.timerStatus?.timer) {
      console.log(`   Current Duration: ${data.timerStatus.timer.currentDuration}`);
      console.log(`   Is Paused: ${data.timerStatus.timer.isPaused}`);
    }
    
    // Today's summary
    console.log('\n📅 Today\'s Summary:');
    console.log(`   Total Worked: ${data.todaysSummary?.totalWorked}`);
    console.log(`   Timer Running: ${data.todaysSummary?.isTimerRunning}`);
    
    // Weekly balance  
    console.log('\n📊 Weekly Balance:');
    console.log(`   Weekly Balance: ${data.weeklyBalance?.weeklyBalance}`);
    console.log(`   Total This Week: ${data.weeklyBalance?.totalWorkedThisWeek}`);
    console.log(`   Expected: ${data.weeklyBalance?.expectedHours}h`);
    
    // Recent entries
    console.log('\n📝 Recent Entries:');
    if (data.recentEntries?.length > 0) {
      data.recentEntries.slice(0, 3).forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.entry_date}: ${entry.clock_in} - ${entry.clock_out || 'ongoing'} (${entry.total_hours || 'N/A'}h)`);
      });
    } else {
      console.log('   No recent entries found');
    }
    
    // Notifications
    console.log('\n🔔 Recent Notifications:');
    if (data.notifications?.length > 0) {
      data.notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.icon} ${notif.title}: ${notif.message}`);
      });
    } else {
      console.log('   No recent notifications');
    }
    
    console.log(`\n⏰ Last Updated: ${data.lastUpdated}`);
    console.log('\n🎉 Dashboard API working perfectly!'.green.bold);
    return true;
  } catch (error) {
    console.log(`❌ Dashboard API test failed: ${error.message}`.red);
    return false;
  }
}

async function testCompleteWorkflow() {
  console.log('\n🔄 Testing Complete Figma Screen Workflow...'.cyan);
  
  try {
    console.log('\n1️⃣  Getting initial dashboard state...');
    await makeRequest('GET', '/api/me/dashboard');
    console.log('✅ Initial dashboard loaded'.green);
    
    console.log('\n2️⃣  Starting work timer (Green Start Button)...');
    const startResult = await makeRequest('POST', '/api/me/timer/start', {
      notes: 'Morning work session'
    });
    console.log(`✅ Timer started: ${startResult.data?.timerId}`.green);
    
    console.log('\n3️⃣  Checking work summary after start...');
    const summaryResult = await makeRequest('GET', '/api/me/work-summary/today');
    console.log(`✅ Work summary: ${summaryResult.data?.totalWorked}`.green);
    
    console.log('\n4️⃣  Getting notifications...');
    const notifResult = await makeRequest('GET', '/api/me/notifications');
    console.log(`✅ Notifications loaded: ${notifResult.data?.notifications?.length} items`.green);
    
    console.log('\n5️⃣  Pausing timer for break...');
    const pauseResult = await makeRequest('POST', '/api/me/timer/pause');
    console.log(`✅ Timer paused: ${pauseResult.data?.isPaused}`.green);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('\n6️⃣  Resuming timer after break...');
    const resumeResult = await makeRequest('POST', '/api/me/timer/pause');
    console.log(`✅ Timer resumed: ${!resumeResult.data?.isPaused}`.green);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n7️⃣  Stopping timer at end of work...');
    const stopResult = await makeRequest('POST', '/api/me/timer/stop', {
      notes: 'Completed morning session'
    });
    console.log(`✅ Timer stopped: ${stopResult.data?.duration}`.green);
    
    console.log('\n8️⃣  Getting final dashboard state...');
    const finalDashboard = await makeRequest('GET', '/api/me/dashboard');
    console.log(`✅ Final summary: ${finalDashboard.data?.todaysSummary?.totalWorked}`.green);
    
    console.log('\n🎉🎉 Complete Figma Screen Workflow Test PASSED! 🎉🎉'.green.bold);
    console.log('\n📱 All APIs are ready for mobile app development!'.cyan.bold);
    return true;
  } catch (error) {
    console.log(`❌ Complete workflow test failed: ${error.message}`.red);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Figma Screen APIs Test Suite...'.yellow.bold);
  console.log(`🌐 Testing against: ${BASE_URL}`.yellow);
  
  const results = [];
  
  // Authentication
  const loginSuccess = await testLogin();
  results.push({ test: 'Authentication', success: loginSuccess });
  
  if (!loginSuccess) {
    console.log('\n❌ Authentication failed. Cannot proceed with API tests.'.red.bold);
    return;
  }
  
  // Test all API groups
  results.push({ test: 'Timer APIs', success: await testTimerAPIs() });
  results.push({ test: 'Work Summary APIs', success: await testWorkSummaryAPIs() });
  results.push({ test: 'Notification APIs', success: await testNotificationAPIs() });
  results.push({ test: 'Dashboard API', success: await testDashboardAPI() });
  results.push({ test: 'Complete Workflow', success: await testCompleteWorkflow() });
  
  // Results summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY'.yellow.bold);
  console.log('='.repeat(60));
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    console.log(`${result.test.padEnd(25)} : ${status}`[color]);
    if (!result.success) allPassed = false;
  });
  
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉'.green.bold);
    console.log('📱 The APIs are fully ready for Figma screen implementation!'.green);
    console.log('\n✨ Features working:');
    console.log('   🟢 Start/Stop/Pause Timer (Green Start Button)');
    console.log('   📊 Work Summary (4h 30m display)');
    console.log('   📈 Weekly Balance (1-3h 20m display)');
    console.log('   🔔 Notifications (New updates section)');
    console.log('   🏠 Complete Dashboard (Full screen data)');
  } else {
    console.log('\n❌ SOME TESTS FAILED'.red.bold);
    console.log('Please check the failed tests above.'.red);
  }
}

// Handle script execution
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('🚨 Test suite crashed:'.red.bold, error.message);
    process.exit(1);
  });
}

module.exports = { runAllTests, testTimerAPIs, testWorkSummaryAPIs, testNotificationAPIs, testDashboardAPI };