// Minimal test server
const express = require('express');
const app = express();
const PORT = 3003;

// Prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Basic middleware
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ success: true, message: 'Minimal server working' });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'healthy' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Minimal server running on port ${PORT}`);
  });
}

module.exports = app;