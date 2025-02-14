import { Dayjs } from 'dayjs';

export interface IFinancialPlan {
  id?: string | null;
  name: string;
  financialSnapshots: IFinancialSnapshot[];

  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
  debts: IDebt[];
}

export type IIncome =
  | {
      amount: number;
      period: 'single';
      name: string;
      date: Dayjs;
    }
  | {
      amount: number;
      period: 'weekly' | 'monthly' | 'yearly';
      name: string;
      date?: Dayjs;
    };

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

  debts: IDebt[];
  incomes: IIncome[];
  fixedExpenses: IFixedExpense[];

  surplus: number;
  actualSurplus?: number;

  reviewed: boolean;
}
