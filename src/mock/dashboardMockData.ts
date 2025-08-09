import { ISummary } from '@shared/models/dashboard';

export const MOCKED_SUMMARY: ISummary = {
  finance: {
    financeScore: 80,
    lastMonth: {
      debtsDecrease: 3000,
      debtsDecreasePercentage: 0.3,
      savingsIncrease: 0,
      savingsIncreasePercentage: 0,
    },
    nextTarget: {
      monthsRemaining: 8,
      name: 'Get out of debrs',
    },
  },
};
