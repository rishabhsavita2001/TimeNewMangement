const axios = require('axios');

async function testBearerTokenSpecific() {
    console.log('🔍 Testing Bearer Token Authentication...\n');
    
    const baseURL = 'https://api-layer.vercel.app';
    
    // Test different token scenarios
    const tests = [
        {
            name: '1️⃣ No Token',
            headers: {}
        },
        {
            name: '2️⃣ Empty Bearer Token',
            headers: { 'Authorization': 'Bearer' }
        },
        {
            name: '3️⃣ Invalid Bearer Token',
            headers: { 'Authorization': 'Bearer invalid_token_123' }
        },
        {
            name: '4️⃣ Valid JWT Format Token',
            headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInRlbmFudElkIjoxfQ.test' }
        },
        {
            name: '5️⃣ Mock JWT Token',
            headers: { 'Authorization': 'Bearer mock-jwt-token-123456789' }
        },
        {
            name: '6️⃣ Simple Bearer Token',
            headers: { 'Authorization': 'Bearer test123' }
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`\n${test.name}:`);
            console.log(`Headers:`, test.headers);
            
            const response = await axios.get(`${baseURL}/api/profile`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...test.headers
                },
                timeout: 10000
            });
            
            console.log(`✅ Status: ${response.status}`);
            console.log(`📋 Response:`, JSON.stringify(response.data).substring(0, 150) + '...');
        } catch (error) {
            console.log(`❌ Status: ${error.response?.status || 'ERROR'}`);
            console.log(`📋 Error:`, error.response?.data || error.message);
        }
    }
    
    // Test Swagger UI specific scenario
    console.log('\n7️⃣ Swagger UI Simulation:');
    try {
        const response = await axios({
            method: 'get',
            url: `${baseURL}/api/profile`,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Authorization': 'Bearer test_swagger_token',
                'Content-Type': 'application/json',
                'Origin': 'https://api-layer.vercel.app',
                'Referer': 'https://api-layer.vercel.app/api-docs'
            },
            timeout: 10000
        });
        
        console.log(`✅ Swagger Simulation: ${response.status}`);
        console.log(`📋 Response:`, JSON.stringify(response.data).substring(0, 150) + '...');
    } catch (error) {
        console.log(`❌ Swagger Simulation: ${error.response?.status || 'ERROR'}`);
        console.log(`📋 Error:`, error.response?.data || error.message);
    }
    
    // Test all main endpoints with bearer token
    console.log('\n8️⃣ Testing All Endpoints with Bearer Token:');
    const endpoints = [
        '/api/health',
        '/api/test', 
        '/api/profile',
        '/api/dashboard',
        '/api/time-entries',
        '/api/leave-requests',
        '/api/projects'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': 'Bearer user_test_token_123'
                },
                timeout: 5000
            });
            console.log(`✅ ${endpoint}: ${response.status} OK`);
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    
    console.log('\n🔍 Bearer Token Testing Completed!');
}

testBearerTokenSpecific().catch(console.error);