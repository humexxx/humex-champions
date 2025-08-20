import { FIRESTORE_PATHS } from '@shared/consts';
import { ICallableRequest, ICallableResponse } from '@shared/models';
import * as admin from 'firebase-admin';
import { https, logger } from 'firebase-functions';
import { pubsub } from 'firebase-functions/v1';

const db = admin.firestore();

export const checklistReportGeneration = pubsub
  .schedule('every 1 hours') // Se ejecuta cada hora
  .onRun(async () => {
    logger.info('Checklist report generation started');

    try {
      const usersSnapshot = await db.collection('users').get();

      await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          try {
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
                const lastData = lastDoc.data();

                if (lastData.date.toDate().getDate() === now.getDate() - 1) {
                  logger.debug(
                    `Processing yesterday's checklist for user: ${userDoc.id}`
                  );

                  if (lastData.items && lastData.items.length > 0) {
                    const completedItems = lastData.items.filter(
                      (item: { completed: boolean }) => item.completed
                    ).length;

                    const totalItems = lastData.items.length;
                    const completionPercentage =
                      (completedItems / totalItems) * 100;

                    await lastDoc.ref.update({
                      completionPercentage: completionPercentage,
                    });

                    logger.info(
                      `Updated completion percentage for user ${userDoc.id}: ${completionPercentage.toFixed(2)}%`
                    );

                    // Mover ítems no completados al checklist de hoy
                    const uncompletedItems = lastData.items
                      .filter((item: { completed: boolean }) => !item.completed)
                      .map(
                        (item: {
                          completed: boolean;
                          [key: string]: unknown;
                        }) => ({
                          ...item,
                          movedFromYesterday: true,
                        })
                      );

                    if (uncompletedItems.length > 0) {
                      const newDocData = {
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
          } catch (userError) {
            logger.error(`Checklist user ${userDoc.id} failed:`, userError);
          }
        })
      );

      logger.info('Checklist report generation completed');
    } catch (error) {
      logger.error('Checklist report generation failed:', error);
    }
  });

export const adminChecklistReportGeneration = https.onCall<ICallableRequest>(
  async (
    req
  ): Promise<
    ICallableResponse<{ message: string; doc?: Record<string, unknown> }>
  > => {
    if (!req.auth?.uid || !req.auth.token.admin) {
      logger.warn('Unauthorized checklist report attempt', {
        userId: req.auth?.uid,
      });
      return { success: false, error: 'Only admins can generate reports.' };
    }

    try {
      logger.info(`Admin generating checklist report: ${req.auth.uid}`);

      const lastChecklistSnapshot = await db
        .collection(FIRESTORE_PATHS.UPLIFT.CHECKLIST(req.auth.uid))
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (!lastChecklistSnapshot.empty) {
        const lastDoc = lastChecklistSnapshot.docs[0];
        const lastData = lastDoc.data();

        if (lastData.items && lastData.items.length > 0) {
          const completedItems = lastData.items.filter(
            (item: { completed: boolean }) => item.completed
          ).length;

          const totalItems = lastData.items.length;
          const completionPercentage = (completedItems / totalItems) * 100;

          await lastDoc.ref.update({
            completionPercentage: completionPercentage,
          });

          logger.info(
            `Admin checklist completion percentage: ${completionPercentage.toFixed(2)}%`
          );

          // Mover ítems no completados al checklist de hoy
          const uncompletedItems = lastData.items
            .filter((item: { completed: boolean }) => !item.completed)
            .map((item: { completed: boolean; [key: string]: unknown }) => ({
              ...item,
              movedFromYesterday: true,
            }));

          if (uncompletedItems.length > 0) {
            const newDocData = {
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
            success: true,
            data: {
              message:
                'Checklist report generated successfully - all items completed',
            },
          };
        }

        return {
          success: false,
          error: 'No items found under the last checklist.',
        };
      }

      return { success: false, error: 'No previous snapshot found.' };
    } catch (error) {
      logger.error('Admin checklist report failed:', error);
      return { success: false, error: 'Error generating snapshot.' };
    }
  }
);
