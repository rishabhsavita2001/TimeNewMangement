const https = require('https');
const http = require('http');

// Test both domains to compare
const domains = [
  'api-layer.vercel.app',
  'apilayer-6njhumcll-soludoo.vercel.app'
];

const endpoints = [
  '/api/health',
  '/api/test',
  '/api/me', 
  '/api/user/profile',
  '/api/user/dashboard',
  '/api/time-entries',
  '/api/leave-requests',
  '/api/projects'
];

const apis = [];
domains.forEach(domain => {
  endpoints.forEach(endpoint => {
    apis.push(`https://${domain}${endpoint}`);
  });
});

function testAPI(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'Authorization': 'Bearer mock-token-12345',
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const short_response = data.length > 150 ? data.substring(0, 150) + '...' : data;
        console.log(`${res.statusCode} ${res.statusMessage} - ${url}`);
        console.log(`Response: ${short_response}`);
        console.log('---');
        resolve({ url, status: res.statusCode, success: res.statusCode >= 200 && res.statusCode < 400 });
      });
    });

    req.on('error', (error) => {
      console.log(`ERROR - ${url}`);
      console.log(`Error: ${error.message}`);
      console.log('---');
      resolve({ url, error: error.message, success: false });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`TIMEOUT - ${url}`);
      console.log('---');
      resolve({ url, error: 'Timeout', success: false });
    });
  });
}

async function testAllAPIs() {
  console.log('🚀 Testing API endpoints on both domains...\n');
  
  const results = [];
  let currentDomain = '';
  
  for (const api of apis) {
    const domain = api.split('/')[2];
    if (domain !== currentDomain) {
      currentDomain = domain;
      console.log(`\n=== Testing Domain: ${domain} ===`);
    }
    
    const result = await testAPI(api);
    results.push(result);
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Summary by domain
  domains.forEach(domain => {
    const domainResults = results.filter(r => r.url.includes(domain));
    const working = domainResults.filter(r => r.success).length;
    const total = domainResults.length;
    
    console.log(`\n=== SUMMARY: ${domain} ===`);
    console.log(`Working: ${working}/${total}`);
    
    if (working === total) {
      console.log('✅ All APIs working on this domain!');
    } else {
      console.log('❌ Some APIs failing on this domain');
      const failed = domainResults.filter(r => !r.success);
      failed.forEach(f => {
        const endpoint = f.url.split('/').slice(3).join('/');
        console.log(`  - /${endpoint} (${f.status || f.error})`);
      });
    }
  });
}

testAllAPIs().catch(console.error);