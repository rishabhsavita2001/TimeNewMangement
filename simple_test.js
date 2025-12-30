const axios = require('axios');

// Simple direct test
async function simpleTest() {
    try {
        console.log('Testing /api/get-token directly...');
        const response = await axios.get('https://api-layer.vercel.app/api/get-token');
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.log('❌ Error:', {
            status: error.response?.status,
            message: error.response?.data
        });
        
        // Let's try the health endpoint instead
        console.log('\nTrying /api/health...');
        try {
            const healthResponse = await axios.get('https://api-layer.vercel.app/api/health');
            console.log('✅ Health check:', healthResponse.data);
        } catch (healthError) {
            console.log('❌ Health error:', healthError.response?.data);
        }
    }
}

simpleTest();