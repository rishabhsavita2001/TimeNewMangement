// Test direct deployment for Figma UI fix
const https = require('https');

const BASE_URL = 'apilayer-4qoj722tr-soludoo.vercel.app';

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

async function testFixedDeployment() {
  console.log('🔧 TESTING FIXED DEPLOYMENT');
  console.log('🌐 URL: https://' + BASE_URL);
  console.log('✅ Fixed duplicate APIs issue');
  console.log('🎨 Testing Figma UI APIs');
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
    
    const authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test Figma UI APIs
    console.log('\\n🎨 Testing Figma UI APIs...');
    
    const apis = [
      { name: 'Invite Employee', path: '/api/employees/invite', method: 'POST', data: {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        role: "Developer", 
        department: "Engineering",
        workingHours: "09:00 - 05:00 PM",
        workingModel: "Hybrid",
        startDate: "2025-01-15"
      }},
      { name: 'Roles Dropdown', path: '/api/employees/roles' },
      { name: 'Departments Dropdown', path: '/api/employees/departments' },
      { name: 'Working Models Dropdown', path: '/api/employees/working-models' }
    ];

    let successCount = 0;
    
    for (const api of apis) {
      try {
        console.log(`\\n📡 Testing ${api.name}...`);
        const response = await makeRequest(
          api.method || 'GET',
          api.path,
          api.data || null,
          { 'Authorization': `Bearer ${authToken}` }
        );
        
        if (response.status === 200 || response.status === 201) {
          console.log(`✅ ${api.name} working! Status: ${response.status}`);
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log(`- Available options: ${response.data.data.length}`);
          } else if (response.data.data) {
            console.log(`- Response: Success`);
          }
          successCount++;
        } else {
          console.log(`❌ ${api.name} failed - Status: ${response.status}`);
          if (response.status === 404) {
            console.log('   Still not found after fix');
          }
        }
      } catch (error) {
        console.log(`❌ ${api.name} error:`, error.message);
      }
    }

    console.log('\\n📊 RESULTS AFTER FIX:');
    console.log('=' .repeat(40));
    console.log(`✅ Working APIs: ${successCount}/${apis.length}`);
    
    if (successCount === apis.length) {
      console.log('🎉 ALL FIGMA UI APIS FIXED AND WORKING!');
      console.log('✅ Invite employee form fully supported');
      console.log('✅ All dropdowns working');
      console.log('✅ Ready for production use');
    } else if (successCount > 0) {
      console.log('⚠️  Partial success - some APIs working');
    } else {
      console.log('❌ Still having deployment issues');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testFixedDeployment();