export interface ISummary {
  finance: {
    financeScore: number;
    lastMonth: {
      savingsIncrease: number;
      debtsDecrease: number;
      savingsIncreasePercentage: number;
      debtsDecreasePercentage: number;
    };
    nextTarget: {
      monthsRemaining: number;
      name: string;
    };
  };
}
