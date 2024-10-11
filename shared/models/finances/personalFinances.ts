export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: any;
  name: string;
}

export interface IIncome {
  amount: number;
  period: 'single' | 'weekly' | 'monthly' | 'yearly';
  name: string;
  date?: any;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'single' | 'primary' | 'secondary';
  name: string;
  singleDate?: any;
}

export interface IFinancialPlan {
  id?: string | null;
  name: string;
  financialSnapshots: IFinancialSnapshot[];
  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
}

export interface IFinancialSnapshot {
  debts: IDebt[];
  date: any;
  surplus: number;
  reviewed: boolean;
}
