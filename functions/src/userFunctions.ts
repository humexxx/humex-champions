import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { user } from 'firebase-functions/v1/auth';

export const createUserDocument = user().onCreate(async (user) => {
  const { uid, email } = user;

  logger.info(`Creating user document: ${uid}`);

  try {
    await admin
      .firestore()
      .collection('users')
      .doc(uid)
      .set({
        email: email || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        timezone: 'UTC',
      });

    return null;
  } catch (error) {
    logger.error('User document creation failed:', error, { userId: uid });
    throw error;
  }
});
