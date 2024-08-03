export interface IncomeEditDialogProps {
  onSubmit: (data: IncomeProps[]) => void;
  data: IncomeProps[];
}

export interface IncomeProps {
  amount: number;
  period: 'Weekly' | 'Monthly' | 'Yearly';
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
