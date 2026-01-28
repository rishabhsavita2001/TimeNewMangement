const https = require('https');

async function testPutTimeEntry() {
  // First get a token
  console.log('🔑 Getting authentication token...');
  
  const tokenOptions = {
    hostname: 'api-layer.vercel.app',
    port: 443,
    path: '/api/get-token',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const tokenReq = https.request(tokenOptions, (tokenRes) => {
      let tokenData = '';
      tokenRes.on('data', chunk => tokenData += chunk);
      tokenRes.on('end', () => {
        try {
          const tokenResponse = JSON.parse(tokenData);
          const token = tokenResponse.token;
          console.log('✅ Token obtained:', token.substring(0, 20) + '...');
          
          // Now test the PUT API
          console.log('\n🔧 Testing PUT /api/me/time-entries/123...');
          
          const putData = JSON.stringify({
            "startTime": "2004-01-01T12:11:40.143Z",
            "endTime": "2024-03-11T20:37:51.814Z",
            "description": "string"
          });

          const putOptions = {
            hostname: 'api-layer.vercel.app',
            port: 443,
            path: '/api/me/time-entries/123',
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Content-Length': Buffer.byteLength(putData)
            }
          };

          const putReq = https.request(putOptions, (putRes) => {
            let putResponseData = '';
            putRes.on('data', chunk => putResponseData += chunk);
            putRes.on('end', () => {
              console.log(`\n📊 Response Status: ${putRes.statusCode}`);
              console.log('📝 Response Headers:', putRes.headers);
              console.log('\n📋 Response Body:');
              
              try {
                const parsed = JSON.parse(putResponseData);
                console.log(JSON.stringify(parsed, null, 2));
              } catch (e) {
                console.log(putResponseData);
              }
              
              if (putRes.statusCode === 200) {
                console.log('\n✅ PUT API is working correctly!');
              } else {
                console.log('\n❌ PUT API failed with status:', putRes.statusCode);
              }
              
              resolve();
            });
          });

          putReq.on('error', (err) => {
            console.error('❌ PUT request error:', err);
            resolve();
          });

          putReq.write(putData);
          putReq.end();

        } catch (error) {
          console.error('❌ Token parsing error:', error);
          resolve();
        }
      });
    });

    tokenReq.on('error', (err) => {
      console.error('❌ Token request error:', err);
      resolve();
    });

    tokenReq.end();
  });
}

// Test with "string" parameter (which should fail)
async function testPutWithString() {
  console.log('\n🧪 Testing PUT with "string" parameter...');
  
  const tokenOptions = {
    hostname: 'api-layer.vercel.app',
    port: 443,
    path: '/api/get-token',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const tokenReq = https.request(tokenOptions, (tokenRes) => {
      let tokenData = '';
      tokenRes.on('data', chunk => tokenData += chunk);
      tokenRes.on('end', () => {
        try {
          const tokenResponse = JSON.parse(tokenData);
          const token = tokenResponse.token;
          
          const putData = JSON.stringify({
            "startTime": "2004-01-01T12:11:40.143Z",
            "endTime": "2024-03-11T20:37:51.814Z",
            "description": "string"
          });

          const putOptions = {
            hostname: 'api-layer.vercel.app',
            port: 443,
            path: '/api/me/time-entries/string', // This should fail
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Content-Length': Buffer.byteLength(putData)
            }
          };

          const putReq = https.request(putOptions, (putRes) => {
            let putResponseData = '';
            putRes.on('data', chunk => putResponseData += chunk);
            putRes.on('end', () => {
              console.log(`\n📊 Response Status: ${putRes.statusCode}`);
              console.log('\n📋 Response Body:');
              
              try {
                const parsed = JSON.parse(putResponseData);
                console.log(JSON.stringify(parsed, null, 2));
              } catch (e) {
                console.log(putResponseData);
              }
              
              resolve();
            });
          });

          putReq.on('error', (err) => {
            console.error('❌ PUT request error:', err);
            resolve();
          });

          putReq.write(putData);
          putReq.end();

        } catch (error) {
          console.error('❌ Token parsing error:', error);
          resolve();
        }
      });
    });

    tokenReq.on('error', (err) => {
      console.error('❌ Token request error:', err);
      resolve();
    });

    tokenReq.end();
  });
}

async function runTests() {
  console.log('🚀 Testing PUT Time Entries API...\n');
  await testPutTimeEntry();
  await testPutWithString();
  console.log('\n🎯 All tests completed!');
}

runTests().catch(console.error);