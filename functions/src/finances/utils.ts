import { Timestamp } from 'firebase-admin/firestore';
import { IDebt, IFinancialSnapshot, IFixedExpense, IIncome } from './types';

// Función para aplicar el método Avalanche
export function applyAvalancheMethod(
  debts: IDebt[],
  remaining: number
): IDebt[] {
  const sortedDebts = debts.sort((a, b) => b.annualInterest - a.annualInterest);

  return sortedDebts.map((debt) => {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
    const payment = Math.min(
      debt.minimumPayment + remaining,
      debt.pendingDebt + interest
    );

    remaining -= Math.max(payment - debt.minimumPayment, 0);

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
        return sum + income.amount * 4;
      case 'monthly':
        return sum + income.amount;
      case 'yearly':
        return sum + income.amount / 12;
    }
  }, 0);

  const totalFixedExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const totalMinimumPayments = lastSnapshot.debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  const remaining = totalIncome - totalFixedExpenses - totalMinimumPayments;
  const newDebts = applyAvalancheMethod(lastSnapshot.debts, remaining);

  return {
    reviewed: false,
    debts: newDebts,
    date: Timestamp.now() as any,
  };
}
