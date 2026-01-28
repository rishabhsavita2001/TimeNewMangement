// Quick Fix Server for Time Entries API Testing
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = 'temp-secret-for-testing';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Simple auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  // Accept any reasonable token for testing
  if (token.length < 5) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = { id: 1, email: 'test@example.com' };
  next();
};

// Get token endpoint
app.get('/api/get-token', (req, res) => {
  const token = jwt.sign({ userId: 1, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({
    success: true,
    token: token,
    message: 'Token generated for testing'
  });
});

// Working time entries endpoint
app.get('/api/me/time-entries', auth, (req, res) => {
  const { page = 1, limit = 20, startDate, endDate } = req.query;
  
  res.json({
    success: true,
    message: 'Time entries retrieved successfully',
    data: {
      entries: [
        {
          id: 1,
          date: '2024-01-28',
          startTime: '09:00:00',
          endTime: '17:30:00',
          breakDuration: 60,
          totalHours: 8.5,
          projectId: 1,
          projectName: 'API Development',
          taskName: 'Time Tracking APIs',
          description: 'Working on API implementation',
          status: 'completed'
        },
        {
          id: 2,
          date: '2024-01-27',
          startTime: '09:15:00',
          endTime: '17:00:00',
          breakDuration: 45,
          totalHours: 8.0,
          projectId: 2,
          projectName: 'Documentation',
          taskName: 'API Documentation',
          description: 'Writing API documentation',
          status: 'completed'
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2,
        totalPages: 1
      }
    }
  });
});

// POST time entry
app.post('/api/me/time-entries', auth, (req, res) => {
  const { startTime, endTime, description } = req.body;
  
  res.json({
    success: true,
    message: 'Time entry created successfully',
    data: {
      entry: {
        id: 3,
        startTime,
        endTime,
        description,
        createdAt: new Date().toISOString()
      }
    }
  });
});

// PUT time entry (fixed)
app.put('/api/me/time-entries/:id', auth, (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, description } = req.body;
  
  if (id === 'string') {
    return res.status(400).json({
      success: false,
      error: 'Use numeric ID, not "string"',
      example: 'Use /api/me/time-entries/123'
    });
  }
  
  res.json({
    success: true,
    message: 'Time entry updated successfully',
    data: {
      entry: {
        id: parseInt(id),
        startTime,
        endTime,
        description,
        updatedAt: new Date().toISOString()
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`🚀 Quick Fix Server running on http://localhost:\${PORT}\`);
  console.log(\`📝 Test the API:\`);
  console.log(\`   GET Token: http://localhost:\${PORT}/api/get-token\`);
  console.log(\`   GET Time Entries: http://localhost:\${PORT}/api/me/time-entries\`);
});

module.exports = app;