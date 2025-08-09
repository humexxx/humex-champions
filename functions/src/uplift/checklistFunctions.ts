import { FIRESTORE_PATHS } from '@shared/consts';
import { ICallableRequest, ICallableResponse } from '@shared/models';
import * as admin from 'firebase-admin';
import { https } from 'firebase-functions';
import { pubsub } from 'firebase-functions/v1';

const db = admin.firestore();

export const checklistReportGeneration = pubsub
  .schedule('every 1 hours') // Se ejecuta cada hora
  .onRun(async () => {
    try {
      const usersSnapshot = await db.collection('users').get();

      await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          const { timezone } = userData;
          const now = new Date();
          const userTime = new Date(
            now.toLocaleString('en-US', { timeZone: timezone })
          );

          if (userTime.getHours() === 0) {
            const lastChecklistSnapshot = await db
              .collection(`uplift/${userDoc.id}/checklist`)
              .orderBy('date', 'desc')
              .limit(1)
              .get();

            if (!lastChecklistSnapshot.empty) {
              const lastDoc = lastChecklistSnapshot.docs[0];
              const lastData = lastDoc.data() as any;

              if (lastData.date.toDate().getDate() === now.getDate() - 1) {
                if (lastData.items && lastData.items.length > 0) {
                  const completedItems = lastData.items.filter(
                    (item: any) => item.completed
                  ).length;

                  const totalItems = lastData.items.length;
                  const completionPercentage =
                    (completedItems / totalItems) * 100;

                  await lastDoc.ref.update({
                    completionPercentage: completionPercentage,
                  });

                  // Mover ítems no completados al checklist de hoy
                  const uncompletedItems = lastData.items
                    .filter((item: any) => !item.completed)
                    .map((item: any) => ({
                      ...item,
                      movedFromYesterday: true,
                    }));

                  if (uncompletedItems.length > 0) {
                    const newDocData: any = {
                      date: admin.firestore.Timestamp.fromDate(new Date()),
                      items: uncompletedItems,
                    };

                    await db
                      .collection(`uplift/${userDoc.id}/checklist`)
                      .add(newDocData);
                  }
                }
              }
            }
          }
        })
      );

      console.log('Checklist reports executed successfully.');
    } catch (error) {
      console.error('Error executing checklist reports:', error);
    }
  });

export const adminChecklistReportGeneration = https.onCall<ICallableRequest>(
  async (req): Promise<ICallableResponse<{ message: string; doc: any }>> => {
    if (!req.auth?.uid || !req.auth.token.admin) {
      return { success: false, error: 'Only admins can generate reports.' };
    }

    try {
      const lastChecklistSnapshot = await db
        .collection(FIRESTORE_PATHS.UPLIFT.CHECKLIST(req.auth.uid))
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (!lastChecklistSnapshot.empty) {
        const lastDoc = lastChecklistSnapshot.docs[0];
        const lastData = lastDoc.data() as any;

        if (lastData.items && lastData.items.length > 0) {
          const completedItems = lastData.items.filter(
            (item: any) => item.completed
          ).length;

          const totalItems = lastData.items.length;
          const completionPercentage = (completedItems / totalItems) * 100;

          await lastDoc.ref.update({
            completionPercentage: completionPercentage,
          });

          // Mover ítems no completados al checklist de hoy
          const uncompletedItems = lastData.items
            .filter((item: any) => !item.completed)
            .map((item: any) => ({ ...item, movedFromYesterday: true }));

          if (uncompletedItems.length > 0) {
            const newDocData: any = {
              date: admin.firestore.Timestamp.fromDate(new Date()),
              items: uncompletedItems,
            };

            await db
              .collection(FIRESTORE_PATHS.UPLIFT.CHECKLIST(req.auth.uid))
              .add(newDocData);

            return {
              success: true,
              data: {
                message:
                  'Checklist report generated successfully with uncompleted items.',
                doc: newDocData,
              },
            };
          }
          return {
            success: false,
            error: 'Checklist report generated successfully',
          };
        }
        return {
          success: false,
          error: 'No items found under the last checklist.',
        };
      }
      return { success: false, error: 'No previous snapshot found.' };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error generating snapshot.' };
    }
  }
);
