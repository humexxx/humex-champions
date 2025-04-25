import { IFinancialPlan } from '@shared/models/finances';
import dayjs from 'dayjs';
import { User } from 'firebase/auth';

// User
export const MOCKED_USER: User = {
  uid: '123',
  email: 'mocked@mocked.com',
  providerData: [{ displayName: 'Mocked User' }],
} as User;

// Financial
export const MOCKED_FINANCIAL_PLAN: IFinancialPlan = {
  id: '123',
  name: 'Mocked Financial Plan',
  debts: [
    {
      annualInterest: 0.3,
      minimumPayment: 3000,
      name: 'Mocked Debt',
      pendingDebt: 40000,
      startDate: dayjs('3/15/2025'),
    },
  ],
  fixedExpenses: [
    {
      amount: 500,
      expenseType: 'primary',
      name: 'Mocked Fixed Expense',
    },
    {
      amount: 1500,
      expenseType: 'primary',
      name: 'Mocked Secondary Fixed Expense',
    },
  ],
  incomes: [
    {
      amount: 8900,
      name: 'Tech9',
      period: 'monthly',
    },
    {
      amount: 5000,
      name: 'Pendiente de Enero',
      period: 'single',
      date: dayjs('3/15/2025'),
    },
  ],
  financialSnapshots: [
    {
      date: dayjs().add(-1, 'month'),
      debts: [
        {
          annualInterest: 0.3,
          minimumPayment: 3000,
          name: 'Mocked Debt',
          pendingDebt: 40000,
          startDate: dayjs('3/15/2025'),
        },
      ],
      fixedExpenses: [
        {
          amount: 500,
          expenseType: 'primary',
          name: 'Mocked Fixed Expense',
        },
        {
          amount: 1500,
          expenseType: 'primary',
          name: 'Mocked Secondary Fixed Expense',
        },
      ],
      incomes: [
        {
          amount: 8900,
          name: 'Tech9',
          period: 'monthly',
        },
        {
          amount: 5000,
          name: 'Pendiente de Enero',
          period: 'single',
          date: dayjs('3/15/2025'),
        },
      ],
      reviewed: false,
      surplus: 0,
      actualSurplus: 0,
    },
  ],
};
