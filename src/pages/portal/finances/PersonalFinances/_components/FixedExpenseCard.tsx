import { useMemo } from 'react';

import {
  Card,
  CardContent,
  Skeleton,
  Typography,
  Tooltip,
  Stack,
} from '@mui/material';
import { IDebt, IFixedExpense } from '@shared/models/finances';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'src/utils';
import RequestQuoteTwoToneIcon from '@mui/icons-material/RequestQuoteTwoTone';
import FixedExpenseEditDialog from './FixedExpenseEditDialog';

interface Props {
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
            return dayjs(fixedExpense.date).get('month') ===
              dayjs().get('month') &&
              dayjs(fixedExpense.date).get('year') === dayjs().get('year')
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
    <Card variant="elevation" elevation={4} sx={{ minHeight: 160 }}>
      <CardContent>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          mb={2}
        >
          <Stack direction={'row'} gap={1} alignItems={'center'}>
            <RequestQuoteTwoToneIcon color="warning" fontSize="large" />
            <Typography variant="body1" component="h3" mb={2}>
              <strong>
                {t('finances.personalFinances.header.fixedExpenses.title')}
              </strong>
            </Typography>
          </Stack>
          <FixedExpenseEditDialog
            data={fixedExpenses}
            onSubmit={update}
            disabled={isLoading}
          />
        </Stack>
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
