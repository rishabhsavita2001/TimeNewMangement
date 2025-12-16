const axios = require('axios');

const baseUrl = 'http://localhost:3002';

async function testAllAPIs() {
  console.log('=== Testing All APIs ===\n');
  
  // Test 1: Health endpoint
  console.log('1. Testing Health Endpoint...');
  try {
    const response = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health endpoint working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
  
  console.log('\n2. Testing Test Endpoint...');
  try {
    const response = await axios.get(`${baseUrl}/test`);
    console.log('✅ Test endpoint working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Test endpoint failed:', error.message);
  }
  
  console.log('\n3. Testing Database Debug...');
  try {
    const response = await axios.get(`${baseUrl}/debug-db`);
    console.log('✅ Database debug working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Database debug failed:', error.message);
  }
  
  console.log('\n4. Testing Auth Login...');
  let authToken = null;
  try {
    const response = await axios.post(`${baseUrl}/auth/login`, {
      email: 'admin@company.com',
      password: 'password123'
    });
    console.log('✅ Auth login working');
    console.log('Response:', response.data);
    authToken = response.data.data?.token;
  } catch (error) {
    console.log('❌ Auth login failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
  
  console.log('\n5. Testing Protected API Endpoints...');
  
  // Test API test endpoint
  console.log('\n5a. Testing /api/test...');
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const response = await axios.get(`${baseUrl}/api/test`, { headers });
    console.log('✅ /api/test working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ /api/test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
  
  // Test user profile
  console.log('\n5b. Testing /api/user/profile...');
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const response = await axios.get(`${baseUrl}/api/user/profile`, { headers });
    console.log('✅ /api/user/profile working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ /api/user/profile failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
  
  // Test time entries
  console.log('\n5c. Testing /api/time-entries...');
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const response = await axios.get(`${baseUrl}/api/time-entries`, { headers });
    console.log('✅ /api/time-entries working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ /api/time-entries failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
  
  // Test projects
  console.log('\n5d. Testing /api/projects...');
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const response = await axios.get(`${baseUrl}/api/projects`, { headers });
    console.log('✅ /api/projects working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ /api/projects failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
  
  // Test leave requests
  console.log('\n5e. Testing /api/leave-requests...');
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const response = await axios.get(`${baseUrl}/api/leave-requests`, { headers });
    console.log('✅ /api/leave-requests working');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ /api/leave-requests failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
  
  console.log('\n=== API Testing Complete ===');
}

testAllAPIs().catch(console.error);