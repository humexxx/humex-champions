import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IChecklist, IChecklistItem } from '@shared/models/uplift';
import { Timestamp } from 'firebase-admin/firestore';

const db = admin.firestore();

export const checklistReportGeneration = functions.pubsub
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
              const lastData = lastDoc.data() as IChecklist<Timestamp>;

              if (lastData.date.toDate().getDate() === now.getDate() - 1) {
                if (lastData.items && lastData.items.length > 0) {
                  const completedItems = lastData.items.filter(
                    (item: IChecklistItem) => item.completed
                  ).length;

                  const totalItems = lastData.items.length;
                  const completionPercentage =
                    (completedItems / totalItems) * 100;

                  await lastDoc.ref.update({
                    completionPercentage: completionPercentage,
                  });

                  // Mover ítems no completados al checklist de hoy
                  const uncompletedItems = lastData.items
                    .filter((item) => !item.completed)
                    .map((item) => ({ ...item, movedFromYesterday: true }));

                  if (uncompletedItems.length > 0) {
                    const newDocData: IChecklist<Timestamp> = {
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

export const adminChecklistReportGeneration = functions.https.onCall(
  async (_, context) => {
    if (!context.auth || !context.auth.token.admin) {
      return { error: 'Only admins can generate reports.' };
    }

    try {
      const lastChecklistSnapshot = await db
        .collection(`uplift/${context.auth.uid}/checklist`)
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (!lastChecklistSnapshot.empty) {
        const lastDoc = lastChecklistSnapshot.docs[0];
        const lastData = lastDoc.data() as IChecklist;

        if (lastData.items && lastData.items.length > 0) {
          const completedItems = lastData.items.filter(
            (item: IChecklistItem) => item.completed
          ).length;

          const totalItems = lastData.items.length;
          const completionPercentage = (completedItems / totalItems) * 100;

          await lastDoc.ref.update({
            completionPercentage: completionPercentage,
          });

          // Mover ítems no completados al checklist de hoy
          const uncompletedItems = lastData.items
            .filter((item) => !item.completed)
            .map((item) => ({ ...item, movedFromYesterday: true }));

          if (uncompletedItems.length > 0) {
            const newDocData: IChecklist<Timestamp> = {
              date: admin.firestore.Timestamp.fromDate(new Date()),
              items: uncompletedItems,
            };

            await db
              .collection(`uplift/${context.auth.uid}/checklist`)
              .add(newDocData);

            return {
              message:
                'Checklist report generated successfully with uncompleted items.',
              data: newDocData,
            };
          }
          return { message: 'Checklist report generated successfully' };
        }
        return { message: 'No items found under the last checklist.' };
      }
      return { message: 'No previous snapshot found.' };
    } catch (error) {
      console.error(error);
      return { error: 'Error generating snapshot.' };
    }
  }
);
