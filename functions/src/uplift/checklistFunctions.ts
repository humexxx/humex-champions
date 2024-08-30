import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IChecklist, IChecklistItem } from './types';

const db = admin.firestore();

export const checklistReport = functions.pubsub
  .schedule('every 1 hours') // Se ejecuta cada hora
  .onRun(async () => {
    try {
      const usersSnapshot = await db.collection('users').get();

      usersSnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const userTimezone = userData.timezone;
        const now = new Date();
        const userMidnight = new Date(
          now.toLocaleString('en-US', { timeZone: userTimezone })
        );

        if (userMidnight.getHours() === 0) {
          // Verifica si es medianoche en la zona horaria del usuario
          const yesterday = new Date(userMidnight);
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          const today = new Date(userMidnight);
          today.setHours(0, 0, 0, 0);

          // Obtener y actualizar checklists
          const checklistsSnapshot = await db
            .collectionGroup('checklist')
            .where('userId', '==', userDoc.id)
            .where('date', '>=', admin.firestore.Timestamp.fromDate(yesterday))
            .where('date', '<', admin.firestore.Timestamp.fromDate(today))
            .get();

          const updates = checklistsSnapshot.docs.map(async (doc) => {
            const data = doc.data() as IChecklist;

            if (data.items && data.items.length > 0) {
              const completedItems = data.items.filter(
                (item: IChecklistItem) => item.completed
              ).length;
              const totalItems = data.items.length;
              const completionPercentage = (completedItems / totalItems) * 100;

              await doc.ref.update({
                completionPercentage: completionPercentage,
              });

              // Mover ítems no completados al checklist de hoy
              const uncompletedItems = data.items
                .filter((item: IChecklistItem) => !item.completed)
                .map((item) => ({ ...item, movedFromYesterday: true }));

              if (uncompletedItems.length > 0) {
                // Obtener la referencia al checklist de hoy, si existe
                const todayChecklistQuery = await db
                  .collection(doc.ref.parent.path)
                  .where(
                    'date',
                    '==',
                    admin.firestore.Timestamp.fromDate(today)
                  )
                  .limit(1)
                  .get();

                if (!todayChecklistQuery.empty) {
                  // Si existe un checklist de hoy, actualízalo
                  const todayDocRef = todayChecklistQuery.docs[0].ref;
                  const todayData =
                    todayChecklistQuery.docs[0].data() as IChecklist;
                  const updatedItems = [
                    ...todayData.items,
                    ...uncompletedItems,
                  ];

                  await todayDocRef.update({
                    items: updatedItems,
                  });
                } else {
                  // Si no existe, crea un nuevo checklist con ID aleatorio
                  const newChecklist: IChecklist = {
                    date: admin.firestore.Timestamp.fromDate(today),
                    items: uncompletedItems,
                  };
                  await db.collection(doc.ref.parent.path).add(newChecklist);
                }
              }
            } else {
              await doc.ref.update({
                completionPercentage: 0,
              });
            }
          });

          await Promise.all(updates);
        }
      });

      console.log('Checklist updates executed successfully.');
    } catch (error) {
      console.error('Error executing checklist updates:', error);
    }
  });
