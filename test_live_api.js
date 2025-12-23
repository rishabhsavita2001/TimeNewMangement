console.log("🔍 Testing Live API Status");
console.log("=".repeat(50));

const testAPI = async () => {
    const liveUrl = "https://api-layer.vercel.app";
    
    console.log(`\n🌐 Testing Live API: ${liveUrl}`);
    
    try {
        // Test login first
        const loginResponse = await fetch(`${liveUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test@company.com",
                password: "password123"
            })
        });
        
        if (!loginResponse.ok) {
            console.log("❌ Login failed - API might not be accessible");
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log("✅ Login successful");
        
        // Test delete account API structure
        console.log("\n🔍 Testing DELETE account API current structure...");
        
        // Test without email field (old version)
        const deleteWithoutEmail = await fetch(`${liveUrl}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: "password123",
                confirmPassword: "password123",
                reason: "Testing current API structure"
            })
        });
        
        const responseWithoutEmail = await deleteWithoutEmail.text();
        
        if (deleteWithoutEmail.status === 400 && responseWithoutEmail.includes('email')) {
            console.log("✅ API already has email field requirement - UPDATED VERSION LIVE!");
        } else if (deleteWithoutEmail.status === 200) {
            console.log("🔄 API NEEDS UPDATE - still accepts requests without email field");
            console.log("📋 Need to deploy updated version with email field");
        } else {
            console.log(`⚠️  Unexpected response: ${deleteWithoutEmail.status}`);
            console.log(`Response: ${responseWithoutEmail}`);
        }
        
        // Test with email field (new version)
        console.log("\n🔍 Testing with email field...");
        const deleteWithEmail = await fetch(`${liveUrl}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: "test@company.com",
                password: "password123",
                confirmPassword: "password123", 
                reason: "Testing with email field"
            })
        });
        
        const responseWithEmail = await deleteWithEmail.text();
        console.log(`Status with email: ${deleteWithEmail.status}`);
        console.log(`Response: ${responseWithEmail}`);
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log(`\n🔗 Live Swagger UI: ${liveUrl}/api-docs`);
    console.log("🎯 Manual Test Instructions:");
    console.log("1. Open Swagger UI");
    console.log("2. Login with: test@company.com / password123");  
    console.log("3. Test DELETE /auth/delete-account");
    console.log("4. Check if email field is required");
};

// Run if we're in Node.js environment
if (typeof window === 'undefined') {
    // We're in Node.js
    const fetch = require('node-fetch');
    testAPI();
} else {
    console.log("Run this script in Node.js to test the API");
}