const https = require('https');
const http = require('http');

const apis = [
  'https://api-layer.vercel.app/api/health',
  'https://api-layer.vercel.app/api/test', 
  'https://api-layer.vercel.app/api/me',
  'https://api-layer.vercel.app/api/user/profile',
  'https://api-layer.vercel.app/api/user/dashboard',
  'https://api-layer.vercel.app/api/time-entries',
  'https://api-layer.vercel.app/api/leave-requests',
  'https://api-layer.vercel.app/api/projects'
];

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
  console.log('Testing all API endpoints on Vercel...\n');
  
  const results = [];
  for (const api of apis) {
    const result = await testAPI(api);
    results.push(result);
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== SUMMARY ===');
  const working = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Working: ${working}/${total}`);
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\nFailed APIs:');
    failed.forEach(f => {
      console.log(`- ${f.url} (${f.status || 'Error'}: ${f.error || 'Unknown error'})`);
    });
  } else {
    console.log('All APIs are working correctly!');
  }
}

testAllAPIs().catch(console.error);