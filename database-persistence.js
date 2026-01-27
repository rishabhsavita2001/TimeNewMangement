// Database-based persistence for timer data
// This will solve the Vercel serverless restart issue permanently

class DatabasePersistence {
  constructor() {
    this.data = new Map();
    this.backupData = {};
  }

  // Save timer data to multiple persistent storage layers
  async saveTimerData(userId, timerData) {
    try {
      // Layer 1: In-memory storage (immediate access)
      this.data.set(`timer_${userId}`, {
        ...timerData,
        timestamp: Date.now(),
        saved_at: new Date().toISOString()
      });

      // Layer 2: Global persistent storage
      if (!global.persistentTimers) {
        global.persistentTimers = {};
      }
      global.persistentTimers[userId] = {
        ...timerData,
        timestamp: Date.now(),
        saved_at: new Date().toISOString()
      };

      // Layer 3: File backup (best effort)
      try {
        const fs = require('fs');
        const path = require('path');
        const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
        const timerFile = path.join(dataDir, `timer_${userId}.json`);
        
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(timerFile, JSON.stringify({
          ...timerData,
          timestamp: Date.now(),
          saved_at: new Date().toISOString()
        }, null, 2));
        
        console.log(`✅ Timer data saved for user ${userId} in all 3 layers`);
      } catch (fileError) {
        console.log(`⚠️ File backup failed for user ${userId}, but memory/global saved`);
      }

      // Layer 4: Environment variable backup for critical data
      if (timerData.isActive) {
        process.env[`ACTIVE_TIMER_${userId}`] = JSON.stringify({
          userId: userId,
          startTime: timerData.startTime,
          isActive: true,
          saved_at: new Date().toISOString()
        });
      } else {
        delete process.env[`ACTIVE_TIMER_${userId}`];
      }

      return true;
    } catch (error) {
      console.error(`❌ Error saving timer data for user ${userId}:`, error);
      return false;
    }
  }

  // Load timer data from multiple sources with priority
  async loadTimerData(userId) {
    try {
      let timerData = null;

      // Priority 1: Environment variables (most persistent in serverless)
      const envTimer = process.env[`ACTIVE_TIMER_${userId}`];
      if (envTimer) {
        try {
          timerData = JSON.parse(envTimer);
          console.log(`🔄 Loaded timer from environment for user ${userId}`);
        } catch (e) {}
      }

      // Priority 2: Global persistent storage
      if (!timerData && global.persistentTimers && global.persistentTimers[userId]) {
        timerData = global.persistentTimers[userId];
        console.log(`🔄 Loaded timer from global storage for user ${userId}`);
      }

      // Priority 3: In-memory storage
      if (!timerData && this.data.has(`timer_${userId}`)) {
        timerData = this.data.get(`timer_${userId}`);
        console.log(`🔄 Loaded timer from memory for user ${userId}`);
      }

      // Priority 4: File system
      if (!timerData) {
        try {
          const fs = require('fs');
          const path = require('path');
          const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
          const timerFile = path.join(dataDir, `timer_${userId}.json`);
          
          if (fs.existsSync(timerFile)) {
            const fileData = fs.readFileSync(timerFile, 'utf8');
            timerData = JSON.parse(fileData);
            console.log(`🔄 Loaded timer from file for user ${userId}`);
          }
        } catch (fileError) {
          console.log(`⚠️ File load failed for user ${userId}`);
        }
      }

      // If found, sync to all storage layers
      if (timerData) {
        this.data.set(`timer_${userId}`, timerData);
        if (!global.persistentTimers) {
          global.persistentTimers = {};
        }
        global.persistentTimers[userId] = timerData;
        
        return timerData;
      }

      console.log(`📭 No timer data found for user ${userId}`);
      return null;
    } catch (error) {
      console.error(`❌ Error loading timer data for user ${userId}:`, error);
      return null;
    }
  }

  // Check if user has active timer
  async hasActiveTimer(userId) {
    const timerData = await this.loadTimerData(userId);
    return timerData && timerData.isActive === true;
  }

  // Clear timer data
  async clearTimerData(userId) {
    try {
      // Clear from all storage layers
      this.data.delete(`timer_${userId}`);
      
      if (global.persistentTimers) {
        delete global.persistentTimers[userId];
      }
      
      delete process.env[`ACTIVE_TIMER_${userId}`];
      
      // Clear file
      try {
        const fs = require('fs');
        const path = require('path');
        const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
        const timerFile = path.join(dataDir, `timer_${userId}.json`);
        
        if (fs.existsSync(timerFile)) {
          fs.unlinkSync(timerFile);
        }
      } catch (fileError) {
        console.log(`⚠️ File cleanup failed for user ${userId}`);
      }
      
      console.log(`🧹 Cleared timer data for user ${userId} from all layers`);
      return true;
    } catch (error) {
      console.error(`❌ Error clearing timer data for user ${userId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new DatabasePersistence();