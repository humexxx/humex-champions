import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generateSingleSnapshot } from './utils';
import { IUser } from '@shared/models';
import { IFinancialPlan } from '@shared/models/finances';

const db = admin.firestore();

export const scheduledSnapshotGeneration = functions.pubsub
  .schedule('0 * 1 * *') // Se ejecuta cada hora el primer día de cada mes
  .onRun(async () => {
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
              .collection(`finances/${userDoc.id}/financialPlans`)
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

export const adminPersonalFinanceSnapshotGeneration = functions.https.onCall(
  async (_, context) => {
    if (!context.auth || !context.auth.token.admin) {
      return { error: 'Only admins can generate snapshots.' };
    }

    try {
      const snapshots = await db
        .collection(`finances/${context.auth.uid}/financialPlans`)
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
      return { message: 'Snapshots generated successfully.' };
    } catch (error) {
      console.error(error);
      return { error: 'Error generating snapshots.' };
    }
  }
);
