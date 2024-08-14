import { useEffect, useMemo, useState } from 'react';
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
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IDebt } from 'src/types/models/finances';
import { useTranslation } from 'react-i18next';
import { CurrencyField, PercentageField } from 'src/components/common/forms';

interface Props {
  onSubmit: (data: IDebt[]) => void;
  data: IDebt[];
  sx?: SxProps;
  loading?: boolean;
}

const DebtEditDialog = ({ onSubmit, data, sx, loading }: Props) => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        debts: yup.array().of(
          yup.object().shape({
            pendingDebt: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .positive(t('commonValidations.positiveNumber')),
            minimumPayment: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .positive(t('commonValidations.positiveNumber')),
            annualInterest: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .positive(t('commonValidations.positiveNumber')),
            startDate: yup
              .string()
              .nonNullable()
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
      debts: data,
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
    onSubmit(data.debts);
  }

  useEffect(() => {
    setValue('debts', data);
  }, [data, setValue]);

  return (
    <>
      <Tooltip title={t('finances.personalFinances.header.debts.dialog.title')}>
        <IconButton onClick={handleOpen} sx={sx} disabled={loading}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        component={'form'}
        onSubmit={handleSubmit(_handleSubmit)}
      >
        <DialogTitle sx={{ textTransform: 'capitalize' }}>
          {t('finances.personalFinances.header.debts.dialog.title')}
        </DialogTitle>
        <DialogContent>
          {fields.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={item.id}>
              <Grid item xs={3}>
                <Controller
                  name={`debts.${index}.pendingDebt`}
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      {...field}
                      value={field.value.toString()}
                      size="small"
                      label={t(
                        'finances.personalFinances.header.debts.dialog.pendingDebt'
                      )}
                      fullWidth
                      error={!!errors?.debts?.[index]?.pendingDebt}
                      helperText={
                        errors?.debts?.[index]?.pendingDebt?.message || ' '
                      }
                      margin="dense"
                      inputProps={{ allowNegative: false }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`debts.${index}.minimumPayment`}
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      {...field}
                      value={field.value.toString()}
                      size="small"
                      label={t(
                        'finances.personalFinances.header.debts.dialog.minPayment'
                      )}
                      fullWidth
                      error={!!errors?.debts?.[index]?.minimumPayment}
                      helperText={
                        errors?.debts?.[index]?.minimumPayment?.message || ' '
                      }
                      margin="dense"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`debts.${index}.annualInterest`}
                  control={control}
                  render={({ field }) => (
                    <PercentageField
                      {...field}
                      value={field.value.toString()}
                      size="small"
                      label={t(
                        'finances.personalFinances.header.debts.dialog.anualInterest'
                      )}
                      fullWidth
                      error={!!errors?.debts?.[index]?.annualInterest}
                      helperText={
                        errors?.debts?.[index]?.annualInterest?.message || ' '
                      }
                      margin="dense"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`debts.${index}.startDate`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      size="small"
                      label={t(
                        'finances.personalFinances.header.debts.dialog.startDate'
                      )}
                      fullWidth
                      error={!!errors?.debts?.[index]?.startDate}
                      helperText={
                        errors?.debts?.[index]?.startDate?.message || ' '
                      }
                      margin="dense"
                    />
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
                  pendingDebt: 0,
                  minimumPayment: 0,
                  annualInterest: 0,
                  startDate: new Date().toISOString().split('T')[0],
                })
              }
              startIcon={<AddIcon />}
            >
              Add Debt
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

export default DebtEditDialog;
