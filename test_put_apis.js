// Test PUT API functionality
const testPutAPI = async () => {
  try {
    console.log('🧪 Testing PUT API Fix...');
    
    // 1. Get token
    console.log('1. Getting token...');
    const tokenResponse = await fetch('https://api-layer.vercel.app/api/get-token');
    const tokenData = await tokenResponse.json();
    const token = tokenData.data.token;
    console.log('✅ Token received');
    
    // 2. Get initial profile
    console.log('\n2. Getting initial profile...');
    const headers = { 'Authorization': `Bearer ${token}` };
    const initialProfile = await fetch('https://api-layer.vercel.app/api/me/profile', { headers });
    const initialData = await initialProfile.json();
    console.log('Initial Name:', initialData.data.user.first_name, initialData.data.user.last_name);
    console.log('Initial Email:', initialData.data.user.email);
    
    // 3. Update name
    console.log('\n3. Updating name to "John Doe"...');
    const updateName = await fetch('https://api-layer.vercel.app/api/me/profile/name', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe'
      })
    });
    const updateResult = await updateName.json();
    console.log('Update Response:', updateResult.message);
    
    // 4. Get updated profile
    console.log('\n4. Getting updated profile...');
    const updatedProfile = await fetch('https://api-layer.vercel.app/api/me/profile', { headers });
    const updatedData = await updatedProfile.json();
    console.log('Updated Name:', updatedData.data.user.first_name, updatedData.data.user.last_name);
    console.log('Updated Email:', updatedData.data.user.email);
    
    // 5. Update email
    console.log('\n5. Updating email to "john.doe@test.com"...');
    const updateEmail = await fetch('https://api-layer.vercel.app/api/me/profile/email', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'john.doe@test.com'
      })
    });
    const emailResult = await updateEmail.json();
    console.log('Email Update Response:', emailResult.message);
    
    // 6. Final profile check
    console.log('\n6. Final profile check...');
    const finalProfile = await fetch('https://api-layer.vercel.app/api/me/profile', { headers });
    const finalData = await finalProfile.json();
    console.log('Final Name:', finalData.data.user.first_name, finalData.data.user.last_name);
    console.log('Final Email:', finalData.data.user.email);
    
    console.log('\n🎉 PUT API Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testPutAPI();