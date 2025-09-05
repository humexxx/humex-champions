import { setGlobalOptions } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { log } from '../../../../core/logger';
import { generateFinancialSnapshots } from '../personalFinances.service';

// Set global options
setGlobalOptions({ region: 'us-central1' });

/**
 * Scheduled function that generates financial snapshots for all users
 * Runs every hour on the first day of each month at midnight in user's timezone
 * PubSub Scheduled Function
 */
export const snapshotGenerationScheduler = onSchedule(
  {
    schedule: '0 * 1 * *', // Every hour on the first day of each month
    timeZone: 'UTC',
    maxInstances: 1,
  },
  async () => {
    try {
      log.info('Starting scheduled financial snapshot generation');

      const result = await generateFinancialSnapshots();

      log.info('Scheduled financial snapshot generation completed', {
        processed: result.processed,
        errors: result.errors,
      });
    } catch (error) {
      log.error('Scheduled financial snapshot generation failed', { error });
      throw error;
    }
  }
);
