export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: Dayjs;
  name: string;
}

export interface IIncome {
  amount: number;
  period: 'single' | 'weekly' | 'monthly' | 'yearly';
  name: string;
  singleDate?: Dayjs;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'single' | 'primary' | 'secondary';
  name: string;
  singleDate?: Dayjs;
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
  date: Dayjs;
  surplus: number;
  reviewed: boolean;
}
