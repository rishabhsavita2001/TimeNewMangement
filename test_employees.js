const express = require('express');
const app = express();

// Simple test to verify employee endpoint structure
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

app.get('/api/employees', (req, res) => {
  const employees = [
    { id: 1, name: "Jenny Wilson", role: "Software Engineer", status: "active" },
    { id: 2, name: "Devon Lane", role: "Product Manager", status: "active" }
  ];
  
  res.json({
    success: true,
    employees: employees,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});