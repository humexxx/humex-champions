import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  SnackbarCloseReason,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IDebt } from '@shared/types/finances';
import dayjs from 'dayjs';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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
  const schema = yup.object().shape({
    debts: yup.array().of(
      yup.object().shape({
        name: yup
          .string()
          .nonNullable()
          .required('This field is required')
          .max(64),
        pendingDebt: yup
          .number()
          .nonNullable()
          .moreThan(0, 'Has to be greater than 0')
          .required('This field is required')
          .typeError('This field is required'),
        minimumPayment: yup
          .number()
          .nonNullable()
          .required('This field is required')
          .typeError('This field is required')
          .moreThan(-1),
        annualInterest: yup
          .number()
          .nonNullable()
          .required('This field is required')
          .typeError('This field is required')
          .moreThan(-1),
        startDate: yupDayjs.nonNullable().required('This field is required'),
      })
    ),
  });

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
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(
        'debts',
        normalizeObjectDates<IDebt[]>(data, toDayjs)
          .sort((x) => x.pendingDebt)
          .reverse()
      );
      setIndexToEdit(0);
    }
  }, [data, setValue, open]);

  const debts = watch('debts');

  const handleOpen = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).blur();
    setOpen(true);
  };

  const handleOnNewDebt = () => {
    if (fields.length >= 5) {
      setIsAlertOpen(true);
      return;
    }

    append({
      name: `Debt ${fields.length + 1}`,
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

  const handleAlertClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsAlertOpen(false);
  };

  function onRemove(index: number) {
    setIndexToEdit((prev) => {
      const debtsCount = (debts?.length ?? 0) - 1;
      if (debtsCount === 1) return 0;
      if (prev === index && index === debtsCount) return prev - 1;
      if (prev > index) return prev - 1;
      return prev;
    });

    remove(index);
  }

  return (
    <>
      <Snackbar
        open={isAlertOpen}
        autoHideDuration={3000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Are you really that broke? Just kidding, you cannot add more than 5
          debts for now.
        </Alert>
      </Snackbar>

      <IconButton
        onClick={handleOpen}
        disabled={disabled}
        aria-label="Edit debts"
      >
        <EditIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason == 'backdropClick') return;
          setOpen(false);
        }}
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
          Debts
        </DialogTitle>

        <DialogContent>
          <Stack gap={4}>
            <Grid container spacing={2}>
              <Grid size={6}>
                {debts?.length ? (
                  <Card variant={'outlined'}>
                    <CardContent key={`${indexToEdit}_${debts?.length}`}>
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
                              error={
                                !!errors?.debts?.[indexToEdit]?.pendingDebt
                              }
                              helperText={
                                errors?.debts?.[indexToEdit]?.pendingDebt
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
                ) : (
                  <Card variant={'outlined'}>
                    <CardContent>
                      <Typography variant="body1" color="textSecondary">
                        There are no debts to edit. Click "Add Debt" to create a
                        new one.
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid size={6}>
                <List sx={{ py: 0, overflowY: 'auto' }} dense>
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
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DebtEditDialog;
