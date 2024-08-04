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
import { useTranslation } from 'react-i18next';

const FinancesPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('finances.financialSummary')}
        </Typography>
        <Typography variant="body1">
          {t('finances.summaryDescription')}
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
                    style={{ viewTransitionName: 'personal-finances' }}
                  >
                    {t('finances.personalFinances.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('finances.personalFinancesDescription')}
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
                    {t('finances.tradingJournal.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('finances.tradingJournalDescription')}
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
                    {t('finances.portfolio')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('finances.portfolioDescription')}
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
