const https = require('https');

console.log('🧪 Testing FIXED APIs...\n');

// Test functions
function testAPI(url, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {}
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  const baseUrl = 'https://api-layer.vercel.app';
  
  try {
    // Test 1: Get authentication token
    console.log('1️⃣  Testing GET /api/get-token...');
    const tokenResponse = await testAPI(`${baseUrl}/api/get-token`);
    console.log(`   Status: ${tokenResponse.status}`);
    
    if (tokenResponse.status === 200 && tokenResponse.data.success) {
      const token = tokenResponse.data.token;
      console.log('   ✅ Token received successfully\n');
      
      // Test 2: Time Entries API
      console.log('2️⃣  Testing GET /api/me/time-entries...');
      const timeEntriesResponse = await testAPI(`${baseUrl}/api/me/time-entries`, token);
      console.log(`   Status: ${timeEntriesResponse.status}`);
      
      if (timeEntriesResponse.status === 200 && timeEntriesResponse.data.success) {
        console.log('   ✅ Time Entries API working!');
        console.log(`   📊 Found ${timeEntriesResponse.data.data.entries.length} entries\n`);
      } else {
        console.log('   ❌ Time Entries API failed');
        console.log('   Response:', timeEntriesResponse.data, '\n');
      }
      
      // Test 3: Vacation Balance API
      console.log('3️⃣  Testing GET /api/me/vacation/balance...');
      const vacationResponse = await testAPI(`${baseUrl}/api/me/vacation/balance`, token);
      console.log(`   Status: ${vacationResponse.status}`);
      
      if (vacationResponse.status === 200 && vacationResponse.data.success) {
        console.log('   ✅ Vacation Balance API working!');
        console.log(`   🏖️  Available days: ${vacationResponse.data.data.balance.availableDays}\n`);
      } else {
        console.log('   ❌ Vacation Balance API failed');
        console.log('   Response:', vacationResponse.data, '\n');
      }
      
    } else {
      console.log('   ❌ Failed to get token');
      console.log('   Response:', tokenResponse.data, '\n');
    }
    
    // Test 4: API Documentation
    console.log('4️⃣  Testing GET /api-docs...');
    const docsResponse = await testAPI(`${baseUrl}/api-docs`);
    console.log(`   Status: ${docsResponse.status}`);
    console.log(`   ✅ Documentation ${docsResponse.status === 200 ? 'accessible' : 'not accessible'}\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Commands to test manually
console.log('🔧 Manual Test Commands:');
console.log('');
console.log('1. Get Token:');
console.log('   curl "https://api-layer.vercel.app/api/get-token"');
console.log('');
console.log('2. Test Time Entries (replace YOUR_TOKEN):');
console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" "https://api-layer.vercel.app/api/me/time-entries"');
console.log('');
console.log('3. Test Vacation Balance (replace YOUR_TOKEN):');
console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" "https://api-layer.vercel.app/api/me/vacation/balance"');
console.log('');
console.log('🧪 Running automated tests...\n');

runTests();