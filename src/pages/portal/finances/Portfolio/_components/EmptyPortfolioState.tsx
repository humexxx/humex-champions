import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  AccountBalance as PortfolioIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface EmptyPortfolioStateProps {
  onCreatePortfolio: () => void;
  loading?: boolean;
}

const EmptyPortfolioState: React.FC<EmptyPortfolioStateProps> = ({
  onCreatePortfolio,
  loading = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 600, textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            {/* Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <PortfolioIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>

            {/* Title */}
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Your Portfolio
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start tracking your investments by creating your first portfolio.
              Monitor performance, analyze holdings, and make informed decisions
              about your financial future.
            </Typography>

            {/* Features */}
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                What you can do:
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 20, color: 'success.main' }}
                  />
                  <Typography variant="body2">
                    Track real-time portfolio performance
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 20, color: 'success.main' }}
                  />
                  <Typography variant="body2">
                    Add buy/sell transactions for stocks, ETFs, and crypto
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 20, color: 'success.main' }}
                  />
                  <Typography variant="body2">
                    View detailed analytics and historical charts
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 20, color: 'success.main' }}
                  />
                  <Typography variant="body2">
                    Monitor gains, losses, and portfolio allocation
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* CTA Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={onCreatePortfolio}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Creating...' : 'Create Your First Portfolio'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmptyPortfolioState;
