import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../../../firebase';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PORTFOLIO_CONSTANTS } from '@shared/consts';
import AssetSearchAutocomplete from './AssetSearchAutocomplete';
import SelectedAssetView from './SelectedAssetView';
import { Asset, TransactionFormData, TransactionDialogProps } from './types';

// Firebase Functions
const getAssetPrice = httpsCallable(functions, 'getAssetPrice');

// Validation schema
const transactionSchema = yup.object({
  assetId: yup.string().required('Asset is required'),
  type: yup
    .string()
    .oneOf(
      Object.values(PORTFOLIO_CONSTANTS.TRANSACTION_TYPES) as ['BUY', 'SELL']
    )
    .required('Transaction type is required'),
  quantity: yup
    .number()
    .positive('Quantity must be positive')
    .required('Quantity is required'),
  price: yup
    .number()
    .positive('Price must be positive')
    .required('Price is required'),
  executedAt: yup.string().required('Date is required'),
  notes: yup.string().default(''),
});

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
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      type: PORTFOLIO_CONSTANTS.TRANSACTION_TYPES.BUY as 'BUY',
      executedAt: new Date().toISOString().split('T')[0],
      notes: '',
      assetId: '',
      quantity: 0,
      price: 0,
    },
  });

  // Asset search state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'stock' | 'etf' | 'crypto'
  >('all');
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watched form values
  const watchedQuantity = watch('quantity');
  const watchedPrice = watch('price');
  const watchedType = watch('type');

  // Calculate total value
  const totalValue = useMemo(() => {
    if (watchedQuantity && watchedPrice) {
      return watchedQuantity * watchedPrice;
    }
    return 0;
  }, [watchedQuantity, watchedPrice]);

  // Handle asset selection
  const handleAssetSelect = async (asset: Asset | null) => {
    setSelectedAsset(asset);
    setError(null);

    if (!asset) {
      setValue('assetId', '');
      setValue('price', 0);
      return;
    }

    setValue('assetId', asset.symbol);

    // If we have a price from search, use it
    if (asset.price) {
      setValue('price', asset.price);
      return;
    }

    // Otherwise, fetch detailed price
    setAssetDetailsLoading(true);
    try {
      const result = await getAssetPrice({ symbol: asset.symbol });
      const priceData = result.data as any;

      if (priceData.price) {
        setValue('price', priceData.price);
        // Update the selected asset with fresh data
        setSelectedAsset({
          ...asset,
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
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
      await onSubmit(data);
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
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: '600px' },
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
        <Box component="form" sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Asset Selection */}
            {selectedAsset ? (
              <SelectedAssetView asset={selectedAsset} />
            ) : (
              <AssetSearchAutocomplete
                selectedAsset={selectedAsset}
                onAssetSelect={handleAssetSelect}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                loading={assetDetailsLoading}
                error={error}
              />
            )}

            {/* Transaction Type and Date */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Transaction Type">
                      <MenuItem value="BUY">Buy</MenuItem>
                      <MenuItem value="SELL">Sell</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>

              <Controller
                name="executedAt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date"
                    type="date"
                    sx={{ flex: 1 }}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={!!errors.executedAt}
                    helperText={errors.executedAt?.message}
                  />
                )}
              />
            </Box>

            {/* Quantity and Price */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity"
                    type="number"
                    sx={{ flex: 1 }}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 0.000001,
                      },
                    }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                  />
                )}
              />

              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price per Unit"
                    type="number"
                    sx={{ flex: 1 }}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon />
                        </InputAdornment>
                      ),
                      endAdornment: assetDetailsLoading && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Box>

            {/* Total Value Display */}
            {totalValue > 0 && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography variant="h6" color="primary">
                  Total Value: $
                  {totalValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {watchedType} {watchedQuantity} shares at ${watchedPrice} each
                </Typography>
              </Box>
            )}

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Add any additional notes about this transaction..."
                />
              )}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          disabled={isSubmitting || !selectedAsset}
          startIcon={isSubmitting && <CircularProgress size={16} />}
        >
          {isSubmitting ? 'Adding...' : `Add ${watchedType || 'Transaction'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDialog;
