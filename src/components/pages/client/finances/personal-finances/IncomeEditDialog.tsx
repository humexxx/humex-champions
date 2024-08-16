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
  Checkbox,
  FormControlLabel,
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
import { IIncome } from 'src/models/finances';
import { useTranslation } from 'react-i18next';

interface Props {
  onSubmit: (data: IIncome[]) => void;
  data: IIncome[];
  sx?: SxProps;
  loading?: boolean;
}

const IncomeEditDialog = ({ onSubmit, data, loading, sx }: Props) => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        incomes: yup.array().of(
          yup.object().shape({
            amount: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .moreThan(-1),
            period: yup
              .string()
              .oneOf(
                ['weekly', 'monthly', 'yearly'],
                t('commonValidations.type')
              )
              .required(t('commonValidations.required'))
              .nonNullable(),
          })
        ),
        useTrading: yup.boolean().default(true),
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

  function _handleSubmit(data: { incomes?: Omit<IIncome, 'startDate'>[] }) {
    if (!data.incomes) return;

    handleClose();
    onSubmit(data.incomes.map((item) => ({ ...item, startDate: new Date() })));
  }

  useEffect(() => {
    setValue('incomes', data);
  }, [data, setValue]);

  return (
    <>
      <Tooltip
        title={t('finances.personalFinances.header.incomes.dialog.title')}
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
          {t('finances.personalFinances.header.incomes.dialog.title')}
        </DialogTitle>
        <DialogContent>
          {fields.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={item.id}>
              <Grid item xs={5}>
                <Controller
                  name={`incomes.${index}.amount`}
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      {...field}
                      label={t(
                        'finances.personalFinances.header.incomes.dialog.amount'
                      )}
                      fullWidth
                      error={!!errors?.incomes?.[index]?.amount}
                      helperText={
                        errors?.incomes?.[index]?.amount?.message || ' '
                      }
                      margin="dense"
                      inputProps={{ min: 0 }}
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
                      label={t(
                        'finances.personalFinances.header.incomes.dialog.period'
                      )}
                      fullWidth
                      select
                      error={!!errors?.incomes?.[index]?.period}
                      helperText={
                        errors?.incomes?.[index]?.period?.message || ' '
                      }
                      margin="dense"
                    >
                      <MenuItem value="weekly">
                        {t(
                          'finances.personalFinances.header.incomes.dialog.periods.weekly'
                        )}
                      </MenuItem>
                      <MenuItem value="monthly">
                        {t(
                          'finances.personalFinances.header.incomes.dialog.periods.monthly'
                        )}
                      </MenuItem>
                      <MenuItem value="yearly">
                        {t(
                          'finances.personalFinances.header.incomes.dialog.periods.yearly'
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
          <FormControlLabel
            control={
              <Controller
                name="useTrading"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value} disabled />
                )}
              />
            }
            label="Add trading data"
          />
          <Box mt={2}>
            <Button
              type="button"
              onClick={() => append({ amount: 0, period: 'monthly' })}
              startIcon={<AddIcon />}
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
