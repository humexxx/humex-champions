import { EPeriodType } from '@shared/enums/finance';
import {
  IDebt,
  IFinancialPlan,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import dayjs from 'dayjs';

const firstDayOfMonth = dayjs().startOf('month');

const MOCKED_DEBTS: IDebt[] = [
  {
    annualInterest: 0.15,
    minimumPayment: 2000,
    name: 'Mocked Debt',
    pendingDebt: 40000,
    startDate: firstDayOfMonth,
  },
  {
    annualInterest: 0.7,
    minimumPayment: 2000,
    name: 'Mocked Debt',
    pendingDebt: 45000,
    startDate: firstDayOfMonth,
  },
];

const MOCKED_INCOMES: IIncome[] = [
  {
    amount: 8900,
    name: 'Mocked Income',
    period: EPeriodType.MONTHLY,
  },
  {
    amount: 5000,
    name: 'Mocked Income',
    period: EPeriodType.SINGLE,
    date: dayjs('07/01/2025'),
  },
];

const MOCKED_FIXED_EXPENSES: IFixedExpense[] = [
  {
    amount: 2500,
    expenseType: 'primary',
    name: 'Mocked Fixed Expense',
  },
  {
    amount: 2500,
    expenseType: 'primary',
    name: 'Mocked Secondary Fixed Expense',
  },
];

export const MOCKED_FINANCIAL_PLAN: IFinancialPlan = {
  id: '123',
  name: 'Mocked Financial Plan',
  debts: MOCKED_DEBTS,
  fixedExpenses: MOCKED_FIXED_EXPENSES,
  incomes: MOCKED_INCOMES,
  financialSnapshots: [
    {
      date: firstDayOfMonth,
      debts: MOCKED_DEBTS,
      fixedExpenses: MOCKED_FIXED_EXPENSES,
      incomes: MOCKED_INCOMES,
      reviewed: true,
      expectedSurplus: 0,
      actualSurplus: 0,
    },
  ],
};
