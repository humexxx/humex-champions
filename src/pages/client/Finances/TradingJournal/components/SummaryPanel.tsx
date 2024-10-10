import { Box, Grid, Paper, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface Props {
  trades: number;
  percentage: number;
  amount: number;
  monthlyGrowth: number;
}

const SummaryPanel = ({ trades, percentage, amount, monthlyGrowth }: Props) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={3} style={{ padding: '20px', borderRadius: '10px' }}>
      <Typography variant="h5" gutterBottom>
        {t('finances.tradingJournal.summaryPanel.title')}
      </Typography>
      <Divider />
      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={6}>
          <Box textAlign="center">
            <Typography variant="h6" color="textSecondary">
              {t('finances.tradingJournal.summaryPanel.trades')}
            </Typography>
            <Typography variant="h4" color="primary">
              {trades}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {percentage}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box textAlign="center">
            <Typography variant="h6" color="textSecondary">
              {t('finances.tradingJournal.summaryPanel.amount')}
            </Typography>
            <Typography variant="h4" color="primary">
              ${amount.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box textAlign="center">
            <Typography variant="h6" color="textSecondary">
              {t('finances.tradingJournal.summaryPanel.monthlyGrowth')}
            </Typography>
            <Typography
              variant="h4"
              color={monthlyGrowth >= 0 ? 'success.main' : 'error.main'}
              display="inline"
            >
              {monthlyGrowth >= 0 ? (
                <TrendingUpIcon fontSize="large" />
              ) : (
                <TrendingDownIcon fontSize="large" />
              )}
              {Math.abs(monthlyGrowth)}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SummaryPanel;
