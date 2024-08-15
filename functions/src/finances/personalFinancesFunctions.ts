import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generateSingleSnapshot } from './utils';

const db = admin.firestore();

// Función para generar y actualizar un solo snapshot en la base de datos
async function generateAndSaveSingleSnapshot() {
  const plansSnapshot = await db.collectionGroup('financialPlans').get();

  const batch = db.batch();

  plansSnapshot.forEach((planDoc) => {
    const planData = planDoc.data();

    if (planData && planData.financialSnapshots) {
      const lastSnapshot =
        planData.financialSnapshots[planData.financialSnapshots.length - 1];
      const newSnapshot = generateSingleSnapshot(lastSnapshot);
      const planRef = planDoc.ref;

      batch.update(planRef, {
        financialSnapshots: FieldValue.arrayUnion({
          ...newSnapshot,
          reviewed: false,
        }),
      });
    }
  });

  await batch.commit();
}

export const scheduledSnapshotGeneration = functions.pubsub
  .schedule('0 0 1 * *') // Cada primer día del mes a las 00:00
  .onRun(async () => {
    await generateAndSaveSingleSnapshot();
  });

export const httpSnapshotGeneration = functions.https.onRequest(
  async (req, res) => {
    res.status(403).send({ error: 'You shall not pass.' });
    return;

    try {
      await generateAndSaveSingleSnapshot();
      res.status(200).send('Snapshot generated successfully.');
    } catch (error: any) {
      res.status(500).send(`Error generating snapshot: ${error.message}`);
    }
  }
);
