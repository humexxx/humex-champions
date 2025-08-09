import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import { IOperation, ITransaction } from '@shared/models/finances';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { CurrencyField } from 'src/components/forms';
import { useDialogFullScreen } from 'src/hooks';
import * as yup from 'yup';

type Props = {
  operations: IOperation[];
  onUpdate: (operations: IOperation) => void;
  day: dayjs.Dayjs;
  filter: 'day' | 'week' | 'month';
};

const BalanceTracker = ({ operations, onUpdate, day, filter }: Props) => {
  const [open, setOpen] = useState(false);
  const fullScreen = useDialogFullScreen();
  const [startOperation, setStartOperation] = useState<IOperation | null>(null);
  const [endOperation, setEndOperation] = useState<IOperation | null>(null);

  const schema = yup.object().shape({
    amount: yup
      .number()
      .nonNullable()
      .required('This field is required')
      .typeError('This field is required'),
    type: yup
      .string()
      .oneOf(['withdrawal', 'deposit'], 'This field is required')
      .required('This field is required')
      .nonNullable(),
    notes: yup.string(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
      type: 'deposit',
      notes: '',
    },
  });

  useEffect(() => {
    const sorted = operations.sort((a, b) => a.date.diff(b.date));
    setStartOperation(sorted[0]);
    setEndOperation(sorted[sorted.length - 1]);
  }, [operations]);

  const _handleSubmit = (data?: ITransaction) => {
    if (!data) {
      return;
    }
    onUpdate({
      ...(endOperation
        ? endOperation
        : {
            balanceStart: 0,
            balanceEnd: 0,
            date: dayjs(),
            notes: '',
            trades: [],
          }),
      transactions: [...(endOperation?.transactions ?? []), data],
    });
    reset();
    setOpen(false);
  };

  const canAddTransaction = useMemo(
    () => day.isSame(dayjs(), 'day') && filter === 'day',
    [day, filter]
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        disableEscapeKeyDown
        maxWidth="sm"
        component={'form'}
        onSubmit={handleSubmit(_handleSubmit)}
        {...{ autoComplete: 'off' }}
      >
        <DialogTitle>Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a new transaction to track your balance changes.
          </DialogContentText>
          <Grid container spacing={2} my={4}>
            <Grid item xs={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyField
                    {...field}
                    label={t(
                      'finances.tradingJournal.balanceTracker.transactionDialog.amount'
                    )}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    fullWidth
                    margin="dense"
                    variant="filled"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t(
                      'finances.tradingJournal.balanceTracker.transactionDialog.type'
                    )}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    fullWidth
                    margin="dense"
                    variant="filled"
                    select
                  >
                    <MenuItem value="widthrawal">
                      {t(
                        'finances.tradingJournal.balanceTracker.transactionDialog.types.withdrawal'
                      )}
                    </MenuItem>
                    <MenuItem value="deposit">
                      {t(
                        'finances.tradingJournal.balanceTracker.transactionDialog.types.deposit'
                      )}
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t(
                      'finances.tradingJournal.balanceTracker.transactionDialog.notes'
                    )}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    fullWidth
                    margin="dense"
                    variant="filled"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpen(false)}>
            {'Cancel'}
          </Button>
          <Button type="submit" color="primary">
            {'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <CurrencyField
            label={'Balance Start'}
            value={startOperation?.balanceStart ?? 0}
            disabled
          />
        </Grid>
        <Grid item xs={5}>
          <CurrencyField
            label={'Balance End'}
            value={endOperation?.balanceEnd ?? 0}
            disabled
          />
        </Grid>
        {Boolean(canAddTransaction) && (
          <Grid item xs={2}>
            <IconButton color="primary" onClick={() => setOpen(true)}>
              <PriceChangeIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default BalanceTracker;
