import { Alert, Box, Button, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TransactionStatus } from '@shared/types/finances';
import { useMemo, useState } from 'react';
import { PageContainer } from 'src/components/layout';
import { formatCurrency } from 'src/utils';
import { ApprovalConfirmDialog } from './ApprovalConfirmDialog';
import useAdminTransactions from './useAdminTransactions';

// Interface for DataGrid rows
export interface TransactionGridRow {
  id: string;
  portfolioId: string;
  userId: string;
  date: string;
  client: string;
  amount: number;
  status: TransactionStatus;
  authorizedBy: string;
}

const TransactionsPage = () => {
  const { error, loading, transactions, approveTransaction } =
    useAdminTransactions();
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionGridRow | null>(null);

  // Handle approval button click
  const handleApprovalClick = (transaction: TransactionGridRow) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  // Handle approval confirmation
  const handleApprovalConfirm = async () => {
    if (!selectedTransaction) return;

    try {
      setApprovalLoading(true);
      await approveTransaction(
        selectedTransaction.userId,
        selectedTransaction.portfolioId,
        selectedTransaction.id
      );
      setDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error approving transaction:', error);
      // Error is handled by the hook and displayed in the alert
    } finally {
      setApprovalLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!approvalLoading) {
      setDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  // Define columns with access to handler functions
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
      field: 'client',
      headerName: 'User',
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
            variant="outlined"
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
      width: 200,
      renderCell: (params) => {
        const row = params.row;
        const isPending = row.status === 'pending';

        if (!isPending) {
          return null;
        }

        return (
          <Button
            onClick={() => handleApprovalClick(row)}
            disabled={approvalLoading}
            title="Approve Transaction"
            variant="outlined"
          >
            Approve
          </Button>
        );
      },
    },
  ];

  // Transform transactions to grid format
  const gridRows = useMemo((): TransactionGridRow[] => {
    return transactions.map((transaction) => ({
      id: transaction.id,
      portfolioId: transaction.portfolioId,
      userId: transaction.userId,
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

      {/* Approval Confirmation Dialog */}
      <ApprovalConfirmDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleApprovalConfirm}
        transaction={selectedTransaction || null}
        loading={approvalLoading}
      />
    </PageContainer>
  );
};

export default TransactionsPage;
