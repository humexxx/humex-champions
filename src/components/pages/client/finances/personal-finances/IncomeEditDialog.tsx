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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
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
import { DatePicker } from '@mui/x-date-pickers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatCurrency } from 'src/utils';
import dayjs from 'dayjs';

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
            singleDate: yup.date().nullable(),
          })
        ),
        useTrading: yup.boolean().default(true),
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

  function _handleSubmit(data: { incomes?: IIncome[] }) {
    if (!data.incomes) return;

    handleClose();
    onSubmit(incomes ?? []);
  }

  useEffect(() => {
    setValue('incomes', data);
  }, [data, setValue]);

  const incomes = watch('incomes');

  function handleOnNewIncome() {
    append({
      amount: 0,
      period: 'monthly',
      name: `${t('finances.personalFinances.header.incomes.dialog.income')} ${fields.length + 1}`,
    });
    setExpanded(`panel${fields.length}`);
  }

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
        <DialogTitle
          sx={{
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {t('finances.personalFinances.header.incomes.dialog.title')}
          <Button
            type="button"
            onClick={handleOnNewIncome}
            startIcon={<AddIcon />}
          >
            {t('finances.personalFinances.header.incomes.dialog.addIncome')}
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
                            Object.values(errors?.incomes?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'inherit'
                          }
                        >
                          {incomes![index].name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            Object.values(errors?.incomes?.[index] ?? {})
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
                              {incomes![index].period !== 'single'
                                ? incomes![index].period
                                : dayjs(incomes![index].singleDate).format(
                                    'DD MMM YYYY'
                                  )}
                            </Box>
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography
                          color={
                            Object.values(errors?.incomes?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'text.secondary'
                          }
                        >
                          {formatCurrency(incomes![index].amount)}
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
                        name={`incomes.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={t(
                              'finances.personalFinances.header.incomes.dialog.name'
                            )}
                            fullWidth
                            error={!!errors?.incomes?.[index]?.name}
                            helperText={
                              errors?.incomes?.[index]?.name?.message || ' '
                            }
                            margin="dense"
                            size="small"
                            variant="filled"
                            inputProps={{ maxLength: 64 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
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
                            size="small"
                            variant="filled"
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
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
                            size="small"
                            variant="filled"
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
                    </Grid>
                    {Boolean(incomes![index].period === 'single') && (
                      <Grid item xs={4}>
                        <Controller
                          name={`incomes.${index}.singleDate`}
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  error: !!errors?.incomes?.[index]?.singleDate,
                                  helperText:
                                    errors?.incomes?.[index]?.singleDate
                                      ?.message || ' ',
                                  margin: 'dense',
                                  variant: 'filled',
                                },
                              }}
                              label={t(
                                'finances.personalFinances.header.incomes.dialog.date'
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
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleClose}>
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
