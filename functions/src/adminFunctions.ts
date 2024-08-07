import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const addAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    return { error: 'Only admins can add other admins.' };
  }

  const uid = data.uid;

  if (!uid) {
    return { error: 'User ID is required.' };
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { message: `Successfully added admin claim to user ${uid}` };
  } catch (error) {
    console.log(error);
    return { error: 'Something went wrong' };
  }
});

export const addAdminClaimHardcore = functions.https.onRequest(
  async (req, res) => {
    res.status(403).send({ error: 'You shall not pass.' });
    return;

    const uid = req.body.uid;

    if (!uid) {
      res.status(400).send({ error: 'User ID is required.' });
      return;
    }

    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      res
        .status(200)
        .send({ message: `Successfully added admin claim to user ${uid}` });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
);
