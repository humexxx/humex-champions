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
import { TimeFilter, TIME_FILTERS } from '@shared/enums/finance/timeFilters';

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

interface UsePortfolioOptions extends CommonFetchHookProps {
  // Dependencies that will trigger snapshot re-fetching
  snapshotDeps?: any[];
  // Current time filter for dynamic snapshot date range
  timeFilter?: TimeFilter;
}

// Helper function to get date range based on time filter
const getDateRangeFromTimeFilter = (
  timeFilter: TimeFilter
): { startDate: Dayjs; endDate: Dayjs } => {
  const now = dayjs();

  switch (timeFilter) {
    case TIME_FILTERS.FIVE_DAYS:
      return { startDate: now.subtract(5, 'days'), endDate: now };
    case TIME_FILTERS.ONE_MONTH:
      return { startDate: now.subtract(1, 'month'), endDate: now };
    case TIME_FILTERS.SIX_MONTHS:
      return { startDate: now.subtract(6, 'months'), endDate: now };
    case TIME_FILTERS.YTD:
      return { startDate: now.startOf('year'), endDate: now };
    case TIME_FILTERS.ONE_YEAR:
      return { startDate: now.subtract(1, 'year'), endDate: now };
    case TIME_FILTERS.FIVE_YEARS:
      return { startDate: now.subtract(5, 'years'), endDate: now };
    case TIME_FILTERS.MAX:
      return { startDate: now.subtract(10, 'years'), endDate: now }; // Reasonable "max" range
    default:
      return { startDate: now.subtract(1, 'year'), endDate: now };
  }
};

const usePortfolio = (
  {
    autoLoad,
    forceMock,
    snapshotDeps = [],
    timeFilter = TIME_FILTERS.ONE_YEAR,
  }: UsePortfolioOptions = {
    autoLoad: true,
    forceMock: false,
    snapshotDeps: [],
    timeFilter: TIME_FILTERS.ONE_YEAR,
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
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(
    null
  );

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

  // Effect to reload snapshots when timeFilter or snapshotDeps change
  useEffect(() => {
    if (!currentPortfolioId || !currentUser) return;

    // Only reload snapshots, not all data
    const { startDate, endDate } = getDateRangeFromTimeFilter(timeFilter);
    const unsubscribeSnapshots = service.subscribeToSnapshots(
      currentUser.uid,
      currentPortfolioId,
      startDate,
      endDate,
      (snapshotsData: IPortfolioSnapshot[]) => {
        setSnapshots(snapshotsData);
        setError(null);
      },
      (error: string) => {
        setError(error);
      }
    );

    return () => {
      unsubscribeSnapshots();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, service, timeFilter, currentPortfolioId, ...snapshotDeps]);

  // Función para cargar datos de un portfolio específico
  const loadPortfolioData = useCallback(
    (portfolioId: string) => {
      if (!currentUser) return;

      setLoading(true);
      setCurrentPortfolioId(portfolioId);

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

      // Subscribe to snapshots with dynamic date range based on timeFilter
      const { startDate, endDate } = getDateRangeFromTimeFilter(timeFilter);
      const unsubscribeSnapshots = service.subscribeToSnapshots(
        currentUser.uid,
        portfolioId,
        startDate,
        endDate,
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
    [currentUser, service, timeFilter]
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
