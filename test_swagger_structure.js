const app = require('./index.js');
const request = require('supertest');

// Test swagger.json endpoint directly from the app
const testSwagger = async () => {
  try {
    const response = await request(app).get('/swagger.json');
    console.log('Swagger JSON Response Status:', response.status);
    console.log('Swagger JSON paths found:', Object.keys(response.body.paths).length);
    console.log('All paths:');
    Object.keys(response.body.paths).forEach(path => {
      console.log(`  ${path}`);
    });
    
    // Check if missing paths exist
    console.log('\nMissing endpoints check:');
    console.log('Has /api/health:', response.body.paths['/api/health'] ? 'YES' : 'NO');
    console.log('Has /api/employees:', response.body.paths['/api/employees'] ? 'YES' : 'NO');
    console.log('Has /api/employees/working-models:', response.body.paths['/api/employees/working-models'] ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Error testing swagger:', error.message);
  }
};

testSwagger();