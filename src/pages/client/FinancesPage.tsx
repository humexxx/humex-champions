import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { useMemo } from 'react';
import { PageHeader } from 'src/components/common';

const FinancesPage = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.title')} - Champions`);

  const options = useMemo(
    () => [
      {
        route: 'personal-finances',
        label: t('finances.personalFinances.title'),
        description: t('finances.personalFinances.description'),
        Icon: BarChartIcon,
      },

      {
        route: 'portfolio',
        label: t('finances.portfolio.title'),
        description: t('finances.portfolio.description'),
        Icon: PieChartIcon,
      },
      {
        route: 'trading-journal',
        label: t('finances.tradingJournal.title'),
        description: t('finances.tradingJournal.description'),
        Icon: TrendingUpIcon,
      },
    ],
    [t]
  );

  return (
    <>
      <PageHeader>
        <Typography variant="h6" component="h2" gutterBottom>
          <strong>{t('finances.financialSummary')}</strong>
        </Typography>
        <Typography variant="body1">
          {t('finances.summaryDescription')}
        </Typography>
      </PageHeader>

      <Grid container spacing={4}>
        {options.map(({ route, Icon, description, label }) => (
          <Grid item xs={12} md={4} key={route}>
            <Link
              unstable_viewTransition
              to={route}
              style={{ textDecoration: 'none' }}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Box>
                      <Paper
                        sx={{
                          display: 'inline-block',
                          p: 1,
                          mb: 1,
                          border: '1px solid rgba(205, 209, 228, 0.2)',
                        }}
                      >
                        <Icon color="primary" />
                      </Paper>
                      <Typography
                        variant="body1"
                        component="h3"
                        my={2}
                        sx={{
                          viewTransitionName: route,
                        }}
                      >
                        <strong>{label}</strong>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default FinancesPage;
