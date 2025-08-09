import { Grid } from '@mui/material';
import { PageContent, PageHeader } from 'src/components';
import {
  PortfolioHeader,
  PortfolioChart,
  HoldingsTable,
  PortfolioHighlights,
} from './_components';
import { ROUTES } from 'src/consts';
import { Page } from 'src/components/layout';
import { useState } from 'react';
import {
  TIME_FILTERS,
  TimeFilter,
} from '../../../../../shared/enums/finance/timeFilters';

// Mock data for the chart
const chartData = [3333.5, 3400, 120417.6];
const chartLabels = ['May 2025', 'Jun 2025', 'Jul 2025'];

// Mock portfolio data
const portfolioData = {
  name: 'MVP',
  totalValue: 120417.6,
  totalGain: 117084.1,
  totalGainPercentage: 3512.36,
  lastUpdate: '9 ago, 3:34:53 p.m. UTC-6 · USD · Renuncia de responsabilidad',
  dailyGain: -212.58,
  dailyGainPercentage: -0.18,
  overallGain: 299.4,
  overallGainPercentage: 0.25,
  cryptoPercentage: 100,
};

const holdings = [
  {
    symbol: 'BTC',
    name: 'Bitcoin (BTC / USD)',
    price: 116383.2,
    quantity: 1,
    dailyChange: -295.08,
    dailyChangePercentage: -0.25,
    value: 116383.2,
  },
  {
    symbol: 'ADA',
    name: 'Cardano (ADA / USD)',
    price: 0.81,
    quantity: 5000,
    dailyChange: 82.5,
    dailyChangePercentage: 2.09,
    value: 4034.4,
  },
];

const PortafolioPage = () => {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>(
    TIME_FILTERS.ONE_YEAR
  );

  return (
    <Page title="Portafolio">
      <PageHeader
        title={'Portfolio'}
        navigator={{
          breadcrumb: [{ title: 'Portfolio', route: 'portfolio' }],
          link: {
            title: 'Finances',
            route: ROUTES.PORTAL.FINANCES.INDEX,
          },
        }}
      />

      <PageContent>
        <PortfolioHeader
          name={portfolioData.name}
          totalValue={portfolioData.totalValue}
          totalGain={portfolioData.totalGain}
          totalGainPercentage={portfolioData.totalGainPercentage}
          lastUpdate={portfolioData.lastUpdate}
          selectedTimeFilter={selectedTimeFilter}
        />

        <Grid container spacing={3}>
          {/* Left Column - Main Chart and Stats */}
          <Grid size={{ xs: 12, md: 8 }}>
            <PortfolioChart
              chartData={chartData}
              chartLabels={chartLabels}
              selectedTimeFilter={selectedTimeFilter}
              timeFilters={Object.values(TIME_FILTERS)}
              onTimeFilterChange={setSelectedTimeFilter}
            />

            <HoldingsTable holdings={holdings} />
          </Grid>

          {/* Right Column - Portfolio Highlights */}
          <Grid size={{ xs: 12, md: 4 }}>
            <PortfolioHighlights
              dailyGain={portfolioData.dailyGain}
              dailyGainPercentage={portfolioData.dailyGainPercentage}
              overallGain={portfolioData.overallGain}
              overallGainPercentage={portfolioData.overallGainPercentage}
              cryptoPercentage={portfolioData.cryptoPercentage}
            />
          </Grid>
        </Grid>
      </PageContent>
    </Page>
  );
};

export default PortafolioPage;
