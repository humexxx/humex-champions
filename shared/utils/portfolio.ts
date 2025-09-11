import dayjs from 'dayjs';
import {
  IPortfolio,
  IPortfolioHolding,
  IPortfolioSnapshot,
} from '../types/finances';

export function calculatePortfolioTotals(
  previousSnapshot: IPortfolioSnapshot,
  currentSnapshot: IPortfolioSnapshot
): {
  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyGain: number;
  dailyGainPercentage: number;
  totalInvested: number;
} {
  const holdings = currentSnapshot.holdings || [];
  let currentValue = 0;
  let totalInvested = 0;

  for (const holding of holdings) {
    currentValue += holding.currentValue ?? 0;
    totalInvested += holding.totalInvested ?? 0;
  }

  // Calculate previous value for daily gain
  const prevValue =
    previousSnapshot && previousSnapshot.holdings
      ? previousSnapshot.holdings.reduce(
          (sum, h) => sum + (h.currentValue ?? 0),
          0
        )
      : 0;

  const dailyGain = currentValue - prevValue;
  const totalGain = currentValue - totalInvested;
  const totalGainPercentage =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const dailyGainPercentage = prevValue > 0 ? (dailyGain / prevValue) * 100 : 0;

  return {
    currentValue,
    totalInvested,
    totalGain,
    totalGainPercentage,
    dailyGain,
    dailyGainPercentage,
  };
}

export function calculateTotalValueFromHoldings(
  holdings: IPortfolioHolding[]
): number {
  return holdings.reduce(
    (total, holding) => total + (holding.currentValue || 0),
    0
  );
}

export function calculateTotalInvestedFromHoldings(
  holdings: IPortfolioHolding[]
): number {
  return holdings.reduce(
    (total, holding) => total + (holding.totalInvested || 0),
    0
  );
}

export function getDefaultPortfolioData(
  userId: string,
  name: string
): Partial<IPortfolio> {
  const now = dayjs();
  return {
    userId,
    name,
    isDraft: false,
    currency: 'USD',
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
