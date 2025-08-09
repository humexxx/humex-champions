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
import usePortfolio from './usePortfolio';

const PortafolioPage = () => {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>(
    TIME_FILTERS.ONE_YEAR
  );

  // Using the standardized usePortfolio hook
  const { portfolio, holdings, loading, error } = usePortfolio('portfolio_1', {
    autoLoad: true,
    forceMock: true,
  });

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  if (error) {
    return <div>Error loading portfolio: {error}</div>;
  }

  if (!portfolio) {
    return <div>Portfolio not found</div>;
  }

  // Mock data for the chart (will be replaced with real data later)
  const chartData = [3333.5, 3400, 120417.6];
  const chartLabels = ['May 2025', 'Jun 2025', 'Jul 2025'];

  // Calculate portfolio highlights from actual data
  const portfolioHighlights = {
    dailyGain: portfolio.dailyGain || 0,
    dailyGainPercentage: portfolio.dailyGainPercentage || 0,
    overallGain: portfolio.totalGain || 0,
    overallGainPercentage: portfolio.totalGainPercentage || 0,
    cryptoPercentage: 100, // This will be calculated from holdings
  };

  // Transform holdings data to match component interface
  const mappedHoldings = holdings.map((holding) => ({
    symbol: holding.assetId, // Will be replaced with actual asset symbol later
    name: holding.assetId, // Will be replaced with actual asset name later
    price: holding.currentPrice,
    quantity: holding.quantity,
    dailyChange: holding.unrealizedGain, // Using unrealized gain as daily change for now
    dailyChangePercentage: holding.unrealizedGainPercentage,
    value: holding.currentValue,
  }));

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
          name={portfolio.name}
          totalValue={portfolio.currentValue}
          totalGain={portfolio.totalGain}
          totalGainPercentage={portfolio.totalGainPercentage}
          lastUpdate={
            portfolio.lastPriceUpdate
              ? portfolio.lastPriceUpdate.toString()
              : new Date().toISOString()
          }
          selectedTimeFilter={selectedTimeFilter}
        />

        <Grid container spacing={4}>
          {/* Left Column - Main Chart and Stats */}
          <Grid size={{ xs: 12, md: 8 }}>
            <PortfolioChart
              chartData={chartData}
              chartLabels={chartLabels}
              selectedTimeFilter={selectedTimeFilter}
              timeFilters={Object.values(TIME_FILTERS)}
              onTimeFilterChange={setSelectedTimeFilter}
            />

            <HoldingsTable holdings={mappedHoldings} />
          </Grid>

          {/* Right Column - Portfolio Highlights */}
          <Grid size={{ xs: 12, md: 4 }}>
            <PortfolioHighlights
              dailyGain={portfolioHighlights.dailyGain}
              dailyGainPercentage={portfolioHighlights.dailyGainPercentage}
              overallGain={portfolioHighlights.overallGain}
              overallGainPercentage={portfolioHighlights.overallGainPercentage}
              cryptoPercentage={portfolioHighlights.cryptoPercentage}
            />
          </Grid>
        </Grid>
      </PageContent>
    </Page>
  );
};

export default PortafolioPage;
