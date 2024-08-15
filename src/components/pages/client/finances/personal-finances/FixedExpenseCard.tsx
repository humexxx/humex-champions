import { useMemo } from 'react';
import { Card, CardContent, Skeleton, Typography } from '@mui/material';
import FixedExpenseEditDialog from './FixedExpenseEditDialog';
import { useTranslation } from 'react-i18next';
import { IFixedExpense } from 'src/types/models/finances';
import { formatCurrency } from 'src/utils';

interface Props {
  personalFinancesId?: string;
  fixedExpenses: IFixedExpense[];
  isLoading: boolean;
  update: (data: IFixedExpense[], id?: string) => void;
}

const FixedExpenseCard = ({
  fixedExpenses,
  isLoading,
  update,
  personalFinancesId,
}: Props) => {
  const { t } = useTranslation();

  const handleFormSubmit = (data: IFixedExpense[]) => {
    update(data, personalFinancesId);
  };

  const total = useMemo(
    () =>
      fixedExpenses.reduce((acc, fixedExpense) => acc + fixedExpense.amount, 0),
    [fixedExpenses]
  );

  return (
    <Card sx={{ position: 'relative', height: '100%', minHeight: 175 }}>
      <FixedExpenseEditDialog
        data={fixedExpenses}
        onSubmit={handleFormSubmit}
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
            {/* <Skeleton width="50%" height={24} /> */}
          </>
        ) : fixedExpenses.length ? (
          <>
            <Typography component="h6" variant="body1" gutterBottom>
              {t('finances.personalFinances.header.fixedExpenses.total')}:{' '}
              {formatCurrency(total)}
            </Typography>
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
