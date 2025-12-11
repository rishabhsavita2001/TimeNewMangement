#!/usr/bin/env node

// Vercel Environment Variables Update Script
const { execSync } = require('child_process');

const envVars = {
  DB_HOST: '217.20.195.77',
  DB_PORT: '5432',
  DB_NAME: 'timemanagement',
  DB_USER: 'sdladmin',
  DB_PASSWORD: '04D8lt1+9^sG/!Dj',
  DB_SSL: 'false',
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-production-256-bits-long',
  JWT_EXPIRES_IN: '8h',
  JWT_ISSUER: 'working-time-api',
  JWT_AUDIENCE: 'working-time-client',
  NODE_ENV: 'production'
};

console.log('🔧 Updating Vercel Environment Variables...\n');

for (const [key, value] of Object.entries(envVars)) {
  try {
    const command = `vercel env add ${key} production`;
    console.log(`Setting ${key}...`);
    
    // Note: This is for reference - you need to run these manually
    console.log(`Run: ${command}`);
    console.log(`Value: ${value}\n`);
  } catch (error) {
    console.error(`❌ Failed to set ${key}:`, error.message);
  }
}

console.log('✅ All environment variables listed above.');
console.log('⚠️  Run these commands manually in terminal:');
console.log('   1. Run each "vercel env add" command');
console.log('   2. Enter the corresponding value when prompted');
console.log('   3. Redeploy with: vercel --prod');