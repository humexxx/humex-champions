import { Dayjs } from 'dayjs';

export interface IFinancialPlan {
  id?: string | null;
  name: string;
  financialSnapshots: IFinancialSnapshot[];

  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
  debts: IDebt[];
}

export interface IIncome {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'single';
  name: string;
  date?: Dayjs;
}

export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  name: string;
  startDate: Dayjs;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'single' | 'primary' | 'secondary';
  name: string;
  date?: Dayjs;
}

export interface IFinancialSnapshot {
  date: Dayjs;

  incomes: IIncome[];
  debts: IDebt[];
  fixedExpenses: IFixedExpense[];

  surplus: number;
  actualSurplus?: number;

  reviewed: boolean;
}
