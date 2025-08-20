import {
  PeriodType,
  PayoffMethod,
  PERIOD_TYPES,
  PAYOFF_METHODS,
} from '@shared/enums/finance';
import {
  IDebt,
  IFinancialSnapshot,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import dayjs, { Dayjs } from 'dayjs';

function generatePastFinancialSnapshots(
  historicalSnapshot: IFinancialSnapshot,
  quantity: number
): IFinancialSnapshot[] {
  const snapshots: IFinancialSnapshot[] = [];
  let previousSnapshot = historicalSnapshot;

  for (let i = 0; i < quantity; i++) {
    const newSnapshot: IFinancialSnapshot = {
      ...structuredClone(previousSnapshot),
      date: dayjs(previousSnapshot.date).subtract(1, 'month'),
    };
    snapshots.unshift(newSnapshot);
    previousSnapshot = snapshots[0];
  }

  return snapshots;
}

function getTotalMonthlyIncome(
  incomes: IIncome[],
  date: Dayjs = dayjs()
): number {
  const total = incomes.reduce(
    (acc, income) =>
      acc +
      ((income: IIncome) => {
        switch (income.period as PeriodType) {
          case PERIOD_TYPES.SINGLE:
            return dayjs(income.date).month() === date.month() &&
              dayjs(income.date).year() === date.year()
              ? income.amount
              : 0;
          case PERIOD_TYPES.WEEKLY: {
            const firstDayOfMonth = dayjs(date).startOf('month');
            const lastDayOfMonth = dayjs(date).endOf('month');
            let count = 0;
            for (
              let currentDay = firstDayOfMonth;
              currentDay.isBefore(lastDayOfMonth) ||
              currentDay.isSame(lastDayOfMonth);
              currentDay = currentDay.add(1, 'day')
            ) {
              if (currentDay.day() === 5) {
                // Actualizar el día de la semana según sea necesario
                count++;
              }
            }
            return income.amount * count;
          }
          case PERIOD_TYPES.MONTHLY:
            return income.amount;
          case PERIOD_TYPES.YEARLY:
            return dayjs(income.date).month() === date.month()
              ? income.amount
              : 0;
          default:
            return 0;
        }
      })(income),
    0
  );
  return total;
}

function getTotalDebts(debts: IDebt[]): number {
  const total = debts.reduce((acc, debt) => acc + debt.pendingDebt, 0);
  return total;
}

function getTotalMinimumDebtPayments(debts: IDebt[]): number {
  const total = debts.reduce((acc, debt) => acc + debt.minimumPayment, 0);
  return total;
}

function getTotalFixedExpenses(
  fixedExpenses: IFixedExpense[],
  date: Dayjs = dayjs()
): number {
  const total = fixedExpenses.reduce(
    (acc, expense) =>
      acc +
      ((expense: IFixedExpense) => {
        switch (expense.expenseType) {
          case 'single':
            return dayjs(expense.date).month() === date.month() &&
              dayjs(expense.date).year() === date.year()
              ? expense.amount
              : 0;
          case 'primary':
            return expense.amount;
          case 'secondary':
            return expense.amount;
          default:
            return 0;
        }
      })(expense),
    0
  );
  return total;
}

function applyAvalancheMethod(
  debts: IDebt[],
  surplus: number
): { newDebts: IDebt[]; surplus: number } {
  const sortedDebts = debts
    .map((debt) => ({ ...debt }))
    .sort((a, b) => b.annualInterest - a.annualInterest);

  for (const debt of sortedDebts) {
    const totalDue = debt.pendingDebt;

    const extra = surplus > 0 ? Math.min(surplus, totalDue) : 0;
    surplus -= extra;

    debt.pendingDebt = Math.max(totalDue - extra, 0);
    debt.minimumPayment = Math.max(debt.pendingDebt * 0.03, 50);
  }

  return { newDebts: sortedDebts, surplus };
}

function applySnowballMethod(
  debts: IDebt[],
  surplus: number
): { newDebts: IDebt[]; surplus: number } {
  const sortedDebts = debts
    .map((debt) => ({ ...debt }))
    .sort((a, b) => a.pendingDebt - b.pendingDebt);

  for (const debt of sortedDebts) {
    const totalDue = debt.pendingDebt;

    const extra = surplus > 0 ? Math.min(surplus, totalDue) : 0;
    surplus -= extra;

    debt.pendingDebt = Math.max(totalDue - extra, 0);
    debt.minimumPayment = Math.max(debt.pendingDebt * 0.03, 50);
  }

  return { newDebts: sortedDebts, surplus };
}

function generateMonthlyFinancialSnapshotsPredictions(
  data: IFinancialSnapshot,
  type: PayoffMethod,
  maxMonths: number = 12
): IFinancialSnapshot[] {
  // Si no hay deudas, retornar array vacío inmediatamente
  if (!data.debts.length || getTotalDebts(data.debts) <= 0) {
    return [];
  }

  const result: IFinancialSnapshot[] = [];

  let date = data.date.add(1, 'month');
  let previousSnapshot = data;
  let iterations = 0;

  while (getTotalDebts(previousSnapshot.debts) > 0 && iterations < maxMonths) {
    // Aplica intereses y pago mínimo aquí, solo una vez por ciclo
    let updatedDebts = previousSnapshot.debts.map((debt) => {
      const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
      const newPendingDebt = debt.pendingDebt + interest;

      // Aplica el pago mínimo
      const paymentToApply = Math.min(debt.minimumPayment, newPendingDebt);
      const remainingDebt = newPendingDebt - paymentToApply;

      return {
        ...debt,
        pendingDebt: remainingDebt,
        minimumPayment: Math.max(remainingDebt * 0.03, 50),
      };
    });

    const totalIncome = getTotalMonthlyIncome(previousSnapshot.incomes, date);
    const totalFixedExpenses = getTotalFixedExpenses(
      previousSnapshot.fixedExpenses
    );
    const totalMinimumPayments = getTotalMinimumDebtPayments(updatedDebts);

    let surplus = totalIncome - totalFixedExpenses - totalMinimumPayments;

    // TODO: Usar el total de sobrante en el futuro
    const { newDebts } =
      type === PAYOFF_METHODS.AVALANCHE
        ? applyAvalancheMethod(updatedDebts, surplus)
        : applySnowballMethod(updatedDebts, surplus);

    const newSnapshot: IFinancialSnapshot = {
      ...previousSnapshot,
      debts: newDebts,
      reviewed: true,
      expectedSurplus: surplus,
      date,
    };

    result.push(newSnapshot);
    previousSnapshot = newSnapshot;
    date = date.add(1, 'month');
    iterations++;
  }

  return result;
}

export const financeUtils = {
  generatePastFinancialSnapshots,
  getTotalMonthlyIncome,
  getTotalDebts,
  getTotalMinimumDebtPayments,
  getTotalFixedExpenses,
  generateMonthlyFinancialSnapshotsPredictions,
  applyAvalancheMethod,
  applySnowballMethod,
};
