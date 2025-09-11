import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TIME_FILTERS, TimeFilter } from '@shared/enums/finance/timeFilters';
import {
  IAsset,
  IPortfolio,
  IPortfolioHolding,
  IPortfolioSnapshot,
  IPortfolioTransaction,
  TransactionFormData,
} from '@shared/types/finances';
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
    transactionData: TransactionFormData,
    asset: IAsset
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
    timeFilter = TIME_FILTERS.ONE_YEAR,
  }: UsePortfolioOptions = {
    autoLoad: true,
    forceMock: false,
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

  // Efecto principal: obtener portfolios y seleccionar el default automáticamente
  useEffect(() => {
    if (!autoLoad || !currentUser) return;

    setLoading(true);

    // Suscripción a portfolios del usuario para obtener la lista
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

        // Seleccionar automáticamente el portfolio default
        if (portfoliosData.length > 0 && !currentPortfolioId) {
          const defaultPortfolio = portfoliosData.find((p: any) => p.isDefault);
          const selectedPortfolio = defaultPortfolio || portfoliosData[0];

          setCurrentPortfolioId(selectedPortfolio.id);
          loadPortfolioData(selectedPortfolio.id);
        }

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

  // Effect para recargar snapshots cuando cambia el timeFilter
  useEffect(() => {
    if (!currentPortfolioId || !currentUser) return;

    const { startDate, endDate } = getDateRangeFromTimeFilter(timeFilter);

    // Suscripción a snapshots con el rango de fechas del timeFilter
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
  }, [currentUser, service, timeFilter, currentPortfolioId]);

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

      // Subscribe to holdings (datos que cambian frecuentemente)
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

      // GET de transacciones (sin suscripción continua)
      const loadTransactions = async () => {
        try {
          // Usando el método de suscripción existente pero solo para carga inicial
          const unsubscribeTransactions = service.subscribeToTransactions(
            currentUser.uid,
            portfolioId,
            50, // limit
            (transactionsData: IPortfolioTransaction[]) => {
              setTransactions(transactionsData);
              setLoading(false);
              setError(null);
              // Desuscribirse inmediatamente después de la primera carga
              unsubscribeTransactions();
            },
            (error: string) => {
              setError(error);
              setLoading(false);
            }
          );
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Error loading transactions'
          );
          setLoading(false);
        }
      };

      loadTransactions();

      return () => {
        unsubscribePortfolio();
        unsubscribeHoldings();
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
    async (transactionData: TransactionFormData, asset: IAsset) => {
      if (!currentUser) throw new Error('User not authenticated');

      return await service.addTransaction(transactionData, asset);
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
