import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { IPortfolioTransaction } from '@shared/types/finances';
import { useMemo } from 'react';
import { formatCurrency } from 'src/utils';
import { SortField, SortOrder } from './index';

interface ActivityTableProps {
  transactions: IPortfolioTransaction[];
  sortBy: SortField;
  sortOrder: SortOrder;
}

const ActivityTable = ({
  transactions,
  sortBy,
  sortOrder,
}: ActivityTableProps) => {
  const apiRef = useGridApiRef();

  // Definir columnas del DataGrid
  const columns: GridColDef<IPortfolioTransaction>[] = useMemo(
    () => [
      {
        field: 'type',
        headerName: 'Type',
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params.value.toUpperCase()}
            size="small"
            color={params.value === 'buy' ? 'success' : 'error'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'assetId',
        headerName: 'Asset',
        width: 120,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'executedAt',
        headerName: 'Date',
        width: 120,
        type: 'date',
        valueGetter: (value: any) => (value ? new Date(value.valueOf()) : null),
      },
      {
        field: 'quantity',
        headerName: 'Qty',
        type: 'number',
        width: 120,
        valueFormatter: (value: number) => value.toLocaleString(),
      },
      {
        field: 'purchasePrice',
        headerName: 'Price',
        type: 'number',
        width: 120,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'totalAmount',
        headerName: 'Total',
        type: 'number',
        width: 120,
        valueFormatter: (value: number) => formatCurrency(value),
        renderCell: (params) => (
          <Typography
            variant="body2"
            fontWeight="500"
            sx={{
              color: params.row.type === 'buy' ? 'error.main' : 'success.main',
            }}
          >
            {params.row.type === 'buy' ? '-' : '+'}${params.value.toFixed(2)}
          </Typography>
        ),
      },
      {
        field: 'fees',
        headerName: 'Fees',
        type: 'number',
        width: 100,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={params.value === 'approved' ? 'success' : 'warning'}
            variant="filled"
          />
        ),
      },
    ],
    []
  );

  if (transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No recent activity</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        disableColumnMenu
        hideFooter
        apiRef={apiRef}
        columns={columns}
        rows={transactions}
        initialState={{
          sorting: {
            sortModel: [{ field: sortBy, sort: sortOrder }],
          },
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        }}
        sortModel={[{ field: sortBy, sort: sortOrder }]}
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        sx={{
          '& .MuiDataGrid-cell--textLeft': {
            textAlign: 'left',
          },
        }}
      />
    </Box>
  );
};

export default ActivityTable;
