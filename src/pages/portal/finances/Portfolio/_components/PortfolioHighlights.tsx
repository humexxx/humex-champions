import { Card, CardContent, Grid, Typography } from '@mui/material';
import ChangeChip from 'src/components/finance/ChangeChip';

interface PortfolioHighlightsProps {
  dailyGain: number;
  dailyGainPercentage: number;
  overallGain: number;
  overallGainPercentage: number;
}

const PortfolioHighlights = ({
  dailyGain,
  dailyGainPercentage,
  overallGain,
  overallGainPercentage,
}: PortfolioHighlightsProps) => {
  return (
    <Card>
      <CardContent sx={{ minWidth: 300 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Portfolio Highlights
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              DAILY GAIN
            </Typography>
            <ChangeChip
              change={dailyGain}
              changePercentage={dailyGainPercentage}
              size="large"
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              TOTAL GAIN
            </Typography>
            <ChangeChip
              change={overallGain}
              changePercentage={overallGainPercentage}
              size="large"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PortfolioHighlights;
