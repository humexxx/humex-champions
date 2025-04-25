import { EPeriodType } from '@shared/enums/finance';
import {
  IDebt,
  IFinancialSnapshot,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import dayjs, { Dayjs } from 'dayjs';

function generatePastFinancialSnapshots(
  historicalSnapshots: IFinancialSnapshot[],
  quantity: number
): IFinancialSnapshot[] {
  const snapshots: IFinancialSnapshot[] = [];

  for (let i = 0; i < quantity; i++) {
    const previousSnapshot = historicalSnapshots[i];
    const newSnapshot: IFinancialSnapshot = {
      ...structuredClone(previousSnapshot),
      date: dayjs(previousSnapshot.date).subtract(i + 1, 'month'),
    };
    snapshots.push(newSnapshot);
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
        switch (income.period as EPeriodType) {
          case EPeriodType.SINGLE:
            return income.date!.month() === date.month() &&
              income.date!.year() === date.year()
              ? income.amount
              : 0;
          case EPeriodType.WEEKLY: {
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
          case EPeriodType.MONTHLY:
            return income.amount;
          case EPeriodType.YEARLY:
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
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
    const totalDue = debt.pendingDebt + interest;

    const basePayment = debt.minimumPayment;
    const extra = surplus > 0 ? Math.min(surplus, totalDue - basePayment) : 0;

    const payment = basePayment + extra;
    surplus -= extra;

    debt.pendingDebt = Math.max(totalDue - payment, 0);
  }

  return { newDebts: sortedDebts, surplus };
}

function generateMonthlyAvalancheFinancialSnapshots(
  data: IFinancialSnapshot,
  maxMonths: number = 12
): IFinancialSnapshot[] {
  const result: IFinancialSnapshot[] = [];

  let date = dayjs().add(1, 'month');
  let previousSnapshot = structuredClone(data);
  let iterations = 0;

  while (getTotalDebts(previousSnapshot.debts) > 0 && iterations < maxMonths) {
    const totalIncome = getTotalMonthlyIncome(previousSnapshot.incomes, date);
    const totalFixedExpenses = getTotalFixedExpenses(
      previousSnapshot.fixedExpenses
    );
    const totalMinimumPayments = getTotalMinimumDebtPayments(
      previousSnapshot.debts
    );

    const surplus = totalIncome - totalFixedExpenses - totalMinimumPayments;

    const { newDebts, surplus: remainingSurplus } = applyAvalancheMethod(
      [...previousSnapshot.debts],
      surplus
    );

    const newSnapshot: IFinancialSnapshot = {
      ...structuredClone(previousSnapshot),
      debts: newDebts,
      reviewed: true,
      surplus: remainingSurplus,
      date: date,
    };

    result.push(newSnapshot);
    previousSnapshot = newSnapshot;
    date = date.add(1, 'month');
    iterations++;
  }

  return [data, ...result];
}

function applySnowballMethod(
  debts: IDebt[],
  surplus: number
): { newDebts: IDebt[]; surplus: number } {
  const sortedDebts = debts
    .map((debt) => ({ ...debt }))
    .sort((a, b) => a.pendingDebt - b.pendingDebt);

  for (const debt of sortedDebts) {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
    const totalDue = debt.pendingDebt + interest;

    const basePayment = debt.minimumPayment;
    const availableToPay = surplus > 0 ? basePayment + surplus : basePayment;
    const payment = Math.min(availableToPay, totalDue);

    const extra = Math.max(payment - basePayment, 0);
    surplus -= extra;

    debt.pendingDebt = Math.max(totalDue - payment, 0);
  }

  return { newDebts: sortedDebts, surplus };
}

function generateMonthlySnowballFinancialSnapshots(
  data: IFinancialSnapshot,
  maxMonths: number = 12
): IFinancialSnapshot[] {
  const result: IFinancialSnapshot[] = [];

  let date = dayjs().add(1, 'month');
  let previousSnapshot = structuredClone(data);
  let iterations = 0;

  while (getTotalDebts(previousSnapshot.debts) > 0 && iterations < maxMonths) {
    const totalIncome = getTotalMonthlyIncome(previousSnapshot.incomes, date);
    const totalFixedExpenses = getTotalFixedExpenses(
      previousSnapshot.fixedExpenses
    );
    const totalMinimumPayments = getTotalMinimumDebtPayments(
      previousSnapshot.debts
    );

    const surplus = totalIncome - totalFixedExpenses - totalMinimumPayments;

    const { newDebts, surplus: remainingSurplus } = applySnowballMethod(
      [...previousSnapshot.debts],
      surplus
    );

    const newSnapshot: IFinancialSnapshot = {
      ...structuredClone(previousSnapshot),
      debts: newDebts,
      reviewed: true,
      surplus: remainingSurplus,
      date,
    };

    result.push(newSnapshot);
    previousSnapshot = newSnapshot;
    date = date.add(1, 'month');
    iterations++;
  }

  return [data, ...result];
}

export const financeUtils = {
  generatePastFinancialSnapshots,
  getTotalMonthlyIncome,
  getTotalDebts,
  getTotalMinimumDebtPayments,
  getTotalFixedExpenses,
  applyAvalancheMethod,
  generateMonthlyAvalancheFinancialSnapshots,
  applySnowballMethod,
  generateMonthlySnowballFinancialSnapshots,
};
