import { useMemo } from 'react';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import DebtEditDialog from './DebtEditDialog';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercentage } from 'src/utils';
import { IDebt } from 'src/models/finances';

interface Props {
  debts: IDebt[];
  isLoading: boolean;
  update: (data: IDebt[]) => void;
  canEdit?: boolean;
}

const DebtCard = ({ debts, isLoading, update, canEdit }: Props) => {
  const { t } = useTranslation();

  const totalDebt = useMemo(
    () => debts.reduce((acc, debt) => acc + debt.pendingDebt, 0),
    [debts]
  );

  const totalMinimumPayment = useMemo(
    () => debts.reduce((acc, debt) => acc + debt.minimumPayment, 0),
    [debts]
  );

  const weightedInterest = useMemo(() => {
    if (totalDebt === 0) return 0;

    const weightedSum = debts.reduce(
      (acc, debt) => acc + debt.annualInterest * debt.pendingDebt,
      0
    );

    return weightedSum / totalDebt;
  }, [debts, totalDebt]);

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 175,
        bgcolor: canEdit ? 'inherit' : 'action.disabledBackground',
      }}
      elevation={canEdit ? 2 : 0}
    >
      {canEdit && (
        <DebtEditDialog
          data={debts}
          onSubmit={update}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          loading={isLoading}
        />
      )}
      <CardContent>
        <Typography
          variant="body1"
          component="h3"
          mb={2}
          color={canEdit ? 'primary.default' : 'text.disabled'}
        >
          <strong>{t('finances.personalFinances.header.debts.title')}</strong>
        </Typography>
        {isLoading ? (
          <>
            <Skeleton width="60%" height={32} />
            <Skeleton width="50%" height={24} />
            <Skeleton width="50%" height={24} />
          </>
        ) : debts.length ? (
          <>
            <Typography
              component="h6"
              variant="body1"
              gutterBottom
              color={canEdit ? 'text.primary' : 'text.disabled'}
            >
              {t('finances.personalFinances.header.debts.total')}:{' '}
              {formatCurrency(totalDebt)}
            </Typography>
            <Typography
              variant="body2"
              color={canEdit ? 'text.primary' : 'text.disabled'}
            >
              {t('finances.personalFinances.header.debts.minimumPayment')}:{' '}
              {formatCurrency(totalMinimumPayment)}
            </Typography>
            <Typography
              variant="body2"
              color={canEdit ? 'text.primary' : 'text.disabled'}
            >
              {t('finances.personalFinances.header.debts.interest')}:{' '}
              {formatPercentage(weightedInterest)}
            </Typography>
          </>
        ) : (
          <Typography
            variant="body2"
            color={canEdit ? 'text.secondary' : 'text.disabled'}
          >
            {t('finances.personalFinances.header.debts.noDebts')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtCard;
