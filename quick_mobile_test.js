// Quick Mobile App API Verification
const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function quickMobileTest() {
  console.log('🚀 Mobile App API Final Verification\n');
  
  try {
    // 1. Projects API
    console.log('1. 📋 Projects API:');
    const projectsRes = await axios.get(`${BASE_URL}/projects`);
    projectsRes.data.data.projects.forEach(p => {
      console.log(`   ✅ ${p.name} (ID: ${p.id}) - ${p.color}`);
    });

    // 2. Locations API  
    console.log('\n2. 📍 Locations API:');
    const locationsRes = await axios.get(`${BASE_URL}/locations`);
    locationsRes.data.data.locations.forEach(l => {
      console.log(`   ✅ ${l.name} ${l.icon} (ID: ${l.id})`);
    });

    // 3. Token API
    console.log('\n3. 🎫 Token API:');
    const tokenRes = await axios.get(`${BASE_URL}/get-token`);
    const payload = JSON.parse(Buffer.from(tokenRes.data.data.token.split('.')[1], 'base64').toString());
    console.log(`   ✅ User: ${payload.firstName} ${payload.lastName}`);
    console.log(`   ✅ Email: ${payload.email}`);

    // 4. Timer Status API
    console.log('\n4. ⏱️  Timer Status API:');
    const headers = { 'Authorization': `Bearer ${tokenRes.data.data.token}` };
    const timerRes = await axios.get(`${BASE_URL}/me/timer`, { headers });
    console.log(`   ✅ Has Active Timer: ${timerRes.data.data.hasActiveTimer}`);
    console.log(`   ✅ User Name: ${timerRes.data.data.user.name}`);
    console.log(`   ✅ Status: ${timerRes.data.data.user.status}`);

    console.log('\n🎉 सभी APIs तैयार हैं! Mobile App को integrate करें:');
    console.log('\n📱 Mobile App Integration URLs:');
    console.log(`   Projects: ${BASE_URL}/projects`);
    console.log(`   Locations: ${BASE_URL}/locations`);
    console.log(`   Start Timer: POST ${BASE_URL}/me/timer/start`);
    console.log(`   Timer Status: ${BASE_URL}/me/timer`);
    console.log(`   Auth Token: ${BASE_URL}/get-token`);
    
    console.log('\n📋 Start Timer Request Body Example:');
    console.log('   {');
    console.log('     "projectId": 1,     // Project A');
    console.log('     "locationId": 1,    // Office');
    console.log('     "notes": "Client meeting, design review"');
    console.log('   }');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

quickMobileTest();