const axios = require('axios');

async function testCurrentLiveAPI() {
    console.log('🔍 Testing Current Live API Structure');
    console.log('=====================================');
    
    const baseUrl = 'https://api-layer.vercel.app';
    
    try {
        console.log('\n1. Testing Login...');
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'test@company.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        console.log(`Token: ${token.substring(0, 20)}...`);
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('\n2. Testing DELETE Account API WITHOUT email field...');
        try {
            const deleteResponse = await axios.delete(`${baseUrl}/auth/delete-account`, {
                headers,
                data: {
                    password: 'password123',
                    confirmPassword: 'password123',
                    reason: 'Testing current API structure'
                }
            });
            
            console.log('🟡 CURRENT API ACCEPTS REQUESTS WITHOUT EMAIL FIELD');
            console.log(`   Response: ${deleteResponse.data.message}`);
            console.log('   📝 This means deployment is needed!');
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('🟢 GOOD! API ALREADY REQUIRES EMAIL FIELD');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }
        
        console.log('\n3. Testing DELETE Account API WITH email field...');
        try {
            const deleteWithEmailResponse = await axios.delete(`${baseUrl}/auth/delete-account`, {
                headers,
                data: {
                    email: 'test@company.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    reason: 'Testing API with email field'
                }
            });
            
            console.log('✅ DELETE WITH EMAIL FIELD WORKS!');
            console.log(`   Response: ${deleteWithEmailResponse.data.message}`);
            
        } catch (error) {
            console.log(`⚠️  Delete with email failed: ${error.response ? error.response.data.message : error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('\n🎯 Test completed!');
}

testCurrentLiveAPI();