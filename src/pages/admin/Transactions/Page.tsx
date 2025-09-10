import { Alert, Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { PageContainer } from 'src/components/layout';
import { formatCurrency } from 'src/utils';
import useAdminTransactions from './useAdminTransactions';

// Interface for DataGrid rows
interface TransactionGridRow {
  id: string;
  portfolioId: string;
  date: string;
  client: string;
  amount: number;
  status: string;
  authorizedBy: string;
}

const columns: GridColDef<TransactionGridRow>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'portfolioId',
    headerName: 'Portfolio ID',
    width: 150,
  },
  {
    field: 'date',
    headerName: 'Transaction Date',
    width: 150,
  },
  {
    field: 'name',
    headerName: 'Client',
    width: 150,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 110,
    valueFormatter: (params) => formatCurrency(params),
  },
  {
    field: 'status',
    headerName: 'Status',
    sortable: false,
    renderCell: (params) => {
      const status = params.value || 'pending';

      return (
        <Chip
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={
            status === 'approved'
              ? 'success'
              : status === 'rejected'
                ? 'error'
                : 'warning'
          }
        />
      );
    },
  },
  {
    field: 'authorizedBy',
    headerName: 'Authorized By',
    width: 160,
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 50,
  },
];

const TransactionsPage = () => {
  const { error, loading, transactions } = useAdminTransactions();

  // Transform transactions to grid format
  const gridRows = useMemo((): TransactionGridRow[] => {
    return transactions.map((transaction) => ({
      id: transaction.id,
      portfolioId: transaction.portfolioId,
      date: transaction.executedAt.format('YYYY-MM-DD'),
      client: transaction.username,
      amount: transaction.totalAmount,
      status: transaction.systemFlags!.status,
      authorizedBy: transaction.systemFlags!.approvedBy || ' ',
    }));
  }, [transactions]);

  return (
    <PageContainer title="Transactions">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          loading={loading}
          rows={gridRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
    </PageContainer>
  );
};

export default TransactionsPage;
