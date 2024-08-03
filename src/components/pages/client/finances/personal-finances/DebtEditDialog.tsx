import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DebtEditDialogProps, DebtProps } from './PersonalFinances.types';

const debtSchema = yup.object().shape({
  debts: yup.array().of(
    yup.object().shape({
      pendingDebt: yup
        .number()
        .required('Pending debt is required')
        .positive('Pending debt must be greater than 0')
        .transform((value, originalValue) =>
          String(originalValue).trim() === '' ? undefined : value
        ),
      minimumPayment: yup
        .number()
        .required('Minimum payment is required')
        .positive('Minimum payment must be greater than 0')
        .transform((value, originalValue) =>
          String(originalValue).trim() === '' ? undefined : value
        ),
      annualInterest: yup
        .number()
        .required('Annual interest is required')
        .positive('Annual interest must be greater than 0')
        .transform((value, originalValue) =>
          String(originalValue).trim() === '' ? undefined : value
        ),
    })
  ),
});

const DebtEditDialog = ({ onSubmit, data }: DebtEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(debtSchema),
    defaultValues: {
      debts: data,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'debts',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function _handleSubmit(data: { debts?: DebtProps[] }) {
    if (!data.debts) return;

    handleClose();
    onSubmit(data.debts);
  }

  return (
    <>
      <IconButton onClick={handleOpen}>
        <EditIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        fullScreen={fullScreen}
        component={'form'}
        onSubmit={handleSubmit(_handleSubmit)}
      >
        <DialogTitle>Edit Debt</DialogTitle>
        <DialogContent>
          {fields.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={item.id}>
              <Grid item xs={4}>
                <Controller
                  name={`debts.${index}.pendingDebt`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Pending Debt"
                      fullWidth
                      error={!!errors?.debts?.[index]?.pendingDebt}
                      helperText={
                        errors?.debts?.[index]?.pendingDebt?.message || ' '
                      }
                      margin="dense"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name={`debts.${index}.minimumPayment`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Minimum Payment"
                      fullWidth
                      error={!!errors?.debts?.[index]?.minimumPayment}
                      helperText={
                        errors?.debts?.[index]?.minimumPayment?.message || ' '
                      }
                      margin="dense"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name={`debts.${index}.annualInterest`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Annual Interest (%)"
                      fullWidth
                      error={!!errors?.debts?.[index]?.annualInterest}
                      helperText={
                        errors?.debts?.[index]?.annualInterest?.message || ' '
                      }
                      margin="dense"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2} textAlign="center">
                <IconButton
                  disabled={!index}
                  onClick={() => remove(index)}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box mt={2}>
            <Button
              type="button"
              onClick={() =>
                append({
                  pendingDebt: 0,
                  minimumPayment: 0,
                  annualInterest: 0,
                })
              }
              startIcon={<AddIcon />}
              disabled={fields.length >= 5}
            >
              Add Debt
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DebtEditDialog;
