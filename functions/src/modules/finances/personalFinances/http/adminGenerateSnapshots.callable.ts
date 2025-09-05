import { onCall } from 'firebase-functions/v2/https';

import { mapToHttpsError } from '../../../../core/errors';
import { log } from '../../../../core/logger';
import { generateFinancialSnapshotsForUser } from '../personalFinances.service';

/**
 * Admin function to manually generate financial snapshots for a specific user
 * Only admins can trigger this function
 * HTTP Callable Function
 */
export const adminGenerateSnapshotsCallable = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 5,
  },
  async (request) => {
    try {
      // Check admin permissions
      if (!request.auth?.uid || !request.auth.token.admin) {
        log.warn('Unauthorized finance snapshot attempt', {
          userId: request.auth?.uid,
        });
        throw new Error('Only admins can generate snapshots');
      }

      const userId = request.auth.uid;
      log.info(`Admin generating finance snapshots for user: ${userId}`);

      const result = await generateFinancialSnapshotsForUser(userId);

      log.info(
        `Admin snapshots completed: ${result.processed} plans processed`
      );

      return {
        success: true,
        data: {
          message: 'Snapshots generated successfully',
          processed: result.processed,
        },
      };
    } catch (error) {
      log.error('Admin finance snapshot generation failed', { error });
      throw mapToHttpsError(error);
    }
  }
);
