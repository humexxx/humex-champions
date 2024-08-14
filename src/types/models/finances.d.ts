export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
  startDate: Dayjs;
}

export interface IIncome {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Dayjs;
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'primary' | 'secondary';
  name: string;
  startDate: Dayjs;
}

export interface IPersonalFinances {
  id: string;
  debts: IDebt[];
  fixedExpenses: IFixedExpense[];
  incomes: IIncome[];
}
