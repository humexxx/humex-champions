import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, TextField, MenuItem, Button, Box } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Trade } from '.';

const schema = yup.object().shape({
  trades: yup
    .array()
    .of(
      yup.object().shape({
        pl: yup.number().required('P/L is required'),
        instrument: yup.string().required('Instrument is required'),
      })
    )
    .min(1, 'You must add at least one trade'),
});

const EditPanel = () => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      trades: [{ pl: 0, instrument: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'trades',
  });

  const onSubmit = (data: { trades?: Trade[] }) => {
    console.log('Submitted data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <Grid container spacing={2} key={field.id} alignItems="center">
          <Grid item xs={5}>
            <TextField
              label={t('finances.tradingJournal.editPanel.pl')}
              {...register(`trades.${index}.pl`)}
              error={!!errors.trades?.[index]?.pl}
              helperText={errors.trades?.[index]?.pl?.message}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={5}>
            <Controller
              name={`trades.${index}.instrument`}
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t('finances.tradingJournal.editPanel.instrument')}
                  {...field}
                  fullWidth
                  error={!!errors.trades?.[index]?.instrument}
                  helperText={errors.trades?.[index]?.instrument?.message}
                  margin="dense"
                >
                  <MenuItem value="stock">Stock</MenuItem>
                  <MenuItem value="forex">Forex</MenuItem>
                  <MenuItem value="crypto">Crypto</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => remove(index)}
            >
              {t('finances.tradingJournal.editPanel.delete')}
            </Button>
          </Grid>
        </Grid>
      ))}
      <Box mt={2}>
        <Button
          variant="contained"
          onClick={() => append({ pl: 0, instrument: '' })}
        >
          {t('finances.tradingJournal.editPanel.addTrade')}
        </Button>
      </Box>
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary">
          {t('finances.tradingJournal.editPanel.submit')}
        </Button>
      </Box>
    </form>
  );
};

export default EditPanel;
