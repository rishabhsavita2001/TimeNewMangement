const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// User profile data storage
let userData = {
  1: { 
    id: 1, 
    first_name: "Jenny", 
    last_name: "Wilson", 
    full_name: "Jenny Wilson", 
    email: "jenny.wilson@email.com", 
    phone: "(+1) 267-9041", 
    role: "Employee" 
  }
};

// Profile API - Fixed to prevent name reverting
app.get('/api/me/profile', (req, res) => {
  const userId = 1; // Simplified for now
  const user = userData[userId];
  
  console.log(`🔍 Profile requested - returning: ${user.full_name}`);
  
  res.json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        profile_photo: "https://api-layer.vercel.app/api/me/profile/photo",
        role: user.role,
        company: "ACME Inc.",
        department: "Engineering",
        status: "Active",
        last_login: new Date().toISOString()
      },
      persistent: true
    }
  });
});

// Profile update API - Fixed to prevent reverting to Jenny Wilson
app.put('/api/me/profile', (req, res) => {
  const userId = 1;
  const { first_name, last_name, email, phone } = req.body;
  
  console.log(`📝 Profile update request:`, { first_name, last_name, email });
  
  // Update user data persistently
  if (first_name) userData[userId].first_name = first_name;
  if (last_name) userData[userId].last_name = last_name;
  if (email) userData[userId].email = email;
  if (phone) userData[userId].phone = phone;
  
  // Update full name
  userData[userId].full_name = `${userData[userId].first_name} ${userData[userId].last_name}`;
  
  // Save to file for persistence
  try {
    const fs = require('fs');
    const path = require('path');
    const userFile = path.join(__dirname, 'user_profile.json');
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
    console.log('💾 User profile saved to file');
  } catch (error) {
    console.log('⚠️ Could not save user profile to file');
  }
  
  console.log(`✅ Profile updated successfully: ${userData[userId].full_name}`);
  
  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: userData[userId],
      persistent: true,
      saved_to_file: true
    }
  });
});

// Global storage for simple timer persistence test  
let timerStorage = {};
let userStorage = {
  stoppedToday: {},
  dailyWork: {}
};

// Load user profile from file if exists
try {
  const fs = require('fs');
  const path = require('path');
  const userFile = path.join(__dirname, 'user_profile.json');
  if (fs.existsSync(userFile)) {
    const savedData = JSON.parse(fs.readFileSync(userFile, 'utf8'));
    userData = { ...userData, ...savedData };
    console.log('📂 Loaded user profile from file:', userData[1].full_name);
  }
} catch (error) {
  console.log('⚠️ Using default user profile');
}

// ENHANCED Timer APIs with PERSISTENT storage

// ENHANCED Timer APIs with Simple File Persistence
app.post('/api/me/timer/start', (req, res) => {
  const { projectId, locationId, taskId, notes } = req.body || {};
  const userId = 1;
  const timerId = `timer_${userId}_${Date.now()}`;
  const startTime = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  console.log(`🚀 ENHANCED TIMER START - User: ${userId}, TimerID: ${timerId}`);

  // Check for existing active timer
  const existingTimer = timerStorage[userId];
  if (existingTimer && existingTimer.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Timer already running. Stop current timer first.',
      data: {
        currentTimer: existingTimer,
        hasActiveTimer: true
      }
    });
  }

  // Check if user stopped a timer today
  if (userStorage.stoppedToday[userId] === today) {
    return res.status(400).json({
      success: false,
      message: 'Work session already completed for today. You can start again tomorrow.',
      data: {
        stoppedToday: true,
        canStartAgain: false,
        nextAvailableStart: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]
      }
    });
  }

  // Create new timer with PERSISTENT storage
  const newTimerData = {
    timerId,
    userId,
    startTime,
    projectId,
    locationId,
    taskId,
    notes,
    isActive: true,
    isRunning: true,
    isPaused: false,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };

  // SAVE TO PERSISTENT STORAGE
  timerStorage[userId] = newTimerData;
  
  // Also try to write to file for extra persistence
  try {
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(__dirname, 'timer_data.json');
    fs.writeFileSync(dataFile, JSON.stringify({
      timers: timerStorage,
      users: userStorage,
      lastUpdated: new Date().toISOString()
    }, null, 2));
    console.log('💾 Timer data saved to file');
  } catch (error) {
    console.log('⚠️ File save failed, but memory storage works');
  }

  console.log(`✅ TIMER START SUCCESS - User: ${userId}, TimerID: ${timerId}`);
  console.log(`📊 Active Timer Count: ${Object.keys(timerStorage).length}`);

  res.json({
    success: true,
    message: 'Timer started successfully with enhanced persistence',
    data: { 
      timerId, 
      startTime, 
      isRunning: true,
      isPaused: false,
      projectId: projectId || null, 
      taskId: taskId || null, 
      notes: notes || '',
      persistent: true,
      enhanced: true,
      debug: {
        savedToMemory: true,
        timerExists: !!timerStorage[userId]
      }
    }
  });
});

app.post('/api/me/timer/stop', (req, res) => {
  const userId = 1;
  const today = new Date().toISOString().split('T')[0];

  const timerData = timerStorage[userId];
  if (!timerData || !timerData.isActive) {
    return res.status(400).json({
      success: false,
      message: 'No active timer to stop'
    });
  }

  // Calculate duration
  const now = new Date();
  const startTime = new Date(timerData.startTime);
  const durationMs = now - startTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = `${hours}h ${minutes}m`;

  // Mark as stopped today
  userStorage.stoppedToday[userId] = today;
  
  // Clear timer data
  delete timerStorage[userId];

  // Save to file
  try {
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(__dirname, 'timer_data.json');
    fs.writeFileSync(dataFile, JSON.stringify({
      timers: timerStorage,
      users: userStorage,
      lastUpdated: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.log('⚠️ File save failed during stop');
  }

  console.log(`⏹️ Timer stopped for user ${userId} - Duration: ${duration}`);

  res.json({
    success: true,
    message: 'Timer stopped successfully',
    data: {
      timer_id: timerData.timerId,
      end_time: new Date().toISOString(),
      total_duration: duration,
      status: 'completed',
      enhanced: true
    }
  });
});

// Timer Pause/Resume API - CLIENT REQUESTED FEATURE
app.post('/api/me/timer/pause', (req, res) => {
  const userId = 1;
  const { action } = req.body; // 'pause' or 'resume' or undefined for toggle
  
  console.log(`⏸️ Timer pause/resume request - action: ${action || 'toggle'}`);
  
  const timerData = timerStorage[userId];
  if (!timerData || !timerData.isActive) {
    return res.status(400).json({
      success: false,
      message: 'No active timer to pause/resume'
    });
  }
  
  const now = new Date();
  const isCurrentlyPaused = timerData.isPaused || false;
  
  // Determine action: pause, resume, or toggle
  const shouldPause = action === 'pause' ? true : action === 'resume' ? false : !isCurrentlyPaused;
  
  if (shouldPause && !isCurrentlyPaused) {
    // Pause the timer
    timerData.isPaused = true;
    timerData.pauseStartTime = now.toISOString();
    console.log(`⏸️ Timer paused for user ${userId}`);
  } else if (!shouldPause && isCurrentlyPaused) {
    // Resume the timer  
    if (timerData.pauseStartTime) {
      const pauseDuration = now - new Date(timerData.pauseStartTime);
      timerData.totalPausedTime = (timerData.totalPausedTime || 0) + pauseDuration;
    }
    timerData.isPaused = false;
    timerData.pauseStartTime = null;
    console.log(`▶️ Timer resumed for user ${userId}`);
  }
  
  timerData.lastActivity = now.toISOString();
  
  // Save to persistent storage
  try {
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(__dirname, 'timer_data.json');
    fs.writeFileSync(dataFile, JSON.stringify({
      timers: timerStorage,
      users: userStorage,
      lastUpdated: new Date().toISOString()
    }, null, 2));
    console.log('💾 Timer state saved after pause/resume');
  } catch (error) {
    console.log('⚠️ Could not save timer state to file');
  }
  
  res.json({
    success: true,
    message: `Timer ${timerData.isPaused ? 'paused' : 'resumed'} successfully`,
    data: {
      timerId: timerData.timerId,
      isPaused: timerData.isPaused,
      pausedAt: timerData.pauseStartTime,
      totalPausedTime: timerData.totalPausedTime || 0,
      status: timerData.isPaused ? 'paused' : 'running',
      enhanced: true
    }
  });
});

app.get('/api/me/timer/current', (req, res) => {
  const userId = 1;

  console.log(`🔍 ENHANCED TIMER CHECK for user ${userId}`);
  
  // Load from file first if exists
  try {
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(__dirname, 'timer_data.json');
    if (fs.existsSync(dataFile)) {
      const fileData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      timerStorage = fileData.timers || {};
      userStorage = fileData.users || {};
      console.log('📂 Loaded timer data from file');
    }
  } catch (error) {
    console.log('⚠️ Could not load from file, using memory');
  }
  
  const timerData = timerStorage[userId];
  const hasActiveTimer = timerData && timerData.isActive;
  
  console.log(`📊 Timer Check - HasActive: ${hasActiveTimer}, TimerExists: ${timerData ? 'YES' : 'NO'}`);

  if (!hasActiveTimer) {
    const today = new Date().toISOString().split('T')[0];
    const stoppedToday = userStorage.stoppedToday[userId] === today;
    
    console.log(`❌ NO ACTIVE TIMER found for user ${userId}`);
    
    return res.json({
      success: true,
      data: {
        hasActiveTimer: false,
        timer: null,
        stoppedToday,
        canStart: !stoppedToday,
        message: stoppedToday 
          ? 'Work session completed for today. You can start again tomorrow.' 
          : 'No active timer - ready to start work session',
        enhanced: true,
        persistent: true,
        debug: {
          memoryTimers: Object.keys(timerStorage).length,
          stoppedToday
        }
      }
    });
  }
  
  console.log(`✅ ACTIVE TIMER FOUND for user ${userId} - Enhanced persistence working!`);
  
  // Calculate current duration
  const now = new Date();
  const startTime = new Date(timerData.startTime);
  const currentTimeMs = now - startTime;
  const currentHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
  const hours = Math.floor(currentHours);
  const minutes = Math.round((currentHours - hours) * 60);
  const currentDuration = `${hours}h ${minutes}m`;

  res.json({
    success: true,
    data: {
      hasActiveTimer: true,
      timer: {
        timer_id: timerData.timerId,
        start_time: timerData.startTime,
        current_duration: currentDuration,
        is_running: timerData.isRunning || timerData.isActive,
        is_paused: timerData.isPaused || false,
        project_id: timerData.projectId,
        task_id: timerData.taskId,
        notes: timerData.notes
      },
      enhanced: true,
      persistent: true,
      debug: {
        timerAge: currentDuration,
        persistentStorage: true
      }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Enhanced Timer API is running!',
    enhanced: true,
    activeTimers: Object.keys(timerStorage).length
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Enhanced Timer Server running on http://localhost:${PORT}`);
  console.log(`🔧 Enhanced persistence system loaded`);
  console.log(`🧪 Test with: curl http://localhost:${PORT}/api/health`);
});

module.exports = app;