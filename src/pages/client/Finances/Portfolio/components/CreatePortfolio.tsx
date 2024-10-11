import { Alert, Autocomplete, Container, Grid, TextField } from '@mui/material';
import { useInstruments } from '../hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IInstrument } from '@shared/models/instruments';
import { CurrencyField, PercentageField } from 'src/components/forms';
import { LoadingButton } from '@mui/lab';
import { PieChart } from '@mui/x-charts';
import { IPortfolioSnapshot } from '@shared/models/finances';
import { toDayjs } from 'src/utils';
import { Dayjs } from 'dayjs';

interface Props {
  onSubmit: (data: IPortfolioSnapshot<Dayjs>) => Promise<void>;
  pageLoading: boolean;
}

const CreatePortfolio = ({ onSubmit, pageLoading }: Props) => {
  const { instruments, isLoading, error } = useInstruments();
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object().shape({
        initialAmount: yup.number().required(t('commonValidations.required')),
        instrument: yup
          .object()
          .shape({
            id: yup.string().required(),
            name: yup.string().required(),
            value: yup.number().required(),
          })
          .nullable()
          .required(t('commonValidations.required')),
        allocationPercentage: yup
          .number()
          .required(t('commonValidations.required')),
      }),
    [t]
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      initialAmount: 0,
      instrument: undefined,
      allocationPercentage: 100,
    },
  });

  async function _onSubmit(data: yup.InferType<typeof schema>) {
    try {
      await onSubmit({
        date: toDayjs(new Date()),
        totalValue: data.initialAmount,
        instruments: [
          {
            ...data.instrument,
            positionPercentage: data.allocationPercentage,
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const instrument = watch('instrument');
  const allocation = watch('allocationPercentage');

  return (
    <Container
      component="form"
      onSubmit={handleSubmit(_onSubmit)}
      maxWidth="md"
      sx={{ ml: '0 !important' }}
    >
      <Grid
        container
        spacing={4}
        sx={{
          flexDirection: { xs: 'column-reverse', md: 'row' },
        }}
      >
        <Grid item container sm={12} md={5} lg={6} spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="instrument"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  loading={isLoading}
                  options={instruments}
                  getOptionLabel={(option: IInstrument) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('finances.portfolio.createPortfolio.instrument')}
                      placeholder={t(
                        'finances.portfolio.createPortfolio.instrumentPlaceholder'
                      )}
                      error={!!errors.instrument}
                      helperText={
                        errors.instrument ? t('commonValidations.required') : ''
                      }
                    />
                  )}
                  onChange={(_, value) => field.onChange(value)}
                  value={field.value || null}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="initialAmount"
              control={control}
              render={({ field }) => (
                <CurrencyField
                  {...field}
                  label={t('finances.portfolio.createPortfolio.amount')}
                  error={!!errors.initialAmount}
                  fullWidth
                  helperText={
                    errors.initialAmount ? t('commonValidations.required') : ''
                  }
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="allocationPercentage"
              control={control}
              render={({ field }) => (
                <PercentageField
                  {...field}
                  label={t('finances.portfolio.createPortfolio.allocation')}
                  error={!!errors.allocationPercentage}
                  fullWidth
                  disabled
                  helperText={
                    errors.allocationPercentage
                      ? t('commonValidations.required')
                      : ''
                  }
                />
              )}
            />
          </Grid>
          <Grid item xs={12} textAlign="right">
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={pageLoading}
            >
              {t('common.submit')}
            </LoadingButton>
          </Grid>
        </Grid>
        <Grid item container sm={12} md={7} lg={6}>
          {Boolean(instrument && allocation) && (
            <PieChart
              series={[
                {
                  data: [{ id: 0, value: allocation, label: instrument.name }],
                },
              ]}
              width={400}
              height={200}
              // no funciona lo del width
              sx={{
                width: {
                  xs: 400,
                  sm: 250,
                  md: 400,
                },
                height: {
                  xs: 200,
                  sm: 150,
                  md: 200,
                },
              }}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreatePortfolio;
