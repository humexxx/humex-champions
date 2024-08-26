import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { Card, CardContent } from '@mui/material';
import { DenseAnalyticCardProps } from './Dashboard.types';

const iconSX = {
  fontSize: '0.75rem',
  color: 'inherit',
  marginLeft: 0,
  marginRight: 0,
};

export default function DenseAnalyticCard({
  title,
  count,
  percentage,
  isLoss = false,
  extra,
}: DenseAnalyticCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Grid container alignItems="center">
            <Grid item>
              <Typography variant="h4" color="inherit">
                {count}
              </Typography>
            </Grid>
            {percentage && (
              <Grid item>
                <Chip
                  variant="filled"
                  color={isLoss ? 'error' : 'success'}
                  icon={
                    isLoss ? (
                      <TrendingDownIcon style={iconSX} />
                    ) : (
                      <TrendingUpIcon style={iconSX} />
                    )
                  }
                  label={`${percentage}%`}
                  sx={{ ml: 1.25, pl: 1 }}
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </Stack>
        <Box sx={{ pt: 2.25 }}>
          <Typography variant="caption" color="text.secondary">
            You made an extra{' '}
            <Typography
              variant="caption"
              sx={{ color: `${isLoss ? 'error' : 'success'}.main` }}
            >
              {extra}
            </Typography>{' '}
            this month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
