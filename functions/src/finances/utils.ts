import { Timestamp } from 'firebase-admin/firestore';
import { AVG_WEEKS_IN_MONTH } from '../consts';
import {
  IDebt,
  IFinancialSnapshot,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';

// Función para aplicar el método Avalanche
export function applyAvalancheMethod(debts: IDebt[], surplus: number): IDebt[] {
  const sortedDebts = debts.sort((a, b) => b.annualInterest - a.annualInterest);

  return sortedDebts.map((debt) => {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
    const payment =
      surplus > 0
        ? Math.min(debt.minimumPayment + surplus, debt.pendingDebt + interest)
        : debt.minimumPayment;

    surplus -= Math.max(payment - debt.minimumPayment, 0);

    return {
      ...debt,
      pendingDebt: debt.pendingDebt + interest - payment,
    };
  });
}

export function generateSingleSnapshot(
  lastSnapshot: IFinancialSnapshot,
  fixedExpenses: IFixedExpense[],
  incomes: IIncome[]
): IFinancialSnapshot {
  const totalIncome = incomes.reduce((sum, income) => {
    switch (income.period) {
      case 'weekly':
        return sum + income.amount * AVG_WEEKS_IN_MONTH;
      case 'monthly':
        return sum + income.amount;
      case 'yearly':
        return income.date?.toDate().getMonth() === new Date().getMonth()
          ? sum + income.amount
          : sum;
      case 'single':
        return income.date?.toDate().getMonth() === new Date().getMonth() &&
          income.date?.toDate().getFullYear() === new Date().getFullYear()
          ? sum + income.amount
          : sum;
    }
  }, 0);

  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => {
    switch (expense.expenseType) {
      case 'single':
        return expense.singleDate?.toDate().getMonth() ===
          new Date().getMonth() &&
          expense.singleDate?.toDate().getFullYear() ===
            new Date().getFullYear()
          ? sum + expense.amount
          : sum;
      case 'primary':
        return sum + expense.amount;
      case 'secondary':
        return sum + expense.amount;
    }
  }, 0);

  const totalMinimumPayments = lastSnapshot.debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const carryover = lastSnapshot.surplus < 0 ? lastSnapshot.surplus : 0;

  let surplus =
    totalIncome - totalFixedExpenses - totalMinimumPayments + carryover;
  const newDebts = applyAvalancheMethod(lastSnapshot.debts, surplus);

  const totalBalanceInFavorForDebts = newDebts.reduce(
    (sum, debt) => (debt.pendingDebt < 0 ? sum + debt.pendingDebt : sum),
    0
  );

  surplus += totalBalanceInFavorForDebts * -1;

  return {
    reviewed: false,
    debts: newDebts,
    date: Timestamp.now() as any,
    surplus,
  };
}
