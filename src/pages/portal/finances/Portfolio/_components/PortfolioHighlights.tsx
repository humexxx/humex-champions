import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { formatCurrency, formatPercentage } from 'src/utils';

interface PortfolioHighlightsProps {
  dailyGain: number;
  dailyGainPercentage: number;
  overallGain: number;
  overallGainPercentage: number;
  cryptoPercentage: number;
}

const PortfolioHighlights = ({
  dailyGain,
  dailyGainPercentage,
  overallGain,
  overallGainPercentage,
  cryptoPercentage,
}: PortfolioHighlightsProps) => {
  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Portfolio Highlights
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              DAILY GAIN
            </Typography>
            <Box
              sx={{
                backgroundColor:
                  dailyGain >= 0 ? 'success.light' : 'error.light',
                color:
                  dailyGain >= 0
                    ? 'success.contrastText'
                    : 'error.contrastText',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {dailyGain >= 0 ? '+' : ''}
                {formatCurrency(dailyGain)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                {dailyGain >= 0 ? (
                  <TrendingUp sx={{ fontSize: 14 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 14 }} />
                )}
                <Typography variant="body2">
                  {formatPercentage(Math.abs(dailyGainPercentage))}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              TOTAL GAIN
            </Typography>
            <Box
              sx={{
                backgroundColor:
                  overallGain >= 0 ? 'success.light' : 'error.light',
                color:
                  overallGain >= 0
                    ? 'success.contrastText'
                    : 'error.contrastText',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {overallGain >= 0 ? '+' : ''}
                {formatCurrency(overallGain)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                {overallGain >= 0 ? (
                  <TrendingUp sx={{ fontSize: 14 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 14 }} />
                )}
                <Typography variant="body2">
                  {formatPercentage(overallGainPercentage)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'warning.main',
            }}
          />
          <Typography variant="body2">
            {cryptoPercentage}% cryptocurrencies
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PortfolioHighlights;
