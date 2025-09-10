import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { formatCurrency } from 'src/utils';
import { TransactionGridRow } from './Page';

interface ApprovalConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: TransactionGridRow | null;
  loading?: boolean;
}

export const ApprovalConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  transaction,
  loading = false,
}: ApprovalConfirmDialogProps) => {
  if (!transaction) {
    onClose();
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-description"
    >
      <DialogTitle id="approval-dialog-title">Approve Transaction</DialogTitle>
      <DialogContent>
        <DialogContent id="approval-dialog-description">
          Are you sure you want to approve transaction{' '}
          <strong>{transaction.id}</strong> for{' '}
          <strong>{formatCurrency(transaction.amount)}</strong>?
          <br />
          <br />
          This action will:
          <ul>
            <li>Mark the transaction as approved</li>
            <li>Activate the corresponding portfolio holding</li>
          </ul>
          <br />
          This action is irreversible
        </DialogContent>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={onConfirm}
          variant="contained"
          loading={loading}
          autoFocus
        >
          Approve
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
