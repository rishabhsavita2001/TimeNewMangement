// Test script to verify data consistency fix
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

console.log('🧪 Testing Data Consistency Fix...\n');

async function testProfileConsistency() {
    console.log('1️⃣ Testing Profile API Consistency...');

    try {
        // First, login to get token
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'john.doe@company.com',
            password: 'password123'
        });

        authToken = loginRes.data.data.token;
        const user1 = loginRes.data.data.user;
        console.log(`   ✅ Login successful - User: ${user1.firstName} ${user1.lastName} (ID: ${user1.id})`);

        // Call profile API 3 times
        const headers = { Authorization: `Bearer ${authToken}` };

        const profile1 = await axios.get(`${BASE_URL}/api/me`, { headers });
        const profile2 = await axios.get(`${BASE_URL}/api/me`, { headers });
        const profile3 = await axios.get(`${BASE_URL}/api/me`, { headers });

        const data1 = profile1.data.data;
        const data2 = profile2.data.data;
        const data3 = profile3.data.data;

        // Check consistency
        if (data1.id === data2.id && data2.id === data3.id &&
            data1.firstName === data2.firstName && data2.firstName === data3.firstName &&
            data1.lastName === data2.lastName && data2.lastName === data3.lastName) {
            console.log(`   ✅ Profile data is CONSISTENT across 3 calls!`);
            console.log(`      - Name: ${data1.firstName} ${data1.lastName}`);
            console.log(`      - ID: ${data1.id}`);
            console.log(`      - Email: ${data1.email}`);
            return true;
        } else {
            console.log(`   ❌ Profile data is INCONSISTENT!`);
            console.log(`      Call 1: ${data1.firstName} ${data1.lastName} (ID: ${data1.id})`);
            console.log(`      Call 2: ${data2.firstName} ${data2.lastName} (ID: ${data2.id})`);
            console.log(`      Call 3: ${data3.firstName} ${data3.lastName} (ID: ${data3.id})`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function testRegistrationConsistency() {
    console.log('\n2️⃣ Testing Registration Consistency...');

    try {
        const testEmail = 'test@example.com';

        // Register twice with same email
        const reg1 = await axios.post(`${BASE_URL}/api/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            password: 'test123'
        });

        const reg2 = await axios.post(`${BASE_URL}/api/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            password: 'test123'
        });

        const user1 = reg1.data.data.user;
        const user2 = reg2.data.data.user;

        if (user1.id === user2.id && user1.email === user2.email) {
            console.log(`   ✅ Registration returns SAME user for duplicate email!`);
            console.log(`      - User ID: ${user1.id}`);
            console.log(`      - Email: ${user1.email}`);
            return true;
        } else {
            console.log(`   ❌ Registration creates DIFFERENT users!`);
            console.log(`      User 1 ID: ${user1.id}`);
            console.log(`      User 2 ID: ${user2.id}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function testTimeEntryConsistency() {
    console.log('\n3️⃣ Testing Time Entry ID Consistency...');

    try {
        const headers = { Authorization: `Bearer ${authToken}` };

        // Create 3 time entries
        const entry1 = await axios.post(`${BASE_URL}/api/me/time-entries`, {
            date: '2025-01-20',
            start_time: '09:00',
            end_time: '17:00',
            project_id: 1,
            task_name: 'Testing',
            description: 'Test entry 1'
        }, { headers });

        const entry2 = await axios.post(`${BASE_URL}/api/me/time-entries`, {
            date: '2025-01-20',
            start_time: '09:00',
            end_time: '17:00',
            project_id: 1,
            task_name: 'Testing',
            description: 'Test entry 2'
        }, { headers });

        const entry3 = await axios.post(`${BASE_URL}/api/me/time-entries`, {
            date: '2025-01-20',
            start_time: '09:00',
            end_time: '17:00',
            project_id: 1,
            task_name: 'Testing',
            description: 'Test entry 3'
        }, { headers });

        const id1 = entry1.data.data.entry.id;
        const id2 = entry2.data.data.entry.id;
        const id3 = entry3.data.data.entry.id;

        // Check if IDs are sequential (not random)
        if (id2 === id1 + 1 && id3 === id2 + 1) {
            console.log(`   ✅ Time entry IDs are SEQUENTIAL (not random)!`);
            console.log(`      - Entry 1 ID: ${id1}`);
            console.log(`      - Entry 2 ID: ${id2}`);
            console.log(`      - Entry 3 ID: ${id3}`);
            return true;
        } else {
            console.log(`   ❌ Time entry IDs are NOT sequential!`);
            console.log(`      - Entry 1 ID: ${id1}`);
            console.log(`      - Entry 2 ID: ${id2}`);
            console.log(`      - Entry 3 ID: ${id3}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  DATA CONSISTENCY TEST SUITE');
    console.log('═══════════════════════════════════════════════════════\n');

    const results = [];

    results.push(await testProfileConsistency());
    results.push(await testRegistrationConsistency());
    results.push(await testTimeEntryConsistency());

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════');

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`\n  ✅ Passed: ${passed}/${total}`);
    console.log(`  ❌ Failed: ${total - passed}/${total}\n`);

    if (passed === total) {
        console.log('  🎉 ALL TESTS PASSED! Data consistency issue is FIXED! 🎉\n');
    } else {
        console.log('  ⚠️  Some tests failed. Please review the output above.\n');
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('Test suite error:', error.message);
    process.exit(1);
});
