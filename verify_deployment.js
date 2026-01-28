const https = require('https');

async function testEndpoint(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: true, data: parsed });
        } catch (e) {
          resolve({ success: true, data: data.substring(0, 100) + '...' });
        }
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

async function verifyDeployment() {
  console.log('🚀 Verifying api-layer.vercel.app deployment...\n');
  
  const endpoints = [
    'https://api-layer.vercel.app/api/health',
    'https://api-layer.vercel.app/swagger.json',
    'https://api-layer.vercel.app/api-docs',
    'https://api-layer.vercel.app/'
  ];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      console.log(`✅ ${endpoint}`);
      if (typeof result.data === 'object' && result.data.message) {
        console.log(`   Message: ${result.data.message}`);
      }
    } else {
      console.log(`❌ ${endpoint} - ${result.error}`);
    }
  }
  
  console.log('\n🎯 Testing complete!');
  console.log('\n📚 Your API Documentation: https://api-layer.vercel.app/api-docs');
  console.log('🔗 Swagger JSON: https://api-layer.vercel.app/swagger.json');
  console.log('❤️ Health Check: https://api-layer.vercel.app/api/health');
}

verifyDeployment().catch(console.error);