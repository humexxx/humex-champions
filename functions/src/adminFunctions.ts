import { ICallableRequest, ICallableResponse } from '@shared/models';
import * as admin from 'firebase-admin';
import { https, logger } from 'firebase-functions';

export const addAdminClaim = https.onCall<ICallableRequest<{ uid: string }>>(
  async (req): Promise<ICallableResponse<{ message: string }>> => {
    if (!req.auth?.uid || !req.auth.token.admin) {
      logger.warn('Unauthorized admin claim attempt', {
        userId: req.auth?.uid,
      });
      return { success: false, error: 'Only admins can add other admins.' };
    }

    const uid = req.data.uid;

    if (!uid) {
      return { success: false, error: 'User ID is required.' };
    }

    try {
      logger.info(`Adding admin claim: ${uid} by ${req.auth.uid}`);
      await admin.auth().setCustomUserClaims(uid, { admin: true });

      return {
        success: true,
        data: {
          message: `Successfully added admin claim to user ${uid}`,
        },
      };
    } catch (error) {
      logger.error('Admin claim addition failed:', error, {
        targetUserId: uid,
      });
      return { success: false, error: 'Something went wrong' };
    }
  }
);

export const addAdminClaimHardcore = https.onRequest(async (req, res) => {
  logger.warn('Hardcore admin endpoint accessed - blocked', { ip: req.ip });
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
    logger.error('Hardcore admin claim failed:', error);
    res.status(500).send({ error: 'Something went wrong' });
  }
});
