const fs = require('fs');

// Read index.js file  
const content = fs.readFileSync('index.js', 'utf8');

// Extract all API routes
const routes = [];
const lines = content.split('\n');

lines.forEach((line, index) => {
  const match = line.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/);
  if (match) {
    const method = match[1].toUpperCase();
    const path = match[2];
    
    // Skip swagger routes and duplicates
    if (!path.includes('swagger') && !path.includes('api-docs')) {
      const existing = routes.find(r => r.method === method && r.path === path);
      if (!existing) {
        routes.push({ method, path, line: index + 1 });
      }
    }
  }
});

console.log('Total unique API endpoints in code:', routes.length);

// Load current swagger spec
const swaggerSpec = JSON.parse(fs.readFileSync('swagger-spec.json', 'utf8'));
const swaggerPaths = Object.keys(swaggerSpec.paths);
console.log('Total endpoints in swagger:', swaggerPaths.length);

console.log('\nMISSING APIs from swagger:');
let missingCount = 0;
routes.forEach(route => {
  // Convert dynamic routes for comparison
  let swaggerPath = route.path.replace(/:([^\/]+)/g, '{$1}');
  
  if (!swaggerPaths.includes(swaggerPath)) {
    console.log(`  ${route.method} ${route.path} (line ${route.line})`);
    missingCount++;
  }
});

console.log(`\nTotal missing APIs: ${missingCount}`);

// Show breakdown by category
const categories = {
  'Employees': [],
  'Dashboard Duplicate': [], 
  'Notifications Duplicate': [],
  'Time Entries Extended': [],
  'Company Extended': [],
  'Other Missing': []
};

routes.forEach(route => {
  let swaggerPath = route.path.replace(/:([^\/]+)/g, '{$1}');
  
  if (!swaggerPaths.includes(swaggerPath)) {
    const path = route.path;
    
    if (path.includes('/employees')) {
      categories['Employees'].push(route);
    } else if (path.includes('/dashboard') && swaggerPaths.some(p => p.includes('/dashboard'))) {
      categories['Dashboard Duplicate'].push(route);
    } else if (path.includes('/notifications') && swaggerPaths.some(p => p.includes('/notifications'))) {
      categories['Notifications Duplicate'].push(route);
    } else if (path.includes('time-entries') || path.includes('time-corrections')) {
      categories['Time Entries Extended'].push(route);
    } else if (path.includes('/company')) {
      categories['Company Extended'].push(route);
    } else {
      categories['Other Missing'].push(route);
    }
  }
});

console.log('\nMISSING API BREAKDOWN:');
Object.keys(categories).forEach(category => {
  if (categories[category].length > 0) {
    console.log(`\n${category} (${categories[category].length} APIs):`);
    categories[category].forEach(route => {
      console.log(`  ${route.method} ${route.path}`);
    });
  }
});