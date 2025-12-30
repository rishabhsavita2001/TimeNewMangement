const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

// Simple test to check if server is working
async function testServerHealth() {
    console.log('=== Testing Server Health ===');
    
    try {
        // Test basic root endpoint first
        console.log('1. Testing root endpoint...');
        const rootResponse = await axios.get('https://api-layer.vercel.app');
        console.log('✅ Root response:', rootResponse.data);

        // Test Swagger endpoint
        console.log('\n2. Testing Swagger docs...');
        const swaggerResponse = await axios.get('https://api-layer.vercel.app/api-docs');
        console.log('✅ Swagger accessible');

        // Test simple API endpoint without auth
        console.log('\n3. Testing time correction types (no auth)...');
        const typesResponse = await axios.get(`${BASE_URL}/time-correction-types`);
        console.log('✅ Time correction types:', JSON.stringify(typesResponse.data, null, 2));

        // Test register endpoint
        console.log('\n4. Testing register endpoint...');
        const randomEmail = `test${Date.now()}@example.com`;
        const registerResponse = await axios.post(`${BASE_URL}/register`, {
            email: randomEmail,
            password: 'password123',
            name: 'Test User'
        });
        console.log('✅ Register response:', JSON.stringify(registerResponse.data, null, 2));

        // Try login with registered user
        console.log('\n5. Testing login with registered user...');
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            email: randomEmail,
            password: 'password123'
        });
        console.log('✅ Login successful:', JSON.stringify(loginResponse.data, null, 2));

        console.log('\n🎉 Server is healthy and new APIs are working!');

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

testServerHealth();