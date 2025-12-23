const axios = require('axios');

async function testDeleteAccountAPI() {
    console.log('🔍 Testing Delete Account API on Live Swagger');
    console.log('==============================================');
    
    const baseUrl = 'https://api-layer.vercel.app';
    
    try {
        console.log('\n1. Testing Login API...');
        
        // Login to get token
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'test@company.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful');
        console.log(`Token: ${loginResponse.data.token.substring(0, 20)}...`);
        
        const headers = {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('\n2. Testing DELETE Account API Structure...');
        
        // Test WITHOUT email field (old version)
        console.log('   Testing WITHOUT email field (old version)...');
        try {
            const deleteOldResponse = await axios.delete(`${baseUrl}/auth/delete-account`, {
                headers,
                data: {
                    password: 'password123',
                    confirmPassword: 'password123',
                    reason: 'Testing current API structure'
                }
            });
            
            console.log('🔄 API NEEDS UPDATE - accepts requests without email field');
            console.log(`   Response: ${deleteOldResponse.data.message}`);
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.data.message.includes('email'))) {
                console.log('✅ API ALREADY UPDATED - requires email field!');
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }
        
        console.log('\n   Testing WITH email field (new version)...');
        try {
            const deleteNewResponse = await axios.delete(`${baseUrl}/auth/delete-account`, {
                headers,
                data: {
                    email: 'test@company.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    reason: 'Testing API with email field from Node.js'
                }
            });
            
            console.log('✅ DELETE ACCOUNT API WITH EMAIL FIELD WORKING!');
            console.log(`   Success: ${deleteNewResponse.data.success}`);
            console.log(`   Message: ${deleteNewResponse.data.message}`);
        } catch (error) {
            console.log(`⚠️  Delete with email failed: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data)}`);
            }
        }
        
        console.log('\n3. Swagger UI Test Results:');
        console.log(`   🌐 Live Swagger UI: ${baseUrl}/api-docs`);
        console.log('   📝 Manual Test Steps:');
        console.log('      1. Open Swagger UI above');
        console.log('      2. Use /auth/login with test@company.com / password123');
        console.log('      3. Copy token and click "Authorize" button');
        console.log('      4. Test DELETE /auth/delete-account');
        console.log('      5. Check if email field is required');
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        }
    }
    
    console.log('\n🎯 Test completed!');
}

testDeleteAccountAPI();