const axios = require('axios');

async function testAuthAPIs() {
    console.log('🔍 Testing Authentication APIs...\n');
    
    const baseURL = 'https://api-layer.vercel.app';
    
    // Test 1: Login API
    console.log('1️⃣ Testing Login API (/auth/login):');
    try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@company.com',
            password: 'password123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log(`✅ Login Status: ${loginResponse.status}`);
        console.log(`📋 Login Response:`, JSON.stringify(loginResponse.data).substring(0, 200) + '...');
        
        // Try with generated token
        if (loginResponse.data.data?.token) {
            console.log(`🔑 Testing with generated token: ${loginResponse.data.data.token.substring(0, 30)}...`);
            
            const profileResponse = await axios.get(`${baseURL}/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${loginResponse.data.data.token}`
                }
            });
            console.log(`✅ Profile with login token: ${profileResponse.status}`);
        }
        
    } catch (error) {
        console.log(`❌ Login Error: ${error.response?.status || 'ERROR'}`);
        console.log(`📋 Login Error Details:`, error.response?.data || error.message);
    }
    
    // Test 2: Register API
    console.log('\n2️⃣ Testing Register API (/auth/register):');
    try {
        const registerResponse = await axios.post(`${baseURL}/auth/register`, {
            firstName: 'Test',
            lastName: 'User', 
            email: 'test@example.com',
            password: 'password123',
            employeeNumber: 'EMP123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log(`✅ Register Status: ${registerResponse.status}`);
        console.log(`📋 Register Response:`, JSON.stringify(registerResponse.data).substring(0, 200) + '...');
        
    } catch (error) {
        console.log(`❌ Register Error: ${error.response?.status || 'ERROR'}`);
        console.log(`📋 Register Error Details:`, error.response?.data || error.message);
    }
    
    // Test 3: Wrong credentials
    console.log('\n3️⃣ Testing Login with wrong credentials:');
    try {
        const wrongLoginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'wrong@email.com',
            password: 'wrongpassword'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log(`✅ Wrong Login Status: ${wrongLoginResponse.status}`);
        console.log(`📋 Wrong Login Response:`, JSON.stringify(wrongLoginResponse.data).substring(0, 200) + '...');
        
    } catch (error) {
        console.log(`❌ Wrong Login Error: ${error.response?.status || 'ERROR'}`);
        console.log(`📋 Wrong Login Error Details:`, error.response?.data || error.message);
    }
    
    // Test 4: Check if auth routes are accessible
    console.log('\n4️⃣ Testing Auth Route Accessibility:');
    const authRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/logout',
        '/auth/refresh'
    ];
    
    for (const route of authRoutes) {
        try {
            const response = await axios.get(`${baseURL}${route}`, {
                timeout: 5000,
                validateStatus: function (status) {
                    return status < 500; // Accept 4xx errors as they are expected for GET requests
                }
            });
            console.log(`✅ ${route}: ${response.status} (${response.status < 400 ? 'OK' : 'Expected Error'})`);
        } catch (error) {
            console.log(`❌ ${route}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    
    console.log('\n🔍 Auth API Testing Completed!');
}

testAuthAPIs().catch(console.error);