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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IncomeEditDialogProps, IncomeProps } from './PersonalFinances.types';
import { NumericFormatInput } from 'src/components/common';

const incomeSchema = yup.object().shape({
  incomes: yup.array().of(
    yup.object().shape({
      amount: yup
        .number()
        .required('Amount is required')
        .positive('Amount must be a > 0')
        .transform((value, originalValue) =>
          String(originalValue).trim() === '' ? undefined : value
        ),
      period: yup
        .string()
        .oneOf(['Weekly', 'Monthly', 'Yearly'], 'Invalid period')
        .required('Period is required'),
    })
  ),
  useTrading: yup.boolean().default(true),
});

const IncomeEditDialog = ({ onSubmit, data }: IncomeEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(incomeSchema),
    defaultValues: {
      incomes: data,
      useTrading: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'incomes',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function _handleSubmit(data: {
    incomes?: IncomeProps[];
    useTrading: boolean;
  }) {
    handleClose();
    onSubmit(data.incomes!);
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
        <DialogTitle>Edit Income</DialogTitle>
        <DialogContent>
          {fields.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={item.id}>
              <Grid item xs={5}>
                <Controller
                  name={`incomes.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Amount"
                      fullWidth
                      error={!!errors?.incomes?.[index]?.amount}
                      helperText={
                        errors?.incomes?.[index]?.amount?.message || ' '
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
              <Grid item xs={5}>
                <Controller
                  name={`incomes.${index}.period`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Period"
                      fullWidth
                      select
                      error={!!errors?.incomes?.[index]?.period}
                      helperText={
                        errors?.incomes?.[index]?.period?.message || ' '
                      }
                      margin="dense"
                    >
                      <MenuItem value="Weekly">Weekly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Yearly">Yearly</MenuItem>
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
          <FormControlLabel
            control={
              <Controller
                name="useTrading"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value} />
                )}
              />
            }
            label="Add trading data"
          />
          <Box mt={2}>
            <Button
              type="button"
              onClick={() => append({ amount: 0, period: 'Monthly' })}
              startIcon={<AddIcon />}
              disabled={fields.length >= 5}
            >
              Add Income
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

export default IncomeEditDialog;
