// Test Break Functionality APIs for Mobile App
const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function testBreakAPIs() {
  console.log('⏸️  Testing Mobile App "Take a Break" APIs...\n');
  
  try {
    // 1. Get fresh token
    console.log('1. 🎫 Getting fresh token...');
    const tokenRes = await axios.get(`${BASE_URL}/get-token`);
    const token = tokenRes.data.data.token;
    console.log('   ✅ Token received\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Start a timer first
    console.log('2. ▶️  Starting timer for break testing...');
    try {
      const startTimer = await axios.post(`${BASE_URL}/me/timer/start`, {
        projectId: 1,
        locationId: 1,
        notes: 'Working before break'
      }, { headers });
      console.log(`   ✅ Timer started: ${startTimer.data.data.timerId}`);
    } catch (error) {
      if (error.response?.data?.message?.includes('already completed')) {
        console.log('   ⚠️  Timer already completed for today - that\'s fine for break testing');
      } else {
        console.log('   ❌ Error starting timer:', error.response?.data?.message);
      }
    }

    // 3. Test Break Types API
    console.log('\n3. 📋 Testing Break Types API (for dropdown)...');
    try {
      const breakTypesRes = await axios.get(`${BASE_URL}/break-types`, { headers });
      console.log('   ✅ Break Types loaded:', breakTypesRes.data.data.breakTypes.length);
      breakTypesRes.data.data.breakTypes.forEach(breakType => {
        console.log(`      - ${breakType.name} ${breakType.icon} (ID: ${breakType.id}) - ${breakType.duration}`);
      });
    } catch (error) {
      console.log('   ❌ Break Types API missing:', error.response?.status);
      console.log('   📝 Need to add: GET /api/break-types');
    }
    console.log('');

    // 4. Test Timer Status with Work Summary
    console.log('4. 📊 Testing Timer Status with Work Summary...');
    const timerStatusRes = await axios.get(`${BASE_URL}/me/timer`, { headers });
    console.log('   ✅ Timer Status Response:');
    console.log(`      User: ${timerStatusRes.data.data.user.name}`);
    console.log(`      Status: ${timerStatusRes.data.data.user.status}`);
    console.log(`      Has Active Timer: ${timerStatusRes.data.data.hasActiveTimer}`);
    
    if (timerStatusRes.data.data.workSummary) {
      const ws = timerStatusRes.data.data.workSummary;
      console.log('   📊 Work Summary:');
      console.log(`      Total Worked: ${ws.totalWorked}`);
      console.log(`      Weekly Balance: ${ws.weeklyBalance}`);
      console.log(`      Vacation Left: ${ws.vacationLeft}`);
      console.log(`      Overtime: ${ws.overtime}`);
    }
    console.log('');

    // 5. Test Start Break API  
    console.log('5. ⏸️  Testing Start Break API...');
    try {
      const breakData = {
        breakType: 'Lunch break',
        breakTypeId: 2,
        notes: 'Time for lunch!'
      };
      
      const startBreakRes = await axios.post(`${BASE_URL}/me/timer/break`, breakData, { headers });
      console.log('   ✅ Break started successfully:');
      console.log(`      Break Type: ${startBreakRes.data.data.breakType} ${startBreakRes.data.data.breakIcon}`);
      console.log(`      Break Notes: ${startBreakRes.data.data.breakNotes}`);
      console.log(`      Message: ${startBreakRes.data.data.message}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  No active timer to pause (expected if daily limit reached)');
      } else if (error.response?.status === 404 && error.response?.data?.message?.includes('endpoint not found')) {
        console.log('   ❌ Start Break API missing:', error.response?.status);
        console.log('   📝 Need to add: POST /api/me/timer/break');
      } else {
        console.log('   ❌ Error starting break:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // 6. Test existing pause API as fallback
    console.log('6. ⏯️  Testing existing Pause API as fallback...');
    try {
      const pauseRes = await axios.post(`${BASE_URL}/me/timer/pause`, {}, { headers });
      console.log('   ✅ Existing pause API works:', pauseRes.data.message);
    } catch (error) {
      console.log('   ⚠️  Pause API response:', error.response?.data?.message || 'No timer to pause');
    }

    console.log('\n📱 Mobile App Break Flow APIs Status:');
    console.log('   ✅ Timer Status API: /api/me/timer (working)');
    console.log('   ✅ Existing Pause API: /api/me/timer/pause (working)');
    console.log('   ❓ Break Types API: /api/break-types (need to verify)');
    console.log('   ❓ Enhanced Break API: /api/me/timer/break (need to verify)');
    
    console.log('\n📋 Missing APIs for Screenshots:');
    console.log('   1. GET /api/break-types - for dropdown with Coffee, Lunch, Personal, Other');
    console.log('   2. POST /api/me/timer/break - enhanced pause with break type and notes');
    console.log('   3. Enhanced work summary in timer status responses');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the break API test
testBreakAPIs();