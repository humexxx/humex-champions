import { FIRESTORE_PATHS } from '@shared/consts';
import { ICallableRequest, ICallableResponse, IUser } from '@shared/models';
import { IFinancialPlan } from '@shared/models/finances';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { pubsub } from 'firebase-functions/v1';
import { https } from 'firebase-functions/v2';

import { generateSingleSnapshot } from './utils';

const db = admin.firestore();

export const scheduledSnapshotGeneration = pubsub
  .schedule('0 * 1 * *') // Se ejecuta cada hora el primer día de cada mes
  .onRun(async () => {
    return null;
    try {
      const usersSnapshot = await db.collection('users').get();

      await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const { timezone } = userDoc.data() as IUser;
          const now = new Date();
          const userTime = new Date(
            now.toLocaleString('en-US', { timeZone: timezone })
          );

          if (userTime.getHours() === 0) {
            const snapshots = await db
              .collection(FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(userDoc.id))
              .get();

            const batch = db.batch();
            snapshots.forEach(async (snapshotDoc) => {
              const data = snapshotDoc.data() as IFinancialPlan;
              const lastPortfolioSnapshot =
                data.financialSnapshots[data.financialSnapshots.length - 1];

              const newSnapshot = generateSingleSnapshot(
                lastPortfolioSnapshot,
                data.fixedExpenses,
                data.incomes
              );

              batch.update(snapshotDoc.ref, {
                financialSnapshots: FieldValue.arrayUnion(newSnapshot),
              });
            });
            await batch.commit();
          }
        })
      );

      return { message: 'Snapshots generated successfully.' };
    } catch (error) {
      console.error(error);
      return { error: 'Error generating snapshots.' };
    }
  });

export const adminPersonalFinanceSnapshotGeneration =
  https.onCall<ICallableRequest>(
    async (req): Promise<ICallableResponse<{ message: string }>> => {
      if (!req.auth?.uid || !req.auth.token.admin) {
        return { success: false, error: 'Only admins can generate snapshots.' };
      }

      try {
        const snapshots = await db
          .collection(FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(req.auth.uid))
          .get();

        const batch = db.batch();
        snapshots.forEach(async (snapshotDoc) => {
          const data = snapshotDoc.data() as IFinancialPlan;
          const lastPortfolioSnapshot =
            data.financialSnapshots[data.financialSnapshots.length - 1];

          const newSnapshot = generateSingleSnapshot(
            lastPortfolioSnapshot,
            data.fixedExpenses,
            data.incomes
          );

          batch.update(snapshotDoc.ref, {
            financialSnapshots: FieldValue.arrayUnion(newSnapshot),
          });
        });
        await batch.commit();
        return {
          success: true,
          data: { message: 'Snapshots generated successfully.' },
        };
      } catch (error) {
        console.error(error);
        return { success: false, error: 'Error generating snapshots.' };
      }
    }
  );
