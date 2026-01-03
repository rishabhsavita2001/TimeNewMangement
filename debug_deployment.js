// Debug what endpoints are actually deployed
const https = require('https');

function checkAvailableEndpoints(url) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: url,
      path: '/api/nonexistent',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.available_endpoints || []);
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.end();
  });
}

async function debugDeployment() {
  console.log('🔍 DEBUG: CHECKING WHAT ACTUALLY DEPLOYED');
  console.log('=' .repeat(50));
  
  const urls = [
    'api-layer.vercel.app',
    'apilayer-4qoj722tr-soludoo.vercel.app'
  ];
  
  for (const url of urls) {
    console.log(`\\n🌐 Checking: https://${url}`);
    const endpoints = await checkAvailableEndpoints(url);
    console.log(`📋 Available endpoints: ${endpoints.length}`);
    
    const employeeEndpoints = endpoints.filter(ep => ep.includes('employee'));
    const authEndpoints = endpoints.filter(ep => ep.includes('auth') || ep.includes('login'));
    
    console.log(`👥 Employee endpoints: ${employeeEndpoints.length}`);
    if (employeeEndpoints.length > 0) {
      employeeEndpoints.forEach(ep => console.log(`  ✅ ${ep}`));
    } else {
      console.log('  ❌ No employee endpoints found');
    }
    
    console.log(`🔐 Auth endpoints: ${authEndpoints.length}`);
    if (authEndpoints.length > 0) {
      authEndpoints.forEach(ep => console.log(`  ✅ ${ep}`));
    } else {
      console.log('  ❌ No auth endpoints found');
    }
    
    // Check if auth/login works differently
    if (endpoints.includes('/api/login')) {
      console.log('  📍 Found /api/login (not /api/auth/login)');
    }
    if (endpoints.includes('/api/auth/login')) {
      console.log('  📍 Found /api/auth/login');
    }
  }
  
  console.log('\\n🔍 DIAGNOSIS:');
  console.log('- If no employee endpoints: Code not deploying properly');
  console.log('- If no auth endpoints: Authentication system missing');
  console.log('- May need to rebuild entire deployment');
}

debugDeployment();