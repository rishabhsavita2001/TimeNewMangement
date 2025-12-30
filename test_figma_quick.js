// 🎯 Figma APIs को Test करने के लिए Quick Script

const axios = require('axios');

async function testFigmaAPIs() {
    console.log('🎨 Testing Figma-based Time Correction APIs...\n');
    
    try {
        // 1. Get Bearer Token
        const tokenRes = await axios.get('https://api-layer.vercel.app/api/get-token');
        const token = tokenRes.data.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        console.log('✅ Bearer token प्राप्त हुआ\n');

        // 2. Test Issue Types (Figma के अनुसार)
        console.log('📋 Issue Types (Figma screen के अनुसार):');
        const typesRes = await axios.get('https://api-layer.vercel.app/api/time-correction-types', { headers });
        typesRes.data.data.forEach(type => {
            console.log(`   • ${type.name} (${type.color})`);
        });
        
        // 3. Test My Requests 
        console.log('\n📱 My Time Corrections:');
        const myRes = await axios.get('https://api-layer.vercel.app/api/me/time-corrections', { headers });
        console.log(`   • Total: ${myRes.data.data.total_count} requests`);
        console.log(`   • Pending: ${myRes.data.data.pending_count}`);
        
        // 4. Create New Request (Figma form के अनुसार)
        console.log('\n➕ Creating new correction request...');
        const newReq = await axios.post('https://api-layer.vercel.app/api/me/time-corrections', {
            type: 'missing_work_entry',
            date: '2024-12-24',
            requested_time_in: '09:00:00',
            requested_time_out: '18:00:00', 
            reason: 'Figma API test - Christmas day work',
            issue_description: 'Testing the new Figma-based API'
        }, { headers });
        console.log('   ✅ Request created successfully');
        
        // 5. Check History
        console.log('\n📊 Request History:');
        const histRes = await axios.get('https://api-layer.vercel.app/api/me/time-corrections/history', { headers });
        console.log(`   • Total Requests: ${histRes.data.data.total_requests}`);
        console.log(`   • Approved: ${histRes.data.data.approved_requests}`);
        console.log(`   • Rejected: ${histRes.data.data.rejected_requests}`);
        
        console.log('\n🎉 सभी Figma APIs successfully working!');
        console.log('🔗 Swagger: https://api-layer.vercel.app/api-docs');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testFigmaAPIs();