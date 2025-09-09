import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { CALLABLE_FUNCTIONS } from '@shared/consts';
import { TransactionFormDataSchema } from '@shared/schemas/finances';
import { ICallableResponse } from '@shared/types';
import {
  AssetFilterType,
  GetAssetPriceInput,
  IAsset,
  IPriceData,
  TransactionFormData,
} from '@shared/types/finances/portfolio';
import dayjs from 'dayjs';
import { httpsCallable } from 'firebase/functions';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CurrencyField } from 'src/components/forms';
import { useAuth } from 'src/context/hooks';
import { functions } from '../../../../../../firebase';
import AssetSearchAutocomplete from './AssetSearchAutocomplete';
import SelectedAssetView from './SelectedAssetView';

// Component props interface
interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionFormData, asset: IAsset) => Promise<void>;
  portfolioId: string;
}

// Firebase Functions
const getAssetPrice = httpsCallable<
  GetAssetPriceInput,
  ICallableResponse<IPriceData>
>(functions, CALLABLE_FUNCTIONS.finances.portfolio.getAssetPrice);

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  open,
  onClose,
  onSubmit,
  portfolioId,
}) => {
  // Form state
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionFormDataSchema),
    defaultValues: {
      portfolioId,
      type: 'buy',
      executedAt: new Date().toISOString().split('T')[0],
      notes: '',
      assetId: '',
      quantity: 0,
      price: 0,
    },
  });
  const { isAdmin } = useAuth();

  // Asset search state
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<AssetFilterType>('all');
  const [showInternalProducts, setShowInternalProducts] = useState(true);
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watched form values
  const watchedType = watch('type');

  // Handle asset selection
  const handleAssetSelect = async (asset: IAsset | null) => {
    setSelectedAsset(asset);
    setError(null);

    setValue('quantity', 1);

    if (!asset) {
      setValue('assetId', '');
      setValue('price', 0);
      return;
    }

    setValue('assetId', asset.symbol);

    // For system assets, don't fetch price as it's fixed
    if (asset.isSystemAsset) {
      return;
    }

    // If it's a system asset or we have a price from search, use it
    if (!!asset.priceData) {
      setValue('price', asset.priceData.price);
      return;
    }

    // Otherwise, fetch detailed price for external assets
    setAssetDetailsLoading(true);
    try {
      const result = await getAssetPrice({ symbol: asset.symbol });
      const priceData = (result.data as any).data as IPriceData;

      if (priceData.price) {
        setValue('price', priceData.price);
        setSelectedAsset({
          ...asset,
          priceData,
        });
      }
    } catch (err: any) {
      console.error('Error getting asset price:', err);
      setError('Failed to get current price. Please enter manually.');
    } finally {
      setAssetDetailsLoading(false);
    }
  };

  // Form submission
  const onFormSubmit = async (data: TransactionFormData) => {
    try {
      setError(null);

      // Calculate total amount and add portfolio ID
      const transactionData: TransactionFormData = {
        ...data,
        portfolioId,
      };

      await onSubmit(transactionData, selectedAsset!);
      handleClose();
    } catch (err: any) {
      console.error('Error submitting transaction:', err);
      setError(err.message || 'Failed to add transaction. Please try again.');
    }
  };

  // Handle dialog close
  const handleClose = () => {
    reset();
    setSelectedAsset(null);
    setSelectedFilter('all');
    setShowInternalProducts(true);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      slotProps={{
        paper: {
          sx: { minHeight: '400px' },
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Add New Transaction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Portfolio: {portfolioId}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInternalProducts}
                onChange={(e) => setShowInternalProducts(e.target.checked)}
                color="primary"
                disabled={!!selectedAsset || !isAdmin}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {showInternalProducts
                    ? 'Internal Products'
                    : 'External Assets'}
                </Typography>
                <Chip
                  label={showInternalProducts ? 'HumEx' : 'Market'}
                  size="small"
                  color={showInternalProducts ? 'primary' : 'default'}
                  variant={showInternalProducts ? 'filled' : 'outlined'}
                />
              </Box>
            }
          />
        </Box>

        {/* Asset Selection */}
        {selectedAsset ? (
          <SelectedAssetView
            asset={selectedAsset}
            loading={assetDetailsLoading}
          />
        ) : (
          <AssetSearchAutocomplete
            selectedAsset={selectedAsset}
            onAssetSelect={handleAssetSelect}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            showInternalProducts={showInternalProducts}
            loading={assetDetailsLoading}
            error={error}
          />
        )}
        {!!selectedAsset && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convert string to number to ensure type consistency
                      field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                    }}
                    fullWidth
                    label="Quantity"
                    type="number"
                    disabled={selectedAsset?.isSystemAsset}
                    slotProps={{
                      htmlInput: {
                        step: 1,
                        min: 0,
                      },
                    }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ mt: 2 }}>
              <Controller
                name="executedAt"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Date"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) => field.onChange(d ? d.toISOString() : '')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.executedAt,
                        helperText: errors.executedAt?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <CurrencyField
                    fullWidth
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convert string to number to ensure type consistency
                      field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                    }}
                    label={
                      selectedAsset?.isSystemAsset ? 'Amount' : 'Price per Unit'
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                      },
                      input: {
                        endAdornment: assetDetailsLoading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={16} />
                          </InputAdornment>
                        ) : undefined,
                      },
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    disabled={assetDetailsLoading}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          loading={isSubmitting || assetDetailsLoading}
          disabled={!selectedAsset}
        >
          {isSubmitting ? 'Adding...' : `Add ${watchedType || 'Transaction'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDialog;
