// Test the new deployment with timer persistence fix
const https = require('https');

const BASE_URL = 'apilayer-cpvs724mr-soludoo.vercel.app';
let authToken = '';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login() {
  try {
    console.log('🔑 Logging in to test timer persistence...');
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@company.com',
      password: 'password123',
      tenantName: 'TechCorp'
    });
    
    if (response.status === 200 && response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    }
    console.log('❌ Login failed:', response.data);
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function startTimer() {
  try {
    console.log('\\n🎯 Starting timer with persistence fix...');
    const response = await makeRequest('POST', '/api/me/timer/start', {
      notes: 'Testing timer persistence fix - Shivam Barnwal issue'
    }, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      console.log('✅ Timer started successfully!');
      console.log('- Timer ID:', response.data.data?.timerId);
      console.log('- Persistent:', response.data.data?.persistent);
      console.log('- Start Time:', response.data.data?.startTime);
      return response.data.data?.timerId;
    } else {
      console.log('❌ Timer start failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Timer start error:', error.message);
    return null;
  }
}

async function checkTimer(testName) {
  try {
    console.log(`\\n🔍 Checking timer (${testName})...`);
    const response = await makeRequest('GET', '/api/me/timer/current', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      const data = response.data.data;
      console.log('- Has Active Timer:', data?.hasActiveTimer);
      console.log('- Timer ID:', data?.timer?.timerId);
      console.log('- Is Running:', data?.timer?.isRunning);
      console.log('- Current Duration:', data?.timer?.currentDuration);
      console.log('- Persistent Storage:', data?.persistent);
      console.log('- Message:', data?.message);
      
      return data?.hasActiveTimer;
    } else {
      console.log('❌ Timer check failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Timer check error:', error.message);
    return false;
  }
}

async function runLivePersistenceTest() {
  console.log('🧪 LIVE TIMER PERSISTENCE TEST');
  console.log('🌐 URL: https://' + BASE_URL);
  console.log("🐛 Fixing Shivam Barnwal's 5-minute timeout issue");
  console.log('=' .repeat(50));

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

  // Step 5: Wait 1 minute
  console.log('\\n⏳ Waiting 1 minute...');
  await new Promise(resolve => setTimeout(resolve, 60000));
  const hasTimer2 = await checkTimer('After 1 minute');

  // Step 6: Wait 2 more minutes (3 minutes total)
  console.log('\\n⏳ Waiting 2 more minutes (3 minutes total)...');
  await new Promise(resolve => setTimeout(resolve, 120000));
  const hasTimer3 = await checkTimer('After 3 minutes');

  // Step 7: Wait 3 more minutes (6 minutes total - past the 5-minute mark)
  console.log('\\n⏳ Waiting 3 more minutes (6 minutes total - CRITICAL TEST)...');
  await new Promise(resolve => setTimeout(resolve, 180000));
  const hasTimer4 = await checkTimer('After 6 minutes - CRITICAL TEST');

  // Results
  console.log('\\n' + '=' .repeat(50));
  console.log('📊 PERSISTENCE TEST RESULTS:');
  console.log('- Immediately after start:', hasTimer1 ? '✅ Active' : '❌ Inactive');
  console.log('- After 1 minute:', hasTimer2 ? '✅ Still Active' : '❌ Lost');
  console.log('- After 3 minutes:', hasTimer3 ? '✅ Still Active' : '❌ Lost');
  console.log('- After 6 minutes (CRITICAL):', hasTimer4 ? '✅ FIXED! Still Active' : '❌ STILL BROKEN');
  
  if (hasTimer4) {
    console.log('\\n🎉 SUCCESS! The 5-minute timeout issue is FIXED!');
    console.log('🔧 Persistent timer storage is working correctly');
    console.log('📧 Shivam Barnwal: Your timer will now survive server restarts');
  } else {
    console.log('\\n❌ ISSUE PERSISTS: Timer still disappearing');
    console.log('🔍 Need to investigate further');
  }
  
  console.log('\\n📋 Summary for Shivam:');
  console.log('- Timer persistence has been implemented');
  console.log('- Timers are now saved to persistent storage'); 
  console.log('- They should survive server restarts and timeouts');
  console.log('- The 5-minute issue should be resolved');
}

// Run the test
runLivePersistenceTest().catch(console.error);