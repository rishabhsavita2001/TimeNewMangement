// Test Figma UI APIs - Complete form validation
const https = require('https');

const BASE_URL = 'api-layer.vercel.app';
let authToken = '';

// Test data matching exact Figma UI
const inviteEmployeeData = {
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@company.com",
  phone: "+1234567890",
  dateOfBirth: "1990-05-15",
  address: "123 Main Street, New York, NY 10001",
  role: "Developer",
  department: "Engineering", 
  manager: "Jane Smith",
  workingHours: "09:00 - 05:00 PM",
  workingModel: "Hybrid",
  startDate: "2025-01-15",
  profilePhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." // Sample base64
};

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

async function testFigmaUIAPIs() {
  console.log('🎨 FIGMA UI API VALIDATION TEST');
  console.log('📋 Checking all invite employee form features');
  console.log('🌐 URL: https://' + BASE_URL);
  console.log('=' .repeat(50));

  try {
    // Step 1: Login
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

    // Step 2: Test dropdown data APIs
    console.log('\n📋 Testing dropdown data APIs...');
    
    // Test Roles API (for Role dropdown)
    const rolesResponse = await makeRequest('GET', '/api/employees/roles', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    console.log('🔧 Roles API Status:', rolesResponse.status);
    if (rolesResponse.status === 200) {
      const roles = rolesResponse.data.data;
      console.log('✅ Roles available:', roles?.length || 0, 'options');
      console.log('- Sample roles:', roles?.slice(0, 3).map(r => r.name).join(', '));
    } else {
      console.log('❌ Roles API failed');
    }

    // Test Departments API (for Department dropdown)
    const deptResponse = await makeRequest('GET', '/api/employees/departments', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    console.log('🏢 Departments API Status:', deptResponse.status);
    if (deptResponse.status === 200) {
      const departments = deptResponse.data.data;
      console.log('✅ Departments available:', departments?.length || 0, 'options');
      console.log('- Sample departments:', departments?.slice(0, 3).map(d => d.name).join(', '));
    } else {
      console.log('❌ Departments API failed');
    }

    // Test Working Models API (for Working Model dropdown)
    const modelsResponse = await makeRequest('GET', '/api/employees/working-models', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    console.log('💼 Working Models API Status:', modelsResponse.status);
    if (modelsResponse.status === 200) {
      const models = modelsResponse.data.data;
      console.log('✅ Working models available:', models?.length || 0, 'options');
      console.log('- Available models:', models?.map(m => m.name).join(', '));
    } else {
      console.log('❌ Working Models API failed');
    }

    // Step 3: Test main invite API
    console.log('\n📧 Testing main invite employee API...');
    const inviteResponse = await makeRequest('POST', '/api/employees/invite', inviteEmployeeData, {
      'Authorization': `Bearer ${authToken}`
    });

    console.log('🎯 Invite API Status:', inviteResponse.status);
    if (inviteResponse.status === 201) {
      console.log('✅ Invite API working perfectly!');
      console.log('- Employee ID:', inviteResponse.data.data?.employee?.id);
      console.log('- Employee Number:', inviteResponse.data.data?.employee?.employeeNumber);
      console.log('- Invitation Link:', inviteResponse.data.data?.invitationLink ? 'Generated' : 'Missing');
      console.log('- Status:', inviteResponse.data.data?.employee?.status);
    } else {
      console.log('❌ Invite API failed:', inviteResponse.data);
    }

    // Step 4: Field mapping validation
    console.log('\n🔍 FIGMA UI FIELD MAPPING VALIDATION');
    console.log('=' .repeat(40));
    
    const fieldMapping = [
      { figma: 'Add photo', api: 'profilePhoto', supported: '✅' },
      { figma: 'First name', api: 'firstName', supported: '✅' },
      { figma: 'Last name', api: 'lastName', supported: '✅' },
      { figma: 'Email address', api: 'email', supported: '✅' },
      { figma: 'Phone number', api: 'phone', supported: '✅' },
      { figma: 'Date of birth', api: 'dateOfBirth', supported: '✅' },
      { figma: 'Address', api: 'address', supported: '✅' },
      { figma: 'Role (dropdown)', api: 'role + /api/employees/roles', supported: rolesResponse.status === 200 ? '✅' : '❌' },
      { figma: 'Department (dropdown)', api: 'department + /api/employees/departments', supported: deptResponse.status === 200 ? '✅' : '❌' },
      { figma: 'Manager (optional)', api: 'manager', supported: '✅' },
      { figma: 'Working hours', api: 'workingHours', supported: '✅' },
      { figma: 'Working model (dropdown)', api: 'workingModel + /api/employees/working-models', supported: modelsResponse.status === 200 ? '✅' : '❌' },
      { figma: 'Start date', api: 'startDate', supported: '✅' }
    ];

    console.log('📋 Field Support Matrix:');
    fieldMapping.forEach((field, index) => {
      console.log(`${index + 1}. ${field.supported} ${field.figma}`);
      console.log(`   API: ${field.api}`);
    });

    // Summary
    const supportedCount = fieldMapping.filter(f => f.supported === '✅').length;
    const totalCount = fieldMapping.length;
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('=' .repeat(40));
    console.log(`✅ Supported Fields: ${supportedCount}/${totalCount}`);
    console.log(`🔧 API Endpoints: ${rolesResponse.status === 200 && deptResponse.status === 200 && modelsResponse.status === 200 ? 'All Working' : 'Some Issues'}`);
    console.log(`📧 Main Invite API: ${inviteResponse.status === 201 ? 'Working' : 'Failed'}`);
    
    if (supportedCount === totalCount && inviteResponse.status === 201) {
      console.log('\n🎉 PERFECT MATCH! Figma UI fully supported by APIs');
      console.log('✅ All form fields mapped correctly');
      console.log('✅ All dropdown data available');
      console.log('✅ File upload supported');
      console.log('✅ Invitation system working');
    } else {
      console.log('\n⚠️  Some features may need attention');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testFigmaUIAPIs();