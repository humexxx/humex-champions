import { useMemo } from 'react';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import IncomeEditDialog from './IncomeEditDialog';
import { IIncome } from 'src/types/models/finances';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'src/utils';

interface Props {
  personalFinancesId?: string;
  incomes: IIncome[];
  isLoading: boolean;
  update: (data: IIncome[], id?: string) => void;
}

const IncomeCard = ({
  incomes,
  isLoading,
  update,
  personalFinancesId,
}: Props) => {
  const { t } = useTranslation();

  const handleFormSubmit = (data: IIncome[]) => {
    update(data, personalFinancesId);
  };

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
                return income.amount * 4;
              case 'yearly':
                return income.amount / 12;
              default:
                return 0;
            }
          })(income),
        0
      ),
    [incomes]
  );

  return (
    <Card sx={{ position: 'relative', height: '100%' }}>
      <IncomeEditDialog
        data={incomes}
        onSubmit={handleFormSubmit}
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
            <Typography variant="body2">
              {t('finances.personalFinances.header.incomes.sources')}:{' '}
              {incomes.length}
            </Typography>
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
