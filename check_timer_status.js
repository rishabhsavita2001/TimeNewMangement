// Quick check of current timer status on main domain
const https = require('https');

const BASE_URL = 'api-layer.vercel.app';

function checkCurrentTimer() {
  const loginData = JSON.stringify({
    email: 'admin@company.com',
    password: 'password123',
    tenantName: 'TechCorp'
  });
  
  const loginReq = https.request({
    hostname: BASE_URL,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, (res) => {
    let loginResponse = '';
    res.on('data', (chunk) => {
      loginResponse += chunk;
    });
    res.on('end', () => {
      try {
        const loginData = JSON.parse(loginResponse);
        if (loginData.success) {
          const token = loginData.data.token;
          
          // Now check timer
          const timerReq = https.request({
            hostname: BASE_URL,
            path: '/api/me/timer/current',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }, (timerRes) => {
            let timerResponse = '';
            timerRes.on('data', (chunk) => {
              timerResponse += chunk;
            });
            timerRes.on('end', () => {
              try {
                const timerData = JSON.parse(timerResponse);
                const data = timerData.data;
                
                console.log('🔍 CURRENT TIMER STATUS ON MAIN DOMAIN');
                console.log('🌐 https://api-layer.vercel.app');
                console.log('=' .repeat(40));
                console.log('✅ Login: SUCCESS');
                console.log('📊 Timer Status:');
                console.log('- Has Active Timer:', data?.hasActiveTimer);
                console.log('- Timer ID:', data?.timer?.timerId);
                console.log('- Is Running:', data?.timer?.isRunning);
                console.log('- Current Duration:', data?.timer?.currentDuration);
                console.log('- Start Time:', data?.timer?.startTime);
                console.log('- Persistent Storage:', data?.persistent);
                console.log('');
                
                if (data?.hasActiveTimer) {
                  const startTime = new Date(data.timer.startTime);
                  const now = new Date();
                  const minutesRunning = Math.floor((now - startTime) / (1000 * 60));
                  
                  console.log('⏱️  Timer Analysis:');
                  console.log('- Started at:', startTime.toLocaleTimeString());
                  console.log('- Running for:', minutesRunning, 'minutes');
                  console.log('- Status:', minutesRunning > 5 ? '🎉 SURVIVED 5+ MINUTES!' : '⏳ Still within 5 minutes');
                  
                  if (minutesRunning > 5) {
                    console.log('\\n🎊 SUCCESS! TIMER PERSISTENCE IS WORKING!');
                    console.log('✅ Shivam: Your 5-minute timeout issue is FIXED!');
                  }
                } else {
                  console.log('❌ No active timer found');
                }
                
              } catch (e) {
                console.log('❌ Error parsing timer response:', e.message);
              }
            });
          });
          
          timerReq.on('error', (e) => {
            console.log('❌ Timer request error:', e.message);
          });
          
          timerReq.end();
        }
      } catch (e) {
        console.log('❌ Error parsing login response:', e.message);
      }
    });
  });
  
  loginReq.on('error', (e) => {
    console.log('❌ Login request error:', e.message);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

checkCurrentTimer();