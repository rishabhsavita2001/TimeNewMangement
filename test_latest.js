// Test latest deployment
const axios = require('axios');

const LATEST_URL = 'https://apilayer-mzwa9gxbg-soludoo.vercel.app/api';

async function testLatestDeployment() {
  console.log('🔍 Testing Latest Deployment for Fixes...\n');
  
  try {
    // 1. Get token from latest deployment
    console.log('1. 🎫 Getting token from latest deployment...');
    const tokenRes = await axios.get(`${LATEST_URL}/get-token`);
    const token = tokenRes.data.data.token;
    
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('   📧 Token email:', tokenPayload.email);
    console.log('   👤 Token name:', tokenPayload.firstName, tokenPayload.lastName);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Check profile
    console.log('\n2. 👤 Checking profile...');
    const profileRes = await axios.get(`${LATEST_URL}/me/profile`, { headers });
    const profile = profileRes.data.data.user;
    console.log('   Profile name:', profile.full_name);
    console.log('   Profile email:', profile.email);
    console.log('   🎯 Email match?:', tokenPayload.email === profile.email);

    // 3. Test missing timer endpoint
    console.log('\n3. ⏱️  Testing timer endpoint...');
    try {
      const timerRes = await axios.get(`${LATEST_URL}/me/timer`, { headers });
      console.log('   ✅ /api/me/timer endpoint exists!');
      console.log('   Timer data:', timerRes.data.data);
    } catch (error) {
      console.log('   ❌ /api/me/timer still missing:', error.response.status);
    }

    // 4. Test profile update persistence
    console.log('\n4. ✏️  Testing profile update...');
    const updateRes = await axios.put(`${LATEST_URL}/me/profile/name`, {
      first_name: 'Fixed',
      last_name: 'User'
    }, { headers });
    console.log('   ✅ Update response:', updateRes.data.data.full_name);

    // 5. Check persistence
    await new Promise(resolve => setTimeout(resolve, 2000));
    const persistCheck = await axios.get(`${LATEST_URL}/me/profile`, { headers });
    console.log('   📊 After 2s:', persistCheck.data.data.user.full_name);

    // 6. Get new token to see if email is synced
    console.log('\n6. 🔄 Getting new token after profile change...');
    const newTokenRes = await axios.get(`${LATEST_URL}/get-token`);
    const newToken = newTokenRes.data.data.token;
    const newPayload = JSON.parse(Buffer.from(newToken.split('.')[1], 'base64').toString());
    console.log('   📧 New token email:', newPayload.email);
    console.log('   👤 New token name:', newPayload.firstName, newPayload.lastName);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLatestDeployment();