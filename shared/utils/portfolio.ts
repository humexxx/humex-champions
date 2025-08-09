import {
  IPortfolio,
  IPortfolioHolding,
  IPortfolioTransaction,
  IAsset,
} from '../models/finances';
import { PORTFOLIO_CONSTANTS } from '../consts';

export function calculateHoldingsFromTransactions(
  transactions: IPortfolioTransaction[],
  assets: Record<string, IAsset>
): IPortfolioHolding[] {
  const holdingsMap: Record<
    string,
    {
      quantity: number;
      totalInvested: number;
      firstPurchaseDate: Date;
      lastUpdateDate: Date;
    }
  > = {};

  const sortedTransactions = transactions.sort(
    (a, b) =>
      new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
  );

  for (const transaction of sortedTransactions) {
    const assetId = transaction.assetId;

    if (!holdingsMap[assetId]) {
      holdingsMap[assetId] = {
        quantity: 0,
        totalInvested: 0,
        firstPurchaseDate: new Date(transaction.executedAt),
        lastUpdateDate: new Date(transaction.executedAt),
      };
    }

    const holding = holdingsMap[assetId];

    switch (transaction.type) {
      case 'BUY':
      case 'TRANSFER_IN':
        holding.quantity += transaction.quantity;
        holding.totalInvested += transaction.totalAmount;
        break;

      case 'SELL':
      case 'TRANSFER_OUT':
        const avgCostPerUnit =
          holding.quantity > 0 ? holding.totalInvested / holding.quantity : 0;
        const soldValue = transaction.quantity * avgCostPerUnit;

        holding.quantity -= transaction.quantity;
        holding.totalInvested -= soldValue;
        break;

      case 'DIVIDEND':
        holding.totalInvested -= transaction.totalAmount;
        break;

      case 'SPLIT':
        const splitRatio = transaction.quantity;
        holding.quantity *= splitRatio;
        break;
    }

    holding.lastUpdateDate = new Date(transaction.executedAt);

    if (holding.quantity <= 0.0001) {
      delete holdingsMap[assetId];
    }
  }

  const holdings: IPortfolioHolding[] = [];
  const totalPortfolioValue = Object.entries(holdingsMap).reduce(
    (sum, [assetId, holding]) => {
      const asset = assets[assetId];
      if (asset) {
        return sum + holding.quantity * asset.currentPrice;
      }
      return sum;
    },
    0
  );

  for (const [assetId, holding] of Object.entries(holdingsMap)) {
    const asset = assets[assetId];
    if (!asset) continue;

    const currentPrice = asset.currentPrice;
    const currentValue = holding.quantity * currentPrice;
    const averageBuyPrice =
      holding.quantity > 0 ? holding.totalInvested / holding.quantity : 0;
    const unrealizedGain = currentValue - holding.totalInvested;
    const unrealizedGainPercentage =
      holding.totalInvested > 0
        ? (unrealizedGain / holding.totalInvested) * 100
        : 0;
    const portfolioPercentage =
      totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

    holdings.push({
      id: `${transactions[0]?.portfolioId}_${assetId}`,
      portfolioId: transactions[0]?.portfolioId || '',
      assetId,
      quantity: holding.quantity,
      averageBuyPrice,
      totalInvested: holding.totalInvested,
      currentPrice,
      currentValue,
      unrealizedGain,
      unrealizedGainPercentage,
      firstPurchaseDate: holding.firstPurchaseDate,
      lastUpdateDate: holding.lastUpdateDate,
      portfolioPercentage,
    });
  }

  return holdings.sort((a, b) => b.currentValue - a.currentValue);
}

export function calculatePortfolioTotals(holdings: IPortfolioHolding[]): {
  currentValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercentage: number;
} {
  let currentValue = 0;
  let totalInvested = 0;

  for (const holding of holdings) {
    currentValue += holding.currentValue;
    totalInvested += holding.totalInvested;
  }

  const totalGain = currentValue - totalInvested;
  const totalGainPercentage =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    currentValue,
    totalInvested,
    totalGain,
    totalGainPercentage,
  };
}

export function calculateDailyChange(
  holdings: IPortfolioHolding[],
  assets: Record<string, IAsset>
): {
  dailyGain: number;
  dailyGainPercentage: number;
} {
  let currentValue = 0;
  let previousValue = 0;

  for (const holding of holdings) {
    const asset = assets[holding.assetId];
    if (!asset) continue;

    currentValue += holding.currentValue;
    previousValue += holding.quantity * asset.previousDayClose;
  }

  const dailyGain = currentValue - previousValue;
  const dailyGainPercentage =
    previousValue > 0 ? (dailyGain / previousValue) * 100 : 0;

  return {
    dailyGain,
    dailyGainPercentage,
  };
}

export function convertMockDataToNewModel(mockData: any): {
  portfolio: Partial<IPortfolio>;
  holdings: IPortfolioHolding[];
  assets: Record<string, IAsset>;
} {
  const now = new Date();

  const portfolio: Partial<IPortfolio> = {
    id: 'portfolio_1',
    userId: 'user_1',
    name: mockData.name,
    isDraft: false,
    currentValue: mockData.totalValue,
    totalGain: mockData.totalGain,
    totalGainPercentage: mockData.totalGainPercentage,
    dailyGain: mockData.dailyGain,
    dailyGainPercentage: mockData.dailyGainPercentage,
    currency: 'USD',
    isDefault: true,
    totalInvested: mockData.totalValue - mockData.totalGain,
    createdAt: now,
    updatedAt: now,
  };

  const assets: Record<string, IAsset> = {};
  const holdings: IPortfolioHolding[] = [];

  if (mockData.holdings) {
    mockData.holdings.forEach((mockHolding: any) => {
      const assetId = mockHolding.symbol;

      assets[assetId] = {
        id: assetId,
        symbol: mockHolding.symbol,
        name: mockHolding.name.split(' (')[0],
        category:
          mockHolding.symbol === 'BTC' || mockHolding.symbol === 'ADA'
            ? 'CRYPTO'
            : 'STOCK',
        type:
          mockHolding.symbol === 'BTC' || mockHolding.symbol === 'ADA'
            ? 'CRYPTOCURRENCY'
            : 'EQUITY',
        currentPrice: mockHolding.price,
        dayOpenPrice: mockHolding.price - mockHolding.dailyChange,
        previousDayClose: mockHolding.price - mockHolding.dailyChange,
        dailyChange: mockHolding.dailyChange,
        dailyChangePercentage: mockHolding.dailyChangePercentage,
        currency: 'USD',
        lastPriceUpdate: now,
      };

      const totalInvested =
        mockHolding.value - mockHolding.dailyChange * mockHolding.quantity;
      holdings.push({
        id: `portfolio_1_${assetId}`,
        portfolioId: 'portfolio_1',
        assetId,
        quantity: mockHolding.quantity,
        averageBuyPrice: totalInvested / mockHolding.quantity,
        totalInvested,
        currentPrice: mockHolding.price,
        currentValue: mockHolding.value,
        unrealizedGain: mockHolding.value - totalInvested,
        unrealizedGainPercentage:
          totalInvested > 0
            ? ((mockHolding.value - totalInvested) / totalInvested) * 100
            : 0,
        firstPurchaseDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        lastUpdateDate: now,
        portfolioPercentage: (mockHolding.value / mockData.totalValue) * 100,
      });
    });
  }

  return { portfolio, holdings, assets };
}

export function validatePortfolio(portfolio: Partial<IPortfolio>): string[] {
  const errors: string[] = [];

  if (!portfolio.name || portfolio.name.trim().length === 0) {
    errors.push('Portfolio name is required');
  }

  if (!portfolio.userId) {
    errors.push('User ID is required');
  }

  if (!portfolio.currency) {
    errors.push('Currency is required');
  }

  return errors;
}

export function validateTransaction(
  transaction: Partial<IPortfolioTransaction>
): string[] {
  const errors: string[] = [];

  if (!transaction.portfolioId) {
    errors.push('Portfolio ID is required');
  }

  if (!transaction.assetId) {
    errors.push('Asset ID is required');
  }

  if (!transaction.type) {
    errors.push('Transaction type is required');
  }

  if (!transaction.quantity || transaction.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!transaction.price || transaction.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  return errors;
}

export function generateSnapshotId(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function createAssetId(symbol: string, exchange?: string): string {
  return exchange ? `${symbol}_${exchange}` : symbol;
}

export function getDefaultPortfolioData(
  userId: string,
  name: string
): Partial<IPortfolio> {
  const now = new Date();
  return {
    userId,
    name,
    isDraft: false,
    currency: PORTFOLIO_CONSTANTS.DEFAULT_CURRENCY,
    isDefault: true,
    currentValue: 0,
    totalGain: 0,
    totalGainPercentage: 0,
    dailyGain: 0,
    dailyGainPercentage: 0,
    totalInvested: 0,
    createdAt: now,
    updatedAt: now,
  };
}
