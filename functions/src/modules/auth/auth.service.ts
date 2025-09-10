import { FIRESTORE_PATHS } from '@shared/consts';
import { IUser } from '@shared/types/user';

import { AppError } from '../../core/errors';
import { db } from '../../core/firebase';
import { log } from '../../core/logger';

/**
 * Retrieves user data from Firestore using the standardized path
 * @param {string} uid - The user's unique identifier
 * @return {Promise<IUser>} The user data
 * @throws {AppError} if user is not found or other errors occur
 */
export async function getUserData(uid: string): Promise<IUser> {
  log.info('Retrieving user data', { uid });

  try {
    const userRef = db().doc(FIRESTORE_PATHS.USERS(uid));
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new AppError(
        'user-not-found',
        `User with ID ${uid} not found`,
        404
      );
    }

    const userData = userDoc.data() as IUser;

    log.info('User data retrieved successfully', { uid });
    return userData;
  } catch (error) {
    log.error('Failed to retrieve user data', { uid, error });

    // Re-throw AppErrors as-is, wrap unknown errors
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'user-retrieval-failed',
      'Failed to retrieve user data: ' + (error as Error).message,
      500
    );
  }
}

/**
 * Checks if a user exists in Firestore
 * @param {string} uid - The user's unique identifier
 * @return {Promise<boolean>} True if user exists, false otherwise
 */
export async function userExists(uid: string): Promise<boolean> {
  log.info('Checking if user exists', { uid });

  try {
    const userRef = db().doc(FIRESTORE_PATHS.USERS(uid));
    const userDoc = await userRef.get();

    const exists = userDoc.exists;
    log.info('User existence check completed', { uid, exists });

    return exists;
  } catch (error) {
    log.error('Failed to check user existence', { uid, error });
    throw new AppError(
      'user-existence-check-failed',
      'Failed to check if user exists: ' + (error as Error).message,
      500
    );
  }
}
