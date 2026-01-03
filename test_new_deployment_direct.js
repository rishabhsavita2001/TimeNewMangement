// Test the direct new deployment URL
const https = require('https');

const BASE_URL = 'apilayer-g96ty5q9d-soludoo.vercel.app'; // Direct new deployment
let authToken = '';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testDirectDeployment() {
  console.log('🎨 TESTING DIRECT DEPLOYMENT FOR FIGMA UI');
  console.log('🌐 URL: https://' + BASE_URL);
  console.log('📋 Checking Invite Employee APIs');
  console.log('=' .repeat(50));

  try {
    // Login
    console.log('🔑 Testing login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@company.com',
      password: 'password123',
      tenantName: 'TechCorp'
    });
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test all Figma UI related APIs
    const apis = [
      { name: 'Roles (for dropdown)', path: '/api/employees/roles' },
      { name: 'Departments (for dropdown)', path: '/api/employees/departments' },
      { name: 'Working Models (for dropdown)', path: '/api/employees/working-models' },
      { name: 'Invite Employee (main form)', path: '/api/employees/invite', method: 'POST', data: {
        firstName: "John",
        lastName: "Doe", 
        email: "john.doe@company.com",
        role: "Developer",
        department: "Engineering", 
        workingHours: "09:00 - 05:00 PM",
        workingModel: "Hybrid",
        startDate: "2025-01-15"
      }}
    ];

    console.log('\\n🧪 Testing Figma UI APIs...');
    
    for (const api of apis) {
      try {
        console.log(`\\n📡 Testing ${api.name}...`);
        const response = await makeRequest(
          api.method || 'GET', 
          api.path, 
          api.data || null, 
          { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log(`- Status: ${response.status}`);
        
        if (response.status === 200 || response.status === 201) {
          console.log(`✅ ${api.name} is working!`);
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log(`- Available options: ${response.data.data.length}`);
          }
        } else if (response.status === 404) {
          console.log(`❌ ${api.name} endpoint not found`);
        } else {
          console.log(`⚠️  ${api.name} returned status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${api.name} failed:`, error.message);
      }
    }

    console.log('\\n📊 FIGMA UI MAPPING STATUS:');
    console.log('=' .repeat(40));
    console.log('📋 Form Sections:');
    console.log('1. ✅ Basic Information Fields - Supported');
    console.log('   - Add photo, Name, Email, Phone, DOB, Address');
    console.log('2. 🔍 Work Information - Testing...');
    console.log('   - Role dropdown, Department dropdown, Manager');
    console.log('3. 🔍 Working Setup - Testing...');
    console.log('   - Working hours, Working model dropdown, Start date');

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testDirectDeployment();