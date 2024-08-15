export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: any;
}

export interface IIncome {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: any;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'primary' | 'secondary';
  name: string;
  startDate: any;
}

export interface IFinancialSnapshot {
  debts: IDebt[];
  incomes: IIncome[];
  fixedExpenses: IFixedExpense[];
  date: any;
  reviewed?: boolean;
}
