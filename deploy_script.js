const { execSync } = require('child_process');

console.log('Starting deployment process...');

try {
    // Set git config for deployment
    execSync('git config user.email "bhoomi@example.com"', { stdio: 'inherit' });
    execSync('git config user.name "bhoomi"', { stdio: 'inherit' });
    
    // Deploy to Vercel
    const result = execSync('npx vercel --prod --force', { encoding: 'utf-8' });
    console.log('Deployment successful:', result);
} catch (error) {
    console.log('Deployment failed, trying alias approach...');
    try {
        // Try preview deployment first
        const previewResult = execSync('npx vercel', { encoding: 'utf-8' });
        console.log('Preview deployment:', previewResult);
        
        // Extract URL from preview result
        const urlMatch = previewResult.match(/https:\/\/[^\s]+/);
        if (urlMatch) {
            const previewUrl = urlMatch[0];
            console.log('Found preview URL:', previewUrl);
            
            // Try to alias to production
            execSync(`npx vercel alias ${previewUrl} api-layer.vercel.app`, { stdio: 'inherit' });
        }
    } catch (aliasError) {
        console.error('All deployment methods failed');
    }
}