import { useMemo } from 'react';

import RequestQuoteTwoToneIcon from '@mui/icons-material/RequestQuoteTwoTone';
import { Card, CardContent, Typography, Skeleton, Stack } from '@mui/material';
import { IIncome } from '@shared/models/finances';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'src/utils';

import IncomeEditDialog from './IncomeEditDialog';
import { financeUtils } from '@shared/utils';

interface Props {
  incomes: IIncome[];
  isLoading: boolean;
  update: (data: IIncome[]) => void;
}

const IncomeCard = ({ incomes, isLoading, update }: Props) => {
  const { t } = useTranslation();

  const total = useMemo(
    () => financeUtils.getTotalMonthlyIncome(incomes),
    [incomes]
  );
  const nextExtraordinaryIncome: IIncome | null = useMemo(
    () =>
      incomes
        .filter((income) => income.date)
        .sort((x) => dayjs(x.date).valueOf())[0],
    [incomes]
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
            <RequestQuoteTwoToneIcon color="success" fontSize="large" />
            <Typography variant="body1" component="h3">
              <strong>
                {t('finances.personalFinances.header.incomes.title')}
              </strong>
            </Typography>
          </Stack>

          <IncomeEditDialog
            data={incomes}
            onSubmit={update}
            disabled={isLoading}
          />
        </Stack>
        {isLoading ? (
          <>
            <Skeleton width="60%" height={32} />
            <Skeleton width="50%" height={24} />
          </>
        ) : incomes.length ? (
          <>
            <Typography variant="body1" gutterBottom>
              {t('finances.personalFinances.header.incomes.total')}:{' '}
              {formatCurrency(total)}
            </Typography>
            {Boolean(nextExtraordinaryIncome) && (
              <>
                <Typography variant="body2" color={'text.secondary'}>
                  {t(
                    'finances.personalFinances.header.incomes.nextExtraordinaryPayment'
                  )}
                  : {formatCurrency(nextExtraordinaryIncome!.amount)}
                </Typography>
                <Typography variant="caption" color={'text.secondary'}>
                  {dayjs(nextExtraordinaryIncome!.date).format('DD MMM YYYY')}
                </Typography>
              </>
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
