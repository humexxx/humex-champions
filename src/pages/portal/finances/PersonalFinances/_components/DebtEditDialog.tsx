import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  Box,
  TextField,
  Stack,
  List,
  Card,
  CardContent,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IDebt } from '@shared/models/finances';
import dayjs from 'dayjs';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CurrencyField, PercentageField } from 'src/components/forms';
import { formatCurrency, normalizeObjectDates, toDayjs } from 'src/utils';
import { yupDayjs } from 'src/yup';
import * as yup from 'yup';

interface Props {
  onSubmit: (data: IDebt[]) => void;
  data: IDebt[];
  disabled?: boolean;
}

const DebtEditDialog = ({ onSubmit, data, disabled }: Props) => {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object().shape({
        debts: yup.array().of(
          yup.object().shape({
            name: yup
              .string()
              .nonNullable()
              .required(t('commonValidations.required'))
              .max(64),
            pendingDebt: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .typeError(t('commonValidations.required'))
              .moreThan(-1),
            minimumPayment: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .typeError(t('commonValidations.required'))
              .moreThan(-1),
            annualInterest: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .typeError(t('commonValidations.required'))
              .moreThan(-1),
            startDate: yupDayjs
              .nonNullable()
              .required(t('commonValidations.required')),
          })
        ),
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
      debts: normalizeObjectDates<IDebt[]>(data, toDayjs),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'debts',
  });

  const [indexToEdit, setIndexToEdit] = useState(0);

  useEffect(() => {
    setValue(
      'debts',
      normalizeObjectDates<IDebt[]>(data, toDayjs)
        .sort((x) => x.pendingDebt)
        .reverse()
    );
  }, [data, setValue]);

  const debts = watch('debts');

  const handleOpen = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).blur();
    setOpen(true);
  };

  const handleOnNewDebt = () => {
    append({
      name: `${t('finances.personalFinances.header.debts.dialog.debt')} ${
        fields.length + 1
      }`,
      pendingDebt: 0,
      minimumPayment: 0,
      annualInterest: 0,
      startDate: dayjs(),
    });
    setIndexToEdit(fields.length);
  };

  function _handleSubmit(data: { debts?: IDebt[] }) {
    if (!data.debts) return;

    setOpen(false);
    onSubmit(normalizeObjectDates(data.debts, toDayjs));
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        disabled={disabled}
        aria-label="Edit debts"
      >
        <EditIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        component="form"
        closeAfterTransition={false}
        onSubmit={handleSubmit(_handleSubmit)}
        {...{ autoComplete: 'off' }}
      >
        <DialogTitle
          sx={{
            textTransform: 'capitalize',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {t('finances.personalFinances.header.debts.dialog.title')}
        </DialogTitle>

        <DialogContent>
          <Stack gap={4}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Card variant={'outlined'}>
                  <CardContent key={indexToEdit}>
                    <Controller
                      name={`debts.${indexToEdit}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Debt Name"
                          fullWidth
                          error={!!errors?.debts?.[indexToEdit]?.name}
                          helperText={
                            errors?.debts?.[indexToEdit]?.name?.message
                          }
                        />
                      )}
                    />
                    <Stack direction={'row'} gap={2}>
                      <Controller
                        name={`debts.${indexToEdit}.pendingDebt`}
                        control={control}
                        render={({ field }) => (
                          <CurrencyField
                            {...field}
                            label={'Pending Debt'}
                            fullWidth
                            error={!!errors?.debts?.[indexToEdit]?.pendingDebt}
                            helperText={
                              errors?.debts?.[indexToEdit]?.pendingDebt?.message
                            }
                            slotProps={{
                              htmlInput: {
                                min: 0,
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name={`debts.${indexToEdit}.minimumPayment`}
                        control={control}
                        render={({ field }) => (
                          <CurrencyField
                            {...field}
                            label={'Minimum Payment'}
                            fullWidth
                            error={
                              !!errors?.debts?.[indexToEdit]?.minimumPayment
                            }
                            helperText={
                              errors?.debts?.[indexToEdit]?.minimumPayment
                                ?.message
                            }
                            slotProps={{
                              htmlInput: {
                                min: 0,
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>

                    <Stack direction={'row'} gap={2}>
                      <Controller
                        name={`debts.${indexToEdit}.annualInterest`}
                        control={control}
                        render={({ field }) => (
                          <PercentageField
                            {...field}
                            label={'Annual Interest'}
                            fullWidth
                            error={
                              !!errors?.debts?.[indexToEdit]?.annualInterest
                            }
                            helperText={
                              errors?.debts?.[indexToEdit]?.annualInterest
                                ?.message
                            }
                            slotProps={{
                              htmlInput: {
                                min: 0,
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name={`debts.${indexToEdit}.startDate`}
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
                                error:
                                  !!errors?.debts?.[indexToEdit]?.startDate,
                                helperText:
                                  errors?.debts?.[indexToEdit]?.startDate
                                    ?.message,
                              },
                            }}
                            label={'Start Date'}
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
                  {debts?.map((x, i) => (
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
                          secondary={formatCurrency(x.pendingDebt)}
                        />
                        <IconButton color="error" onClick={() => remove(i)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Stack direction={'row'} justifyContent={'flex-end'} p={2}>
                  <Button startIcon={<AddIcon />} onClick={handleOnNewDebt}>
                    Add Debt
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={() => setOpen(false)}>
            {t('finances.personalFinances.header.debts.dialog.cancel')}
          </Button>
          <Button type="submit">
            {t('finances.personalFinances.header.debts.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DebtEditDialog;
