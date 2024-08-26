import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IChecklist, IChecklistItem } from './types';

const db = admin.firestore();

export const checklistReport = functions.pubsub
  .schedule('0 0 * * *') // Se ejecuta todos los días a medianoche
  .onRun(async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0); // Inicio del día anterior

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Inicio del día actual

      // Obtener todos los checklists del día anterior
      const checklistsSnapshot = await db
        .collectionGroup('checklist')
        .where('date', '>=', yesterday)
        .where('date', '<', today)
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
              .where('date', '==', admin.firestore.Timestamp.fromDate(today))
              .limit(1)
              .get();

            if (!todayChecklistQuery.empty) {
              // Si existe un checklist de hoy, actualízalo
              const todayDocRef = todayChecklistQuery.docs[0].ref;
              const todayData =
                todayChecklistQuery.docs[0].data() as IChecklist;
              const updatedItems = [...todayData.items, ...uncompletedItems];

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
      console.log(
        'Checklist completion percentages and item migrations updated successfully.'
      );
    } catch (error) {
      console.error(
        'Error updating checklist completion percentages and item migrations:',
        error
      );
    }
  });
