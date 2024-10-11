import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const createUserDocument = functions.auth
  .user()
  .onCreate(async (user) => {
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
