const axios = require('axios');

async function debugAuth() {
    try {
        // 1. Get fresh token
        console.log('1. Getting fresh token...');
        const tokenResponse = await axios.get('https://api-layer.vercel.app/api/get-token');
        const token = tokenResponse.data.data.token;
        console.log('Token received:', token.substring(0, 50) + '...');
        
        // 2. Test header format
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        console.log('Auth header:', headers.Authorization.substring(0, 50) + '...');
        
        // 3. Test with a working endpoint first
        try {
            console.log('\n3. Testing working endpoint /api/dashboard...');
            const dashResponse = await axios.get('https://api-layer.vercel.app/api/dashboard', { headers });
            console.log('✅ Dashboard works with this token');
        } catch (error) {
            console.log('❌ Dashboard failed:', error.response?.status, error.response?.data?.message);
        }
        
        // 4. Test time correction types
        try {
            console.log('\n4. Testing time correction types...');
            const typesResponse = await axios.get('https://api-layer.vercel.app/api/time-correction-types', { headers });
            console.log('✅ Time correction types work:', typesResponse.data.data.length, 'types');
        } catch (error) {
            console.log('❌ Time correction types failed:', error.response?.status, error.response?.data);
        }

    } catch (error) {
        console.error('Auth debug error:', error.message);
    }
}

debugAuth();