// Test script to verify timer persistence fix
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@company.com',
      password: 'password123',
      tenantName: 'TechCorp'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function startTimer() {
  try {
    console.log('🎯 Starting timer...');
    const response = await axios.post(`${BASE_URL}/api/me/timer/start`, {
      notes: 'Testing timer persistence'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Timer start response:');
    console.log('- Timer ID:', response.data.data?.timerId);
    console.log('- Persistent:', response.data.data?.persistent);
    console.log('- Start Time:', response.data.data?.startTime);
    return response.data.data?.timerId;
  } catch (error) {
    console.log('❌ Timer start failed:', error.response?.data || error.message);
    return null;
  }
}

async function checkTimer(testName) {
  try {
    console.log(`\\n🔍 Checking timer (${testName})...`);
    const response = await axios.get(`${BASE_URL}/api/me/timer/current`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = response.data.data;
    console.log('- Has Active Timer:', data?.hasActiveTimer);
    console.log('- Timer ID:', data?.timer?.timerId);
    console.log('- Is Running:', data?.timer?.isRunning);
    console.log('- Current Duration:', data?.timer?.currentDuration);
    console.log('- Persistent Storage:', data?.persistent);
    console.log('- Can Start:', data?.canStart);
    console.log('- Message:', data?.message);
    
    return data?.hasActiveTimer;
  } catch (error) {
    console.log('❌ Timer check failed:', error.response?.data || error.message);
    return false;
  }
}

async function checkPersistentFile() {
  try {
    console.log('\\n📁 Checking persistent storage file...');
    if (fs.existsSync('timer_data.json')) {
      const data = JSON.parse(fs.readFileSync('timer_data.json', 'utf8'));
      console.log('✅ Persistent file exists');
      console.log('- Active Timers:', Object.keys(data.activeTimers || {}).length);
      console.log('- Last Updated:', data.lastUpdated);
      return true;
    } else {
      console.log('❌ Persistent file not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading persistent file:', error.message);
    return false;
  }
}

async function runPersistenceTest() {
  console.log('🧪 TIMER PERSISTENCE TEST');
  console.log('=' .repeat(40));

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without login');
    return;
  }

  // Step 2: Check initial state
  await checkTimer('Initial State');

  // Step 3: Start timer
  const timerId = await startTimer();
  if (!timerId) {
    console.log('❌ Cannot proceed without timer start');
    return;
  }

  // Step 4: Immediately check timer
  const hasTimer1 = await checkTimer('Immediately After Start');

  // Step 5: Check persistent file
  await checkPersistentFile();

  // Step 6: Wait 30 seconds and check again
  console.log('\\n⏳ Waiting 30 seconds to test persistence...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  const hasTimer2 = await checkTimer('After 30 seconds');

  // Step 7: Wait another 30 seconds (total 1 minute)
  console.log('\\n⏳ Waiting another 30 seconds (1 minute total)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  const hasTimer3 = await checkTimer('After 1 minute');

  // Results
  console.log('\\n' + '=' .repeat(40));
  console.log('📊 TEST RESULTS:');
  console.log('- Timer after start:', hasTimer1 ? '✅ Active' : '❌ Inactive');
  console.log('- Timer after 30s:', hasTimer2 ? '✅ Still Active' : '❌ Lost');
  console.log('- Timer after 1m:', hasTimer3 ? '✅ Still Active' : '❌ Lost');
  
  if (hasTimer1 && hasTimer2 && hasTimer3) {
    console.log('\\n🎉 SUCCESS! Timer persistence is working!');
  } else {
    console.log('\\n❌ FAIL! Timer persistence issue detected');
  }
}

// Run the test
runPersistenceTest().catch(console.error);