const https = require('https');

async function testLiveAPI(endpoint, method = 'GET', token = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api-layer.vercel.app',
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Live-API-Test/1.0'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON',
            rawData: data.substring(0, 500)
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        success: false,
        error: error.message
      });
    });
    
    req.end();
  });
}

async function testAllNewAPIs() {
  console.log('🔍 Testing New Figma APIs on https://api-layer.vercel.app\n');
  
  // First get login token
  console.log('1. 🔐 Getting Authentication Token...');
  const loginOptions = {
    hostname: 'api-layer.vercel.app',
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginResult = await new Promise((resolve) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, error: 'Invalid JSON' });
        }
      });
    });
    req.write(JSON.stringify({ email: 'admin@company.com', password: 'password123' }));
    req.end();
  });

  if (loginResult.status !== 200) {
    console.log('❌ Login failed, testing without auth');
    return;
  }
  
  const token = loginResult.data.token || 'mock-token-12345';
  console.log('✅ Login successful\n');

  // Test new APIs
  const newAPIs = [
    { endpoint: '/api/me/work-status', name: 'Work Status API (Completion Screen)' },
    { endpoint: '/api/me/updates', name: 'Updates Screen API (New Updates)' },
    { endpoint: '/api/me/notifications', name: 'Enhanced Notifications API' },
    { endpoint: '/api/me/dashboard', name: 'Dashboard API (Verification)' }
  ];

  for (const api of newAPIs) {
    console.log(`2. 🧪 Testing: ${api.name}`);
    console.log(`   URL: https://api-layer.vercel.app${api.endpoint}`);
    
    const result = await testLiveAPI(api.endpoint, 'GET', token);
    
    if (result.success) {
      console.log('   ✅ Status: 200 OK - API Working!');
      
      // Show specific data for each API
      if (api.endpoint === '/api/me/work-status' && result.data.data) {
        console.log(`   📊 Work Completed: ${result.data.data.isCompleted}`);
        console.log(`   📈 Progress: ${result.data.data.progressPercentage || 0}%`);
        console.log(`   💬 Message: ${result.data.data.completionMessage}`);
      }
      
      if (api.endpoint === '/api/me/updates' && result.data.data) {
        console.log(`   📋 Today's Updates: ${result.data.data.today?.length || 0}`);
        console.log(`   📅 This Week Updates: ${result.data.data.thisWeek?.length || 0}`);
        console.log(`   🔢 New Count: ${result.data.data.newCount || 0}`);
      }
      
      if (api.endpoint === '/api/me/notifications' && result.data.data) {
        const notifications = result.data.data.notifications || [];
        console.log(`   📢 Total Notifications: ${notifications.length}`);
        const figmaNotifs = notifications.filter(n => 
          n.title?.includes('dental') || 
          n.title?.includes('Security policy') ||
          n.title?.includes('End of year') ||
          n.title?.includes('employee handbook')
        );
        console.log(`   🎨 Figma Notifications: ${figmaNotifs.length}`);
      }
      
    } else {
      console.log(`   ❌ Status: ${result.status} - FAILED`);
      if (result.error) {
        console.log(`   🔍 Error: ${result.error}`);
      }
      if (result.rawData) {
        console.log(`   📄 Response: ${result.rawData.substring(0, 200)}...`);
      }
    }
    console.log('');
  }

  // Test Swagger JSON endpoint
  console.log('3. 📚 Testing Swagger Documentation...');
  const swaggerResult = await testLiveAPI('/api-docs.json');
  if (swaggerResult.success) {
    console.log('   ✅ Swagger JSON: Available');
    // Check if new endpoints are in swagger
    const swaggerData = JSON.stringify(swaggerResult.data);
    const hasWorkStatus = swaggerData.includes('/api/me/work-status');
    const hasUpdates = swaggerData.includes('/api/me/updates');
    
    console.log(`   📖 Work Status API in docs: ${hasWorkStatus ? '✅ Yes' : '❌ No'}`);
    console.log(`   📖 Updates API in docs: ${hasUpdates ? '✅ Yes' : '❌ No'}`);
  } else {
    console.log('   ❌ Swagger JSON: Failed');
  }

  console.log('\n🎯 LIVE API TEST SUMMARY');
  console.log('========================');
  console.log('🌐 Base URL: https://api-layer.vercel.app');
  console.log('📚 Swagger UI: https://api-layer.vercel.app/api-docs');
  console.log('🔍 Health: https://api-layer.vercel.app/api/health');
}

testAllNewAPIs().catch(console.error);