// Check correction request APIs status
const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

console.log('🔍 CORRECTION REQUEST APIs STATUS\n');

// Required APIs based on screenshots
const checkApis = [
  { pattern: /app\.get\(['"]\/api\/me\/time-corrections['"]/, desc: 'GET /api/me/time-corrections' },
  { pattern: /app\.post\(['"]\/api\/me\/time-corrections['"]/, desc: 'POST /api/me/time-corrections' },
  { pattern: /app\.put\(['"]\/api\/time-corrections\/:[^'"]+\/status['"]/, desc: 'PUT /api/time-corrections/:id/status' },
  { pattern: /app\.get\(['"]\/api\/time-correction-types['"]/, desc: 'GET /api/time-correction-types' },
  { pattern: /app\.get\(['"]\/api\/me\/time-corrections\/history['"]/, desc: 'GET /api/me/time-corrections/history' },
  { pattern: /app\.get\(['"]\/api\/correction-requests['"]/, desc: 'GET /api/correction-requests' },
  { pattern: /app\.post\(['"]\/api\/correction-requests\/:[^'"]+\/approve['"]/, desc: 'POST /api/correction-requests/:id/approve' },
  { pattern: /app\.post\(['"]\/api\/correction-requests\/:[^'"]+\/reject['"]/, desc: 'POST /api/correction-requests/:id/reject' }
];

console.log('📋 API Status Check:');
checkApis.forEach(({ pattern, desc }) => {
  if (content.match(pattern)) {
    console.log('✅', desc, '- EXISTS');
  } else {
    console.log('❌', desc, '- MISSING');
  }
});

console.log('\n🔍 Missing APIs that need to be created:');
const missingApis = checkApis.filter(({ pattern }) => !content.match(pattern));
missingApis.forEach(({ desc }) => {
  console.log('🚨', desc);
});

console.log('\n📊 Total APIs: ' + checkApis.length);
console.log('✅ Existing: ' + (checkApis.length - missingApis.length));  
console.log('❌ Missing: ' + missingApis.length);

console.log('\n🏷️ Correction Types from Screenshots:');
console.log('- Add missing work entry');
console.log('- Wrong clock-in time');  
console.log('- Missing clock-out');
console.log('- Overtime');
console.log('- Wrong break duration');
console.log('- Wrong clock-out time');
console.log('- Missing clock-in');