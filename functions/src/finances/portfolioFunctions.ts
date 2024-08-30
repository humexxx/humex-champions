import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const DEFAULT_PERCENTAGE_INCREMENT = 0.03;

export const portfolioQuarterlyUpdate = functions.pubsub
  // Se ejecuta cada hora el primer día de enero, abril, julio y octubre
  .schedule('0 * 1 1,4,7,10 *')
  .onRun(async () => {
    try {
      const usersSnapshot = await db.collection('users').get();

      await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          const userTimezone = userData.timezone;
          const now = new Date();
          const userTime = new Date(
            now.toLocaleString('en-US', { timeZone: userTimezone })
          );

          if (userTime.getHours() === 0) {
            const lastPortfolioSnapshot = await db
              .collection(`finances/${userDoc.id}/portfolio`)
              .orderBy('date', 'desc')
              .limit(1)
              .get();

            if (!lastPortfolioSnapshot.empty) {
              const lastDoc = lastPortfolioSnapshot.docs[0];
              const lastData = lastDoc.data();

              // Modifica los valores de los instrumentos
              const newInstruments = lastData.instruments.map(
                (instrument: any) => ({
                  ...instrument,
                  value: instrument.value * (1 + DEFAULT_PERCENTAGE_INCREMENT),
                })
              );

              // Calcula el nuevo valor total
              const newTotalValue = newInstruments.reduce(
                (acc: number, instrument: any) => acc + instrument.value,
                0
              );

              // Crea un nuevo documento con los cambios
              const newDocData = {
                date: admin.firestore.Timestamp.fromDate(new Date()),
                instruments: newInstruments,
                totalValue: newTotalValue,
                reviewed: false,
              };

              // Guarda el nuevo documento en la colección
              await db
                .collection(`finances/${userDoc.id}/portfolio`)
                .add(newDocData);
            }
          }
        })
      );

      console.log('Portfolio updates executed successfully.');
    } catch (error) {
      console.error('Error executing portfolio updates:', error);
    }
  });
