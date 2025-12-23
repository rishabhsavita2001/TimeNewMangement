const axios = require('axios');

async function debugSwaggerIssues() {
    console.log('🔍 Debugging Swagger UI Issues...\n');
    
    const baseURL = 'https://api-layer.vercel.app';
    
    // 1. Test Swagger JSON accessibility
    try {
        console.log('1️⃣ Testing Swagger JSON...');
        const swaggerResponse = await axios.get(`${baseURL}/api-docs.json`);
        console.log(`✅ Swagger JSON: ${swaggerResponse.status} - Size: ${JSON.stringify(swaggerResponse.data).length} bytes`);
        
        // Check if security schemes are properly defined
        const securitySchemes = swaggerResponse.data.components?.securitySchemes;
        console.log(`🔐 Security Schemes:`, securitySchemes ? Object.keys(securitySchemes) : 'None');
    } catch (error) {
        console.log(`❌ Swagger JSON Error: ${error.message}`);
    }
    
    // 2. Test API without authentication
    try {
        console.log('\n2️⃣ Testing API without token...');
        const response = await axios.get(`${baseURL}/api/health`);
        console.log(`✅ Health API (no auth): ${response.status} - ${response.data.message}`);
    } catch (error) {
        console.log(`❌ Health API Error: ${error.response?.status} - ${error.message}`);
    }
    
    // 3. Test API with Bearer token (simulating Swagger behavior)
    try {
        console.log('\n3️⃣ Testing API with Bearer token...');
        const response = await axios.get(`${baseURL}/api/profile`, {
            headers: {
                'Authorization': 'Bearer fake_token_from_swagger'
            }
        });
        console.log(`✅ Profile API (with token): ${response.status} - User: ${response.data.user?.username}`);
    } catch (error) {
        console.log(`❌ Profile API Error: ${error.response?.status} - ${error.message}`);
    }
    
    // 4. Test CORS headers
    try {
        console.log('\n4️⃣ Testing CORS headers...');
        const response = await axios.options(`${baseURL}/api/profile`);
        console.log(`✅ CORS Options: ${response.status}`);
        console.log(`🌐 CORS Headers:`, response.headers['access-control-allow-origin'] || 'Not set');
    } catch (error) {
        console.log(`❌ CORS Error: ${error.message}`);
    }
    
    // 5. Test all main APIs that would be used in Swagger
    console.log('\n5️⃣ Testing main APIs...');
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
                    'Authorization': 'Bearer test_token'
                },
                timeout: 5000
            });
            console.log(`✅ ${endpoint}: ${response.status} OK`);
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    
    // 6. Simulate Swagger UI request exactly
    try {
        console.log('\n6️⃣ Simulating exact Swagger UI request...');
        const response = await axios({
            method: 'get',
            url: `${baseURL}/api/profile`,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log(`✅ Swagger simulation: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
        console.log(`❌ Swagger simulation error: ${error.response?.status} - ${error.message}`);
        if (error.response?.data) {
            console.log(`📋 Error details:`, error.response.data);
        }
    }
    
    console.log('\n🔍 Debug completed!');
}

debugSwaggerIssues().catch(console.error);