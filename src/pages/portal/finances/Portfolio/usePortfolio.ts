import { useEffect, useState, useCallback, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  IPortfolio,
  IPortfolioHolding,
  IPortfolioTransaction,
  IPortfolioSnapshot,
  IAsset,
} from '@shared/models/finances';
import { CommonFetchHookProps } from 'src/_models';
import { useAuth } from 'src/context/hooks';
import { createPortfolioService } from 'src/services/finances';

interface UsePortfolio {
  // Datos de un portfolio específico (null si no hay ninguno seleccionado)
  portfolio: IPortfolio | null;
  holdings: IPortfolioHolding[];
  transactions: IPortfolioTransaction[];
  snapshots: IPortfolioSnapshot[];

  // Lista completa de portfolios del usuario
  userPortfolios: Array<{
    id: string;
    name: string;
    isDefault?: boolean;
    updatedAt: Dayjs;
  }>;

  loading: boolean;
  error: string | null;

  // Métodos
  createPortfolio: (
    portfolio: Omit<IPortfolio, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  addTransaction: (
    portfolioId: string,
    transaction: Omit<IPortfolioTransaction, 'id' | 'createdAt' | 'portfolioId'>
  ) => Promise<string>;
  getAsset: (assetId: string) => Promise<IAsset | null>;
  setAsset: (asset: IAsset) => Promise<void>;
  validateTransaction: (
    transaction: Partial<IPortfolioTransaction>
  ) => string[];

  // Método para cargar datos de un portfolio específico
  loadPortfolioData: (portfolioId: string) => void;
}

const usePortfolio = (
  { autoLoad, forceMock }: CommonFetchHookProps = {
    autoLoad: true,
    forceMock: false,
  }
): UsePortfolio => {
  const { currentUser } = useAuth();
  const [portfolio, setPortfolio] = useState<IPortfolio | null>(null);
  const [holdings, setHoldings] = useState<IPortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<IPortfolioTransaction[]>([]);
  const [snapshots, setSnapshots] = useState<IPortfolioSnapshot[]>([]);
  const [userPortfolios, setUserPortfolios] = useState<
    Array<{
      id: string;
      name: string;
      isDefault?: boolean;
      updatedAt: Dayjs;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear el servicio basado en la configuración
  const service = useMemo(() => createPortfolioService(forceMock), [forceMock]);

  // Efecto principal que solo obtiene la lista de portfolios del usuario
  useEffect(() => {
    if (!autoLoad || !currentUser) return;

    setLoading(true);

    // Subscribe to user portfolios para obtener la lista
    const unsubscribeUserPortfolios = service.subscribeToUserPortfolios(
      currentUser.uid,
      (
        portfoliosData: Array<{
          id: string;
          name: string;
          isDefault?: boolean;
          updatedAt: Dayjs;
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
      unsubscribeUserPortfolios();
    };
  }, [autoLoad, currentUser, service]);

  // Función para cargar datos de un portfolio específico
  const loadPortfolioData = useCallback(
    (portfolioId: string) => {
      if (!currentUser) return;

      setLoading(true);

      // Subscribe to portfolio
      const unsubscribePortfolio = service.subscribeToPortfolio(
        currentUser.uid,
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
        currentUser.uid,
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
        currentUser.uid,
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

      // Subscribe to snapshots (last year for default)
      const now = dayjs();
      const lastYear = now.subtract(1, 'year');
      const unsubscribeSnapshots = service.subscribeToSnapshots(
        currentUser.uid,
        portfolioId,
        lastYear,
        now,
        (snapshotsData: IPortfolioSnapshot[]) => {
          setSnapshots(snapshotsData);
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
        unsubscribeSnapshots();
      };
    },
    [currentUser, service]
  );

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
      portfolioId: string,
      transactionData: Omit<
        IPortfolioTransaction,
        'id' | 'createdAt' | 'portfolioId'
      >
    ) => {
      if (!currentUser) throw new Error('User not authenticated');

      // Crear la transacción completa con el portfolioId
      const completeTransaction: Omit<
        IPortfolioTransaction,
        'id' | 'createdAt'
      > = {
        ...transactionData,
        portfolioId: portfolioId,
      };

      return await service.addTransaction(currentUser.uid, completeTransaction);
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
    snapshots,
    userPortfolios,
    loading,
    error,
    createPortfolio,
    addTransaction,
    getAsset,
    setAsset,
    validateTransaction,
    loadPortfolioData,
  };
};

export default usePortfolio;
