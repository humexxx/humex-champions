export interface IncomeEditDialogProps {
  onSubmit: (data: IncomeProps[]) => void;
  data: IncomeProps[];
}

export interface IncomeProps {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface DebtEditDialogProps {
  onSubmit: (data: DebtProps[]) => void;
  data: DebtProps[];
}

export interface DebtProps {
  pendingDebt: number;
  minimumPayment: number;
  annualInterest: number;
}

export interface FixedExpenseEditDialogProps {
  onSubmit: (data: FixedExpenseProps[]) => void;
  data: FixedExpenseProps[];
}

export interface FixedExpenseProps {
  amount: number;
  expenseType: 'primary' | 'secondary';
}
