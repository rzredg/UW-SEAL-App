// backend/src/config/cronScheduler.js
import cron from 'node-cron';
import { updateStaleTaskStatuses } from '../services/staleTaskService.js';

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  console.log('[Cron Scheduler] Initializing scheduled jobs...');
  
  // Run stale task checker every day at midnight
  // Cron format: minute hour day month weekday
  // '0 0 * * *' = At 00:00 (midnight) every day
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Scheduler] Running daily stale task check...');
    await updateStaleTaskStatuses();
  });
  
  // Run every hour for more frequent checks
  // Uncomment this for hourly checks:
  // cron.schedule('0 * * * *', async () => {
  //   console.log('[Cron Scheduler] Running hourly stale task check...');
  //   await updateStaleTaskStatuses();
  // });
  
  // Run every 5 minutes for testing
  // Uncomment this ONLY for testing, then remove:
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron Scheduler] Running test stale task check...');
    await updateStaleTaskStatuses();
  });
  
  // Run once on startup to ensure current status
  updateStaleTaskStatuses();
  
  console.log('[Cron Scheduler] Scheduled jobs initialized:');
  console.log('  - Daily stale task check at midnight');
  console.log('  - Initial check completed');
};

/**
 * Cron schedule examples:
 * '0 0 * * *'      - Every day at midnight
 * '0 * * * *'      - Every hour
 * '* /30 * * * *'   - Every 30 minutes
 * '0 9,17 * * *'   - At 9 AM and 5 PM every day
 * '0 9 * * 1-5'    - At 9 AM Monday through Friday
 */