import {
  IDebt,
  IFixedExpense,
  IIncome,
} from 'src/components/pages/client/finances/personal-finances';

const generateMockIncomeData = (): IIncome[][] => {
  const now = new Date();
  const months = [-2, -1, 0];

  return months.map((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const formattedDate = date.toISOString().slice(0, 7); // YYYY-MM formato

    return [
      {
        amount: Math.floor(Math.random() * 10000) + 1000,
        period: 'monthly',
        date: formattedDate,
      },
      {
        amount: Math.floor(Math.random() * 5000) + 500,
        period: 'weekly',
        date: formattedDate,
      },
      {
        amount: Math.floor(Math.random() * 20000) + 5000,
        period: 'yearly',
        date: formattedDate,
      },
    ];
  });
};

export const fetchIncomeData = (): Promise<IIncome[][]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockIncomeData());
    }, 1000);
  });
};

const generateMockDebtData = (): IDebt[][] => {
  const now = new Date();
  const months = [-2, -1, 0];

  return months.map((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const formattedDate = date.toISOString().slice(0, 7);

    return [
      {
        pendingDebt: Math.floor(Math.random() * 50000) + 5000,
        minimumPayment: Math.floor(Math.random() * 5000) + 500,
        annualInterest: Math.random() * 10 + 1,
        date: formattedDate,
      },
      {
        pendingDebt: Math.floor(Math.random() * 20000) + 2000,
        minimumPayment: Math.floor(Math.random() * 2000) + 200,
        annualInterest: Math.random() * 10 + 1,
        date: formattedDate,
      },
    ];
  });
};

export const fetchDebtData = (): Promise<IDebt[][]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockDebtData());
    }, 1000);
  });
};

const generateMockFixedExpenseData = (): IFixedExpense[][] => {
  const now = new Date();
  const months = [-2, -1, 0];

  return months.map((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const formattedDate = date.toISOString().slice(0, 7);

    return [
      {
        amount: Math.floor(Math.random() * 3000) + 300,
        expenseType: 'primary',
        date: formattedDate,
      },
      {
        amount: Math.floor(Math.random() * 1500) + 150,
        expenseType: 'secondary',
        date: formattedDate,
      },
    ];
  });
};

export const fetchFixedExpenseData = (): Promise<IFixedExpense[][]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockFixedExpenseData());
    }, 1000);
  });
};
