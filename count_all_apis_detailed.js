const fs = require('fs');
const path = require('path');

// Read index.js file
const indexPath = path.join(__dirname, 'index.js');
const content = fs.readFileSync(indexPath, 'utf8');

// Find all API routes using regex
const apiRoutes = [];
const regex = /app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"],?\s*(?:authenticateToken,?)?\s*\(req,\s*res\)/g;

let match;
while ((match = regex.exec(content)) !== null) {
    const method = match[1];
    const path = match[2];
    
    // Skip swagger routes and duplicate routes
    if (!path.includes('/swagger') && !path.includes('/api-docs')) {
        const exists = apiRoutes.find(route => route.method === method && route.path === path);
        if (!exists) {
            apiRoutes.push({
                method: method.toUpperCase(),
                path: path
            });
        }
    }
}

// Sort by path for better organization
apiRoutes.sort((a, b) => a.path.localeCompare(b.path));

console.log('Total API Endpoints Found:', apiRoutes.length);
console.log('\n=== API ENDPOINTS LIST ===');

// Group by category
const categories = {
    'Health & System': [],
    'Authentication': [],
    'User Profile': [],
    'Timer Management': [],
    'Time Entries': [],
    'Projects & Tasks': [],
    'Notifications': [],
    'Dashboard': [],
    'Leave Management': [],
    'Company Settings': [],
    'Reports & Summary': [],
    'Quick Actions': [],
    'Other': []
};

apiRoutes.forEach(route => {
    const path = route.path;
    
    if (path.includes('/health') || path.includes('/test')) {
        categories['Health & System'].push(route);
    } else if (path.includes('/auth/') || path.includes('login') || path.includes('logout') || path.includes('register') || path.includes('forgot-password') || path.includes('verify-otp') || path.includes('reset-password') || path.includes('token')) {
        categories['Authentication'].push(route);
    } else if (path.includes('/profile') || path.includes('/me/profile')) {
        categories['User Profile'].push(route);
    } else if (path.includes('/timer')) {
        categories['Timer Management'].push(route);
    } else if (path.includes('time-entries') || path.includes('time-corrections')) {
        categories['Time Entries'].push(route);
    } else if (path.includes('/projects') || path.includes('/tasks')) {
        categories['Projects & Tasks'].push(route);
    } else if (path.includes('/notifications')) {
        categories['Notifications'].push(route);
    } else if (path.includes('/dashboard')) {
        categories['Dashboard'].push(route);
    } else if (path.includes('/leave') || path.includes('/vacation')) {
        categories['Leave Management'].push(route);
    } else if (path.includes('/company')) {
        categories['Company Settings'].push(route);
    } else if (path.includes('/reports') || path.includes('/summary') || path.includes('/work-status') || path.includes('/updates') || path.includes('/overtime')) {
        categories['Reports & Summary'].push(route);
    } else if (path.includes('quick-actions')) {
        categories['Quick Actions'].push(route);
    } else {
        categories['Other'].push(route);
    }
});

// Display categorized APIs
Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
        console.log(`\n${category} (${categories[category].length} APIs):`);
        categories[category].forEach(route => {
            console.log(`  ${route.method.padEnd(6)} ${route.path}`);
        });
    }
});

console.log('\n=== SUMMARY ===');
Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
        console.log(`${category}: ${categories[category].length} APIs`);
    }
});

console.log('\nTotal Unique APIs:', apiRoutes.length);
console.log('Current Swagger APIs: 6 (only auth endpoints)');
console.log('Missing from Swagger:', apiRoutes.length - 6);