const axios = require('axios');

const baseUrl = 'http://localhost:3002';
let authToken = null;

async function testEndpoint(name, url, method = 'GET', data = null, headers = {}) {
    try {
        const config = { method, url, headers };
        if (data) config.data = data;
        
        const response = await axios(config);
        console.log(`✅ ${name}: SUCCESS`);
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`❌ ${name}: FAILED - ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error: ${JSON.stringify(error.response.data)}`);
        }
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('=== API Testing Started ===\n');
    
    // Test 1: Health
    console.log('1. Testing Health endpoint...');
    const health = await testEndpoint('Health', `${baseUrl}/health`);
    if (health.success) {
        console.log(`   Status: ${health.data.status}\n`);
    }
    
    // Test 2: Basic test
    console.log('2. Testing basic /test endpoint...');
    const test = await testEndpoint('Test', `${baseUrl}/test`);
    if (test.success) {
        console.log(`   Message: ${test.data.message}\n`);
    }
    
    // Test 3: Test login
    console.log('3. Testing /test-login endpoint...');
    const testLogin = await testEndpoint('Test Login', `${baseUrl}/test-login`, 'POST', {
        email: 'admin@company.com',
        password: 'password123'
    });
    if (testLogin.success) {
        console.log(`   Token: ${testLogin.data.token.substring(0,20)}...\n`);
    }
    
    // Test 4: Auth login
    console.log('4. Testing /auth/login endpoint...');
    const authLogin = await testEndpoint('Auth Login', `${baseUrl}/auth/login`, 'POST', {
        email: 'admin@company.com',
        password: 'password123'
    });
    if (authLogin.success) {
        authToken = authLogin.data.data.token;
        console.log(`   User: ${authLogin.data.data.user.firstName} ${authLogin.data.data.user.lastName}`);
        console.log(`   Token: ${authToken.substring(0,20)}...\n`);
    }
    
    // Use auth token for protected endpoints
    if (authToken) {
        const headers = { Authorization: `Bearer ${authToken}` };
        
        console.log('=== Testing Protected Endpoints ===\n');
        
        // Test 5: API Test
        console.log('5. Testing /api/test endpoint...');
        const apiTest = await testEndpoint('API Test', `${baseUrl}/api/test`, 'GET', null, headers);
        if (apiTest.success) {
            console.log(`   Message: ${apiTest.data.message}\n`);
        }
        
        // Test 6: User Profile
        console.log('6. Testing /api/user/profile endpoint...');
        const profile = await testEndpoint('User Profile', `${baseUrl}/api/user/profile`, 'GET', null, headers);
        if (profile.success) {
            console.log(`   User: ${profile.data.data.firstName} ${profile.data.data.lastName}\n`);
        }
        
        // Test 7: Time Entries
        console.log('7. Testing /api/time-entries endpoint...');
        const timeEntries = await testEndpoint('Time Entries', `${baseUrl}/api/time-entries`, 'GET', null, headers);
        if (timeEntries.success) {
            console.log(`   Count: ${timeEntries.data.data.count}\n`);
        }
        
        // Test 8: Projects
        console.log('8. Testing /api/projects endpoint...');
        const projects = await testEndpoint('Projects', `${baseUrl}/api/projects`, 'GET', null, headers);
        if (projects.success) {
            console.log(`   Count: ${projects.data.data.count}\n`);
        }
        
        // Test 9: Leave Requests
        console.log('9. Testing /api/leave-requests endpoint...');
        const leaveRequests = await testEndpoint('Leave Requests', `${baseUrl}/api/leave-requests`, 'GET', null, headers);
        if (leaveRequests.success) {
            console.log(`   Count: ${leaveRequests.data.data.count}\n`);
        }
        
        // Test 10: Dashboard
        console.log('10. Testing /api/user/dashboard endpoint...');
        const dashboard = await testEndpoint('Dashboard', `${baseUrl}/api/user/dashboard`, 'GET', null, headers);
        if (dashboard.success) {
            console.log(`   Time entries today: ${dashboard.data.data.timeEntriesToday || 0}\n`);
        }
    } else {
        console.log('❌ No auth token available - skipping protected endpoints\n');
    }
    
    console.log('=== API Testing Complete ===');
}

runTests().catch(console.error);