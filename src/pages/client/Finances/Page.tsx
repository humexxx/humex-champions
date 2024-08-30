import { Grid, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ButtonOptionCard, PageHeader } from 'src/components';
import CalculateIcon from '@mui/icons-material/Calculate';

const FinancesPage = () => {
  const { t } = useTranslation();

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
      {
        route: 'compound-calculator',
        label: t('finances.compound-calculator.title'),
        description: t('finances.compound-calculator.description'),
        Icon: CalculateIcon,
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
            <ButtonOptionCard
              route={route}
              label={label}
              description={description}
              icon={<Icon color="primary" />}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default FinancesPage;
