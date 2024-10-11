import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Typography,
  Tooltip,
} from '@mui/material';
import FixedExpenseEditDialog from './FixedExpenseEditDialog';
import { useTranslation } from 'react-i18next';
import { IDebt, IFixedExpense } from '@shared/models/finances';
import { formatCurrency } from 'src/utils';
import dayjs from 'dayjs';

interface Props {
  personalFinancesId?: string;
  fixedExpenses: IFixedExpense[];
  debts: IDebt[];
  isLoading: boolean;
  update: (data: IFixedExpense[]) => void;
}

const FixedExpenseCard = ({
  fixedExpenses,
  debts,
  isLoading,
  update,
}: Props) => {
  const { t } = useTranslation();

  const monthlyFixedDebt = useMemo(
    () => debts.reduce((acc, debt) => acc + debt.minimumPayment, 0),
    [debts]
  );

  const total = useMemo(
    () =>
      fixedExpenses.reduce((acc, fixedExpense) => {
        switch (fixedExpense.expenseType) {
          case 'single':
            return dayjs(fixedExpense.singleDate).get('month') ===
              dayjs().get('month') &&
              dayjs(fixedExpense.singleDate).get('year') === dayjs().get('year')
              ? acc + fixedExpense.amount
              : acc;
          case 'primary':
            return acc + fixedExpense.amount;
          case 'secondary':
            return acc + fixedExpense.amount;
        }
      }, 0) + monthlyFixedDebt,
    [fixedExpenses, monthlyFixedDebt]
  );

  return (
    <Card sx={{ position: 'relative', height: '100%', minHeight: 175 }}>
      <FixedExpenseEditDialog
        data={fixedExpenses}
        onSubmit={update}
        sx={{ position: 'absolute', right: 8, top: 8 }}
        loading={isLoading}
      />
      <CardContent>
        <Typography variant="body1" component="h3" mb={2}>
          <strong>
            {t('finances.personalFinances.header.fixedExpenses.title')}
          </strong>
        </Typography>
        {isLoading ? (
          <>
            <Skeleton width="60%" height={32} />
            <Skeleton width="50%" height={24} />
          </>
        ) : fixedExpenses.length || debts.length ? (
          <>
            <Typography component="h6" variant="body1" gutterBottom>
              {t('finances.personalFinances.header.fixedExpenses.total')}:{' '}
              {formatCurrency(total)}
            </Typography>

            <Tooltip
              title={t(
                'finances.personalFinances.header.fixedExpenses.fixedMonthlyDebtHint'
              )}
            >
              <Typography variant="body2">
                {t(
                  'finances.personalFinances.header.fixedExpenses.fixedMonthlyDebt'
                )}
                : {formatCurrency(monthlyFixedDebt)}
              </Typography>
            </Tooltip>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t(
              'finances.personalFinances.header.fixedExpenses.noFixedExpenses'
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default FixedExpenseCard;
