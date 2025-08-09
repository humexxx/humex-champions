import { useEffect, useState, useCallback, useMemo } from 'react';

import {
  IPortfolio,
  IPortfolioHolding,
  IPortfolioTransaction,
  IAsset,
} from '@shared/models/finances';
import { CommonFetchHookProps } from 'src/_models';
import { useAuth } from 'src/context/hooks';
import { createPortfolioService } from 'src/services/finances/portfolioService';

interface UsePortfolio {
  portfolio: IPortfolio | null;
  holdings: IPortfolioHolding[];
  transactions: IPortfolioTransaction[];
  userPortfolios: Array<{
    id: string;
    name: string;
    isDefault?: boolean;
    updatedAt: Date;
  }>;
  loading: boolean;
  error: string | null;
  createPortfolio: (
    portfolio: Omit<IPortfolio, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  addTransaction: (
    transaction: Omit<IPortfolioTransaction, 'id' | 'createdAt'>
  ) => Promise<string>;
  getAsset: (assetId: string) => Promise<IAsset | null>;
  setAsset: (asset: IAsset) => Promise<void>;
  validateTransaction: (
    transaction: Partial<IPortfolioTransaction>
  ) => string[];
}

const usePortfolio = (
  portfolioId: string,
  { autoLoad, forceMock }: CommonFetchHookProps = {
    autoLoad: true,
    forceMock: false,
  }
): UsePortfolio => {
  const { currentUser } = useAuth();
  const [portfolio, setPortfolio] = useState<IPortfolio | null>(null);
  const [holdings, setHoldings] = useState<IPortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<IPortfolioTransaction[]>([]);
  const [userPortfolios, setUserPortfolios] = useState<
    Array<{
      id: string;
      name: string;
      isDefault?: boolean;
      updatedAt: Date;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear el servicio basado en la configuración
  const service = useMemo(() => createPortfolioService(forceMock), [forceMock]);

  useEffect(() => {
    if (!autoLoad || !currentUser || !portfolioId) return;

    setLoading(true);

    // Subscribe to portfolio
    const unsubscribePortfolio = service.subscribeToPortfolio(
      portfolioId,
      (portfolioData: IPortfolio | null) => {
        setPortfolio(portfolioData);
        setError(null);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );

    // Subscribe to holdings
    const unsubscribeHoldings = service.subscribeToHoldings(
      portfolioId,
      (holdingsData: IPortfolioHolding[]) => {
        setHoldings(holdingsData);
        setError(null);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );

    // Subscribe to transactions
    const unsubscribeTransactions = service.subscribeToTransactions(
      portfolioId,
      50, // limit
      (transactionsData: IPortfolioTransaction[]) => {
        setTransactions(transactionsData);
        setError(null);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );

    // Subscribe to user portfolios
    const unsubscribeUserPortfolios = service.subscribeToUserPortfolios(
      currentUser.uid,
      (
        portfoliosData: Array<{
          id: string;
          name: string;
          isDefault?: boolean;
          updatedAt: Date;
        }>
      ) => {
        setUserPortfolios(portfoliosData);
        setLoading(false);
        setError(null);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribePortfolio();
      unsubscribeHoldings();
      unsubscribeTransactions();
      unsubscribeUserPortfolios();
    };
  }, [autoLoad, currentUser, portfolioId, service]);

  const createPortfolio = useCallback(
    async (
      portfolioData: Omit<IPortfolio, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      if (!currentUser) throw new Error('User not authenticated');
      return await service.createPortfolio(currentUser.uid, portfolioData);
    },
    [currentUser, service]
  );

  const addTransaction = useCallback(
    async (
      transactionData: Omit<IPortfolioTransaction, 'id' | 'createdAt'>
    ) => {
      if (!currentUser) throw new Error('User not authenticated');
      return await service.addTransaction(transactionData);
    },
    [currentUser, service]
  );

  const getAsset = useCallback(
    async (assetId: string) => {
      return await service.getAsset(assetId);
    },
    [service]
  );

  const setAsset = useCallback(
    async (asset: IAsset) => {
      return await service.setAsset(asset);
    },
    [service]
  );

  const validateTransaction = useCallback(
    (transaction: Partial<IPortfolioTransaction>) => {
      return service.validateTransaction(transaction);
    },
    [service]
  );

  return {
    portfolio,
    holdings,
    transactions,
    userPortfolios,
    loading,
    error,
    createPortfolio,
    addTransaction,
    getAsset,
    setAsset,
    validateTransaction,
  };
};

export default usePortfolio;
