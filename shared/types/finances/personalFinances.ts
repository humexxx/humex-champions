import { PeriodType } from '@shared/enums/finance';
import { Dayjs } from 'dayjs';

export interface IFinancialPlan {
  id: string;
  name: string;
  financialSnapshots: IFinancialSnapshot[];

  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
  debts: IDebt[];
}

export interface IIncome {
  amount: number;
  period: PeriodType;
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
  expenseType: 'single' | 'primary' | 'secondary' | 'investment';
  name: string;
  date?: Dayjs;

  // Portfolio Investment Configuration
  portfolioConfig?: {
    portfolioId: string;
    assetSymbol: string; // System asset symbol (e.g., 'HUMEX-YIELD')
    transactionType: 'BUY'; // Only BUY for now
    autoExecute: boolean; // Whether to automatically execute monthly
    requiresApproval: boolean; // Always true for system assets
    nextExecutionDate?: Dayjs; // When the next transaction should occur
    isActive: boolean; // Whether the recurring investment is active
  };
}

export interface IFinancialSnapshot {
  date: Dayjs;

  incomes: IIncome[];
  debts: IDebt[];
  fixedExpenses: IFixedExpense[];

  expectedSurplus: number;
  actualSurplus?: number;
  reviewed: boolean;
}
