const https = require('https');

const baseUrl = 'api-layer.vercel.app';

async function testPostEndpoints() {
  console.log('🔄 Testing POST/PUT/DELETE Endpoints\n');
  
  const postTests = [
    {
      endpoint: '/test-login',
      method: 'POST',
      description: 'Test Login Endpoint',
      body: { email: 'admin@company.com', password: 'password123' }
    },
    {
      endpoint: '/api/me/time-entries',
      method: 'POST', 
      description: 'Create Time Entry',
      body: {
        project_id: 1,
        entry_date: '2024-12-16',
        clock_in: '09:00:00',
        notes: 'Test entry'
      },
      requiresAuth: true
    },
    {
      endpoint: '/api/me/leave-requests',
      method: 'POST',
      description: 'Create Leave Request', 
      body: {
        start_date: '2024-12-20',
        end_date: '2024-12-22',
        leave_type_id: 1,
        reason: 'Test leave request'
      },
      requiresAuth: true
    }
  ];
  
  for (const test of postTests) {
    console.log(`Testing: ${test.description} (${test.method})`);
    
    const options = {
      hostname: baseUrl,
      path: test.endpoint,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test/1.0'
      }
    };
    
    if (test.requiresAuth) {
      options.headers['Authorization'] = 'Bearer mock-token-12345';
    }
    
    const postData = JSON.stringify(test.body);
    options.headers['Content-Length'] = Buffer.byteLength(postData);
    
    try {
      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
            
            try {
              const json = JSON.parse(data);
              if (json.success) {
                console.log('   Success: true');
                if (json.token) console.log(`   Token: ${json.token.substring(0, 20)}...`);
                if (json.data && json.data.id) console.log(`   Created ID: ${json.data.id}`);
              } else {
                console.log(`   Success: false - ${json.message || json.error}`);
              }
            } catch (e) {
              console.log(`   Response: ${data.substring(0, 100)}`);
            }
            
            resolve();
          });
        });
        
        req.on('error', (error) => {
          console.log(`❌ Error: ${error.message}`);
          resolve();
        });
        
        req.setTimeout(8000, () => {
          req.destroy();
          console.log('❌ Timeout');
          resolve();
        });
        
        req.write(postData);
        req.end();
      });
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🔍 Authentication Edge Cases\n');
  
  // Test without auth token
  console.log('Testing: API without auth token');
  try {
    await new Promise((resolve) => {
      const req = https.request({
        hostname: baseUrl,
        path: '/api/me',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        resolve();
      });
      
      req.on('error', () => resolve());
      req.setTimeout(5000, () => { req.destroy(); resolve(); });
      req.end();
    });
  } catch (e) {}
  
  console.log('');
  
  // Test with invalid token
  console.log('Testing: API with invalid token format');
  try {
    await new Promise((resolve) => {
      const req = https.request({
        hostname: baseUrl,
        path: '/api/me',
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'InvalidToken'
        }
      }, (res) => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        resolve();
      });
      
      req.on('error', () => resolve());
      req.setTimeout(5000, () => { req.destroy(); resolve(); });
      req.end();
    });
  } catch (e) {}
  
  console.log('\n✅ POST/PUT/DELETE Testing Complete!');
}

testPostEndpoints().catch(console.error);