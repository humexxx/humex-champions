import { onSchedule } from 'firebase-functions/v2/scheduler';

import { schedulerRuntime } from '../../../core/config';
import { log } from '../../../core/logger';
import { updateF1NextRaceCache } from '../f1.service';

/**
 * Scheduled function to update F1 next race cache
 * Runs every Monday at 9 AM UTC (after race weekend)
 */
export const updateF1NextRaceScheduler = onSchedule(
  {
    schedule: '0 9 * * 1', // Every Monday at 9 AM UTC
    timeZone: 'UTC',
    region: schedulerRuntime.region,
    memory: '1GiB',
    timeoutSeconds: schedulerRuntime.timeoutSeconds,
  },
  async () => {
    try {
      log.info('Starting scheduled F1 next race update');

      await updateF1NextRaceCache();

      log.info('Completed scheduled F1 next race update');
    } catch (error) {
      log.error('Failed to update F1 next race cache', { error });
      throw error;
    }
  }
);
