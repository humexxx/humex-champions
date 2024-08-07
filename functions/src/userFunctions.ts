import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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
      });

    return null;
  });
