import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Edit as EditIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Grid,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
  Stack,
  ListItem,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IIncome } from '@shared/models/finances';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CurrencyField, PercentageField } from 'src/components/forms';
import { formatCurrency, normalizeObjectDates, toDayjs } from 'src/utils';
import { yupDayjs } from 'src/yup';
import * as yup from 'yup';

interface Props {
  onSubmit: (data: IIncome[]) => void;
  data: IIncome[];
  disabled?: boolean;
}

const IncomeEditDialog = ({ onSubmit, data, disabled }: Props) => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        incomes: yup.array().of(
          yup.object().shape({
            name: yup
              .string()
              .required(t('commonValidations.required'))
              .nonNullable()
              .max(64),
            amount: yup
              .number()
              .nonNullable()
              .typeError(t('commonValidations.required'))
              .required(t('commonValidations.required'))
              .moreThan(-1),
            period: yup
              .string()
              .oneOf(
                ['single', 'weekly', 'monthly', 'yearly'],
                t('commonValidations.type')
              )
              .required(t('commonValidations.required'))
              .nonNullable(),
            date: yupDayjs.nonNullable(),
          })
        ),
        useTrading: yup.boolean().default(true),
        tradingPercentage: yup.number(),
      }),
    [t]
  );

  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      incomes: normalizeObjectDates<IIncome[]>(data, toDayjs),
      useTrading: false,
      tradingPercentage: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'incomes',
  });

  const [indexToEdit, setIndexToEdit] = useState(0);

  useEffect(() => {
    setValue(
      'incomes',
      normalizeObjectDates(data.sort((x) => x.amount).reverse(), toDayjs)
    );
  }, [data, setValue]);

  const incomes = watch('incomes');

  function _handleSubmit(_data: { incomes?: IIncome[] }) {
    if (!_data.incomes) return;

    setOpen(false);
    onSubmit(normalizeObjectDates<IIncome[]>(_data.incomes, toDayjs));
  }

  function handleOnNewIncome() {
    append({
      amount: 0,
      period: 'monthly',
      name: `${t('finances.personalFinances.header.incomes.dialog.income')} ${fields.length + 1}`,
    });
    setIndexToEdit(fields.length);
  }

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label="Edit incomes">
        <EditIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        component={'form'}
        closeAfterTransition={false}
        onSubmit={handleSubmit(_handleSubmit)}
        {...{ autoComplete: 'off' }}
      >
        <DialogTitle
          sx={{
            textTransform: 'capitalize',
          }}
        >
          {t('finances.personalFinances.header.incomes.dialog.title')}
        </DialogTitle>
        <DialogContent>
          <Stack gap={4}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Card variant={'outlined'}>
                  <CardContent key={indexToEdit}>
                    <Controller
                      name={`incomes.${indexToEdit}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={t(
                            'finances.personalFinances.header.incomes.dialog.name'
                          )}
                          fullWidth
                          error={!!errors?.incomes?.[indexToEdit]?.name}
                          helperText={
                            errors?.incomes?.[indexToEdit]?.name?.message
                          }
                          inputProps={{ maxLength: 64 }}
                        />
                      )}
                    />
                    <Controller
                      name={`incomes.${indexToEdit}.amount`}
                      control={control}
                      render={({ field }) => (
                        <CurrencyField
                          {...field}
                          label={t(
                            'finances.personalFinances.header.incomes.dialog.amount'
                          )}
                          fullWidth
                          error={!!errors?.incomes?.[indexToEdit]?.amount}
                          helperText={
                            errors?.incomes?.[indexToEdit]?.amount?.message
                          }
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />

                    <Stack direction={'row'} gap={2}>
                      <Controller
                        name={`incomes.${indexToEdit}.period`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={t(
                              'finances.personalFinances.header.incomes.dialog.period'
                            )}
                            fullWidth
                            select
                            error={!!errors?.incomes?.[indexToEdit]?.period}
                            helperText={
                              errors?.incomes?.[indexToEdit]?.period?.message
                            }
                          >
                            <MenuItem value="single">
                              {t(
                                'finances.personalFinances.header.incomes.dialog.periods.single'
                              )}
                            </MenuItem>
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
                      <Controller
                        name={`incomes.${indexToEdit}.date`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            value={field.value ?? null}
                            slotProps={{
                              textField: {
                                variant: 'filled',
                                margin: 'dense',
                                size: 'small',
                                fullWidth: true,
                                error: !!errors?.incomes?.[indexToEdit]?.date,
                                helperText:
                                  errors?.incomes?.[indexToEdit]?.date?.message,
                              },
                            }}
                            label={t(
                              'finances.personalFinances.header.incomes.dialog.date'
                            )}
                            views={['year', 'month', 'day']}
                          />
                        )}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={6}>
                <List sx={{ py: 0 }} dense>
                  {incomes?.map((x, i) => (
                    <ListItem key={i}>
                      <ListItemButton
                        sx={{ borderRadius: 2 }}
                        selected={i === indexToEdit}
                        onClick={() => setIndexToEdit(i)}
                      >
                        <ListItemText
                          primary={
                            x.name ? (
                              x.name
                            ) : (
                              <Box color={'error.main'}>Not Defined</Box>
                            )
                          }
                          secondary={formatCurrency(x.amount)}
                        />
                        <IconButton color="error" onClick={() => remove(i)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Stack direction={'row'} justifyContent={'flex-end'} p={2}>
                  <Button startIcon={<AddIcon />} onClick={handleOnNewIncome}>
                    Add Income
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <Divider />
            <Grid container>
              <Grid size={{ xs: 12, md: 6 }} sx={{ px: 4 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Use Trading Profits</strong>
                </Typography>

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
                  label={t(
                    'finances.personalFinances.header.incomes.dialog.useTrading'
                  )}
                />
                <Controller
                  name={'tradingPercentage'}
                  control={control}
                  render={({ field }) => (
                    <PercentageField
                      {...field}
                      label={'Withdrawal Profit Percentage'}
                      fullWidth
                      error={!!errors?.tradingPercentage}
                      helperText={errors?.tradingPercentage?.message || ' '}
                      margin="dense"
                      inputProps={{ min: 0 }}
                      disabled
                    />
                  )}
                />
                <Typography variant="caption">
                  If this is active and you have trading profits for the month,
                  the percentage you choose will be automatically added to the
                  income.
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpen(false)}>
            {t('finances.personalFinances.header.incomes.dialog.cancel')}
          </Button>
          <Button type="submit">
            {t('finances.personalFinances.header.incomes.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IncomeEditDialog;
