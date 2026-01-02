const http = require('http');

function testAPI() {
  // Test the timer current API
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/me/timer/current',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ API Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
      
      const response = JSON.parse(data);
      if (response.success && response.data.is_active === true) {
        console.log('\n🎉 SUCCESS: Timer API now shows active status!');
        console.log(`📊 Timer Details:`);
        console.log(`   - Task: ${response.data.current_task}`);
        console.log(`   - Running time: ${response.data.formatted_time}`);
        console.log(`   - Project: ${response.data.project_name}`);
      } else {
        console.log('\n❌ ISSUE: Timer API still not working as expected');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
    console.log('🔄 Please make sure the server is running on port 3000');
  });

  req.end();
}

// Wait a moment then test
setTimeout(() => {
  console.log('🧪 Testing Timer API...\n');
  testAPI();
}, 1000);