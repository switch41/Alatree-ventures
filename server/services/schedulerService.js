const cron = require('node-cron');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // Initialize scheduled jobs
    this.setupDrawScheduler();
    this.setupNotificationScheduler();
    this.setupCleanupScheduler();
    
    this.isInitialized = true;
    console.log('Scheduler service initialized');
  }

  setupDrawScheduler() {
    const drawJob = cron.schedule('0 0 * * *', () => {
      this.runDraw();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set('draw', {
      name: 'Prize Draw',
      description: 'Runs scheduled prize draws',
      schedule: '0 0 * * *', // Daily at midnight
      enabled: false,
      job: drawJob,
      lastRun: null
    });
  }

  setupNotificationScheduler() {
    const notificationJob = cron.schedule('0 */6 * * *', () => {
      this.sendNotifications();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set('notifications', {
      name: 'Notifications',
      description: 'Sends scheduled notifications and reminders',
      schedule: '0 */6 * * *', // Every 6 hours
      enabled: false,
      job: notificationJob,
      lastRun: null
    });
  }

  setupCleanupScheduler() {
    const cleanupJob = cron.schedule('0 2 * * 0', () => {
      this.cleanupOldData();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set('cleanup', {
      name: 'Data Cleanup',
      description: 'Cleans up old data and logs',
      schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
      enabled: false,
      job: cleanupJob,
      lastRun: null
    });
  }

  async runDraw() {
    try {
      console.log('Running scheduled draw...', new Date().toISOString());
      
      const Cycle = require('../models/Cycle');
      
      // Find cycles that should have draws run
      const cyclesToDraw = await Cycle.find({
        status: 'active',
        drawDate: { $lte: new Date() },
        'winners.0': { $exists: false } // No winners selected yet
      });

      for (const cycle of cyclesToDraw) {
        await this.selectWinners(cycle);
      }

      this.updateJobLastRun('draw');
    } catch (error) {
      console.error('Draw scheduler error:', error);
    }
  }

  async selectWinners(cycle) {
    try {
      if (cycle.entries.length === 0) return;

      const winners = [];
      const availableEntries = [...cycle.entries];

      for (const prize of cycle.prizes.sort((a, b) => a.position - b.position)) {
        if (availableEntries.length === 0) break;

        for (let i = 0; i < prize.quantity && availableEntries.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableEntries.length);
          const winner = availableEntries.splice(randomIndex, 1)[0];

          winners.push({
            user: winner.user,
            prize: {
              position: prize.position,
              name: prize.name,
              value: prize.value
            }
          });
        }
      }

      cycle.winners = winners;
      cycle.status = 'completed';
      await cycle.save();

      console.log(`Draw completed for cycle ${cycle.name}, ${winners.length} winners selected`);
    } catch (error) {
      console.error('Error selecting winners:', error);
    }
  }

  async sendNotifications() {
    try {
      console.log('Sending scheduled notifications...', new Date().toISOString());
      
      // Add notification logic here
      // For example: send reminders about upcoming draws, task deadlines, etc.
      
      this.updateJobLastRun('notifications');
    } catch (error) {
      console.error('Notification scheduler error:', error);
    }
  }

  async cleanupOldData() {
    try {
      console.log('Running data cleanup...', new Date().toISOString());
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Add cleanup logic here
      // For example: remove old logs, expired tokens, etc.
      
      this.updateJobLastRun('cleanup');
    } catch (error) {
      console.error('Cleanup scheduler error:', error);
    }
  }

  getStatus() {
    const status = {};
    
    for (const [key, job] of this.jobs) {
      status[key] = {
        name: job.name,
        description: job.description,
        schedule: job.schedule,
        enabled: job.enabled,
        lastRun: job.lastRun,
        nextRun: job.enabled ? this.getNextRun(job.schedule) : null
      };
    }

    return status;
  }

  toggleJob(jobName, enabled) {
    const job = this.jobs.get(jobName);
    
    if (!job) {
      return { success: false, message: 'Job not found' };
    }

    job.enabled = enabled;
    
    if (enabled) {
      job.job.start();
    } else {
      job.job.stop();
    }

    return { 
      success: true, 
      message: `Job ${jobName} ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        name: job.name,
        enabled: job.enabled,
        schedule: job.schedule
      }
    };
  }

  updateJobLastRun(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.lastRun = new Date();
    }
  }

  getNextRun(schedule) {
    // Simple next run calculation - in production you'd use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now);
    
    // Add basic logic for common schedules
    if (schedule === '0 0 * * *') { // Daily
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(0, 0, 0, 0);
    } else if (schedule === '0 */6 * * *') { // Every 6 hours
      nextRun.setHours(nextRun.getHours() + 6, 0, 0, 0);
    } else if (schedule === '0 2 * * 0') { // Weekly Sunday 2 AM
      nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
      nextRun.setHours(2, 0, 0, 0);
    }
    
    return nextRun;
  }

  destroy() {
    for (const [, job] of this.jobs) {
      job.job.destroy();
    }
    this.jobs.clear();
    this.isInitialized = false;
  }
}

module.exports = new SchedulerService();