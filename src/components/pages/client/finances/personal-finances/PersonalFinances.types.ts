export interface IBasicProps {
  id?: string;
  date?: string;
}

export interface IncomeEditDialogProps {
  onSubmit: (data: IIncome[]) => void;
  data: IIncome[];
}

export interface IIncome {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface IncomeCardProps {
  incomes: (IIncome & IBasicProps)[];
}

export interface DebtEditDialogProps {
  onSubmit: (data: IDebt[]) => void;
  data: IDebt[];
}

export interface IDebt {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
}

export interface DebtCardProps {
  debts: (IDebt & IBasicProps)[];
}

export interface FixedExpenseEditDialogProps {
  onSubmit: (data: IFixedExpense[]) => void;
  data: IFixedExpense[];
}

export interface IFixedExpense {
  amount: number;
  expenseType: 'primary' | 'secondary';
}

export interface FixedExpenseCardProps {
  expenses: (IFixedExpense & IBasicProps)[];
}
