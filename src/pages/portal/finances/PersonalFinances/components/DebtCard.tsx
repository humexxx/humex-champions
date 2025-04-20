import { useMemo } from 'react';

import RequestQuoteTwoToneIcon from '@mui/icons-material/RequestQuoteTwoTone';
import { Card, CardContent, Typography, Skeleton, Stack } from '@mui/material';
import { IDebt } from '@shared/models/finances';
import { getTotalDebts } from '@shared/utils';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercentage } from 'src/utils';

import DebtEditDialog from './DebtEditDialog';

interface Props {
  debts: IDebt[];
  isLoading: boolean;
  update: (data: IDebt[]) => void;
  canEdit?: boolean;
}

const DebtCard = ({ debts, isLoading, update, canEdit }: Props) => {
  const { t } = useTranslation();

  const totalDebt = useMemo(() => getTotalDebts(debts), [debts]);

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
        minHeight: 186,
      }}
    >
      <CardContent>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          mb={2}
        >
          <Stack direction={'row'} gap={1} alignItems={'center'}>
            <RequestQuoteTwoToneIcon color="error" fontSize="large" />
            <Typography variant="body1" component="h3">
              <strong>
                {t('finances.personalFinances.header.debts.title')}
              </strong>
            </Typography>
          </Stack>

          <DebtEditDialog
            data={debts}
            onSubmit={update}
            disabled={isLoading || !canEdit}
          />
        </Stack>
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
