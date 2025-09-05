import { onSchedule } from 'firebase-functions/v2/scheduler';

import { schedulerRuntime } from '../../../../../core/config';
import { log } from '../../../../../core/logger';
import { updateF1NewsCache } from '../f1.service';

/**
 * Scheduled function to update F1 news cache
 * Runs daily at 8 AM UTC
 */
export const updateF1NewsScheduler = onSchedule(
  {
    schedule: '0 8 * * *', // Daily at 8 AM UTC
    timeZone: 'UTC',
    region: schedulerRuntime.region,
    memory: '1GiB',
    timeoutSeconds: schedulerRuntime.timeoutSeconds,
  },
  async () => {
    try {
      log.info('Starting scheduled F1 news update');

      await updateF1NewsCache();

      log.info('Completed scheduled F1 news update');
    } catch (error) {
      log.error('Failed to update F1 news cache', { error });
      throw error;
    }
  }
);
