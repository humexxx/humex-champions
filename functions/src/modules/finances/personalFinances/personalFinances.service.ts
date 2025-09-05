import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

import { FIRESTORE_PATHS } from '../../../../../shared/consts';
import { PAYOFF_METHODS } from '../../../../../shared/enums/finance';
import { IUser } from '../../../../../shared/models';
import { IFinancialPlan } from '../../../../../shared/models/finances';
import { financeUtils } from '../../../../../shared/utils/finance';
import { AppError } from '../../../core/errors';
import { log } from '../../../core/logger';

const db = admin.firestore();

/**
 * Interface for snapshot generation results
 */
interface SnapshotGenerationResult {
  processed: number;
  errors: number;
}

/**
 * Generate financial snapshots for all users
 * This function is called by the scheduled function
 */
export async function generateFinancialSnapshots(): Promise<SnapshotGenerationResult> {
  try {
    log.info('Financial snapshot generation started');

    const usersSnapshot = await db.collection('users').get();
    let processed = 0;
    let errors = 0;

    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        try {
          const { timezone } = userDoc.data() as IUser;
          const now = new Date();
          const userTime = new Date(
            now.toLocaleString('en-US', { timeZone: timezone })
          );

          // Only process if it's midnight in user's timezone
          if (userTime.getHours() === 0) {
            const result = await generateFinancialSnapshotsForUser(userDoc.id);
            if (result.processed > 0) {
              processed++;
            }
          }
        } catch (userError) {
          log.error(`User ${userDoc.id} failed:`, { error: userError });
          errors++;
        }
      })
    );

    log.info(
      `Financial snapshots completed: ${processed} users processed, ${errors} errors`
    );

    return { processed, errors };
  } catch (error) {
    log.error('Financial snapshot generation failed:', { error });
    throw new AppError(
      'snapshot-generation-failed',
      'Failed to generate financial snapshots',
      500
    );
  }
}

/**
 * Generate financial snapshots for a specific user
 * @param {string} userId - User ID to generate snapshots for
 */
export async function generateFinancialSnapshotsForUser(
  userId: string
): Promise<SnapshotGenerationResult> {
  try {
    log.info(`Generating financial snapshots for user: ${userId}`);

    const snapshots = await db
      .collection(FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(userId))
      .get();

    const batch = db.batch();
    let processed = 0;

    snapshots.forEach(async (snapshotDoc) => {
      try {
        const data = snapshotDoc.data() as IFinancialPlan;
        const lastFinancialSnapshot =
          data.financialSnapshots[data.financialSnapshots.length - 1];

        // Generate next month snapshot directly using shared utils
        const predictions =
          financeUtils.generateMonthlyFinancialSnapshotsPredictions(
            lastFinancialSnapshot,
            PAYOFF_METHODS.AVALANCHE,
            1
          );

        if (predictions.length > 0) {
          const newSnapshot = {
            ...predictions[0],
            incomes: data.incomes,
            fixedExpenses: data.fixedExpenses,
            date: admin.firestore.Timestamp.fromDate(
              predictions[0].date.toDate()
            ) as unknown as IFinancialPlan['financialSnapshots'][0]['date'],
          };

          batch.update(snapshotDoc.ref, {
            financialSnapshots: FieldValue.arrayUnion(newSnapshot),
          });

          processed++;
        }
      } catch (planError) {
        log.error(`Plan ${snapshotDoc.id} failed:`, { error: planError });
      }
    });

    await batch.commit();
    log.info(
      `User ${userId} snapshots completed: ${processed} plans processed`
    );

    return { processed, errors: 0 };
  } catch (error) {
    log.error(`Failed to generate snapshots for user ${userId}:`, { error });
    throw new AppError(
      'user-snapshot-generation-failed',
      `Failed to generate financial snapshots for user ${userId}`,
      500,
      { userId }
    );
  }
}
