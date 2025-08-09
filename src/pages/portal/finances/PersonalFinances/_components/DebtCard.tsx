import { useMemo } from 'react';

import RequestQuoteTwoToneIcon from '@mui/icons-material/RequestQuoteTwoTone';
import { Card, CardContent, Typography, Skeleton, Stack } from '@mui/material';
import { IDebt } from '@shared/models/finances';
import { formatCurrency, formatPercentage } from 'src/utils';

import DebtEditDialog from './DebtEditDialog';
import { financeUtils } from '@shared/utils';

interface Props {
  debts: IDebt[];
  isLoading: boolean;
  update: (data: IDebt[]) => void;
  canEdit?: boolean;
}

const DebtCard = ({ debts, isLoading, update, canEdit }: Props) => {
  const totalDebt = useMemo(() => financeUtils.getTotalDebts(debts), [debts]);

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

    return (weightedSum / totalDebt) * 100;
  }, [debts, totalDebt]);

  return (
    <Card
      variant="elevation"
      elevation={4}
      sx={{
        minHeight: 160,
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
              <strong>Debts</strong>
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
          </>
        ) : debts.length ? (
          <>
            <Typography
              component="h6"
              variant="body1"
              gutterBottom
              color={canEdit ? 'text.primary' : 'text.disabled'}
            >
              Total Monthly: {formatCurrency(totalMinimumPayment)}
            </Typography>
            <Typography
              variant="body2"
              color={canEdit ? 'text.secondary' : 'text.disabled'}
            >
              Total Debt: {formatCurrency(totalDebt)}
            </Typography>
            <Typography
              variant="caption"
              color={canEdit ? 'text.secondary' : 'text.disabled'}
            >
              Average Interest: {formatPercentage(weightedInterest)}
            </Typography>
          </>
        ) : (
          <Typography
            variant="body2"
            color={canEdit ? 'text.secondary' : 'text.disabled'}
          >
            No debts configured
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtCard;
