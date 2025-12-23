const fetch = require('node-fetch');

async function testDeleteAccountAPI() {
    const baseUrl = 'https://apilayer-mw09v8dwi-soludoo.vercel.app';
    
    try {
        console.log('🔐 Testing Delete Account API');
        console.log('===============================');
        
        // Step 1: Login to get token
        console.log('1. Logging in to get token...');
        const loginResponse = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@company.com',
                password: 'password123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`Token: ${loginData.token.substring(0, 20)}...`);
        
        // Step 2: Test Delete Account API
        console.log('\n2. Testing delete account endpoint...');
        const deleteResponse = await fetch(`${baseUrl}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: 'password123',
                confirmPassword: 'password123',
                reason: 'Testing API from Node.js'
            })
        });
        
        const deleteData = await deleteResponse.json();
        
        if (deleteResponse.ok) {
            console.log('✅ DELETE ACCOUNT API IS WORKING!');
            console.log(`Status: ${deleteResponse.status}`);
            console.log(`Success: ${deleteData.success}`);
            console.log(`Message: ${deleteData.message}`);
            if (deleteData.data) {
                console.log(`Deleted at: ${deleteData.data.deletedAt}`);
            }
        } else {
            console.log('❌ Delete account API failed');
            console.log(`Status: ${deleteResponse.status}`);
            console.log(`Error: ${deleteData.error || 'Unknown error'}`);
            console.log(`Message: ${deleteData.message || 'No message'}`);
        }
        
        // Step 3: Test Swagger UI accessibility
        console.log('\n3. Testing Swagger UI...');
        const swaggerResponse = await fetch(`${baseUrl}/docs/`);
        
        if (swaggerResponse.ok) {
            console.log('✅ Swagger UI is accessible');
            console.log(`Swagger URL: ${baseUrl}/docs/`);
        } else {
            console.log('❌ Swagger UI not accessible');
            console.log(`Status: ${swaggerResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testDeleteAccountAPI();