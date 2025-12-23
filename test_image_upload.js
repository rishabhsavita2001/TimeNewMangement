const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Create a simple test image (1x1 PNG pixel)
const createTestImage = () => {
  // Simple 1x1 black PNG pixel (base64 data)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  const testImagePath = path.join(__dirname, 'test-profile-image.png');
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
};

async function testImageUploadAPI() {
  const BASE_URL = 'http://localhost:3002';
  
  try {
    console.log('🧪 Testing Image Upload API...\n');
    
    // Create test image
    console.log('📝 Creating test image...');
    const imagePath = createTestImage();
    console.log('✅ Test image created:', imagePath);
    
    // Step 1: Test the basic API health
    console.log('\n1️⃣ Testing API health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ API Health:', healthResponse.data);
    
    // Step 2: Test get-token endpoint (since auth is required)
    console.log('\n2️⃣ Getting test token...');
    const tokenResponse = await axios.get(`${BASE_URL}/api/get-token`);
    const token = tokenResponse.data.token;
    console.log('✅ Test token acquired:', token);
    
    // Step 3: Test GET profile image (should return no image initially)
    console.log('\n3️⃣ Testing GET profile image...');
    try {
      const getImageResponse = await axios.get(`${BASE_URL}/api/profile/image`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ GET profile image response:', getImageResponse.data);
    } catch (error) {
      console.log('📋 GET profile image:', error.response?.data || error.message);
    }
    
    // Step 4: Test image upload
    console.log('\n4️⃣ Testing PUT profile image upload...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const uploadResponse = await axios.put(
      `${BASE_URL}/api/profile/image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024
      }
    );
    
    console.log('✅ Image upload successful!');
    console.log('📊 Upload response:', JSON.stringify(uploadResponse.data, null, 2));
    
    // Step 5: Test GET profile image again (should return the uploaded image)
    console.log('\n5️⃣ Testing GET profile image after upload...');
    const getImageAfterResponse = await axios.get(`${BASE_URL}/api/profile/image`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ GET profile image after upload:', getImageAfterResponse.data);
    
    // Step 6: Test image access via static URL
    if (uploadResponse.data.data?.imageUrl) {
      console.log('\n6️⃣ Testing static image access...');
      const staticImageUrl = `${BASE_URL}${uploadResponse.data.data.imageUrl}`;
      try {
        const staticResponse = await axios.head(staticImageUrl);
        console.log('✅ Static image accessible:', staticImageUrl);
        console.log('📋 Content-Type:', staticResponse.headers['content-type']);
      } catch (error) {
        console.log('❌ Static image not accessible:', error.message);
      }
    }
    
    // Step 7: Test DELETE profile image
    console.log('\n7️⃣ Testing DELETE profile image...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/profile/image`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Image deletion successful:', deleteResponse.data);
    } catch (error) {
      console.log('📋 DELETE profile image:', error.response?.data || error.message);
    }
    
    // Cleanup
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('\n🧹 Cleanup: Test image file deleted');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Error response:', error.response.data);
      console.error('📋 Status code:', error.response.status);
    }
  }
}

// Run the test
if (require.main === module) {
  testImageUploadAPI();
}

module.exports = { testImageUploadAPI };