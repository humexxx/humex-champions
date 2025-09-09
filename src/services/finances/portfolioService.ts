import { CALLABLE_FUNCTIONS, FIRESTORE_PATHS } from '@shared/consts';
import { TRANSACTION_TYPES } from '@shared/schemas';
import { ICallableResponse } from '@shared/types';
import {
  AddTransactionInput,
  IAsset,
  IPortfolio,
  IPortfolioHolding,
  IPortfolioSnapshot,
  IPortfolioTransaction,
  TransactionFormData,
} from '@shared/types/finances';
import { getDefaultPortfolioData, getError } from '@shared/utils';
import dayjs, { Dayjs } from 'dayjs';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firestore, functions } from 'src/firebase';
import { normalizeObjectDates, toDate, toDayjs } from 'src/utils';

// ============= MOCK DATA =============

const MOCK_PORTFOLIO: IPortfolio = {
  id: 'portfolio_1',
  userId: 'user_1',
  name: 'MVP Portfolio',
  isDraft: false,
  createdAt: dayjs('2024-01-01'),
  updatedAt: dayjs(),
  currentValue: 120417.6,
  totalGain: 117084.1,
  totalGainPercentage: 3512.36,
  dailyGain: -212.58,
  dailyGainPercentage: -0.18,
  totalInvested: 3333.5,
  currency: 'USD',
  isDefault: true,
};

const MOCK_ASSETS: Record<string, IAsset> = {
  BTC: {
    id: 'BTC',
    symbol: 'BTC',
    name: 'Bitcoin',
    market: 'crypto',
    exchange: 'Binance',
    currency: 'USD',
    isActive: true,
    isSystemAsset: false,
    priceData: {
      symbol: 'BTC',
      price: 116383.2,
      open: 116678.28,
      high: 117000,
      low: 115000,
      close: 116383.2,
      volume: 15000000000,
      change: -295.08,
      changePercent: -0.25,
      updatedAt: dayjs(),
    },
    previousDayClose: 116678.28,
  },
  ADA: {
    id: 'ADA',
    symbol: 'ADA',
    name: 'Cardano',
    market: 'crypto',
    exchange: 'Binance',
    currency: 'USD',
    isActive: true,
    isSystemAsset: false,
    priceData: {
      symbol: 'ADA',
      price: 0.81,
      open: 0.79,
      high: 0.82,
      low: 0.78,
      close: 0.81,
      volume: 400000000,
      change: 0.02,
      changePercent: 2.09,
      updatedAt: dayjs(),
    },
    previousDayClose: 0.79,
  },
};

const MOCK_HOLDINGS: IPortfolioHolding[] = [
  {
    id: 'holding_1',
    portfolioId: 'portfolio_1',
    assetId: 'BTC',
    quantity: 1,
    totalInvested: 3000,
    currentPrice: 116383.2,
    currentValue: 116383.2,
    createdAt: dayjs('2024-01-01'),
    updatedAt: dayjs(),
    isSystemAsset: false,

    localCalculations: {
      averageBuyPrice: 3000,
      portfolioPercentage: 96.65,
      unrealizedGain: 113383.2,
      unrealizedGainPercentage: 3779.44,
    },
  },
  {
    id: 'holding_2',
    portfolioId: 'portfolio_1',
    assetId: 'ADA',
    quantity: 5000,
    totalInvested: 333.5,
    currentPrice: 0.81,
    currentValue: 4034.4,
    createdAt: dayjs('2024-02-01'),
    updatedAt: dayjs(),
    isSystemAsset: false,

    localCalculations: {
      averageBuyPrice: 0.067,
      portfolioPercentage: 3.35,
      unrealizedGain: 3700.9,
      unrealizedGainPercentage: 1109.55,
    },
  },
];

const MOCK_TRANSACTIONS: IPortfolioTransaction[] = [
  {
    id: 'transaction_1',
    portfolioId: 'portfolio_1',
    assetId: 'BTC',
    type: 'buy',
    quantity: 1,
    purchasePrice: 3000,
    totalAmount: 3000,
    fees: 15,
    executedAt: dayjs('2024-01-01'),
    notes: 'Initial BTC purchase',
  },
  {
    id: 'transaction_2',
    portfolioId: 'portfolio_1',
    assetId: 'ADA',
    type: 'buy',
    quantity: 5000,
    purchasePrice: 0.067,
    totalAmount: 333.5,
    fees: 1.67,
    executedAt: dayjs('2024-02-01'),
    notes: 'ADA accumulation',
  },
];

// Helper function to generate historical snapshots
const generateMockSnapshots = (
  startDate: Dayjs,
  endDate: Dayjs
): IPortfolioSnapshot[] => {
  const snapshots: IPortfolioSnapshot[] = [];
  const currentDate = dayjs(startDate);
  const baseValue = 3333.5; // Initial investment
  const finalValue = 120417.6; // Current value
  const totalDays = endDate.diff(startDate, 'day');

  // Generate daily snapshots with realistic growth curve
  for (let i = 0; i <= totalDays; i += 1) {
    const progress = i / totalDays;
    // Use exponential growth curve with some randomness
    const growthFactor = Math.pow(progress, 0.7) + (Math.random() - 0.5) * 0.1;
    const value =
      baseValue +
      (finalValue - baseValue) * Math.max(0, Math.min(1, growthFactor));
    const iterationDate = currentDate.add(i, 'day');
    const snapshot: IPortfolioSnapshot = {
      id: `snapshot_${iterationDate.format('YYYY-MM-DD')}`,
      portfolioId: 'portfolio_1',
      createdAt: iterationDate,
      totalInvested: value,
      totalValue: value - baseValue,
      holdings: MOCK_HOLDINGS,
      updatedAt: iterationDate,
    };

    snapshots.push(snapshot);
  }

  return snapshots;
};

const MOCK_SNAPSHOTS: IPortfolioSnapshot[] = generateMockSnapshots(
  dayjs('2024-01-01'),
  dayjs()
);

const addTransactionCallable = httpsCallable<
  AddTransactionInput,
  ICallableResponse<{ transactionId: string }>
>(functions, CALLABLE_FUNCTIONS.finances.portfolio.addTransaction);

export const portfolioService = {
  getPortfolioCollection: (userId: string, portfolioId: string) =>
    doc(firestore, FIRESTORE_PATHS.FINANCES.PORTFOLIO(userId, portfolioId)),

  getHoldingsCollection: (userId: string, portfolioId: string) =>
    collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.HOLDINGS(userId, portfolioId)
    ),

  getTransactionsCollection: (userId: string, portfolioId: string) =>
    collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, portfolioId)
    ),

  getSnapshotsCollection: (userId: string, portfolioId: string) =>
    collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.SNAPSHOTS(userId, portfolioId)
    ),

  getUserPortfoliosCollection: (userId: string) =>
    collection(firestore, FIRESTORE_PATHS.FINANCES.PORTFOLIOS(userId)),

  getAssetsCollection: () =>
    collection(firestore, FIRESTORE_PATHS.ASSETS.ROOT()),

  subscribeToPortfolio: (
    userId: string,
    portfolioId: string,
    onSuccess: (portfolio: IPortfolio | null) => void,
    onError: (error: string) => void
  ) => {
    const docRef = portfolioService.getPortfolioCollection(userId, portfolioId);

    return onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          onSuccess(null);
          return;
        }

        const data = normalizeObjectDates<IPortfolio>(
          { id: snap.id, ...snap.data() },
          toDayjs
        );

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  subscribeToHoldings: (
    userId: string,
    portfolioId: string,
    onSuccess: (holdings: IPortfolioHolding[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = portfolioService.getHoldingsCollection(
      userId,
      portfolioId
    );
    const q = query(collectionRef, orderBy('currentValue', 'desc'));

    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          onSuccess([]);
          return;
        }

        const data = snap.docs.map((doc) =>
          normalizeObjectDates<IPortfolioHolding>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  subscribeToTransactions: (
    userId: string,
    portfolioId: string,
    transactionLimit: number = 50,
    onSuccess: (transactions: IPortfolioTransaction[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = portfolioService.getTransactionsCollection(
      userId,
      portfolioId
    );
    const q = query(
      collectionRef,
      orderBy('executedAt', 'desc'),
      limit(transactionLimit)
    );

    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          onSuccess([]);
          return;
        }

        const data = snap.docs.map((doc) =>
          normalizeObjectDates<IPortfolioTransaction>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  subscribeToSnapshots: (
    userId: string,
    portfolioId: string,
    startDate: Dayjs,
    endDate: Dayjs,
    onSuccess: (snapshots: IPortfolioSnapshot[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = portfolioService.getSnapshotsCollection(
      userId,
      portfolioId
    );
    const q = query(
      collectionRef,
      orderBy('date', 'asc')
      // Note: In real implementation, add where clauses for date range
      // where('date', '>=', startDate),
      // where('date', '<=', endDate)
    );

    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          onSuccess([]);
          return;
        }

        const data = snap.docs
          .map((doc) =>
            normalizeObjectDates<IPortfolioSnapshot>(
              { id: doc.id, ...doc.data() },
              toDayjs
            )
          )
          .filter((snapshot) => {
            const snapshotDate = snapshot.createdAt;
            return (
              (snapshotDate.isAfter(startDate) ||
                snapshotDate.isSame(startDate)) &&
              (snapshotDate.isBefore(endDate) || snapshotDate.isSame(endDate))
            );
          });

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },
  subscribeToUserPortfolios: (
    userId: string,
    onSuccess: (
      portfolios: Array<{
        id: string;
        name: string;
        isDefault?: boolean;
        updatedAt: Dayjs;
      }>
    ) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = portfolioService.getUserPortfoliosCollection(userId);
    const q = query(collectionRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          onSuccess([]);
          return;
        }

        const data = snap.docs.map((doc) =>
          normalizeObjectDates<{
            id: string;
            name: string;
            isDefault?: boolean;
            updatedAt: Dayjs;
          }>({ id: doc.id, ...doc.data() }, toDayjs)
        );

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  getPortfolio: async (
    userId: string,
    portfolioId: string
  ): Promise<IPortfolio | null> => {
    const docRef = portfolioService.getPortfolioCollection(userId, portfolioId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return null;
    }

    return normalizeObjectDates<IPortfolio>(
      { id: snap.id, ...snap.data() },
      toDayjs
    );
  },

  createPortfolio: async (
    userId: string,
    portfolio: Omit<IPortfolio, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const portfolioData = getDefaultPortfolioData(userId, portfolio.name);
    const mergedData = { ...portfolioData, ...portfolio };

    const collectionRef = collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.PORTFOLIOS(userId)
    );
    const docRef = await addDoc(
      collectionRef,
      normalizeObjectDates(mergedData, toDate)
    );

    return docRef.id;
  },

  addTransaction: async (
    transactionData: TransactionFormData,
    asset: IAsset
  ): Promise<string> => {
    try {
      const result = await addTransactionCallable({
        transactionData,
        asset,
      });

      const response = result.data;

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to add transaction');
      }

      return response.data.transactionId;
    } catch (error) {
      console.error('Error calling addTransaction:', error);
      throw error;
    }
  },

  getAsset: async (assetId: string): Promise<IAsset | null> => {
    const docRef = doc(firestore, FIRESTORE_PATHS.ASSETS.ASSET(assetId));
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return null;
    }

    return normalizeObjectDates<IAsset>(
      { id: snap.id, ...snap.data() },
      toDayjs
    );
  },

  setAsset: async (asset: IAsset): Promise<void> => {
    const docRef = doc(firestore, FIRESTORE_PATHS.ASSETS.ASSET(asset.id!));
    const { id, ...assetData } = normalizeObjectDates(asset, toDate) as any;

    await setDoc(docRef, assetData);
  },

  validateTransaction: (
    transaction: Partial<IPortfolioTransaction>
  ): string[] => {
    const errors: string[] = [];

    if (!transaction.portfolioId) {
      errors.push('Portfolio ID is required');
    }

    if (!transaction.assetId) {
      errors.push('Asset ID is required');
    }

    if (
      !transaction.type ||
      !Object.values(TRANSACTION_TYPES).includes(transaction.type as any)
    ) {
      errors.push('Valid transaction type is required');
    }

    if (!transaction.quantity || transaction.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!transaction.purchasePrice || transaction.purchasePrice <= 0) {
      errors.push('Price must be greater than 0');
    }

    return errors;
  },
};

export const mockPortfolioService = {
  subscribeToPortfolio: (
    _userId: string,
    portfolioId: string,
    onSuccess: (portfolio: IPortfolio | null) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      onSuccess({ ...MOCK_PORTFOLIO, id: portfolioId });
    }, 1000);

    return () => {};
  },

  subscribeToHoldings: (
    _userId: string,
    _portfolioId: string,
    onSuccess: (holdings: IPortfolioHolding[]) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      onSuccess(MOCK_HOLDINGS);
    }, 1000);

    return () => {};
  },

  subscribeToTransactions: (
    _userId: string,
    _portfolioId: string,
    _transactionLimit: number = 50,
    onSuccess: (transactions: IPortfolioTransaction[]) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      onSuccess(MOCK_TRANSACTIONS.slice(0, _transactionLimit));
    }, 1000);

    return () => {};
  },

  subscribeToSnapshots: (
    _userId: string,
    _portfolioId: string,
    startDate: Dayjs,
    endDate: Dayjs,
    onSuccess: (snapshots: IPortfolioSnapshot[]) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      const filteredSnapshots = MOCK_SNAPSHOTS.filter((snapshot) => {
        const snapshotDate = snapshot.createdAt;
        return (
          (snapshotDate.isAfter(startDate) || snapshotDate.isSame(startDate)) &&
          (snapshotDate.isBefore(endDate) || snapshotDate.isSame(endDate))
        );
      });
      onSuccess(filteredSnapshots);
    }, 1000);

    return () => {};
  },

  subscribeToUserPortfolios: (
    _userId: string,
    onSuccess: (
      portfolios: Array<{
        id: string;
        name: string;
        isDefault?: boolean;
        updatedAt: Dayjs;
      }>
    ) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      onSuccess([
        {
          id: MOCK_PORTFOLIO.id,
          name: MOCK_PORTFOLIO.name,
          isDefault: MOCK_PORTFOLIO.isDefault,
          updatedAt: MOCK_PORTFOLIO.updatedAt,
        },
      ]);
    }, 1000);

    return () => {};
  },

  getPortfolio: async (
    _userId: string,
    portfolioId: string
  ): Promise<IPortfolio | null> => {
    return { ...MOCK_PORTFOLIO, id: portfolioId };
  },

  createPortfolio: async (
    _userId: string,
    _portfolio: Omit<IPortfolio, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    return 'mock_portfolio_id';
  },

  addTransaction: async (
    transactionData: TransactionFormData,
    asset: IAsset
  ): Promise<string> => {
    // Mock implementation
    console.log(
      'Mock: Adding transaction',
      transactionData,
      'for asset',
      asset.symbol
    );
    return 'mock_transaction_id';
  },

  getAsset: async (assetId: string): Promise<IAsset | null> => {
    return MOCK_ASSETS[assetId] || null;
  },

  setAsset: async (_asset: IAsset): Promise<void> => {
    return Promise.resolve();
  },

  validateTransaction: portfolioService.validateTransaction,
};

export const createPortfolioService = (forceMock: boolean = false) => {
  return forceMock ? mockPortfolioService : portfolioService;
};

export default {
  portfolioService,
  mockPortfolioService,
  createPortfolioService,
};
