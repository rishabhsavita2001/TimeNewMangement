#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to api-layer.vercel.app...\n');

try {
    // Check if we have the right files
    const indexExists = fs.existsSync('index.js');
    const vercelExists = fs.existsSync('vercel.json');
    
    if (!indexExists) {
        console.log('❌ index.js not found. Copying from fixed_apis_server.js...');
        if (fs.existsSync('fixed_apis_server.js')) {
            fs.copyFileSync('fixed_apis_server.js', 'index.js');
            console.log('✅ Copied fixed_apis_server.js to index.js');
        } else {
            throw new Error('No server file found');
        }
    }

    if (!vercelExists) {
        console.log('❌ vercel.json not found. Creating...');
        const vercelConfig = {
            "version": 2,
            "builds": [
                {
                    "src": "index.js",
                    "use": "@vercel/node"
                }
            ],
            "routes": [
                {
                    "src": "/(.*)",
                    "dest": "index.js"
                }
            ]
        };
        fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
        console.log('✅ Created vercel.json');
    }

    // Try to create a new project with the correct name
    console.log('📦 Creating deployment with api-layer name...\n');
    
    try {
        // First try to unlink and relink with correct name
        try {
            execSync('vercel --yes', { stdio: 'inherit', cwd: process.cwd() });
        } catch (e) {
            console.log('⚠️  Initial deploy failed, trying alternative method...');
        }
        
        // Create a new vercel project config
        const projectConfig = {
            "projectId": "prj_AW0Wq3TxVzZH62poreNHFVlOfiuO",
            "orgId": "team_ek5G1jRM0BmxDY51LUt0Cifa",
            "projectName": "api-layer"
        };
        
        // Ensure .vercel directory exists
        if (!fs.existsSync('.vercel')) {
            fs.mkdirSync('.vercel');
        }
        
        fs.writeFileSync('.vercel/project.json', JSON.stringify(projectConfig, null, 2));
        console.log('✅ Updated project configuration to api-layer');
        
        // Now try to deploy
        console.log('\n🚀 Deploying to production...');
        execSync('vercel --prod --yes', { stdio: 'inherit', cwd: process.cwd() });
        
    } catch (error) {
        console.log('\n⚠️  Standard deployment failed. Trying alternative deployment method...');
        
        // Alternative: direct deploy with specific URL
        const deployCommand = `vercel deploy --prod --confirm`;
        console.log(`Running: ${deployCommand}`);
        execSync(deployCommand, { stdio: 'inherit', cwd: process.cwd() });
    }

    console.log('\n✅ Deployment completed!');
    console.log('🌐 Your API should be available at: https://api-layer.vercel.app');
    console.log('');
    console.log('📋 Testing the deployment...');
    
    // Test the deployment
    setTimeout(() => {
        try {
            const https = require('https');
            const testUrl = 'https://api-layer.vercel.app/api/health';
            
            https.get(testUrl, (res) => {
                console.log(`✅ API Health Check: Status ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log('🎉 Deployment successful! API is responding.');
                } else {
                    console.log('⚠️  API deployed but returning non-200 status');
                }
            }).on('error', (err) => {
                console.log('⚠️  API deployed but health check failed:', err.message);
            });
        } catch (testError) {
            console.log('⚠️  Could not test deployment:', testError.message);
        }
    }, 5000);

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}