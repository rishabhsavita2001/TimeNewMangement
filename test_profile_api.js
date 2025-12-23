const https = require('https');

async function testProfileAPI() {
  const baseUrl = 'api-layer.vercel.app';
  const endpoints = [
    { path: '/api/me', description: 'Get current user profile' },
    { path: '/api/user/profile', description: 'Get user profile (alias)' }
  ];
  
  console.log('🚀 Testing Profile API Endpoints on Live Vercel\n');
  
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.description}`);
    console.log(`URL: https://${baseUrl}${endpoint.path}`);
    
    const options = {
      hostname: baseUrl,
      path: endpoint.path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-token-12345',
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test/1.0'
      }
    };
    
    try {
      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
            
            if (res.statusCode === 200) {
              try {
                const json = JSON.parse(data);
                console.log('✅ Success Response:');
                console.log(`   User ID: ${json.data?.id || 'N/A'}`);
                console.log(`   Name: ${json.data?.firstName || 'N/A'} ${json.data?.lastName || 'N/A'}`);
                console.log(`   Email: ${json.data?.email || 'N/A'}`);
                console.log(`   Employee Number: ${json.data?.employeeNumber || 'N/A'}`);
                console.log(`   Tenant: ${json.data?.tenantName || 'N/A'}`);
              } catch (e) {
                console.log('Response:', data.substring(0, 200));
              }
            } else {
              console.log(`❌ Error Response: ${data.substring(0, 200)}`);
            }
            console.log('---\n');
            resolve();
          });
        });
        
        req.on('error', err => {
          console.log(`❌ Request Error: ${err.message}`);
          console.log('---\n');
          resolve();
        });
        
        req.setTimeout(10000, () => {
          req.destroy();
          console.log('❌ Request Timeout');
          console.log('---\n');
          resolve();
        });
        
        req.end();
      });
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('---\n');
    }
  }
  
  console.log('🎯 Profile API Testing Complete!');
  console.log('\n📋 Swagger UI Available at:');
  console.log(`https://${baseUrl}/api-docs`);
  console.log('\n🔑 Test Authorization Token:');
  console.log('Bearer mock-token-12345');
}

testProfileAPI().catch(console.error);