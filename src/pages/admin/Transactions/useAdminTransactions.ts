import { IPortfolioTransaction } from '@shared/types/finances/portfolio';
import { useCallback, useEffect, useState } from 'react';
import { transactionsService } from 'src/services/admin/transactions.service';

// Types for the hook
export type TransactionQueryType = 'all' | 'portfolio';

export interface UseAdminTransactionsOptions {
  queryType?: TransactionQueryType;
  userId?: string;
  portfolioId?: string;
  enabled?: boolean;
}

export interface UseAdminTransactionsReturn {
  transactions: IPortfolioTransaction[];
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
  approveTransaction: (
    userId: string,
    portfolioId: string,
    transactionId: string
  ) => Promise<boolean>;

  // Query type management
  setQueryType: (type: TransactionQueryType) => void;
  setUserId: (userId: string | undefined) => void;
  setPortfolioId: (portfolioId: string | undefined) => void;
}

/**
 * Hook for managing admin transactions with different query types
 *
 * @param options - Configuration options for the hook
 * @returns Object containing transactions data and management functions
 */
export const useAdminTransactions = (
  options: UseAdminTransactionsOptions = {}
): UseAdminTransactionsReturn => {
  const {
    queryType: initialQueryType = 'all',
    userId: initialUserId,
    portfolioId: initialPortfolioId,
    enabled = true,
  } = options;

  // State
  const [transactions, setTransactions] = useState<IPortfolioTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryType, setQueryType] =
    useState<TransactionQueryType>(initialQueryType);
  const [userId, setUserId] = useState<string | undefined>(initialUserId);
  const [portfolioId, setPortfolioId] = useState<string | undefined>(
    initialPortfolioId
  );

  // Success callback
  const handleSuccess = useCallback(
    (newTransactions: IPortfolioTransaction[]) => {
      setTransactions(newTransactions);
      setLoading(false);
      setError(null);
    },
    []
  );

  // Error callback
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
    console.error('Admin transactions error:', errorMessage);
  }, []);

  // Refetch function
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    // The subscription will trigger automatically with new data
  }, []);

  // Effect to subscribe to transactions based on query type
  useEffect(() => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;

    try {
      switch (queryType) {
        case 'all':
          unsubscribe = transactionsService.subscribeToSystemAssetTransactions(
            handleSuccess,
            handleError
          );
          break;

        case 'portfolio':
          if (!userId || !portfolioId) {
            setError(
              'User ID and Portfolio ID are required for portfolio-specific query'
            );
            setLoading(false);
            return;
          }
          unsubscribe =
            transactionsService.subscribeToPortfolioSystemAssetTransactions(
              userId,
              portfolioId,
              handleSuccess,
              handleError
            );
          break;

        default:
          setError(`Unknown query type: ${queryType}`);
          setLoading(false);
          return;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to subscribe to transactions';
      handleError(errorMessage);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enabled, queryType, userId, portfolioId, handleSuccess, handleError]);

  // Reset transactions when query parameters change
  useEffect(() => {
    setTransactions([]);
  }, [queryType, userId, portfolioId]);

  // Approve transaction action
  const approveTransaction = useCallback(
    async (
      userId: string,
      portfolioId: string,
      transactionId: string
    ): Promise<boolean> => {
      try {
        setError(null);
        const result = await transactionsService.approveTransaction(
          userId,
          portfolioId,
          transactionId
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to approve transaction';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return {
    transactions,
    loading,
    error,

    // Actions
    refetch,
    approveTransaction,

    // Query management
    setQueryType,
    setUserId,
    setPortfolioId,
  };
};

export default useAdminTransactions;
