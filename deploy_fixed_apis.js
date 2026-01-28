const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying FIXED APIs...');

// Replace the main index.js with the fixed version
const fixedServerPath = path.join(__dirname, 'fixed_apis_server.js');
const indexPath = path.join(__dirname, 'index.js');

if (fs.existsSync(fixedServerPath)) {
  // Backup current index.js
  if (fs.existsSync(indexPath)) {
    const backupPath = path.join(__dirname, `index_backup_${Date.now()}.js`);
    fs.copyFileSync(indexPath, backupPath);
    console.log('✅ Current index.js backed up');
  }
  
  // Copy fixed version
  fs.copyFileSync(fixedServerPath, indexPath);
  console.log('✅ Fixed APIs deployed to index.js');
  
  // Update package.json if needed
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.start = 'node index.js';
    packageJson.scripts.dev = 'node index.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json updated');
  }
  
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('');
  console.log('✅ Fixed APIs:');
  console.log('   - GET /api/me/time-entries');
  console.log('   - GET /api/me/vacation/balance');
  console.log('   - GET /api/get-token');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log('1. Get Token: curl https://api-layer.vercel.app/api/get-token');
  console.log('2. Test Time Entries: curl -H "Authorization: Bearer <token>" https://api-layer.vercel.app/api/me/time-entries');
  console.log('3. Test Vacation Balance: curl -H "Authorization: Bearer <token>" https://api-layer.vercel.app/api/me/vacation/balance');
  
} else {
  console.error('❌ Fixed server file not found');
}