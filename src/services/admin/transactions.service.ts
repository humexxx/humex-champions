import { FIRESTORE_PATHS } from '@shared/consts';
import { IPortfolioTransaction } from '@shared/types/finances/portfolio';
import { getError } from '@shared/utils';
import {
  collection,
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from 'src/firebase';
import { normalizeObjectDates, toDayjs } from 'src/utils';

/**
 * Service for managing admin operations on portfolio transactions,
 * specifically focused on system asset transactions that require approval.
 *
 * Note: Collection group queries require proper Firestore indexes:
 * - Collection ID: transactions
 * - Fields: isSystemAsset (Ascending), executedAt (Descending)
 * - Query scope: Collection group
 */

export const transactionsService = {
  /**
   * Subscribe to system asset transactions across all users and portfolios
   * This requires a collection group query with proper indexing in Firestore
   * @param onSuccess - Callback function called with the system asset transactions
   * @param onError - Callback function called when an error occurs
   * @returns Unsubscribe function
   */
  subscribeToSystemAssetTransactions: (
    onSuccess: (transactions: IPortfolioTransaction[]) => void,
    onError: (error: string) => void
  ) => {
    // Note: This requires a collection group index for 'transactions' collection
    // with fields: isSystemAsset, executedAt (descending)

    const transactionsQuery = query(
      collectionGroup(firestore, 'transactions'), // Collection group query
      where('isSystemAsset', '==', true),
      orderBy('executedAt', 'desc')
    );

    return onSnapshot(
      transactionsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          onSuccess([]);
          return;
        }

        const transactions = snapshot.docs.map((doc) =>
          normalizeObjectDates<IPortfolioTransaction>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        onSuccess(transactions);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  /**
   * Subscribe to system asset transactions for a specific portfolio
   * @param userId - The user ID
   * @param portfolioId - The portfolio ID
   * @param onSuccess - Callback function called with the system asset transactions
   * @param onError - Callback function called when an error occurs
   * @returns Unsubscribe function
   */
  subscribeToPortfolioSystemAssetTransactions: (
    userId: string,
    portfolioId: string,
    onSuccess: (transactions: IPortfolioTransaction[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, portfolioId)
    );

    const transactionsQuery = query(
      collectionRef,
      where('isSystemAsset', '==', true),
      orderBy('executedAt', 'desc')
    );

    return onSnapshot(
      transactionsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          onSuccess([]);
          return;
        }

        const transactions = snapshot.docs.map((doc) =>
          normalizeObjectDates<IPortfolioTransaction>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        onSuccess(transactions);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },
};
