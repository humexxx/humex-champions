import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface CreatePortfolioFormData {
  name: string;
  currency: string;
  isDefault: boolean;
}

interface CreatePortfolioDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (portfolioData: CreatePortfolioFormData) => Promise<void>;
  loading?: boolean;
}

// Validation schema
const portfolioSchema = yup.object({
  name: yup
    .string()
    .required('Portfolio name is required')
    .min(3, 'Portfolio name must be at least 3 characters')
    .max(50, 'Portfolio name must be less than 50 characters'),
  currency: yup.string().required('Currency is required'),
  isDefault: yup.boolean().default(false),
});

const CreatePortfolioDialog: React.FC<CreatePortfolioDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreatePortfolioFormData>({
    resolver: yupResolver(portfolioSchema),
    defaultValues: {
      name: '',
      currency: 'USD',
      isDefault: true,
    },
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onFormSubmit = async (data: CreatePortfolioFormData) => {
    try {
      setError(null);
      await onSubmit(data);
      handleClose();
    } catch (err: any) {
      console.error('Error creating portfolio:', err);
      setError(err.message || 'Failed to create portfolio. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon />
          <Typography variant="h6">Create New Portfolio</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                A portfolio helps you track your investments across different
                assets. You can add transactions, monitor performance, and
                analyze your holdings over time.
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Portfolio Name"
                  placeholder="e.g., My Investment Portfolio"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Base Currency"
                  fullWidth
                  error={!!errors.currency}
                  helperText={
                    errors.currency?.message ||
                    'All values will be displayed in this currency'
                  }
                />
              )}
            />

            <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch checked={field.value} onChange={field.onChange} />
                  }
                  label="Set as default portfolio"
                />
              )}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting || loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          disabled={isSubmitting || loading}
          startIcon={isSubmitting || loading ? undefined : <AddIcon />}
        >
          {isSubmitting || loading ? 'Creating...' : 'Create Portfolio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePortfolioDialog;
