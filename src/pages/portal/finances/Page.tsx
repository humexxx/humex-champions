import { useMemo } from 'react';

import BarChartIcon from '@mui/icons-material/BarChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Grid } from '@mui/material';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';
import { PageContainer } from 'src/components/layout';

const FinancesPage = () => {
  const options = useMemo(
    () => [
      {
        route: 'personal-finances',
        label: 'Personal Finances',
        description: 'Track your income, expenses, and debts',
        Icon: BarChartIcon,
      },

      {
        route: 'portfolio',
        label: 'Portfolio',
        description: 'Manage your investment portfolio',
        Icon: PieChartIcon,
      },
      {
        route: 'trading-journal',
        label: 'Trading Journal',
        description: 'Keep track of your trading activities',
        Icon: TrendingUpIcon,
      },
      {
        route: 'compound-calculator',
        label: 'Compound Calculator',
        description: 'Calculate compound interest over time',
        Icon: CalculateIcon,
      },
    ],
    []
  );

  return (
    <PageContainer title="Finances">
      <PageHeader
        title="Finances"
        description="Manage your financial planning and tracking"
      />

      <PageContent>
        <Grid container spacing={4}>
          {options.map(({ route, Icon, description, label }) => (
            <Grid size={{ xs: 12, md: 4 }} key={route}>
              <LinkOptionCard
                route={route}
                label={label}
                description={description}
                icon={<Icon color="primary" />}
              />
            </Grid>
          ))}
        </Grid>
      </PageContent>
    </PageContainer>
  );
};

export default FinancesPage;
