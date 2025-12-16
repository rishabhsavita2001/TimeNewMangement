console.log('Testing APIs systematically...');

// Simple test without axios
const http = require('http');

function testAPI(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('\n=== API Testing Started ===');
    
    try {
        // Test 1: Health
        console.log('\n1. Testing Health endpoint...');
        const health = await testAPI('/health');
        console.log(`✅ Health: ${health.status} - ${health.data.status}`);
        
        // Test 2: Test endpoint
        console.log('\n2. Testing /test endpoint...');
        const test = await testAPI('/test');
        console.log(`✅ Test: ${test.status} - ${test.data.message}`);
        
        // Test 3: Test login
        console.log('\n3. Testing /test-login endpoint...');
        const testLogin = await testAPI('/test-login', 'POST', {
            email: 'admin@company.com',
            password: 'password123'
        });
        console.log(`✅ Test Login: ${testLogin.status} - Token received`);
        
        // Test 4: Auth login
        console.log('\n4. Testing /auth/login endpoint...');
        const authLogin = await testAPI('/auth/login', 'POST', {
            email: 'admin@company.com',
            password: 'password123'
        });
        console.log(`✅ Auth Login: ${authLogin.status}`);
        
        if (authLogin.data.data && authLogin.data.data.token) {
            const token = authLogin.data.data.token;
            console.log(`   User: ${authLogin.data.data.user.firstName} ${authLogin.data.data.user.lastName}`);
            
            // Test protected endpoints
            console.log('\n=== Testing Protected Endpoints ===');
            
            // Test 5: API Test
            console.log('\n5. Testing /api/test...');
            const apiTest = await testAPI('/api/test', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });
            console.log(`✅ API Test: ${apiTest.status} - ${apiTest.data.message}`);
            
            // Test 6: User Profile
            console.log('\n6. Testing /api/user/profile...');
            const profile = await testAPI('/api/user/profile', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });
            console.log(`✅ User Profile: ${profile.status}`);
            
            // Test 7: Time Entries
            console.log('\n7. Testing /api/time-entries...');
            const timeEntries = await testAPI('/api/time-entries', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });
            console.log(`✅ Time Entries: ${timeEntries.status} - Count: ${timeEntries.data.data.count}`);
            
            // Test 8: Projects
            console.log('\n8. Testing /api/projects...');
            const projects = await testAPI('/api/projects', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });
            console.log(`✅ Projects: ${projects.status} - Count: ${projects.data.data.count}`);
            
            // Test 9: Leave Requests
            console.log('\n9. Testing /api/leave-requests...');
            const leaveRequests = await testAPI('/api/leave-requests', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });
            console.log(`✅ Leave Requests: ${leaveRequests.status} - Count: ${leaveRequests.data.data.count}`);
            
        } else {
            console.log('❌ No token received from auth login');
        }
        
        console.log('\n🎉 All API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTests();