import { FIRESTORE_PATHS } from '@shared/consts';
import { PAYOFF_METHODS } from '@shared/enums/finance';
import { ICallableRequest, ICallableResponse, IUser } from '@shared/models';
import { IFinancialPlan } from '@shared/models/finances';
import { financeUtils } from '@shared/utils/finance';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { pubsub } from 'firebase-functions/v1';
import { https } from 'firebase-functions/v2';

const db = admin.firestore();

export const scheduledSnapshotGeneration = pubsub
  .schedule('0 * 1 * *') // Se ejecuta cada hora el primer día de cada mes
  .onRun(async () => {
    logger.info('Financial snapshot generation started');

    try {
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

            if (userTime.getHours() === 0) {
              const snapshots = await db
                .collection(
                  FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(userDoc.id)
                )
                .get();

              const batch = db.batch();
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
                  }
                } catch (planError) {
                  logger.error(`Plan ${snapshotDoc.id} failed:`, planError);
                }
              });
              await batch.commit();
              processed++;
            }
          } catch (userError) {
            logger.error(`User ${userDoc.id} failed:`, userError);
            errors++;
          }
        })
      );

      logger.info(
        `Financial snapshots completed: ${processed} users processed, ${errors} errors`
      );
      return { message: 'Snapshots generated successfully.' };
    } catch (error) {
      logger.error('Financial snapshot generation failed:', error);
      return { error: 'Error generating snapshots.' };
    }
  });

export const adminPersonalFinanceSnapshotGeneration =
  https.onCall<ICallableRequest>(
    async (req): Promise<ICallableResponse<{ message: string }>> => {
      if (!req.auth?.uid || !req.auth.token.admin) {
        logger.warn('Unauthorized finance snapshot attempt', {
          userId: req.auth?.uid,
        });
        return { success: false, error: 'Only admins can generate snapshots.' };
      }

      try {
        logger.info(
          `Admin generating finance snapshots for user: ${req.auth.uid}`
        );

        const snapshots = await db
          .collection(FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(req.auth.uid))
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
            logger.error(`Admin plan ${snapshotDoc.id} failed:`, planError);
          }
        });

        await batch.commit();
        logger.info(`Admin snapshots completed: ${processed} plans processed`);

        return {
          success: true,
          data: { message: 'Snapshots generated successfully.' },
        };
      } catch (error) {
        logger.error('Admin finance snapshot generation failed:', error);
        return { success: false, error: 'Error generating snapshots.' };
      }
    }
  );
