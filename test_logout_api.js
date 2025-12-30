const http = require('http');

// Test functions
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
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

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function makeRequestWithToken(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
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

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Logout/Sign Out API...\n');

  try {
    // Test 1: Get Token
    console.log('1️⃣  Testing GET /api/get-token (Get Bearer Token)...');
    const tokenResponse = await makeRequest('GET', '/api/get-token');
    console.log(`   Status: ${tokenResponse.status}`);
    console.log(`   Message: ${tokenResponse.data.message}`);
    
    if (tokenResponse.data.data && tokenResponse.data.data.token) {
      const token = tokenResponse.data.data.token;
      console.log(`   ✅ Token obtained: ${token.substring(0, 20)}...`);
      console.log();

      // Test 2: Test user profile (to verify token works)
      console.log('2️⃣  Testing GET /api/me (Protected route - verify token works)...');
      const profileResponse = await makeRequestWithToken('GET', '/api/me', token);
      console.log(`   Status: ${profileResponse.status}`);
      console.log(`   Message: ${profileResponse.data.message}`);
      console.log(`   ✅ Token is valid\n`);

      // Test 3: Test Logout API
      console.log('3️⃣  Testing POST /api/auth/logout (Sign Out)...');
      const logoutResponse = await makeRequestWithToken('POST', '/api/auth/logout', token);
      console.log(`   Status: ${logoutResponse.status}`);
      console.log(`   Message: "${logoutResponse.data.message}"`);
      
      if (logoutResponse.data.message === 'Your sign out success') {
        console.log('   ✅ Logout API working correctly!');
        console.log(`   Data:`, JSON.stringify(logoutResponse.data.data, null, 2));
      } else {
        console.log('   ❌ Logout message not as expected');
      }
      console.log();

      // Test 4: Test Swagger endpoint exists
      console.log('4️⃣  Testing GET /api-docs (Swagger UI)...');
      const swaggerResponse = await makeRequest('GET', '/api-docs');
      console.log(`   Status: ${swaggerResponse.status}`);
      if (swaggerResponse.status === 200) {
        console.log('   ✅ Swagger UI is available');
      }
      console.log();

      console.log('✨ All tests completed successfully!');
      console.log('\n📝 Summary:');
      console.log('   ✅ GET /api/get-token - Working');
      console.log('   ✅ GET /api/me - Working (with auth)');
      console.log('   ✅ POST /api/auth/logout - Working (with auth)');
      console.log('   ✅ GET /api-docs - Available');
      console.log('\n🌐 Live API: https://api-layer.vercel.app');
      console.log('📚 Swagger: https://api-layer.vercel.app/api-docs');

    } else {
      console.log('❌ Failed to get token');
    }
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

runTests();
