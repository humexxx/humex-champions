import { FIRESTORE_PATHS, PORTFOLIO_CONSTANTS } from '@shared/consts';
import {
  IAsset,
  IPortfolio,
  IPortfolioHolding,
  IPortfolioTransaction,
} from '@shared/models/finances';
import {
  convertMockDataToNewModel,
  getDefaultPortfolioData,
} from '@shared/utils';
import { getError } from '@shared/utils';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  addDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { firestore } from 'src/firebase';
import { normalizeObjectDates, toDayjs, toTimestamp } from 'src/utils';

const MOCK_PORTFOLIO_DATA = {
  name: 'MVP',
  totalValue: 120417.6,
  totalGain: 117084.1,
  totalGainPercentage: 3512.36,
  dailyGain: -212.58,
  dailyGainPercentage: -0.18,
  holdings: [
    {
      symbol: 'BTC',
      name: 'Bitcoin (BTC / USD)',
      price: 116383.2,
      quantity: 1,
      dailyChange: -295.08,
      dailyChangePercentage: -0.25,
      value: 116383.2,
    },
    {
      symbol: 'ADA',
      name: 'Cardano (ADA / USD)',
      price: 0.81,
      quantity: 5000,
      dailyChange: 82.5,
      dailyChangePercentage: 2.09,
      value: 4034.4,
    },
  ],
};

export const portfolioService = {
  getPortfolioCollection: (portfolioId: string) =>
    doc(firestore, FIRESTORE_PATHS.PORTFOLIOS.ROOT(portfolioId)),

  getHoldingsCollection: (portfolioId: string) =>
    collection(firestore, FIRESTORE_PATHS.PORTFOLIOS.HOLDINGS(portfolioId)),

  getTransactionsCollection: (portfolioId: string) =>
    collection(firestore, FIRESTORE_PATHS.PORTFOLIOS.TRANSACTIONS(portfolioId)),

  getSnapshotsCollection: (portfolioId: string) =>
    collection(firestore, FIRESTORE_PATHS.PORTFOLIOS.SNAPSHOTS(portfolioId)),

  getUserPortfoliosCollection: (userId: string) =>
    collection(firestore, FIRESTORE_PATHS.USER_PORTFOLIOS.ROOT(userId)),

  getAssetsCollection: () =>
    collection(firestore, FIRESTORE_PATHS.ASSETS.ROOT()),

  subscribeToPortfolio: (
    portfolioId: string,
    onSuccess: (portfolio: IPortfolio | null) => void,
    onError: (error: string) => void
  ) => {
    const docRef = portfolioService.getPortfolioCollection(portfolioId);

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
    portfolioId: string,
    onSuccess: (holdings: IPortfolioHolding[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = portfolioService.getHoldingsCollection(portfolioId);
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
    portfolioId: string,
    transactionLimit: number = 50,
    onSuccess: (transactions: IPortfolioTransaction[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef =
      portfolioService.getTransactionsCollection(portfolioId);
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

  subscribeToUserPortfolios: (
    userId: string,
    onSuccess: (
      portfolios: Array<{
        id: string;
        name: string;
        isDefault?: boolean;
        updatedAt: Date;
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

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<{
          id: string;
          name: string;
          isDefault?: boolean;
          updatedAt: Date;
        }>;

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  getPortfolio: async (portfolioId: string): Promise<IPortfolio | null> => {
    const docRef = portfolioService.getPortfolioCollection(portfolioId);
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
      FIRESTORE_PATHS.PORTFOLIOS.ROOT('')
    );
    const docRef = await addDoc(
      collectionRef,
      normalizeObjectDates(mergedData, toTimestamp)
    );

    const userPortfolioRef = doc(
      firestore,
      FIRESTORE_PATHS.USER_PORTFOLIOS.PORTFOLIO(userId, docRef.id)
    );
    await setDoc(userPortfolioRef, {
      id: docRef.id,
      name: portfolio.name,
      isDefault: portfolio.isDefault || false,
      updatedAt: new Date(),
    });

    return docRef.id;
  },

  addTransaction: async (
    transaction: Omit<IPortfolioTransaction, 'id' | 'createdAt'>
  ): Promise<string> => {
    const transactionData = {
      ...transaction,
      createdAt: new Date(),
    };

    const collectionRef = portfolioService.getTransactionsCollection(
      transaction.portfolioId
    );
    const docRef = await addDoc(
      collectionRef,
      normalizeObjectDates(transactionData, toTimestamp)
    );

    return docRef.id;
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
    _portfolioId: string,
    onSuccess: (portfolio: IPortfolio | null) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      const { portfolio } = convertMockDataToNewModel(MOCK_PORTFOLIO_DATA);
      onSuccess({ ...portfolio, id: _portfolioId } as IPortfolio);
    }, 1000);

    return () => {};
  },

  subscribeToHoldings: (
    _portfolioId: string,
    onSuccess: (holdings: IPortfolioHolding[]) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      const { holdings } = convertMockDataToNewModel(MOCK_PORTFOLIO_DATA);
      onSuccess(holdings);
    }, 1000);

    return () => {};
  },

  subscribeToTransactions: (
    _portfolioId: string,
    _transactionLimit: number = 50,
    onSuccess: (transactions: IPortfolioTransaction[]) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      onSuccess([]);
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
        updatedAt: Date;
      }>
    ) => void,
    _onError: (error: string) => void
  ) => {
    setTimeout(() => {
      onSuccess([
        {
          id: 'portfolio_1',
          name: 'MVP',
          isDefault: true,
          updatedAt: new Date(),
        },
      ]);
    }, 1000);

    return () => {};
  },

  getPortfolio: async (portfolioId: string): Promise<IPortfolio | null> => {
    const { portfolio } = convertMockDataToNewModel(MOCK_PORTFOLIO_DATA);
    return { ...portfolio, id: portfolioId } as IPortfolio;
  },

  createPortfolio: async (
    _userId: string,
    _portfolio: Omit<IPortfolio, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    return 'mock_portfolio_id';
  },

  addTransaction: async (
    _transaction: Omit<IPortfolioTransaction, 'id' | 'createdAt'>
  ): Promise<string> => {
    return 'mock_transaction_id';
  },

  getAsset: async (assetId: string): Promise<IAsset | null> => {
    const { assets } = convertMockDataToNewModel(MOCK_PORTFOLIO_DATA);
    return assets[assetId] || null;
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
