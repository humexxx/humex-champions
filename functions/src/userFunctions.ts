import * as admin from 'firebase-admin';
import { user } from 'firebase-functions/v1/auth';

export const createUserDocument = user().onCreate(async (user) => {
  const { uid, email } = user;

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
});
