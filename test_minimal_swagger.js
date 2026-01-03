// Test Simple Swagger
app.get('/test-swagger.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/api/health': { get: { summary: 'Health' } },
      '/api/employees': { get: { summary: 'Employees' } },
      '/api/auth/login': { post: { summary: 'Login' } }
    }
  });
});