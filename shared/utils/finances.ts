import { AVG_WEEKS_IN_MONTH } from '@shared/consts';
import { IDebt, IIncome } from '@shared/models/finances';
import dayjs from 'dayjs';

export function getTotalIcomes(incomes: IIncome[]): number {
  const total = incomes.reduce(
    (acc, income) =>
      acc +
      ((income: IIncome) => {
        switch (income.period) {
          case 'monthly':
            return income.amount;
          case 'weekly':
            return income.amount * AVG_WEEKS_IN_MONTH;
          case 'yearly':
            return dayjs(income.date).month() === dayjs().month()
              ? income.amount
              : 0;
          case 'single':
            return dayjs(income.date).month() === dayjs().month() &&
              dayjs(income.date).year() === dayjs().year()
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

export function getTotalDebts(debts: IDebt[]): number {
  const total = debts.reduce((acc, debt) => acc + debt.minimumPayment, 0);
  return total;
}
