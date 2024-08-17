import { useMemo } from 'react';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import IncomeEditDialog from './IncomeEditDialog';
import { IIncome } from 'src/models/finances';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'src/utils';
import dayjs from 'dayjs';
import { AVG_WEEKS_IN_MONTH } from 'src/consts';

interface Props {
  incomes: IIncome[];
  isLoading: boolean;
  update: (data: IIncome[]) => void;
}

const IncomeCard = ({ incomes, isLoading, update }: Props) => {
  const { t } = useTranslation();

  const total = useMemo(
    () =>
      incomes.reduce(
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
      ),
    [incomes]
  );

  const nextExtraordinaryIncome: IIncome | null = useMemo(
    () =>
      incomes
        .filter((income) => income.date)
        .sort((a, b) => a.date.diff(b.date))[0],
    [incomes]
  );

  return (
    <Card sx={{ position: 'relative', height: '100%', minHeight: 175 }}>
      <IncomeEditDialog
        data={incomes}
        onSubmit={update}
        sx={{ position: 'absolute', right: 8, top: 8 }}
        loading={isLoading}
      />
      <CardContent>
        <Typography variant="body1" component="h3" mb={2}>
          <strong>{t('finances.personalFinances.header.incomes.title')}</strong>
        </Typography>
        {isLoading ? (
          <>
            <Skeleton width="60%" height={32} />
            <Skeleton width="50%" height={24} />
          </>
        ) : incomes.length ? (
          <>
            <Typography component="h6" variant="body1" gutterBottom>
              {t('finances.personalFinances.header.incomes.total')}:{' '}
              {formatCurrency(total)}
            </Typography>
            {Boolean(nextExtraordinaryIncome) && (
              <Typography variant="body2">
                {t(
                  'finances.personalFinances.header.incomes.nextExtraordinaryPayment'
                )}
                : {formatCurrency(nextExtraordinaryIncome!.amount)}
                {' - '}
                {dayjs(nextExtraordinaryIncome!.date).format('DD MMM YYYY')}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('finances.personalFinances.header.incomes.noIncome')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeCard;
