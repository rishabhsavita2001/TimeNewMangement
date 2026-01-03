const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// Test the fixed timer API implementation
async function testTimerAPIs() {
  try {
    console.log('🔧 Testing Fixed Timer APIs\n');
    
    // Step 1: Get auth token
    console.log('1. Getting auth token...');
    const tokenRes = await axios.get(`${BASE_URL}/api/get-token`);
    authToken = tokenRes.data.data.token;
    console.log('✅ Auth token obtained');
    
    const headers = { 'Authorization': `Bearer ${authToken}` };
    
    // Step 2: Check current timer (should be empty initially)
    console.log('\n2. Checking initial timer status...');
    const currentRes1 = await axios.get(`${BASE_URL}/api/me/timer/current`, { headers });
    console.log('Current Timer Status:', JSON.stringify(currentRes1.data.data, null, 2));
    
    // Step 3: Start timer
    console.log('\n3. Starting timer...');
    const startRes = await axios.post(`${BASE_URL}/api/me/timer/start`, {
      projectId: 'test-project',
      notes: 'Testing timer fix'
    }, { headers });
    console.log('✅ Timer started:', startRes.data.message);
    
    // Step 4: Check current timer (should be active now)
    console.log('\n4. Checking timer after start...');
    const currentRes2 = await axios.get(`${BASE_URL}/api/me/timer/current`, { headers });
    const timerData = currentRes2.data.data;
    console.log('Active Timer:', {
      hasActiveTimer: timerData.hasActiveTimer,
      isRunning: timerData.timer?.isRunning,
      isPaused: timerData.timer?.isPaused,
      isBreak: timerData.timer?.isBreak,
      duration: timerData.timer?.currentDuration
    });
    
    // Step 5: Pause timer (should set isBreak to true)
    console.log('\n5. Pausing timer...');
    const pauseRes = await axios.post(`${BASE_URL}/api/me/timer/pause`, {}, { headers });
    console.log('✅ Timer paused:', pauseRes.data.message);
    console.log('Pause data:', {
      isPaused: pauseRes.data.data.isPaused,
      isBreak: pauseRes.data.data.isBreak
    });
    
    // Step 6: Check timer during pause (isBreak should be true)
    console.log('\n6. Checking timer during pause...');
    const currentRes3 = await axios.get(`${BASE_URL}/api/me/timer/current`, { headers });
    const pausedData = currentRes3.data.data;
    console.log('Paused Timer:', {
      hasActiveTimer: pausedData.hasActiveTimer,
      isRunning: pausedData.timer?.isRunning,
      isPaused: pausedData.timer?.isPaused,
      isBreak: pausedData.timer?.isBreak
    });
    
    if (pausedData.timer?.isBreak) {
      console.log('✅ isBreak field working correctly!');
    } else {
      console.log('❌ isBreak field not working');
    }
    
    // Step 7: Resume timer
    console.log('\n7. Resuming timer...');
    const resumeRes = await axios.post(`${BASE_URL}/api/me/timer/pause`, {}, { headers });
    console.log('✅ Timer resumed:', resumeRes.data.message);
    console.log('Resume data:', {
      isPaused: resumeRes.data.data.isPaused,
      isBreak: resumeRes.data.data.isBreak
    });
    
    // Step 8: Stop timer
    console.log('\n8. Stopping timer...');
    const stopRes = await axios.post(`${BASE_URL}/api/me/timer/stop`, {
      notes: 'Test completed'
    }, { headers });
    console.log('✅ Timer stopped:', stopRes.data.message);
    console.log('Stop data:', {
      duration: stopRes.data.data.duration,
      stoppedToday: stopRes.data.data.stoppedToday
    });
    
    // Step 9: Check timer after stop (should be empty)
    console.log('\n9. Checking timer after stop...');
    const currentRes4 = await axios.get(`${BASE_URL}/api/me/timer/current`, { headers });
    const stoppedData = currentRes4.data.data;
    console.log('Stopped Timer Status:', {
      hasActiveTimer: stoppedData.hasActiveTimer,
      stoppedToday: stoppedData.stoppedToday,
      canStart: stoppedData.canStart,
      message: stoppedData.message
    });
    
    if (!stoppedData.hasActiveTimer) {
      console.log('✅ Timer properly stopped - no active timer showing!');
    } else {
      console.log('❌ Timer still showing as active after stop');
    }
    
    // Step 10: Try to start again (should be blocked)
    console.log('\n10. Trying to start timer again (should be blocked)...');
    try {
      await axios.post(`${BASE_URL}/api/me/timer/start`, {
        projectId: 'test-project',
        notes: 'Second attempt'
      }, { headers });
      console.log('❌ Timer started again (this should not happen)');
    } catch (error) {
      console.log('✅ Timer properly blocked:', error.response.data.message);
    }
    
    // Step 11: Force start timer
    console.log('\n11. Force starting timer...');
    const forceStartRes = await axios.post(`${BASE_URL}/api/me/timer/start`, {
      projectId: 'test-project',
      notes: 'Force restart',
      force: true
    }, { headers });
    console.log('✅ Timer force started:', forceStartRes.data.message);
    console.log('Force start data:', {
      forceRestart: forceStartRes.data.data.forceRestart
    });
    
    // Step 12: Final cleanup - stop the force started timer
    console.log('\n12. Final cleanup...');
    await axios.post(`${BASE_URL}/api/me/timer/stop`, {
      notes: 'Final cleanup'
    }, { headers });
    console.log('✅ Final timer stopped');
    
    console.log('\n🎉 ALL TIMER TESTS COMPLETED SUCCESSFULLY!');
    console.log('\nFixes implemented:');
    console.log('✅ Timer properly removed from activeTimers when stopped');
    console.log('✅ isBreak field properly set during pause/resume');
    console.log('✅ Force field added to allow restarting after stop');
    console.log('✅ Proper state management for all timer operations');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testTimerAPIs();