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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FixedExpenseEditDialogProps,
  IFixedExpense,
} from './PersonalFinances.types';
import { NumericFormatInput } from 'src/components/common';

const expenseSchema = yup.object().shape({
  expenses: yup.array().of(
    yup.object().shape({
      amount: yup
        .number()
        .required('Amount is required')
        .positive('Amount must be greater than 0')
        .transform((value, originalValue) =>
          String(originalValue).trim() === '' ? undefined : value
        ),
      expenseType: yup
        .string()
        .oneOf(['primary', 'secondary'], 'Invalid expense type')
        .required('Expense type is required'),
    })
  ),
});

const FixedExpenseEditDialog = ({
  onSubmit,
  data,
}: FixedExpenseEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(expenseSchema),
    defaultValues: {
      expenses: data,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expenses',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function _handleSubmit(data: { expenses?: IFixedExpense[] }) {
    if (!data.expenses) return;

    handleClose();
    onSubmit(data.expenses);
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
        <DialogTitle>Edit Fixed Expenses</DialogTitle>
        <DialogContent>
          {fields.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={item.id}>
              <Grid item xs={6}>
                <Controller
                  name={`expenses.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Amount"
                      fullWidth
                      error={!!errors?.expenses?.[index]?.amount}
                      helperText={
                        errors?.expenses?.[index]?.amount?.message || ' '
                      }
                      margin="dense"
                      InputProps={{
                        inputComponent: NumericFormatInput as any,
                      }}
                      inputProps={{ allowNegative: false }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name={`expenses.${index}.expenseType`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expense Type"
                      fullWidth
                      select
                      error={!!errors?.expenses?.[index]?.expenseType}
                      helperText={
                        errors?.expenses?.[index]?.expenseType?.message || ' '
                      }
                      margin="dense"
                    >
                      <MenuItem value="primary">Primary</MenuItem>
                      <MenuItem value="secondary">Secondary</MenuItem>
                    </TextField>
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
                  amount: 0,
                  expenseType: 'primary',
                })
              }
              startIcon={<AddIcon />}
              disabled={fields.length >= 5}
            >
              Add Expense
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

export default FixedExpenseEditDialog;
