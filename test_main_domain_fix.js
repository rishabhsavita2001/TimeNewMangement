// Test the main domain with timer persistence fix
const https = require('https');

const BASE_URL = 'api-layer.vercel.app'; // Main domain
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

async function testMainDomainFix() {
  console.log('🔧 TESTING MAIN DOMAIN TIMER FIX');
  console.log('🌐 URL: https://' + BASE_URL);
  console.log('👤 For: Shivam Barnwal');
  console.log('🐛 Issue: Timer inactive after 5 minutes');
  console.log('=' .repeat(50));

  try {
    // Step 1: Test login
    console.log('🔑 Testing login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@company.com',
      password: 'password123',
      tenantName: 'TechCorp'
    });
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Check initial timer state
    console.log('\\n🔍 Checking initial timer state...');
    const initialState = await makeRequest('GET', '/api/me/timer/current', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    console.log('- Has Active Timer:', initialState.data.data?.hasActiveTimer);
    console.log('- Can Start:', initialState.data.data?.canStart);
    console.log('- Persistent Storage:', initialState.data.data?.persistent);

    // Step 3: Start timer
    console.log('\\n🎯 Starting timer...');
    const startResponse = await makeRequest('POST', '/api/me/timer/start', {
      notes: 'Test for Shivam - 5 minute issue fix'
    }, {
      'Authorization': `Bearer ${authToken}`
    });

    if (startResponse.status !== 200 || !startResponse.data.success) {
      console.log('❌ Timer start failed:', startResponse.data);
      return;
    }

    const timerId = startResponse.data.data?.timerId;
    const persistent = startResponse.data.data?.persistent;
    console.log('✅ Timer started successfully!');
    console.log('- Timer ID:', timerId);
    console.log('- Persistent:', persistent);
    console.log('- Start Time:', startResponse.data.data?.startTime);

    // Step 4: Immediate check
    console.log('\\n🔍 Immediate timer check...');
    const immediateCheck = await makeRequest('GET', '/api/me/timer/current', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    console.log('- Active:', immediateCheck.data.data?.hasActiveTimer);
    console.log('- Duration:', immediateCheck.data.data?.timer?.currentDuration);

    if (!persistent) {
      console.log('\\n⚠️  WARNING: Timer is not marked as persistent!');
      console.log('🔄 This means the fix may not be fully deployed.');
      return;
    }

    // Step 5: Test persistence over time
    console.log('\\n⏳ Testing persistence...');
    console.log('- Will check timer every 2 minutes');
    console.log('- Critical test: Timer should still be active after 6 minutes');
    
    for (let i = 1; i <= 3; i++) {
      const minutes = i * 2;
      console.log(`\\n⏳ Waiting ${2} minutes (${minutes} minutes total)...`);
      await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
      
      const check = await makeRequest('GET', '/api/me/timer/current', null, {
        'Authorization': `Bearer ${authToken}`
      });
      
      const isActive = check.data.data?.hasActiveTimer;
      const duration = check.data.data?.timer?.currentDuration;
      
      console.log(`📊 After ${minutes} minutes:`);
      console.log('- Timer Active:', isActive ? '✅ YES' : '❌ NO');
      console.log('- Duration:', duration || 'N/A');
      
      if (!isActive) {
        console.log(`\\n❌ TIMER LOST at ${minutes} minutes!`);
        console.log('🐛 The issue is NOT fixed yet');
        return;
      }
      
      if (minutes >= 6) {
        console.log('\\n🎉 SUCCESS! Timer survived past 5 minutes!');
        console.log('✅ Shivam: Your timer persistence issue is FIXED!');
        break;
      }
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Run the test
testMainDomainFix();