const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'API is running on api-layer.vercel.app'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working on correct domain!',
    domain: 'api-layer.vercel.app'
  });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Export for Vercel
module.exports = app;