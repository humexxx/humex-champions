export interface IFinancialPlan<T = Date> {
  id?: string | null;
  name: string;
  financialSnapshots: IFinancialSnapshot<T>[];
  fixedExpenses: IFixedExpense<T>[];
  incomes: IIncome<T>[];
}
export interface IIncome<T = Date> {
  amount: number;
  period: 'single' | 'weekly' | 'monthly' | 'yearly';
  name: string;
  date?: T;
}

export interface IDebt<T = Date> {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: T;
  name: string;
}

export interface IFixedExpense<T = Date> {
  amount: number;
  expenseType: 'single' | 'primary' | 'secondary';
  name: string;
  singleDate?: T;
}

export interface IFinancialSnapshot<T = Date> {
  debts: IDebt<T>[];
  date: T;
  surplus: number;
  reviewed: boolean;
}
