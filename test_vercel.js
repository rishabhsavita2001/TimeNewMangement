const axios = require('axios');

// Replace with your actual Vercel deployment URL
const VERCEL_URL = process.argv[2] || 'https://api-layer.vercel.app';

async function testVercelAPIs() {
    console.log(`🚀 Testing Vercel APIs at: ${VERCEL_URL}`);
    console.log('================================\n');
    
    let authToken = null;
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health endpoint...');
        const health = await axios.get(`${VERCEL_URL}/health`);
        console.log('✅ Health:', health.data.status);
        
        // Test 2: Basic Test
        console.log('\n2. Testing /test endpoint...');
        const test = await axios.get(`${VERCEL_URL}/test`);
        console.log('✅ Test:', test.data.message);
        console.log('   Environment:', test.data.environment || 'Unknown');
        
        // Test 3: Test Login (Mock)
        console.log('\n3. Testing /test-login endpoint...');
        const testLogin = await axios.post(`${VERCEL_URL}/test-login`, {
            email: 'admin@company.com',
            password: 'password123'
        });
        console.log('✅ Test Login: Success');
        console.log('   Token:', testLogin.data.token.substring(0, 30) + '...');
        
        // Test 4: Auth Login
        console.log('\n4. Testing /auth/login endpoint...');
        const authLogin = await axios.post(`${VERCEL_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'password123'
        });
        console.log('✅ Auth Login: Success');
        console.log('   User:', authLogin.data.data.user.firstName, authLogin.data.data.user.lastName);
        
        authToken = authLogin.data.data.token;
        
        // Test Protected Endpoints
        console.log('\n=== Testing Protected Endpoints ===');
        const headers = { Authorization: `Bearer ${authToken}` };
        
        // Test 5: API Test
        console.log('\n5. Testing /api/test...');
        const apiTest = await axios.get(`${VERCEL_URL}/api/test`, { headers });
        console.log('✅ API Test:', apiTest.data.message);
        
        // Test 6: User Profile
        console.log('\n6. Testing /api/user/profile...');
        const profile = await axios.get(`${VERCEL_URL}/api/user/profile`, { headers });
        console.log('✅ User Profile:', profile.data.data.firstName, profile.data.data.lastName);
        
        // Test 7: Time Entries
        console.log('\n7. Testing /api/time-entries...');
        const timeEntries = await axios.get(`${VERCEL_URL}/api/time-entries`, { headers });
        console.log('✅ Time Entries: Found', timeEntries.data.data.count, 'entries');
        
        // Test 8: Projects
        console.log('\n8. Testing /api/projects...');
        const projects = await axios.get(`${VERCEL_URL}/api/projects`, { headers });
        console.log('✅ Projects: Found', projects.data.data.count, 'projects');
        
        // Test 9: Leave Requests
        console.log('\n9. Testing /api/leave-requests...');
        const leaveRequests = await axios.get(`${VERCEL_URL}/api/leave-requests`, { headers });
        console.log('✅ Leave Requests: Found', leaveRequests.data.data.count, 'requests');
        
        // Test 10: Dashboard
        console.log('\n10. Testing /api/user/dashboard...');
        const dashboard = await axios.get(`${VERCEL_URL}/api/user/dashboard`, { headers });
        console.log('✅ Dashboard: Success');
        if (dashboard.data.data) {
            console.log('   Time entries today:', dashboard.data.data.timeEntriesToday || 0);
            console.log('   Active projects:', dashboard.data.data.activeProjects || 0);
        }
        
        console.log('\n🎉 All Vercel APIs are working perfectly!');
        console.log('\n📋 Summary:');
        console.log('- Health Check: ✅');
        console.log('- Basic Test: ✅');
        console.log('- Authentication: ✅');
        console.log('- Protected Routes: ✅');
        console.log('- Mock Database: ✅');
        console.log('\n🌐 Live URL:', VERCEL_URL);
        
    } catch (error) {
        console.error('\n❌ API Test Failed:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        console.error('\n🔧 Check your Vercel deployment and environment variables');
    }
}

// Usage: node test_vercel.js [your-vercel-url]
testVercelAPIs();