const https = require('https');

async function testSwaggerAuth() {
  console.log('🔐 Testing Swagger Authentication Requirements\n');
  
  const tests = [
    { 
      token: null, 
      description: 'No Authorization header (should fail)',
      shouldPass: false
    },
    { 
      token: 'invalid-token', 
      description: 'Invalid token format (should fail)',
      shouldPass: false  
    },
    { 
      token: 'Bearer ', 
      description: 'Empty Bearer token (should fail)',
      shouldPass: false
    },
    { 
      token: 'Bearer mock-token-12345', 
      description: 'Valid Bearer token (should pass)',
      shouldPass: true
    },
    { 
      token: 'Bearer any-random-token', 
      description: 'Any Bearer token (should pass in production)',
      shouldPass: true
    }
  ];
  
  for (const test of tests) {
    console.log(`📍 ${test.description}`);
    
    const options = {
      hostname: 'api-layer.vercel.app',
      path: '/api/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (test.token) {
      options.headers['Authorization'] = test.token;
    }
    
    try {
      await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
            const expectedResult = test.shouldPass ? 'should pass' : 'should fail';
            
            if (isSuccess === test.shouldPass) {
              console.log(`✅ Status ${res.statusCode} - Correct (${expectedResult})`);
            } else {
              console.log(`❌ Status ${res.statusCode} - Unexpected (${expectedResult})`);
            }
            
            if (isSuccess) {
              try {
                const json = JSON.parse(data);
                console.log(`   User: ${json.data?.firstName || 'N/A'} (${json.data?.email || 'N/A'})`);
              } catch (e) {
                console.log('   Response:', data.substring(0, 100));
              }
            } else {
              console.log('   Error:', data.substring(0, 150));
            }
            
            console.log('');
            resolve();
          });
        });
        
        req.on('error', err => {
          console.log(`❌ Request Error: ${err.message}\n`);
          resolve();
        });
        
        req.setTimeout(8000, () => {
          req.destroy();
          console.log(`❌ Request Timeout\n`);
          resolve();
        });
        
        req.end();
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🎯 Authentication Test Complete!');
  console.log('\n📋 For Swagger UI:');
  console.log('1. Open: https://api-layer.vercel.app/api-docs');
  console.log('2. Click "Authorize" button 🔒');
  console.log('3. Enter: Bearer mock-token-12345');
  console.log('4. Click "Authorize" then "Close"');
  console.log('5. Test any API endpoint');
}

testSwaggerAuth().catch(console.error);