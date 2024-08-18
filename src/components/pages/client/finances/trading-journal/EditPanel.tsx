import { yupResolver } from '@hookform/resolvers/yup';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  IconButton,
  Pagination,
} from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CurrencyField } from 'src/components/common/forms';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { ITrade } from 'src/models/finances';

type Props = {
  trades: ITrade[];
  onSubmit: (trades: ITrade[]) => void;
};

const EditPanel = ({ trades, onSubmit }: Props) => {
  const { t } = useTranslation();
  const schema = useMemo(() => {
    return yup.object().shape({
      trades: yup
        .array()
        .of(
          yup.object().shape({
            pl: yup
              .number()
              .nonNullable()
              .required(t('commonValidations.required'))
              .typeError(t('commonValidations.required')),
            instrument: yup
              .string()
              .required(t('commonValidations.required'))
              .oneOf(['stock', 'forex', 'crypto']),
          })
        )
        .min(1),
    });
  }, [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
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

  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const _onSubmit = (data: { trades?: ITrade[] }) => {
    onSubmit(data.trades || []);
  };

  const totalPages = Math.ceil(fields.length / itemsPerPage);

  const currentFields = fields.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  function handleAddOnClick() {
    append({ pl: 0, instrument: '' });
  }

  useEffect(() => {
    setPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    const _trades = [...trades];
    if (!_trades.length) _trades.push({ pl: 0, instrument: '' });
    setValue('trades', _trades);
  }, [trades, setValue]);

  return (
    <Box component="form" onSubmit={handleSubmit(_onSubmit)}>
      <Box sx={{ height: 228 }}>
        <Grid container spacing={2} alignItems="center">
          {currentFields.map((field, index) => (
            <Fragment key={field.id}>
              <Grid item xs={5}>
                <Controller
                  name={`trades.${index}.pl`}
                  control={control}
                  render={({ field }) => (
                    <CurrencyField
                      {...field}
                      label={t('finances.tradingJournal.editPanel.pl')}
                      error={!!errors.trades?.[index]?.pl}
                      helperText={errors.trades?.[index]?.pl?.message}
                      fullWidth
                      margin="dense"
                      size="small"
                      variant="filled"
                    />
                  )}
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
                      size="small"
                      variant="filled"
                    >
                      <MenuItem value="stock">Stock</MenuItem>
                      <MenuItem value="forex">Forex</MenuItem>
                      <MenuItem value="crypto">Crypto</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton color="error" onClick={() => remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Fragment>
          ))}
        </Grid>
      </Box>
      <Grid container mt={4}>
        <Grid item xs={4}>
          <Button onClick={handleAddOnClick} startIcon={<AddIcon />}>
            {t('finances.tradingJournal.editPanel.addTrade')}
          </Button>
        </Grid>
        <Grid item xs={8} textAlign="right" flexDirection="column">
          {fields.length > itemsPerPage - 1 && (
            <Pagination
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              siblingCount={0}
              boundaryCount={1}
            />
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: fields.length > itemsPerPage - 1 ? 2 : 0,
              mr: 2,
            }}
          >
            {t('finances.tradingJournal.editPanel.submit')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditPanel;
