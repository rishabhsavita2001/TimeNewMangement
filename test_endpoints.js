const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function testEndpoints() {
    try {
        // Get token
        const tokenResponse = await axios.get(`${BASE_URL}/get-token`);
        const token = tokenResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };

        // Test the new Figma endpoints that were added
        const endpoints = [
            { url: '/time-correction-types', method: 'get', name: 'Time Correction Types' },
            { url: '/me/time-corrections', method: 'get', name: 'My Time Corrections' },
            { url: '/me/time-corrections/history', method: 'get', name: 'Time Correction History' }
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Testing ${endpoint.name}...`);
                const response = await axios({
                    method: endpoint.method,
                    url: `${BASE_URL}${endpoint.url}`,
                    headers
                });
                console.log(`✅ ${endpoint.name}: Working`);
            } catch (error) {
                console.log(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            }
        }

        // Test creating a time correction
        try {
            console.log('Testing Create Time Correction...');
            const response = await axios.post(`${BASE_URL}/me/time-corrections`, {
                type: 'missing_work_entry',
                date: '2024-12-23',
                reason: 'Test request'
            }, { headers });
            console.log('✅ Create Time Correction: Working');
        } catch (error) {
            console.log(`❌ Create Time Correction: ${error.response?.status}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEndpoints();