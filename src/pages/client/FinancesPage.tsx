import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import { Link } from 'react-router-dom';

const FinancesPage = () => {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Financial Summary
        </Typography>
        <Typography variant="body1">
          Here you could include a brief summary of personal finances, such as
          current balance, portfolio performance, etc.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Link
            unstable_viewTransition
            to="personal-finances"
            style={{ textDecoration: 'none' }}
          >
            <Card>
              <CardActionArea>
                <CardContent>
                  <BarChartIcon fontSize="large" />
                  <Typography
                    variant="h5"
                    component="div"
                    style={{
                      viewTransitionName: 'personal-finances',
                    }}
                  >
                    Personal Finances
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your personal finances and keep track of your
                    expenses and income.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link
            unstable_viewTransition
            to="trading-journal"
            style={{ textDecoration: 'none' }}
          >
            <Card>
              <CardActionArea>
                <CardContent>
                  <TrendingUpIcon fontSize="large" />
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ viewTransitionName: 'trading-journal' }}
                  >
                    Trading Journal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep a record of your trading activities and analyze your
                    performance.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={12} md={4}>
          <Link
            unstable_viewTransition
            to="portfolio"
            style={{ textDecoration: 'none' }}
          >
            <Card>
              <CardActionArea>
                <CardContent>
                  <PieChartIcon fontSize="large" />
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ viewTransitionName: 'portfolio' }}
                  >
                    Portfolio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your investment portfolio and monitor its
                    performance.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </>
  );
};

export default FinancesPage;
