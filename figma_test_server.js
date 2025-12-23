const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication
app.use((req, res, next) => {
  req.user = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 1,
    tenantName: 'Test Company'
  };
  next();
});

// Global timer storage
global.activeTimers = {};

// Timer APIs
app.post('/api/me/timer/start', (req, res) => {
  const { projectId, taskId, notes } = req.body || {};
  const timerId = `timer_${req.user.id}_${Date.now()}`;
  const startTime = new Date().toISOString();
  
  // Check for existing timer
  const existingTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (existingTimer) {
    return res.status(400).json({
      success: false,
      message: 'Timer already running. Stop current timer first.',
      data: { currentTimer: existingTimer }
    });
  }
  
  // Create new timer
  global.activeTimers[timerId] = {
    timerId,
    userId: req.user.id,
    tenantId: req.user.tenantId,
    startTime,
    projectId,
    taskId,
    notes,
    isRunning: true,
    isPaused: false,
    totalPausedTime: 0,
    pauseStartTime: null
  };

  res.json({
    success: true,
    message: 'Timer started successfully',
    data: { timerId, startTime, isRunning: true, projectId, taskId, notes }
  });
});

app.post('/api/me/timer/stop', (req, res) => {
  const { notes: stopNotes } = req.body || {};
  
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.status(404).json({
      success: false,
      message: 'No running timer found'
    });
  }
  
  const stopTime = new Date();
  const startTime = new Date(activeTimer.startTime);
  const totalTimeMs = (stopTime - startTime) - activeTimer.totalPausedTime;
  const totalHours = Math.round((totalTimeMs / (1000 * 60 * 60)) * 100) / 100;
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  const durationString = `${hours}h ${minutes}m`;
  
  delete global.activeTimers[activeTimer.timerId];

  res.json({
    success: true,
    message: 'Timer stopped successfully',
    data: {
      duration: durationString,
      totalHours,
      startTime: activeTimer.startTime,
      stopTime: stopTime.toISOString(),
      timerId: activeTimer.timerId
    }
  });
});

app.post('/api/me/timer/pause', (req, res) => {
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.status(404).json({
      success: false,
      message: 'No running timer found'
    });
  }
  
  const now = new Date();
  
  if (activeTimer.isPaused) {
    // Resume timer
    if (activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      activeTimer.totalPausedTime += pauseDuration;
    }
    activeTimer.isPaused = false;
    activeTimer.pauseStartTime = null;
    
    res.json({
      success: true,
      message: 'Timer resumed successfully',
      data: { isPaused: false, timerId: activeTimer.timerId }
    });
  } else {
    // Pause timer
    activeTimer.isPaused = true;
    activeTimer.pauseStartTime = now.toISOString();
    
    res.json({
      success: true,
      message: 'Timer paused successfully',
      data: { isPaused: true, timerId: activeTimer.timerId }
    });
  }
});

app.get('/api/me/timer/current', (req, res) => {
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (!activeTimer) {
    return res.json({
      success: true,
      data: { hasActiveTimer: false, timer: null }
    });
  }
  
  const now = new Date();
  const startTime = new Date(activeTimer.startTime);
  let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
  
  if (activeTimer.isPaused && activeTimer.pauseStartTime) {
    const pauseDuration = now - new Date(activeTimer.pauseStartTime);
    currentTimeMs -= pauseDuration;
  }
  
  const currentHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
  const hours = Math.floor(currentHours);
  const minutes = Math.round((currentHours - hours) * 60);
  const currentDuration = `${hours}h ${minutes}m`;
  
  res.json({
    success: true,
    data: {
      hasActiveTimer: true,
      timer: {
        timerId: activeTimer.timerId,
        startTime: activeTimer.startTime,
        isRunning: activeTimer.isRunning,
        isPaused: activeTimer.isPaused,
        currentDuration,
        currentHours: Math.round(currentHours * 100) / 100
      }
    }
  });
});

// Work Summary APIs
app.get('/api/me/work-summary/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Mock completed hours for today
  let totalHours = 2.5; // Mock: 2.5 hours already worked
  
  // Add current timer time if running
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  let currentTimerDuration = "0h 0m";
  
  if (activeTimer) {
    const now = new Date();
    const startTime = new Date(activeTimer.startTime);
    let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
    
    if (activeTimer.isPaused && activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      currentTimeMs -= pauseDuration;
    }
    
    const currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
    const hours = Math.floor(currentTimerHours);
    const minutes = Math.round((currentTimerHours - hours) * 60);
    currentTimerDuration = `${hours}h ${minutes}m`;
    
    totalHours += currentTimerHours;
  }
  
  const totalWorkedHoursInt = Math.floor(totalHours);
  const totalWorkedMinutes = Math.round((totalHours - totalWorkedHoursInt) * 60);
  const totalWorkedString = `${totalWorkedHoursInt}h ${totalWorkedMinutes}m`;
  
  res.json({
    success: true,
    data: {
      totalWorked: totalWorkedString,
      totalHours: Math.round(totalHours * 100) / 100,
      isTimerRunning: !!activeTimer,
      currentTimerDuration,
      date: today
    }
  });
});

app.get('/api/me/work-summary/weekly', (req, res) => {
  // Mock weekly data
  let totalWorkedHours = 22.5; // Mock: 22.5 hours this week
  
  // Add current timer if running today
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  if (activeTimer) {
    const now = new Date();
    const startTime = new Date(activeTimer.startTime);
    let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
    
    if (activeTimer.isPaused && activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      currentTimeMs -= pauseDuration;
    }
    
    const currentTimerHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
    totalWorkedHours += currentTimerHours;
  }
  
  const expectedWeeklyHours = 40;
  const balanceHours = totalWorkedHours - expectedWeeklyHours;
  
  const workedHoursInt = Math.floor(totalWorkedHours);
  const workedMinutes = Math.round((totalWorkedHours - workedHoursInt) * 60);
  const totalWorkedString = `${workedHoursInt}h ${workedMinutes}m`;
  
  let balanceString;
  if (balanceHours >= 0) {
    const balanceHoursInt = Math.floor(balanceHours);
    const balanceMinutes = Math.round((balanceHours - balanceHoursInt) * 60);
    balanceString = `+${balanceHoursInt}h ${balanceMinutes}m`;
  } else {
    const absBalance = Math.abs(balanceHours);
    const balanceHoursInt = Math.floor(absBalance);
    const balanceMinutes = Math.round((absBalance - balanceHoursInt) * 60);
    balanceString = `-${balanceHoursInt}h ${balanceMinutes}m`;
  }
  
  res.json({
    success: true,
    data: {
      weeklyBalance: balanceString,
      totalWorkedThisWeek: totalWorkedString,
      expectedHours: expectedWeeklyHours,
      actualHours: Math.round(totalWorkedHours * 100) / 100,
      balanceHours: Math.round(balanceHours * 100) / 100
    }
  });
});

// Notifications API
app.get('/api/me/notifications', (req, res) => {
  const now = new Date();
  const hour = now.getHours();
  const notifications = [];
  
  if (hour >= 12 && hour <= 14) {
    notifications.push({
      id: `lunch_${now.getDate()}`,
      title: "Lunch Break",
      message: "Lunch break. Let's go!",
      type: "break_reminder",
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      isRead: false,
      icon: "🍽️"
    });
  }
  
  if (hour >= 9 && hour <= 11) {
    notifications.push({
      id: `welcome_${now.getDate()}`,
      title: "Good Morning!",
      message: "Ready to start your workday? Tap the Start button when you're ready.",
      type: "welcome",
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
      isRead: false,
      icon: "🌅"
    });
  }
  
  notifications.push({
    id: `achievement_${now.getDate()}`,
    title: "Great Work!",
    message: "You're making good progress today. Keep it up!",
    type: "achievement",
    timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
    isRead: Math.random() > 0.7,
    icon: "🏆"
  });
  
  res.json({
    success: true,
    data: {
      notifications: notifications.slice(0, 10),
      unreadCount: notifications.filter(n => !n.isRead).length,
      hasNewUpdates: notifications.some(n => !n.isRead)
    }
  });
});

app.post('/api/me/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notificationId: id, markedAt: new Date().toISOString() }
  });
});

app.post('/api/me/notifications/mark-all-read', (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: { markedAt: new Date().toISOString() }
  });
});

// Dashboard API
app.get('/api/me/dashboard', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // User profile
  const userProfile = {
    id: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    tenantName: req.user.tenantName
  };
  
  // Timer status
  const activeTimer = Object.values(global.activeTimers).find(
    timer => timer.userId === req.user.id && timer.isRunning
  );
  
  let timerStatus = { hasActiveTimer: false, timer: null };
  
  if (activeTimer) {
    const now = new Date();
    const startTime = new Date(activeTimer.startTime);
    let currentTimeMs = now - startTime - activeTimer.totalPausedTime;
    
    if (activeTimer.isPaused && activeTimer.pauseStartTime) {
      const pauseDuration = now - new Date(activeTimer.pauseStartTime);
      currentTimeMs -= pauseDuration;
    }
    
    const currentHours = Math.max(0, currentTimeMs / (1000 * 60 * 60));
    const hours = Math.floor(currentHours);
    const minutes = Math.round((currentHours - hours) * 60);
    const currentDuration = `${hours}h ${minutes}m`;
    
    timerStatus = {
      hasActiveTimer: true,
      timer: {
        timerId: activeTimer.timerId,
        startTime: activeTimer.startTime,
        isRunning: activeTimer.isRunning,
        isPaused: activeTimer.isPaused,
        currentDuration,
        currentHours: Math.round(currentHours * 100) / 100
      }
    };
  }
  
  // Mock today's summary and weekly balance
  const todaysSummary = {
    totalWorked: "4h 30m",
    totalHours: 4.5,
    isTimerRunning: !!activeTimer,
    date: today
  };
  
  const weeklyBalance = {
    weeklyBalance: "-3h 20m",
    totalWorkedThisWeek: "36h 40m",
    expectedHours: 40,
    actualHours: 36.67,
    balanceHours: -3.33
  };
  
  // Mock notifications
  const notifications = [
    {
      id: 'lunch_today',
      title: "Lunch Break",
      message: "Lunch break. Let's go!",
      type: "break_reminder",
      timestamp: new Date().toISOString(),
      isRead: false,
      icon: "🍽️"
    }
  ];
  
  res.json({
    success: true,
    data: {
      user: userProfile,
      timerStatus,
      todaysSummary,
      weeklyBalance,
      recentEntries: [],
      notifications,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Authentication endpoints (mock)
app.post('/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token-12345',
    data: {
      user: {
        id: 1,
        email: req.body.email,
        firstName: 'Test',
        lastName: 'User'
      }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Figma Screen APIs Test Server'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'POST /auth/login',
      'GET /api/health',
      'POST /api/me/timer/start',
      'POST /api/me/timer/stop', 
      'POST /api/me/timer/pause',
      'GET /api/me/timer/current',
      'GET /api/me/work-summary/today',
      'GET /api/me/work-summary/weekly',
      'GET /api/me/notifications',
      'GET /api/me/dashboard'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Figma Screen APIs Test Server running on http://localhost:${PORT}`);
  console.log('📱 All APIs ready for testing!');
  console.log('\n🔗 Available endpoints:');
  console.log('   POST /auth/login');
  console.log('   POST /api/me/timer/start');
  console.log('   POST /api/me/timer/stop');
  console.log('   POST /api/me/timer/pause');
  console.log('   GET  /api/me/timer/current');
  console.log('   GET  /api/me/work-summary/today');
  console.log('   GET  /api/me/work-summary/weekly');
  console.log('   GET  /api/me/notifications');
  console.log('   GET  /api/me/dashboard');
});