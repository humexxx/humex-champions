import { useEffect, useState } from 'react';

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
import { CurrencyField, PercentageField } from 'src/components/forms';
import { formatCurrency, normalizeObjectDates, toDayjs } from 'src/utils';
import { yupDayjs } from 'src/yup';
import * as yup from 'yup';
import { PeriodType, PERIOD_TYPES } from '@shared/enums/finance';

interface Props {
  onSubmit: (data: IIncome[]) => void;
  data: IIncome[];
  disabled?: boolean;
}

const schema = yup.object().shape({
  incomes: yup.array().of(
    yup.object().shape({
      name: yup
        .string()
        .required('This field is required')
        .nonNullable()
        .max(64),
      amount: yup
        .number()
        .nonNullable()
        .typeError('This field is required')
        .required('This field is required')
        .moreThan(-1),
      period: yup
        .mixed<PeriodType>()
        .oneOf(Object.values(PERIOD_TYPES), 'Invalid type')
        .required('This field is required')
        .nonNullable(),
      date: yupDayjs.nonNullable(),
    })
  ),
  useTrading: yup.boolean().default(true),
  tradingPercentage: yup.number(),
});

const IncomeEditDialog = ({ onSubmit, data }: Props) => {
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
    if (open) {
      setValue(
        'incomes',
        normalizeObjectDates<IIncome[]>(
          data.sort((x) => x.amount).reverse(),
          toDayjs
        )
      );
      setIndexToEdit(0);
    }
  }, [data, setValue, open]);

  const incomes = watch('incomes');

  function _handleSubmit(_data: { incomes?: IIncome[] }) {
    if (!_data.incomes) return;

    setOpen(false);
    onSubmit(normalizeObjectDates<IIncome[]>(_data.incomes, toDayjs));
  }

  function handleOnNewIncome() {
    append({
      amount: 0,
      period: PERIOD_TYPES.MONTHLY,
      name: `Income ${fields.length + 1}`,
    });
    setIndexToEdit(fields.length);
  }

  function onRemove(index: number) {
    setIndexToEdit((prev) => {
      const incomesCount = (incomes?.length ?? 0) - 1;
      if (incomesCount === 1) return 0;
      if (prev === index && index === incomesCount) return prev - 1;
      if (prev > index) return prev - 1;
      return prev;
    });

    remove(index);
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
          Manage Incomes
        </DialogTitle>

        <DialogContent>
          <Stack gap={4}>
            <Grid container spacing={2}>
              <Grid size={6}>
                {incomes?.length ? (
                  <Card variant={'outlined'}>
                    <CardContent key={`${indexToEdit}_${incomes.length}`}>
                      <Controller
                        name={`incomes.${indexToEdit}.name`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Name"
                            fullWidth
                            error={!!errors?.incomes?.[indexToEdit]?.name}
                            helperText={
                              errors?.incomes?.[indexToEdit]?.name?.message
                            }
                            slotProps={{
                              htmlInput: {
                                maxLength: 64,
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name={`incomes.${indexToEdit}.amount`}
                        control={control}
                        render={({ field }) => (
                          <CurrencyField
                            {...field}
                            label="Amount"
                            fullWidth
                            error={!!errors?.incomes?.[indexToEdit]?.amount}
                            helperText={
                              errors?.incomes?.[indexToEdit]?.amount?.message
                            }
                            slotProps={{
                              htmlInput: {
                                min: 0,
                              },
                            }}
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
                              label="Period"
                              fullWidth
                              select
                              error={!!errors?.incomes?.[indexToEdit]?.period}
                              helperText={
                                errors?.incomes?.[indexToEdit]?.period?.message
                              }
                            >
                              <MenuItem value={PERIOD_TYPES.SINGLE}>
                                Single
                              </MenuItem>
                              <MenuItem value={PERIOD_TYPES.WEEKLY}>
                                Weekly
                              </MenuItem>
                              <MenuItem value={PERIOD_TYPES.MONTHLY}>
                                Monthly
                              </MenuItem>
                              <MenuItem value={PERIOD_TYPES.YEARLY}>
                                Yearly
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
                                    errors?.incomes?.[indexToEdit]?.date
                                      ?.message,
                                },
                              }}
                              label="Date"
                              views={['year', 'month', 'day']}
                            />
                          )}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant={'outlined'}>
                    <CardContent>
                      <Typography variant="body1" gutterBottom>
                        There are no incomes defined yet.
                      </Typography>
                    </CardContent>
                  </Card>
                )}
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
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(i);
                          }}
                        >
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
                  label="Use Trading Profits for Income"
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
                      slotProps={{
                        htmlInput: {
                          min: 0,
                        },
                      }}
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
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IncomeEditDialog;
