import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

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

      return { message: 'Portfolio snapshot generated successfully.' };
    } catch (error) {
      console.error(error);
      return { error: 'Error generating snapshot.' };
    }
  });

export const adminPortfolioSnapshotGeneration = functions.https.onCall(
  async (_, context) => {
    if (!context.auth || !context.auth.token.admin) {
      return { error: 'Only admins can generate snapshots.' };
    }

    try {
      const lastPortfolioSnapshot = await db
        .collection(`finances/${context.auth.uid}/portfolio`)
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (!lastPortfolioSnapshot.empty) {
        const lastDoc = lastPortfolioSnapshot.docs[0];
        const lastData = lastDoc.data();

        const newInstruments = lastData.instruments.map((instrument: any) => ({
          ...instrument,
          value: instrument.value * (1 + DEFAULT_PERCENTAGE_INCREMENT),
        }));

        const newTotalValue = newInstruments.reduce(
          (acc: number, instrument: any) => acc + instrument.value,
          0
        );

        const newDocData = {
          date: admin.firestore.Timestamp.fromDate(new Date()),
          instruments: newInstruments,
          totalValue: newTotalValue,
          reviewed: false,
        };

        await db
          .collection(`finances/${context.auth.uid}/portfolio`)
          .add(newDocData);

        return {
          message: 'Portfolio snapshot generated successfully.',
          data: newDocData,
        };
      }
      return { message: 'No previous snapshot found.' };
    } catch (error) {
      console.error(error);
      return { error: 'Error generating snapshot.' };
    }
  }
);
