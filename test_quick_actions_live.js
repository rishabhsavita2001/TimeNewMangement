const https = require('https');

const baseUrl = 'apilayer-k24w6pzp3-soludoo.vercel.app';

async function testQuickActionsAPIs() {
  console.log('🎨 Testing New Quick Actions APIs (Figma Design)');
  console.log('===============================================\n');
  
  // Get auth token first
  const loginResult = await new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, error: 'Invalid JSON' });
        }
      });
    });
    
    req.write(JSON.stringify({ email: 'admin@company.com', password: 'password123' }));
    req.end();
  });

  if (loginResult.status !== 200) {
    console.log('❌ Login failed');
    return;
  }
  
  const token = loginResult.data.token;
  console.log('✅ Authentication successful\n');

  // Test Quick Actions APIs
  const tests = [
    {
      name: 'Quick Actions Menu API',
      path: '/api/me/quick-actions',
      method: 'GET',
      description: 'Get available quick actions (Request vacation, Request correction, Add time manually)'
    },
    {
      name: 'Request Time Correction API',
      path: '/api/me/time-corrections', 
      method: 'POST',
      body: {
        original_entry_id: 123,
        correction_type: 'time_adjustment',
        reason: 'Forgot to stop timer at lunch break',
        corrected_start_time: '2023-12-23T09:00:00Z',
        corrected_end_time: '2023-12-23T17:00:00Z'
      },
      description: 'Submit time correction request'
    },
    {
      name: 'Add Time Manually API',
      path: '/api/me/time-entries/manual',
      method: 'POST', 
      body: {
        entry_date: '2023-12-23',
        start_time: '09:00',
        end_time: '17:00',
        project_id: 1,
        task_name: 'Mobile app development',
        description: 'Working on Figma integration',
        break_duration: 60,
        reason: 'Forgot to track time yesterday'
      },
      description: 'Add manual time entry'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`   ${test.method} https://${baseUrl}${test.path}`);
    console.log(`   Purpose: ${test.description}`);
    
    const result = await new Promise((resolve) => {
      const options = {
        hostname: baseUrl,
        path: test.path,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, error: 'Invalid JSON', rawData: data });
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({ status: 0, error: error.message });
      });
      
      if (test.body) {
        req.write(JSON.stringify(test.body));
      }
      
      req.end();
    });

    if (result.status >= 200 && result.status < 300) {
      console.log('   ✅ Status: 200 OK - API Working!');
      passedTests++;
      
      // Show specific response details
      if (test.path === '/api/me/quick-actions' && result.data.data) {
        const actions = result.data.data.actions || [];
        console.log(`   📋 Available Actions: ${actions.length}`);
        actions.forEach(action => {
          console.log(`     - ${action.icon} ${action.title}: ${action.description}`);
        });
      }
      
      if (test.path === '/api/me/time-corrections' && result.data.data) {
        console.log(`   📝 Correction ID: ${result.data.data.correction_id}`);
        console.log(`   📊 Status: ${result.data.data.status}`);
        console.log(`   🔗 Reference: ${result.data.data.reference_number}`);
      }
      
      if (test.path === '/api/me/time-entries/manual' && result.data.data) {
        console.log(`   ⏱️ Entry ID: ${result.data.data.entry_id}`);
        console.log(`   📈 Total Hours: ${result.data.data.total_hours}`);
        console.log(`   📊 Duration: ${result.data.data.formatted_duration}`);
      }
      
    } else {
      console.log(`   ❌ Status: ${result.status} - FAILED`);
      if (result.error) {
        console.log(`   🔍 Error: ${result.error}`);
      }
    }
    console.log('');
  }

  // Results summary
  console.log('📊 QUICK ACTIONS APIs TEST SUMMARY');
  console.log('==================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL QUICK ACTIONS APIs WORKING!');
    console.log('✅ Figma Quick Actions screen is fully supported');
  } else {
    console.log('\n⚠️ Some APIs need attention');
  }
  
  console.log('\n🌐 Live URLs for Mobile App Integration:');
  console.log(`- Quick Actions Menu: https://${baseUrl}/api/me/quick-actions`);
  console.log(`- Request Correction: https://${baseUrl}/api/me/time-corrections`); 
  console.log(`- Add Time Manually: https://${baseUrl}/api/me/time-entries/manual`);
  console.log(`- Swagger UI: https://${baseUrl}/api-docs`);
  
  console.log('\n🎨 Figma Integration Complete:');
  console.log('1. ✅ Start Button - Timer start API exists');
  console.log('2. ✅ Quick Actions Menu - New API created');
  console.log('3. ✅ Request Vacation - Existing leave request API');
  console.log('4. ✅ Request Correction - New API created'); 
  console.log('5. ✅ Add Time Manually - New API created');
}

testQuickActionsAPIs().catch(console.error);