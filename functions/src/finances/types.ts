import { Timestamp } from 'firebase-admin/firestore';

export interface IFinancialPlan {
  id?: string | null;
  name: string;
  financialSnapshots: IFinancialSnapshot[];
  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
}

export interface IDebt {
  name: string;
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: Timestamp;
}

export interface IIncome {
  name: string;
  amount: number;
  period: 'single' | 'weekly' | 'monthly' | 'yearly';
  singleDate?: Timestamp;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'single' | 'primary' | 'secondary';
  name: string;
  singleDate?: Timestamp;
}

export interface IFinancialSnapshot {
  debts: IDebt[];
  date: Timestamp;
  reviewed?: boolean;
  surplus: number;
}
