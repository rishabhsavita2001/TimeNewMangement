// Quick local test for user-specific projects
const axios = require('axios');

async function testLocal() {
  try {
    // Test local server
    const response = await axios.get('http://localhost:3000/api/get-token');
    console.log('Token retrieved:', response.data.success);
    
    const token = response.data.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const userProjects = await axios.get('http://localhost:3000/api/me/projects', { headers });
    console.log('✅ User projects:', userProjects.data.data.projects.length);
    
  } catch (error) {
    console.log('❌ Need to start local server first');
    console.log('Run: node index.js');
  }
}

testLocal();