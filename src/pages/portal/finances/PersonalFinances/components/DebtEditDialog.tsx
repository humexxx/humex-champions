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
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Box,
  SxProps,
  Tooltip,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { IDebt } from '@shared/models/finances';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CurrencyField, PercentageField } from 'src/components/forms';
import {
  formatCurrency,
  formatPercentage,
  objectDateConverter,
  toDayjs,
} from 'src/utils';
import * as yup from 'yup';

interface Props {
  onSubmit: (data: IDebt<Dayjs>[]) => void;
  data: IDebt<Dayjs>[];
  sx?: SxProps;
  loading?: boolean;
  disabled?: boolean;
}

const DebtEditDialog = ({ onSubmit, data, sx, loading, disabled }: Props) => {
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
            startDate: yup
              .date()
              .nonNullable()
              .required(t('commonValidations.required')),
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
      debts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'debts',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function _handleSubmit(data: { debts?: IDebt[] }) {
    if (!data.debts) return;

    handleClose();
    onSubmit(objectDateConverter(data.debts, toDayjs));
  }

  useEffect(() => {
    setValue(
      'debts',
      objectDateConverter(data, (date: Dayjs) => date.toDate())
        .sort((x: any) => x.pendingDebt)
        .reverse()
    );
  }, [data, setValue]);

  const debts = watch('debts');

  const handleOnNewDebt = () => {
    append({
      name: `${t('finances.personalFinances.header.debts.dialog.debt')} ${
        fields.length + 1
      }`,
      pendingDebt: 0,
      minimumPayment: 0,
      annualInterest: 0,
      startDate: dayjs() as any,
    });
    setExpanded(`panel${fields.length}`);
  };

  return (
    <>
      <Tooltip title={t('finances.personalFinances.header.debts.dialog.title')}>
        <Box sx={{ display: 'inline-block', ...sx }}>
          <IconButton onClick={handleOpen} disabled={loading || disabled}>
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
          {t('finances.personalFinances.header.debts.dialog.title')}
          <Button
            type="button"
            onClick={handleOnNewDebt}
            startIcon={<AddIcon />}
          >
            {t('finances.personalFinances.header.debts.dialog.addDebt')}
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box p={4}>
            {fields.map((item, index) => (
              <Accordion
                key={item.id}
                expanded={expanded === `panel${index}`}
                onChange={() => setExpanded(`panel${index}`)}
                variant="outlined"
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
                            Object.values(errors?.debts?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'inherit'
                          }
                        >
                          {debts![index].name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            Object.values(errors?.debts?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'text.secondary'
                          }
                        >
                          {formatPercentage(debts![index].annualInterest)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography
                          color={
                            Object.values(errors?.debts?.[index] ?? {})
                              .length && expanded !== `panel${index}`
                              ? 'error.main'
                              : 'text.secondary'
                          }
                        >
                          {formatCurrency(debts![index].pendingDebt)}
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
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                      <Controller
                        name={`debts.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={t(
                              'finances.personalFinances.header.debts.dialog.name'
                            )}
                            fullWidth
                            error={!!errors?.debts?.[index]?.name}
                            helperText={
                              errors?.debts?.[index]?.name?.message || ' '
                            }
                            margin="dense"
                            variant="filled"
                            inputProps={{ maxLength: 64 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Controller
                        name={`debts.${index}.startDate`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            value={field.value ?? null}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error: !!errors?.debts?.[index]?.startDate,
                                helperText:
                                  errors?.debts?.[index]?.startDate?.message ||
                                  ' ',
                                margin: 'dense',
                                variant: 'filled',
                              },
                            }}
                            label={t(
                              'finances.personalFinances.header.debts.dialog.startDate'
                            )}
                            views={['year', 'month', 'day']}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Controller
                        name={`debts.${index}.pendingDebt`}
                        control={control}
                        render={({ field }) => (
                          <CurrencyField
                            {...field}
                            label={t(
                              'finances.personalFinances.header.debts.dialog.pendingDebt'
                            )}
                            fullWidth
                            error={!!errors?.debts?.[index]?.pendingDebt}
                            helperText={
                              errors?.debts?.[index]?.pendingDebt?.message ||
                              ' '
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
                        name={`debts.${index}.minimumPayment`}
                        control={control}
                        render={({ field }) => (
                          <CurrencyField
                            {...field}
                            label={t(
                              'finances.personalFinances.header.debts.dialog.minPayment'
                            )}
                            fullWidth
                            error={!!errors?.debts?.[index]?.minimumPayment}
                            helperText={
                              errors?.debts?.[index]?.minimumPayment?.message ||
                              ' '
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
                        name={`debts.${index}.annualInterest`}
                        control={control}
                        render={({ field }) => (
                          <PercentageField
                            {...field}
                            label={t(
                              'finances.personalFinances.header.debts.dialog.anualInterest'
                            )}
                            fullWidth
                            error={!!errors?.debts?.[index]?.annualInterest}
                            helperText={
                              errors?.debts?.[index]?.annualInterest?.message ||
                              ' '
                            }
                            margin="dense"
                            inputProps={{ min: 0 }}
                            variant="filled"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleClose}>
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
