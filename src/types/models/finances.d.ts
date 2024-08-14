export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: string;
}

export interface IIncome {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'primary' | 'secondary';
  name: string;
  startDate: string;
}

export interface IPersonalFinances {
  id: string;
  debts: IDebt[];
  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
}
