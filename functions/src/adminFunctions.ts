import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const addAdminClaim = functions.https.onCall(async (data, context) => {
  //   if (!context.auth || !context.auth.token.admin) {
  //     return { error: 'Only admins can add other admins.' };
  //   }

  const uid = data.uid;

  if (!uid) {
    return { error: 'User ID is required.' };
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { message: `Successfully added admin claim to user ${uid}` };
  } catch (error) {
    return { error: (error as any).message };
  }
});
