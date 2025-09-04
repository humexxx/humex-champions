import { AppError } from '../../core/errors';
import { adminAuth } from '../../core/firebase';
import { log } from '../../core/logger';

export async function addAdminClaim(
  targetUid: string,
  adminUid: string
): Promise<{ message: string }> {
  try {
    log.info('Adding admin claim', { targetUid, adminUid });

    await adminAuth().setCustomUserClaims(targetUid, { admin: true });

    log.info('Admin claim added successfully', { targetUid, adminUid });

    return {
      message: `Successfully added admin claim to user ${targetUid}`,
    };
  } catch (error) {
    log.error('Failed to add admin claim', { targetUid, adminUid, error });
    throw new AppError('admin-claim-failed', 'Failed to add admin claim', 500);
  }
}
