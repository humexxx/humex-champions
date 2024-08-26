import { useMemo, useState, useEffect, Fragment } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  DialogActions,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IDebt, IFinancialPlan } from 'src/models/finances';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'src/utils';
import { CurrencyField } from 'src/components/forms';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

interface Props {
  financialPlan: IFinancialPlan;
  onSubmit: (debts: IDebt[]) => void;
}

const ValidateMainFinantialSnapshotDialog = ({
  financialPlan,
  onSubmit,
}: Props) => {
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
              .moreThan(-1),
          })
        ),
      }),
    [t]
  );

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const lastSnapshot = financialPlan?.financialSnapshots.at(-1);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      debts: lastSnapshot?.debts || [],
    },
  });

  useEffect(() => {
    if (lastSnapshot && !lastSnapshot.reviewed) {
      setOpen(true);
      setValue('debts', lastSnapshot.debts);
    }
  }, [lastSnapshot, setValue]);

  const { fields } = useFieldArray({
    control,
    name: 'debts',
  });

  if (!lastSnapshot) return null;

  const prevSnapshot =
    financialPlan.financialSnapshots.length > 1
      ? financialPlan.financialSnapshots.at(-2)
      : lastSnapshot;

  const handleClose = () => setOpen(false);

  const _handleSubmit = (data: { debts?: { pendingDebt: number }[] }) => {
    if (!data.debts) return;
    handleClose();
    onSubmit(
      lastSnapshot.debts.map((debt, index) => ({
        ...debt,
        pendingDebt: data.debts![index].pendingDebt,
      }))
    );
  };

  const debts = watch('debts');
  const totalNewDebt = debts?.reduce(
    (sum, debt) => sum + (debt.pendingDebt || 0),
    0
  );

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      component={'form'}
      onSubmit={handleSubmit(_handleSubmit)}
      disableEscapeKeyDown
      {...{ autoComplete: 'off' }}
    >
      <DialogTitle>
        {t('finances.personalFinances.debtConfirmationDialog.title')}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" my={4}>
          {t('finances.personalFinances.debtConfirmationDialog.description')}
        </Typography>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ ml: 0, maxWidth: '100%' }}
        >
          {fields.map((item, index) => (
            <Fragment key={item.id}>
              <Grid item xs={6} textAlign="right">
                <Typography component="span" variant="subtitle2" marginTop={1}>
                  <strong>
                    {formatCurrency(prevSnapshot!.debts[index].pendingDebt)}
                  </strong>
                </Typography>
                <ArrowRightAltIcon
                  color="action"
                  sx={{ mr: 1, ml: 2, pt: '10px' }}
                />
              </Grid>
              <Grid item xs={6} justifyContent="center">
                <Controller
                  name={`debts.${index}.pendingDebt`}
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      {...field}
                      label={t(
                        'finances.personalFinances.debtConfirmationDialog.newDebt'
                      )}
                      fullWidth
                      error={!!errors?.debts?.[index]?.pendingDebt}
                      margin="dense"
                      size="small"
                      inputProps={{ min: 0 }}
                      sx={{ maxWidth: 160 }}
                    />
                  )}
                />
              </Grid>
            </Fragment>
          ))}
        </Grid>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            mt: 4,
            borderTop: 1,
            borderColor: 'divider',
            ml: 0,
            maxWidth: '100%',
          }}
        >
          <Grid item xs={6}>
            <Typography variant="body1" textAlign="right">
              {t(
                'finances.personalFinances.debtConfirmationDialog.totalPreviousDebt'
              )}
              :{' '}
              <strong>
                {formatCurrency(
                  prevSnapshot!.debts.reduce(
                    (sum, debt) => sum + debt.pendingDebt,
                    0
                  )
                )}
              </strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              {t(
                'finances.personalFinances.debtConfirmationDialog.totalNewDebt'
              )}
              : <strong>{formatCurrency(totalNewDebt ?? 0)}</strong>
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button type="submit">
          {t('finances.personalFinances.debtConfirmationDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidateMainFinantialSnapshotDialog;
