console.log('🔍 CHECKING ALL APIS ON LIVE SERVER...\n');

const APIs = [
    { name: 'Health', url: 'https://api-layer.vercel.app/api/health', method: 'GET' },
    { name: 'Login', url: 'https://api-layer.vercel.app/api/auth/login', method: 'POST', 
      body: { email: 'test@test.com', password: 'password123' } },
    { name: 'API Docs', url: 'https://api-layer.vercel.app/api-docs', method: 'GET' },
    { name: 'Swagger JSON', url: 'https://api-layer.vercel.app/swagger.json', method: 'GET' },
];

const protectedAPIs = [
    { name: 'Roles', url: 'https://api-layer.vercel.app/api/employees/roles', method: 'GET' },
    { name: 'Departments', url: 'https://api-layer.vercel.app/api/employees/departments', method: 'GET' },
    { name: 'Working Models', url: 'https://api-layer.vercel.app/api/employees/working-models', method: 'GET' },
    { name: 'Employees', url: 'https://api-layer.vercel.app/api/employees', method: 'GET' },
    { name: 'Invite Employee', url: 'https://api-layer.vercel.app/api/employees/invite', method: 'POST',
      body: { firstName: 'Test', lastName: 'User', email: 'test@company.com', role: 'Developer', 
              department: 'Engineering', workingHours: '40 hours/week', workingModel: 'Remote', startDate: '2024-01-15' } }
];

async function testAPI(api, token = null) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const options = {
            method: api.method,
            headers: headers
        };
        
        if (api.body) {
            options.body = JSON.stringify(api.body);
        }
        
        const response = await fetch(api.url, options);
        const status = response.status;
        
        if (status === 200 || status === 201) {
            console.log(`✅ ${api.name}: WORKING (${status})`);
            
            if (api.name === 'Login') {
                const data = await response.json();
                return data.data?.token || data.token;
            }
            return true;
        } else {
            console.log(`❌ ${api.name}: FAILED (${status})`);
            const error = await response.text();
            console.log(`   Error: ${error.substring(0, 100)}...`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${api.name}: ERROR - ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('📋 Testing Basic APIs...');
    let token = null;
    
    for (const api of APIs) {
        const result = await testAPI(api);
        if (api.name === 'Login' && result && typeof result === 'string') {
            token = result;
            console.log(`   🔑 Token obtained: ${token.substring(0, 20)}...`);
        }
    }
    
    console.log('\n🔐 Testing Protected APIs...');
    if (token) {
        for (const api of protectedAPIs) {
            await testAPI(api, token);
        }
    } else {
        console.log('❌ No token available, skipping protected APIs');
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('If any APIs show FAILED, we need to fix the deployment.');
}

// Run if Node.js
if (typeof window === 'undefined') {
    const fetch = require('node-fetch');
    runTests();
}