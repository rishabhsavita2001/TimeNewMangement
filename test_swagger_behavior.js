const axios = require('axios');

async function testSwaggerUIBehavior() {
    console.log('🔍 Testing Swagger UI Exact Behavior...\n');
    
    const baseURL = 'https://api-layer.vercel.app';
    
    // Test 1: Swagger UI tries to load the spec
    try {
        console.log('1️⃣ Testing Swagger Spec Loading:');
        const specResponse = await axios.get(`${baseURL}/api-docs.json`, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Origin': baseURL,
                'Referer': `${baseURL}/api-docs`
            }
        });
        console.log(`✅ Swagger Spec: ${specResponse.status} - ${JSON.stringify(specResponse.data).length} chars`);
    } catch (error) {
        console.log(`❌ Swagger Spec Error: ${error.response?.status} - ${error.message}`);
    }
    
    // Test 2: Simulate exact Swagger UI OPTIONS request
    try {
        console.log('\n2️⃣ Testing CORS Preflight:');
        const optionsResponse = await axios.options(`${baseURL}/auth/login`, {
            headers: {
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'authorization,content-type',
                'Origin': baseURL,
                'Referer': `${baseURL}/api-docs`
            }
        });
        console.log(`✅ OPTIONS: ${optionsResponse.status}`);
        console.log(`📋 CORS Headers:`, optionsResponse.headers['access-control-allow-origin'] || 'Not set');
    } catch (error) {
        console.log(`❌ OPTIONS Error: ${error.response?.status} - ${error.message}`);
    }
    
    // Test 3: Simulate Swagger UI POST request exactly
    try {
        console.log('\n3️⃣ Testing Register API (Swagger UI style):');
        const registerResponse = await axios({
            method: 'POST',
            url: `${baseURL}/auth/register`,
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/json',
                'Origin': baseURL,
                'Referer': `${baseURL}/api-docs`,
                'User-Agent': 'Mozilla/5.0 (Swagger UI)'
            },
            data: {
                firstName: 'SwaggerTest',
                lastName: 'User',
                email: 'swagger@test.com',
                password: 'test123',
                employeeNumber: 'SWAGGER001'
            },
            timeout: 15000
        });
        console.log(`✅ Register (Swagger style): ${registerResponse.status}`);
        console.log(`📋 Register Response:`, JSON.stringify(registerResponse.data).substring(0, 150) + '...');
    } catch (error) {
        console.log(`❌ Register (Swagger style) Error: ${error.response?.status}`);
        console.log(`📋 Error Details:`, error.response?.data || error.message);
        console.log(`📋 Response Headers:`, error.response?.headers || 'None');
    }
    
    // Test 4: Login API with Swagger headers
    try {
        console.log('\n4️⃣ Testing Login API (Swagger UI style):');
        const loginResponse = await axios({
            method: 'POST',
            url: `${baseURL}/auth/login`,
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/json',
                'Origin': baseURL,
                'Referer': `${baseURL}/api-docs`,
                'User-Agent': 'Mozilla/5.0 (Swagger UI)'
            },
            data: {
                email: 'admin@company.com',
                password: 'password123'
            },
            timeout: 15000
        });
        console.log(`✅ Login (Swagger style): ${loginResponse.status}`);
        const token = loginResponse.data.data?.token;
        console.log(`🔑 Token received: ${token ? token.substring(0, 30) + '...' : 'None'}`);
        
        // Test 5: Use token for protected API
        if (token) {
            try {
                console.log('\n5️⃣ Testing Protected API with Token (Swagger style):');
                const profileResponse = await axios({
                    method: 'GET',
                    url: `${baseURL}/api/profile`,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Origin': baseURL,
                        'Referer': `${baseURL}/api-docs`
                    },
                    timeout: 15000
                });
                console.log(`✅ Profile with Token: ${profileResponse.status}`);
                console.log(`📋 Profile Data:`, JSON.stringify(profileResponse.data).substring(0, 150) + '...');
            } catch (error) {
                console.log(`❌ Profile with Token Error: ${error.response?.status}`);
                console.log(`📋 Profile Error:`, error.response?.data || error.message);
            }
        }
        
    } catch (error) {
        console.log(`❌ Login (Swagger style) Error: ${error.response?.status}`);
        console.log(`📋 Error Details:`, error.response?.data || error.message);
    }
    
    console.log('\n🔍 Swagger UI Behavior Testing Completed!');
}

testSwaggerUIBehavior().catch(console.error);