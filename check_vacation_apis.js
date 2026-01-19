// Check vacation/leave APIs status
const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

console.log('🔍 VACATION/LEAVE REQUEST APIs STATUS\n');

// Check existing APIs
const checkApis = [
  { pattern: /app\.get\(['"]\/api\/me\/leave-requests['"]/, desc: 'GET /api/me/leave-requests' },
  { pattern: /app\.post\(['"]\/api\/me\/leave-requests['"]/, desc: 'POST /api/me/leave-requests' },
  { pattern: /app\.put\(['"]\/api\/me\/leave-requests\/:[^'"]+['"]/, desc: 'PUT /api/me/leave-requests/:id' },
  { pattern: /app\.delete\(['"]\/api\/me\/leave-requests\/:[^'"]+['"]/, desc: 'DELETE /api/me/leave-requests/:id' },
  { pattern: /app\.post\(['"]\/api\/requests\/:[^'"]+\/approve['"]/, desc: 'POST /api/requests/:id/approve' },
  { pattern: /app\.post\(['"]\/api\/requests\/:[^'"]+\/reject['"]/, desc: 'POST /api/requests/:id/reject' },
  { pattern: /app\.get\(['"]\/api\/leave-types['"]/, desc: 'GET /api/leave-types' }
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