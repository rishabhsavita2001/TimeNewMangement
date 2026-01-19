// Test profile persistence fix
const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRlbmFudElkIjoxLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJVc2VyIiwiaWF0IjoxNzY3ODU3MDY2LCJleHAiOjE3Njc5NDM0NjZ9.347q12ENIb1Ewd-s9tI30_f0Gyux4arFATKVimQwtuo';

async function testProfilePersistence() {
  console.log('🧪 Testing Profile Persistence Fix...\n');
  
  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Get current profile
    console.log('1. 👤 Getting current profile...');
    const currentProfile = await axios.get(`${BASE_URL}/me/profile`, { headers });
    console.log(`   Current name: ${currentProfile.data.data.user.full_name}`);
    console.log(`   Current email: ${currentProfile.data.data.user.email}\n`);

    // 2. Update name
    console.log('2. ✏️  Updating name to "John Doe"...');
    const nameUpdate = await axios.put(`${BASE_URL}/me/profile/name`, {
      first_name: 'John',
      last_name: 'Doe'
    }, { headers });
    console.log(`   ✅ Name updated: ${nameUpdate.data.data.full_name}`);
    console.log(`   Update time: ${nameUpdate.data.data.updated_at}\n`);

    // 3. Wait 2 seconds and check persistence
    console.log('3. ⏱️  Waiting 2 seconds then checking persistence...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const persistenceCheck1 = await axios.get(`${BASE_URL}/me/profile`, { headers });
    console.log(`   After 2s: ${persistenceCheck1.data.data.user.full_name}`);
    
    // 4. Wait another 10 seconds and check again
    console.log('4. ⏰ Waiting 10 more seconds then checking again...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const persistenceCheck2 = await axios.get(`${BASE_URL}/me/profile`, { headers });
    console.log(`   After 12s total: ${persistenceCheck2.data.data.user.full_name}`);

    // 5. Test email update persistence
    console.log('\n5. 📧 Testing email update persistence...');
    const emailUpdate = await axios.put(`${BASE_URL}/me/profile/email`, {
      email: 'john.doe@example.com'
    }, { headers });
    console.log(`   ✅ Email updated: ${emailUpdate.data.data.email}`);

    // 6. Wait and check email persistence
    await new Promise(resolve => setTimeout(resolve, 3000));
    const emailCheck = await axios.get(`${BASE_URL}/me/profile`, { headers });
    console.log(`   Email after 3s: ${emailCheck.data.data.user.email}\n`);

    // 7. Final verification
    console.log('7. 🔍 Final verification - Multiple quick requests...');
    for (let i = 0; i < 5; i++) {
      const quickCheck = await axios.get(`${BASE_URL}/me/profile`, { headers });
      console.log(`   Request ${i+1}: ${quickCheck.data.data.user.full_name} | ${quickCheck.data.data.user.email}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ PERSISTENCE TEST COMPLETED');
    console.log('If the name stays "John Doe" and email stays "john.doe@example.com" throughout all checks,');
    console.log('the persistence fix is working correctly! 🎉');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProfilePersistence();