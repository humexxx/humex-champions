import { Box, Button, ButtonGroup } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IOperation } from 'src/models/finances';

type Props = {
  operations: IOperation[];
  periodFilter: 'day' | 'week' | 'month';
};

const OperationsHistoryChart = ({ operations }: Props) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'profit' | 'balance'>('profit');

  const data = useMemo(
    () =>
      operations.map((operation) => ({
        date: operation.date.toDate(),
        value:
          filter === 'balance'
            ? operation.balanceEnd
            : operation.balanceEnd - operation.balanceStart,
      })),
    [operations, filter]
  );

  return (
    <Box height={250}>
      <Box textAlign="center">
        <ButtonGroup aria-label="profit/balance filter" disableElevation>
          <Button
            variant={filter === 'profit' ? 'contained' : 'outlined'}
            onClick={() => setFilter('profit')}
          >
            {t('finances.tradingJournal.operationsHistoryChart.filters.profit')}
          </Button>
          <Button
            variant={filter === 'balance' ? 'contained' : 'outlined'}
            onClick={() => setFilter('balance')}
          >
            {t(
              'finances.tradingJournal.operationsHistoryChart.filters.balance'
            )}
          </Button>
        </ButtonGroup>
      </Box>
      <LineChart
        xAxis={[{ scaleType: 'utc', data: data.map((d) => d.date) }]}
        series={[
          {
            data: data.map((d) => d.value),
          },
        ]}
      />
    </Box>
  );
};

export default OperationsHistoryChart;
