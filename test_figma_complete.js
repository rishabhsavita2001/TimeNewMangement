const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

// Test with proper authentication flow
async function testWithAuth() {
    console.log('=== Testing Figma Time Correction APIs with Proper Auth ===');
    
    try {
        // 1. Get auth token first
        console.log('1. Getting auth token...');
        const tokenResponse = await axios.get(`${BASE_URL}/get-token`);
        const token = tokenResponse.data.data.token;
        console.log('✅ Got auth token');

        // Headers with Bearer token
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test time correction types
        console.log('\n2. Testing GET /api/time-correction-types...');
        const typesResponse = await axios.get(`${BASE_URL}/time-correction-types`, { headers });
        console.log('✅ Time correction types:', JSON.stringify(typesResponse.data.data, null, 2));

        // 3. Test get my time corrections
        console.log('\n3. Testing GET /api/me/time-corrections...');
        const myCorrectionsResponse = await axios.get(`${BASE_URL}/me/time-corrections`, { headers });
        console.log('✅ My time corrections count:', myCorrectionsResponse.data.data.total_count);

        // 4. Test create new time correction (Missing work entry)
        console.log('\n4. Testing POST /api/me/time-corrections (Missing Work Entry)...');
        const missingWorkData = {
            type: 'missing_work_entry',
            date: '2024-12-23',
            requested_time_in: '09:00:00',
            requested_time_out: '18:00:00',
            reason: 'System was down, unable to clock in/out properly',
            issue_description: 'Complete work day missing due to system maintenance',
            additional_notes: 'I was present and working, can provide witness confirmation'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/me/time-corrections`, missingWorkData, { headers });
        console.log('✅ Missing work entry created:', {
            id: createResponse.data.data.id,
            type: createResponse.data.data.type,
            status: createResponse.data.data.status
        });

        // 5. Test create wrong clock time correction
        console.log('\n5. Testing POST /api/me/time-corrections (Wrong Clock Time)...');
        const wrongTimeData = {
            type: 'wrong_clock_time',
            date: '2024-12-22',
            actual_time_in: '08:45:00',
            requested_time_in: '09:00:00',
            reason: 'Clock recorded wrong time due to network delay',
            issue_description: 'System recorded early clock-in but actual time was 9 AM'
        };
        
        const wrongTimeResponse = await axios.post(`${BASE_URL}/me/time-corrections`, wrongTimeData, { headers });
        console.log('✅ Wrong time correction created:', {
            id: wrongTimeResponse.data.data.id,
            type: wrongTimeResponse.data.data.type,
            status: wrongTimeResponse.data.data.status
        });

        // 6. Test update status (simulate admin action)
        console.log('\n6. Testing PUT /api/time-corrections/{id}/status...');
        const correctionId = createResponse.data.data.id;
        const statusResponse = await axios.put(`${BASE_URL}/time-corrections/${correctionId}/status`, {
            status: 'approved',
            admin_comment: 'Request verified and approved by HR'
        }, { headers });
        console.log('✅ Status updated to approved');

        // 7. Test history
        console.log('\n7. Testing GET /api/me/time-corrections/history...');
        const historyResponse = await axios.get(`${BASE_URL}/me/time-corrections/history`, { headers });
        console.log('✅ History shows:', historyResponse.data.data.total_requests, 'total requests');

        console.log('\n🎉 ALL FIGMA-BASED TIME CORRECTION APIS WORKING PERFECTLY!');
        console.log('\n📋 SUMMARY:');
        console.log('• ✅ Time correction types retrieved');
        console.log('• ✅ Missing work entry requests working');
        console.log('• ✅ Wrong clock time corrections working');
        console.log('• ✅ Admin status updates working');
        console.log('• ✅ History tracking working');
        console.log('\n🔗 Live API: https://api-layer.vercel.app');
        console.log('📖 Swagger Docs: https://api-layer.vercel.app/api-docs');
        console.log('🎨 Ready for Figma mobile app integration!');

    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            url: error.config?.url?.replace(BASE_URL, '/api'),
            status: error.response?.status,
            data: error.response?.data?.message
        });
    }
}

testWithAuth();