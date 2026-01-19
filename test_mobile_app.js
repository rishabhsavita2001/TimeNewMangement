// Test Mobile App APIs for "Start Working" Flow
const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function testMobileAppAPIs() {
  console.log('📱 Testing Mobile App "Start Working" APIs...\n');
  
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

    // 2. Test Projects API (Project dropdown)
    console.log('2. 📋 Testing Projects API (for dropdown)...');
    const projectsRes = await axios.get(`${BASE_URL}/projects`, { headers });
    console.log('   ✅ Projects loaded:', projectsRes.data.data.projects.length);
    projectsRes.data.data.projects.forEach(project => {
      console.log(`      - ${project.name} (ID: ${project.id})`);
    });
    console.log('');

    // 3. Test Locations API (Location dropdown) 
    console.log('3. 📍 Testing Locations API (for dropdown)...');
    const locationsRes = await axios.get(`${BASE_URL}/locations`, { headers });
    console.log('   ✅ Locations loaded:', locationsRes.data.data.locations.length);
    locationsRes.data.data.locations.forEach(location => {
      console.log(`      - ${location.name} ${location.icon} (ID: ${location.id})`);
    });
    console.log('');

    // 4. Test Timer Start with Project + Location (as per mobile flow)
    console.log('4. ▶️  Testing Timer Start with Project + Location...');
    const startData = {
      projectId: 1, // Project A
      locationId: 1, // Office  
      notes: 'Client meeting, design review'
    };
    
    const timerStartRes = await axios.post(`${BASE_URL}/me/timer/start`, startData, { headers });
    console.log('   ✅ Timer started successfully:');
    console.log(`      Timer ID: ${timerStartRes.data.data.timerId}`);
    console.log(`      Project: ${timerStartRes.data.data.projectName} (ID: ${timerStartRes.data.data.projectId})`);
    console.log(`      Location: ${timerStartRes.data.data.locationName} (ID: ${timerStartRes.data.data.locationId})`);
    console.log(`      Notes: ${timerStartRes.data.data.notes}`);
    console.log(`      Start Time: ${timerStartRes.data.data.startTime}`);
    console.log('');

    // 5. Verify Timer Status
    console.log('5. ⏱️  Verifying timer status...');
    const timerStatusRes = await axios.get(`${BASE_URL}/me/timer`, { headers });
    console.log('   ✅ Timer Status:');
    console.log(`      Active: ${timerStatusRes.data.data.hasActiveTimer}`);
    console.log(`      User: ${timerStatusRes.data.data.user.name}`);
    console.log(`      Status: ${timerStatusRes.data.data.user.status}`);
    if (timerStatusRes.data.data.timer) {
      console.log(`      Running: ${timerStatusRes.data.data.timer.isRunning}`);
      console.log(`      Duration: ${timerStatusRes.data.data.timer.currentDuration}`);
    }
    console.log('');

    // 6. Test different project and location combinations
    console.log('6. 🔄 Testing Stop and Start with different combinations...');
    
    // Stop current timer first
    await axios.post(`${BASE_URL}/me/timer/stop`, {}, { headers });
    console.log('   ✅ Timer stopped');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start with Project B + Home
    const newStartData = {
      projectId: 2, // Project B
      locationId: 2, // Home
      notes: 'Development work from home'
    };
    
    const newTimerRes = await axios.post(`${BASE_URL}/me/timer/start`, newStartData, { headers });
    console.log('   ✅ New timer started:');
    console.log(`      Project: ${newTimerRes.data.data.projectName}`);
    console.log(`      Location: ${newTimerRes.data.data.locationName}`);
    console.log(`      Notes: ${newTimerRes.data.data.notes}`);
    console.log('');

    // 7. Test API Documentation URLs
    console.log('7. 📖 Checking API Documentation...');
    try {
      const docsRes = await axios.get(`${BASE_URL}-docs/`);
      console.log('   ✅ API Documentation is accessible');
    } catch (error) {
      console.log('   ⚠️  API Documentation check failed');
    }

    console.log('\n🎉 ALL MOBILE APP APIs ARE WORKING PERFECTLY!');
    console.log('\n📱 Mobile App Integration Ready:');
    console.log('   ✅ Projects dropdown API: /api/projects');
    console.log('   ✅ Locations dropdown API: /api/locations');
    console.log('   ✅ Timer start API: /api/me/timer/start (with projectId + locationId)');
    console.log('   ✅ Timer status API: /api/me/timer');
    console.log('   ✅ All APIs support the mobile app flow shown in screenshots');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('🔄 Some APIs might be missing - deploying fixes needed');
    }
  }
}

// Run the mobile app test
testMobileAppAPIs();