const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

// Test the new Figma Time Correction APIs
async function testFigmaAPIsWorking() {
    console.log('=== Testing Figma Time Correction APIs ===');
    
    try {
        // 1. Test time correction types (no auth required)
        console.log('1. Testing GET /api/time-correction-types...');
        const typesResponse = await axios.get(`${BASE_URL}/time-correction-types`);
        console.log('✅ Time correction types:', JSON.stringify(typesResponse.data, null, 2));

        // 2. Test getting auth token
        console.log('\n2. Testing authentication...');
        const tokenResponse = await axios.get(`${BASE_URL}/get-token`);
        const token = tokenResponse.data.token;
        console.log('✅ Got auth token');

        // Headers with Bearer token
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 3. Test get my time corrections
        console.log('\n3. Testing GET /api/me/time-corrections...');
        const myCorrectionsResponse = await axios.get(`${BASE_URL}/me/time-corrections`, { headers });
        console.log('✅ My time corrections:', JSON.stringify(myCorrectionsResponse.data, null, 2));

        // 4. Test create time correction
        console.log('\n4. Testing POST /api/me/time-corrections...');
        const newCorrectionData = {
            type: 'missing_work_entry',
            date: '2025-01-01',
            requested_time_in: '09:00:00',
            requested_time_out: '17:00:00',
            reason: 'Forgot to clock in and out on New Year day',
            issue_description: 'Missing clock in/out for full day work'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/me/time-corrections`, newCorrectionData, { headers });
        console.log('✅ New time correction created:', JSON.stringify(createResponse.data, null, 2));

        // 5. Test time correction history
        console.log('\n5. Testing GET /api/me/time-corrections/history...');
        const historyResponse = await axios.get(`${BASE_URL}/me/time-corrections/history`, { headers });
        console.log('✅ Time corrections history:', JSON.stringify(historyResponse.data, null, 2));

        // 6. Test Swagger documentation
        console.log('\n6. Testing Swagger documentation...');
        const swaggerResponse = await axios.get('https://api-layer.vercel.app/api-docs');
        console.log('✅ Swagger documentation accessible');

        console.log('\n🎉 ALL FIGMA TIME CORRECTION APIS ARE WORKING PERFECTLY!');
        console.log('🔗 Live Swagger: https://api-layer.vercel.app/api-docs');
        console.log('📱 APIs ready for mobile app integration');

    } catch (error) {
        console.error('❌ Error during testing:', {
            message: error.message,
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testFigmaAPIsWorking();