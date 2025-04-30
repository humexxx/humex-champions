import { useMemo } from 'react';

import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IOperation } from '@shared/models/finances';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'src/utils';

interface HistoryRecord {
  id: string;
  operation: string;
  amount: number;
  date: Dayjs;
}

type Props = {
  operations: IOperation[];
};

const TradingHistory = ({ operations }: Props) => {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      operations
        .sort((a, b) => a.date.diff(b.date))
        .map((operation, i) => {
          const _rows: HistoryRecord[] = [];
          if (operation.trades.length) {
            operation.trades.forEach((trade, j) => {
              _rows.push({
                id: `${i}-trade-${j}`,
                operation: trade.instrument,
                amount: trade.pl,
                date: operation.date,
              });
            });
          }
          if (operation.transactions?.length) {
            operation.transactions.forEach((transaction, i) => {
              _rows.push({
                id: `${i}-transaction-${i}`,
                operation: transaction.type,
                amount: transaction.amount,
                date: operation.date,
              });
            });
          }
          return _rows;
        })
        .flat(),
    [operations]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
      },
      {
        field: 'operation',
        headerName: t(
          'finances.tradingJournal.operationsHistory.columns.operation'
        ),
        flex: 1,
        valueGetter: (value: string) =>
          Boolean(value) && value[0].toUpperCase() + value.slice(1),
      },
      {
        field: 'date',
        headerName: t('finances.tradingJournal.operationsHistory.columns.date'),
        valueFormatter: (value: Dayjs) => value.format('DD MMM'),
        type: 'date',
      },
      {
        field: 'amount',
        headerName: t(
          'finances.tradingJournal.operationsHistory.columns.amount'
        ),
        flex: 1,
        valueFormatter: formatCurrency,
        type: 'number',
      },
    ],
    [t]
  );

  return (
    <Box height="286px">
      <DataGrid
        density="compact"
        rows={rows}
        columns={columns}
        disableColumnMenu
        disableAutosize
        hideFooter
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false,
            },
          },
        }}
      />
    </Box>
  );
};

export default TradingHistory;
