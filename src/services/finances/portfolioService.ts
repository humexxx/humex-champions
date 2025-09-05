import { FIRESTORE_PATHS, PORTFOLIO_CONSTANTS } from '@shared/consts';
import {
  IAsset,
  IPortfolio,
  IPortfolioHolding,
  IPortfolioSnapshot,
  IPortfolioTransaction,
} from '@shared/models/finances';
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
import { firestore } from 'src/firebase';
import { normalizeObjectDates, toDayjs, toTimestamp } from 'src/utils';

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
  lastPriceUpdate: dayjs(),
};

const MOCK_ASSETS: Record<string, IAsset> = {
  BTC: {
    id: 'BTC',
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'CRYPTO',
    type: 'CRYPTOCURRENCY',
    currentPrice: 116383.2,
    dayOpenPrice: 116678.28,
    previousDayClose: 116678.28,
    dailyChange: -295.08,
    dailyChangePercentage: -0.25,
    currency: 'USD',
    exchange: 'Binance',
    lastPriceUpdate: dayjs(),
    marketCap: 2300000000000,
    volume24h: 15000000000,
  },
  ADA: {
    id: 'ADA',
    symbol: 'ADA',
    name: 'Cardano',
    category: 'CRYPTO',
    type: 'CRYPTOCURRENCY',
    currentPrice: 0.81,
    dayOpenPrice: 0.79,
    previousDayClose: 0.79,
    dailyChange: 0.02,
    dailyChangePercentage: 2.09,
    currency: 'USD',
    exchange: 'Binance',
    lastPriceUpdate: dayjs(),
    marketCap: 28000000000,
    volume24h: 400000000,
  },
};

const MOCK_HOLDINGS: IPortfolioHolding[] = [
  {
    id: 'holding_1',
    portfolioId: 'portfolio_1',
    assetId: 'BTC',
    quantity: 1,
    averageBuyPrice: 3000,
    totalInvested: 3000,
    currentPrice: 116383.2,
    currentValue: 116383.2,
    unrealizedGain: 113383.2,
    unrealizedGainPercentage: 3779.44,
    firstPurchaseDate: dayjs('2024-01-01'),
    lastUpdateDate: dayjs(),
    portfolioPercentage: 96.65,
  },
  {
    id: 'holding_2',
    portfolioId: 'portfolio_1',
    assetId: 'ADA',
    quantity: 5000,
    averageBuyPrice: 0.067,
    totalInvested: 333.5,
    currentPrice: 0.81,
    currentValue: 4034.4,
    unrealizedGain: 3700.9,
    unrealizedGainPercentage: 1109.55,
    firstPurchaseDate: dayjs('2024-02-01'),
    lastUpdateDate: dayjs(),
    portfolioPercentage: 3.35,
  },
];

const MOCK_TRANSACTIONS: IPortfolioTransaction[] = [
  {
    id: 'transaction_1',
    portfolioId: 'portfolio_1',
    assetId: 'BTC',
    type: 'BUY',
    quantity: 1,
    price: 3000,
    totalAmount: 3000,
    fees: 15,
    executedAt: dayjs('2024-01-01'),
    createdAt: dayjs('2024-01-01'),
    notes: 'Initial BTC purchase',
    source: 'Binance',
  },
  {
    id: 'transaction_2',
    portfolioId: 'portfolio_1',
    assetId: 'ADA',
    type: 'BUY',
    quantity: 5000,
    price: 0.067,
    totalAmount: 333.5,
    fees: 1.67,
    executedAt: dayjs('2024-02-01'),
    createdAt: dayjs('2024-02-01'),
    notes: 'ADA accumulation',
    source: 'Binance',
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
    const previousValue =
      i === 0
        ? baseValue
        : snapshots[snapshots.length - 1]?.totalValue || baseValue;

    const iterationDate = currentDate.add(i, 'day');
    const snapshot: IPortfolioSnapshot = {
      id: `snapshot_${iterationDate.format('YYYY-MM-DD')}`,
      portfolioId: 'portfolio_1',
      date: iterationDate,
      totalValue: value,
      totalGain: value - baseValue,
      totalGainPercentage: ((value - baseValue) / baseValue) * 100,
      dailyChange: value - previousValue,
      dailyChangePercentage:
        previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0,
      holdings: MOCK_HOLDINGS.map((holding) => ({
        ...holding,
        currentValue: holding.currentValue * (value / finalValue),
        unrealizedGain: holding.unrealizedGain * (value / finalValue),
      })),
      createdAt: iterationDate,
    };

    snapshots.push(snapshot);
  }

  return snapshots;
};

const MOCK_SNAPSHOTS: IPortfolioSnapshot[] = generateMockSnapshots(
  dayjs('2024-01-01'),
  dayjs()
);

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
            const snapshotDate = snapshot.date;
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
      normalizeObjectDates(mergedData, toTimestamp)
    );

    return docRef.id;
  },

  // DEPRECATED: Function not implemented in Firebase Functions
  // TODO: Implement addPortfolioTransaction callable function in backend
  addTransaction: async (
    _transaction: Omit<IPortfolioTransaction, 'id' | 'createdAt'>
  ): Promise<string> => {
    // Placeholder implementation - function needs to be created in Firebase Functions
    throw new Error(
      'addPortfolioTransaction function not implemented in backend. Please implement in functions/src/modules/finances/'
    );

    /*
    // Use callable function for robust transaction processing (COMMENTED OUT - FUNCTION DOESN'T EXIST)
    const addPortfolioTransaction = httpsCallable(
      functions,
      CALLABLE_FUNCTION_NAMES.addPortfolioTransaction
    );

    try {
      const result = await addPortfolioTransaction({
        portfolioId: transaction.portfolioId,
        assetId: transaction.assetId,
        symbol: transaction.assetId.toUpperCase(), // Temporary: use assetId as symbol
        name: transaction.assetId, // Temporary: use assetId as name
        type: 'CRYPTOCURRENCY', // Default type for now
        category: 'CRYPTO', // Default category for now
        transactionType: transaction.type,
        quantity: transaction.quantity,
        price: transaction.price,
        fees: transaction.fees || 0,
        executedAt: transaction.executedAt.toDate().toISOString(),
        notes: transaction.notes || '',
      });

      const response = result.data as any;

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to add transaction');
      }

      return response.data.transactionId;
    } catch (error) {
      console.error('Error calling addPortfolioTransaction:', error);
      throw error;
    }
    */
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
    const docRef = doc(firestore, FIRESTORE_PATHS.ASSETS.ASSET(asset.id));
    const { id, ...assetData } = normalizeObjectDates(
      asset,
      toTimestamp
    ) as any;

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
      !Object.values(PORTFOLIO_CONSTANTS.TRANSACTION_TYPES).includes(
        transaction.type as any
      )
    ) {
      errors.push('Valid transaction type is required');
    }

    if (!transaction.quantity || transaction.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!transaction.price || transaction.price <= 0) {
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
        const snapshotDate = snapshot.date;
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
    _userId: string,
    _transaction: Omit<IPortfolioTransaction, 'id' | 'createdAt'>
  ): Promise<string> => {
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
