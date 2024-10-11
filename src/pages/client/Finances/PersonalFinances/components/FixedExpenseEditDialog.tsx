import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IFixedExpense } from '@shared/models/finances';
import dayjs from 'dayjs';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CurrencyField } from 'src/components/forms';
import { formatCurrency } from 'src/utils';
import * as yup from 'yup';

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
              .required(t('commonValidations.required'))
              .max(64),
            amount: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .typeError(t('commonValidations.required'))
              .moreThan(-1),
            expenseType: yup
              .string()
              .nonNullable()
              .oneOf(
                ['primary', 'secondary', 'single'],
                t('commonValidations.type')
              )
              .required(t('commonValidations.required')),
            singleDate: yup.date().nullable(),
          })
        ),
      }),
    [t]
  );

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string>('panel0');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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

  const expenses = watch('expenses');

  function handleOnNewExpense() {
    append({
      amount: 0,
      expenseType: 'primary',
      name: `${t('finances.personalFinances.header.fixedExpenses.dialog.fixedExpense')} ${fields.length + 1}`,
    });
    setExpanded(`panel${fields.length}`);
  }

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
        <DialogTitle
          sx={{
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {t('finances.personalFinances.header.fixedExpenses.dialog.title')}
          <Button
            type="button"
            onClick={handleOnNewExpense}
            startIcon={<AddIcon />}
          >
            {t(
              'finances.personalFinances.header.fixedExpenses.dialog.addFixedExpense'
            )}
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box p={4}>
            {fields.map((item, index) => (
              <Accordion
                key={item.id}
                expanded={expanded === `panel${index}`}
                onChange={() => setExpanded(`panel${index}`)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}bh-content`}
                  id={`panel${index}bh-header`}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  {expanded !== `panel${index}` ? (
                    <>
                      <Box sx={{ width: '75%' }} mr={1}>
                        <Typography
                          color={
                            Object.values(errors?.expenses?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'inherit'
                          }
                        >
                          {expenses![index].name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            Object.values(errors?.expenses?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'text.secondary'
                          }
                        >
                          {
                            <Box
                              component="span"
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {expenses![index].expenseType !== 'single'
                                ? expenses![index].expenseType
                                : dayjs(expenses![index].singleDate).format(
                                    'DD MMM YYYY'
                                  )}
                            </Box>
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography
                          color={
                            Object.values(errors?.expenses?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'text.secondary'
                          }
                        >
                          {formatCurrency(expenses![index].amount)}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <IconButton onClick={() => remove(index)} size="small">
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} alignItems="center" key={item.id}>
                    <Grid item xs={8}>
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
                              errors?.expenses?.[index]?.expenseType?.message ||
                              ' '
                            }
                            margin="dense"
                            inputProps={{ maxLength: 64 }}
                            variant="filled"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
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
                            inputProps={{ min: 0 }}
                            variant="filled"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
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
                              errors?.expenses?.[index]?.expenseType?.message ||
                              ' '
                            }
                            margin="dense"
                            variant="filled"
                          >
                            <MenuItem value="single">
                              {t(
                                'finances.personalFinances.header.fixedExpenses.dialog.expenseTypes.single'
                              )}
                            </MenuItem>
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
                    {Boolean(expenses![index].expenseType === 'single') && (
                      <Grid item xs={4}>
                        <Controller
                          name={`expenses.${index}.singleDate`}
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              value={field.value ?? null}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  error:
                                    !!errors?.expenses?.[index]?.singleDate,
                                  helperText:
                                    errors?.expenses?.[index]?.singleDate
                                      ?.message || ' ',
                                  margin: 'dense',
                                  variant: 'filled',
                                },
                              }}
                              label={t(
                                'finances.personalFinances.header.fixedExpenses.dialog.date'
                              )}
                              views={['year', 'month', 'day']}
                            />
                          )}
                        />
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleClose}>
            {t('finances.personalFinances.header.fixedExpenses.dialog.cancel')}
          </Button>
          <Button type="submit">
            {t('finances.personalFinances.header.fixedExpenses.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FixedExpenseEditDialog;
