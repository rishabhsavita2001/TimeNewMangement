const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

// Test Time Correction APIs based on Figma designs
async function testFigmaTimeCorrecionAPIs() {
    console.log('=== Testing Figma Time Correction APIs on Live Environment ===');
    
    try {
        // 1. First get an auth token
        console.log('1. Getting auth token...');
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Auth token received');

        // Headers with Bearer token
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test GET /api/time-correction-types
        console.log('\n2. Testing GET /api/time-correction-types...');
        const typesResponse = await axios.get(`${BASE_URL}/time-correction-types`, { headers });
        console.log('✅ Time correction types:', JSON.stringify(typesResponse.data, null, 2));

        // 3. Test GET /api/me/time-corrections
        console.log('\n3. Testing GET /api/me/time-corrections...');
        const myCorrectionsResponse = await axios.get(`${BASE_URL}/me/time-corrections`, { headers });
        console.log('✅ My time corrections:', JSON.stringify(myCorrectionsResponse.data, null, 2));

        // 4. Test POST /api/me/time-corrections - Add missing work entry (from Figma)
        console.log('\n4. Testing POST /api/me/time-corrections (Add missing work entry)...');
        const newCorrectionData = {
            type: 'missing_work_entry',
            date: '2025-01-01',
            requested_time_in: '09:00:00',
            requested_time_out: '17:00:00',
            reason: 'I forgot to clock in and out on New Year day due to holiday confusion',
            issue_description: 'Missing clock in/out for full day work',
            additional_notes: 'Worked from office, can provide CCTV evidence if needed'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/me/time-corrections`, newCorrectionData, { headers });
        console.log('✅ New time correction created:', JSON.stringify(createResponse.data, null, 2));
        
        const correctionId = createResponse.data.data.id;

        // 5. Test POST /api/me/time-corrections - Wrong clock-in time (from Figma)
        console.log('\n5. Testing POST /api/me/time-corrections (Wrong clock-in time)...');
        const wrongTimeData = {
            type: 'wrong_clock_time',
            date: '2025-01-02',
            actual_time_in: '08:30:00',
            requested_time_in: '09:00:00',
            reason: 'Clock-in time was wrong due to system error',
            issue_description: 'System recorded early clock-in but I actually arrived at 9 AM'
        };
        
        const wrongTimeResponse = await axios.post(`${BASE_URL}/me/time-corrections`, wrongTimeData, { headers });
        console.log('✅ Wrong time correction created:', JSON.stringify(wrongTimeResponse.data, null, 2));

        // 6. Test GET /api/me/time-corrections/history
        console.log('\n6. Testing GET /api/me/time-corrections/history...');
        const historyResponse = await axios.get(`${BASE_URL}/me/time-corrections/history`, { headers });
        console.log('✅ Time corrections history:', JSON.stringify(historyResponse.data, null, 2));

        // 7. Test PUT /api/time-corrections/{id}/status (as admin/manager)
        console.log('\n7. Testing PUT /api/time-corrections/{id}/status...');
        const statusUpdateResponse = await axios.put(`${BASE_URL}/time-corrections/${correctionId}/status`, {
            status: 'approved',
            admin_notes: 'Request approved after verification'
        }, { headers });
        console.log('✅ Status updated:', JSON.stringify(statusUpdateResponse.data, null, 2));

        console.log('\n🎉 All Figma Time Correction APIs are working perfectly on Live Environment!');

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

testFigmaTimeCorrecionAPIs();