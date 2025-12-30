const axios = require('axios');

async function testNewDeployment() {
    console.log('=== Testing New Deployment ===');
    
    try {
        const testUrl = 'https://apilayer-3h0w2iiti-soludoo.vercel.app';
        
        // Test basic endpoint
        console.log('Testing basic root endpoint...');
        const response = await axios.get(testUrl);
        console.log('✅ Response:', response.data);
        
    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Try to get more specific error info
        if (error.response && error.response.data) {
            console.log('Server error details:', error.response.data);
        }
    }
}

testNewDeployment();