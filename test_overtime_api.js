const https = require('https');

console.log('🧪 Testing Overtime API...\n');

async function testOvertimeAPI() {
  const baseUrl = 'https://api-layer.vercel.app';
  
  try {
    // Test 1: Get authentication token
    console.log('1️⃣  Getting authentication token...');
    const tokenResponse = await fetch(`${baseUrl}/api/get-token`);
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      const token = tokenData.token;
      console.log('   ✅ Token received successfully\n');
      
      // Test 2: Overtime API
      console.log('2️⃣  Testing GET /api/me/overtime/summary...');
      const overtimeResponse = await fetch(`${baseUrl}/api/me/overtime/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`   Status: ${overtimeResponse.status}`);
      
      if (overtimeResponse.ok) {
        const overtimeData = await overtimeResponse.json();
        console.log('   ✅ Overtime API working!');
        console.log(`   📊 Current month overtime: ${overtimeData.data.current_month.overtime_hours} hours`);
        console.log(`   📈 Year to date: ${overtimeData.data.year_to_date.total_overtime} hours\n`);
        
        console.log('🎉 SUCCESS! Overtime API is working perfectly!');
        console.log('\n📋 Complete curl command:');
        console.log(`curl --location 'https://api-layer.vercel.app/api/me/overtime/summary' --header 'Authorization: Bearer ${token}'`);
        
      } else {
        const errorText = await overtimeResponse.text();
        console.log('   ❌ Overtime API failed');
        console.log('   Response:', errorText, '\n');
        
        // Provide manual commands
        console.log('🔧 Manual Test Commands:');
        console.log('1. Get Token:');
        console.log(`   curl "https://api-layer.vercel.app/api/get-token"`);
        console.log('2. Test Overtime API:');
        console.log(`   curl --location 'https://api-layer.vercel.app/api/me/overtime/summary' --header 'Authorization: Bearer ${token}'`);
      }
      
    } else {
      console.log('   ❌ Failed to get token');
      console.log('   Status:', tokenResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Fallback curl commands
    console.log('\n🔧 Fallback - Manual curl commands:');
    console.log('1. Get Token:');
    console.log('   curl "https://api-layer.vercel.app/api/get-token"');
    console.log('2. Test Overtime (replace YOUR_TOKEN):');
    console.log('   curl --location "https://api-layer.vercel.app/api/me/overtime/summary" --header "Authorization: Bearer YOUR_TOKEN"');
  }
}

// Also test using curl commands
console.log('🔗 Alternative curl commands to test manually:');
console.log('');
console.log('# Step 1: Get token');
console.log('curl "https://api-layer.vercel.app/api/get-token"');
console.log('');
console.log('# Step 2: Test overtime (replace YOUR_TOKEN with actual token)');
console.log('curl --location "https://api-layer.vercel.app/api/me/overtime/summary" \\');
console.log('  --header "Authorization: Bearer YOUR_TOKEN"');
console.log('');

testOvertimeAPI();