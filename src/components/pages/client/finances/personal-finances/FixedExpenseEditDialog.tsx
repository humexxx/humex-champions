import { useEffect, useMemo, useState } from 'react';
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
  SxProps,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CurrencyField } from 'src/components/common/forms';
import { IFixedExpense } from 'src/models/finances';
import { useTranslation } from 'react-i18next';

interface Props {
  onSubmit: (data: IFixedExpense[]) => void;
  data: IFixedExpense[];
  sx?: SxProps;
  loading?: boolean;
}

const FixedExpenseEditDialog = ({ onSubmit, data, loading, sx }: Props) => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        expenses: yup.array().of(
          yup.object().shape({
            name: yup
              .string()
              .nonNullable()
              .required(t('commonValidations.required')),
            amount: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .moreThan(-1),
            expenseType: yup
              .string()
              .nonNullable()
              .oneOf(['primary', 'secondary'], t('commonValidations.type'))
              .required(t('commonValidations.required')),
          })
        ),
      }),
    [t]
  );

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
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

  function _handleSubmit(data: {
    expenses?: Omit<IFixedExpense, 'startDate'>[];
  }) {
    if (!data.expenses) return;

    handleClose();
    onSubmit(data.expenses.map((item) => ({ ...item, startDate: new Date() })));
  }

  useEffect(() => {
    setValue('expenses', data);
  }, [data, setValue]);

  return (
    <>
      <Tooltip
        title={t('finances.personalFinances.header.fixedExpenses.dialog.title')}
      >
        <Box sx={{ display: 'inline-block', ...sx }}>
          <IconButton onClick={handleOpen} disabled={loading}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        component={'form'}
        onSubmit={handleSubmit(_handleSubmit)}
        {...{ autoComplete: 'off' }}
      >
        <DialogTitle sx={{ textTransform: 'capitalize' }}>
          {t('finances.personalFinances.header.fixedExpenses.dialog.title')}
        </DialogTitle>
        <DialogContent>
          {fields.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={item.id}>
              <Grid item xs={3}>
                <Controller
                  name={`expenses.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t(
                        'finances.personalFinances.header.fixedExpenses.dialog.name'
                      )}
                      fullWidth
                      error={!!errors?.expenses?.[index]?.expenseType}
                      helperText={
                        errors?.expenses?.[index]?.expenseType?.message || ' '
                      }
                      margin="dense"
                      size="small"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`expenses.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      {...field}
                      value={field.value.toString()}
                      label={t(
                        'finances.personalFinances.header.fixedExpenses.dialog.amount'
                      )}
                      fullWidth
                      error={!!errors?.expenses?.[index]?.amount}
                      helperText={
                        errors?.expenses?.[index]?.amount?.message || ' '
                      }
                      margin="dense"
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`expenses.${index}.expenseType`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t(
                        'finances.personalFinances.header.fixedExpenses.dialog.expenseType'
                      )}
                      fullWidth
                      select
                      error={!!errors?.expenses?.[index]?.expenseType}
                      helperText={
                        errors?.expenses?.[index]?.expenseType?.message || ' '
                      }
                      margin="dense"
                      size="small"
                    >
                      <MenuItem value="primary">
                        {t(
                          'finances.personalFinances.header.fixedExpenses.dialog.expenseTypes.primary'
                        )}
                      </MenuItem>
                      <MenuItem value="secondary">
                        {t(
                          'finances.personalFinances.header.fixedExpenses.dialog.expenseTypes.secondary'
                        )}
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={2} textAlign="center">
                <IconButton onClick={() => remove(index)} size="small">
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
                  name: '',
                })
              }
              startIcon={<AddIcon />}
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
