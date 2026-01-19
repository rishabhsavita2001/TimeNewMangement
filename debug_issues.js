// Comprehensive debug script for timer, profile, and authentication issues
const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function debugAllIssues() {
  console.log('🔍 COMPREHENSIVE DEBUG - Timer, Profile & Auth Issues\n');
  
  try {
    // 1. Get fresh token and check auth details
    console.log('1. 🎫 Getting fresh token and checking auth details...');
    const tokenRes = await axios.get(`${BASE_URL}/get-token`);
    const token = tokenRes.data.data.token;
    console.log(`   ✅ Token received: ${token.substring(0, 50)}...`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Decode token to see what's inside
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('   📋 Token payload:', tokenPayload);
    console.log('   📧 Login email from token:', tokenPayload.email);
    console.log('   👤 User ID from token:', tokenPayload.userId);
    console.log('   🏢 Tenant ID from token:', tokenPayload.tenantId);

    // 2. Check current profile details
    console.log('\n2. 👤 Checking current profile details...');
    const profileRes = await axios.get(`${BASE_URL}/me/profile`, { headers });
    const profile = profileRes.data.data.user;
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Phone: ${profile.phone}`);
    console.log(`   Last updated: ${profile.updated_at}`);
    console.log(`   🚨 EMAIL MISMATCH?: Login email (${tokenPayload.email}) vs Profile email (${profile.email})`);

    // 3. Check timer status
    console.log('\n3. ⏱️  Checking timer status...');
    const timerRes = await axios.get(`${BASE_URL}/me/timer`, { headers });
    console.log(`   Timer status: ${JSON.stringify(timerRes.data.data, null, 2)}`);
    
    const currentTimerRes = await axios.get(`${BASE_URL}/me/timer/current`, { headers });
    console.log(`   Current timer: ${JSON.stringify(currentTimerRes.data.data, null, 2)}`);

    // 4. Test profile update and check immediate persistence
    console.log('\n4. ✏️  Testing profile update with immediate verification...');
    const updateRes = await axios.put(`${BASE_URL}/me/profile/name`, {
      first_name: 'TestUser',
      last_name: 'DebugMode'
    }, { headers });
    console.log(`   ✅ Update response: ${updateRes.data.data.full_name}`);
    
    // Immediately check if it persisted
    const immediateCheck = await axios.get(`${BASE_URL}/me/profile`, { headers });
    console.log(`   📊 Immediate check: ${immediateCheck.data.data.user.full_name}`);

    // 5. Wait 5 seconds and check again
    console.log('\n5. ⏰ Waiting 5 seconds and checking persistence...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const persistenceCheck = await axios.get(`${BASE_URL}/me/profile`, { headers });
    console.log(`   📊 After 5s: ${persistenceCheck.data.data.user.full_name}`);
    console.log(`   📧 After 5s email: ${persistenceCheck.data.data.user.email}`);

    // 6. Multiple rapid requests to check consistency
    console.log('\n6. 🔄 Multiple rapid requests to check consistency...');
    for (let i = 0; i < 5; i++) {
      const rapidCheck = await axios.get(`${BASE_URL}/me/profile`, { headers });
      console.log(`   Request ${i+1}: ${rapidCheck.data.data.user.full_name} | ${rapidCheck.data.data.user.email}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 7. Test timer start
    console.log('\n7. ▶️  Testing timer start...');
    const timerStartRes = await axios.post(`${BASE_URL}/me/timer/start`, {
      notes: 'Debug test timer'
    }, { headers });
    console.log(`   ✅ Timer start response:`, timerStartRes.data.data);

    // 8. Check timer status after start
    await new Promise(resolve => setTimeout(resolve, 1000));
    const timerAfterStart = await axios.get(`${BASE_URL}/me/timer`, { headers });
    console.log(`   📊 Timer after start:`, timerAfterStart.data.data);

    // 9. Check if timer persists across requests
    console.log('\n9. 🔄 Checking timer persistence across multiple requests...');
    for (let i = 0; i < 3; i++) {
      const timerCheck = await axios.get(`${BASE_URL}/me/timer`, { headers });
      console.log(`   Timer check ${i+1}: hasActiveTimer = ${timerCheck.data.data.hasActiveTimer}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔄 Token might be expired, trying to get a new one...');
    }
  }
}

// Run the debug
debugAllIssues();