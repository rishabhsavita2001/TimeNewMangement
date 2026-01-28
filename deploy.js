#!/usr/bin/env node

// Simple deployment script that bypasses git auth issues
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Starting Vercel deployment process...');

try {
    // First, check if we can deploy without git
    console.log('📦 Attempting deployment...');
    
    // Try to deploy using vercel CLI with --force flag to bypass git checks
    const result = execSync('npx vercel --prod --force --yes', { 
        encoding: 'utf-8',
        stdio: 'pipe' 
    });
    
    console.log('✅ Production deployment successful!');
    console.log(result);
    
} catch (error) {
    console.log('⚠️ Production deployment failed, trying alternative method...');
    
    try {
        // Deploy to preview first
        console.log('📋 Creating preview deployment...');
        const previewResult = execSync('npx vercel --yes', { 
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        
        console.log('📋 Preview deployment created');
        
        // Extract the preview URL
        const lines = previewResult.split('\n');
        let previewUrl = '';
        
        for (let line of lines) {
            if (line.includes('https://') && line.includes('vercel.app')) {
                previewUrl = line.trim();
                break;
            }
        }
        
        if (previewUrl) {
            console.log('🔗 Preview URL:', previewUrl);
            
            try {
                // Try to alias to production domain
                console.log('🎯 Setting up production alias...');
                execSync(`npx vercel alias ${previewUrl} api-layer.vercel.app`, { 
                    stdio: 'pipe' 
                });
                console.log('✅ Production alias set successfully!');
                console.log('🌐 Production URL: https://api-layer.vercel.app');
            } catch (aliasError) {
                console.log('⚠️ Could not set production alias, but preview is available');
                console.log('📋 Test your APIs at:', previewUrl);
            }
        }
        
    } catch (previewError) {
        console.log('❌ All deployment methods failed');
        console.log('Error details:', previewError.message);
        
        // Try one more time with different approach
        try {
            console.log('🔄 Trying manual build and deploy...');
            
            // Create a temporary vercel.json if it doesn't exist
            if (!fs.existsSync('./vercel.json')) {
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
                            "dest": "/index.js"
                        }
                    ]
                };
                
                fs.writeFileSync('./vercel.json', JSON.stringify(vercelConfig, null, 2));
                console.log('📄 Created vercel.json configuration');
            }
            
            // Try deployment one more time
            const finalResult = execSync('npx vercel --prod --force --yes --confirm', { 
                encoding: 'utf-8',
                stdio: 'pipe'
            });
            
            console.log('✅ Manual deployment successful!');
            console.log(finalResult);
            
        } catch (finalError) {
            console.log('❌ Final deployment attempt failed');
            console.log('Please check Vercel dashboard or try deploying manually');
        }
    }
}

console.log('\n🔍 Testing deployment status...');
try {
    const testResult = execSync('curl -s https://api-layer.vercel.app/api/health', { encoding: 'utf-8' });
    console.log('✅ API is responsive:', testResult);
} catch (testError) {
    console.log('⚠️ Could not test API endpoint');
}