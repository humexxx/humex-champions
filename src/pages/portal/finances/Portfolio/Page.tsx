import {
  Add,
  AttachMoney,
  CalendarToday,
  MonetizationOn,
  Person,
} from '@mui/icons-material';
import { Box, Button, Grid, Stack } from '@mui/material';
import { IAsset, TransactionFormData } from '@shared/types/finances';
import { useCallback, useMemo, useState } from 'react';
import { GlobalLoader } from 'src/components';
import { PageContainer } from 'src/components/layout';
import {
  TIME_FILTERS,
  TimeFilter,
} from '../../../../../shared/enums/finance/timeFilters';
import {
  ActivityTable,
  AdminTestingSection,
  CreatePortfolioDialog,
  EmptyPortfolioState,
  HoldingsTable,
  PortfolioChart,
  PortfolioHeader,
  PortfolioHighlights,
  SortField,
  SortOrder,
  TableFilter,
} from './_components';
import TransactionDialog from './_components/TransactionDialog';
import usePortfolio from './usePortfolio';

const PortafolioPage = () => {
  // State management - stable references prevent unnecessary re-renders
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>(
    TIME_FILTERS.ONE_YEAR
  );
  const [selectedTab, setSelectedTab] = useState<'investments' | 'activity'>(
    'investments'
  );
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [createPortfolioDialogOpen, setCreatePortfolioDialogOpen] =
    useState(false);

  // Memoized callback prevents child component re-renders
  const handleSortChange = useCallback((field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // Using the updated usePortfolio hook
  const {
    portfolio,
    holdings,
    transactions,
    snapshots,
    userPortfolios,
    loading,
    error,
    createPortfolio,
    addTransaction,
    loadPortfolioData,
  } = usePortfolio({
    autoLoad: true,
    forceMock: false,
    timeFilter: selectedTimeFilter, // Pass the current time filter
  });

  // Handle transaction dialog submission
  const handleTransactionSubmit = useCallback(
    async (transactionData: TransactionFormData, asset: IAsset) => {
      if (!portfolio?.id) {
        throw new Error('No portfolio selected');
      }

      if (!asset) {
        throw new Error('No asset selected');
      }

      try {
        const result = await addTransaction(transactionData, asset);

        console.log('Transaction added successfully:', result);

        setTimeout(() => {
          loadPortfolioData(portfolio.id);
        }, 1000); // Small delay to allow Firebase function to complete
      } catch (error) {
        console.error('Error adding transaction:', error);
        throw error; // Re-throw so the dialog can handle it
      }
    },
    [portfolio?.id, addTransaction, loadPortfolioData]
  );

  // Handle portfolio creation
  const handleCreatePortfolio = useCallback(
    async (portfolioData: {
      name: string;
      currency: string;
      isDefault: boolean;
    }) => {
      try {
        const result = await createPortfolio({
          userId: '', // Will be set by the service
          name: portfolioData.name,
          currency: portfolioData.currency,
          isDraft: false,
          currentValue: 0,
          totalGain: 0,
          totalGainPercentage: 0,
          dailyGain: 0,
          dailyGainPercentage: 0,
          totalInvested: 0,
          isDefault: portfolioData.isDefault,
        });

        console.log('Portfolio created successfully:', result);
        // The UI will automatically update due to the usePortfolio hook
      } catch (error) {
        console.error('Error creating portfolio:', error);
        throw error;
      }
    },
    [createPortfolio]
  );

  // Memoized portfolio highlights
  const portfolioHighlights = useMemo(
    () => ({
      dailyGain: portfolio?.dailyGain || 0,
      dailyGainPercentage: portfolio?.dailyGainPercentage || 0,
      overallGain: portfolio?.totalGain || 0,
      overallGainPercentage: portfolio?.totalGainPercentage || 0,
      cryptoPercentage: 100, // This will be calculated from holdings
    }),
    [portfolio]
  );

  // Temporary field definitions until components are updated
  const transactionFields = useMemo(
    () => [
      {
        field: 'date' as SortField,
        label: 'date',
        icon: <CalendarToday fontSize="small" />,
      },
      {
        field: 'amount' as SortField,
        label: 'amount',
        icon: <AttachMoney fontSize="small" />,
      },
    ],
    []
  );

  const holdingFields = useMemo(
    () => [
      {
        field: 'name' as SortField,
        label: 'name',
        icon: <Person fontSize="small" />,
      },
      {
        field: 'value' as SortField,
        label: 'value',
        icon: <AttachMoney fontSize="small" />,
      },
      {
        field: 'date' as SortField,
        label: 'gains',
        icon: <MonetizationOn fontSize="small" />,
      },
    ],
    []
  );

  // Early returns AFTER all hooks
  if (loading) {
    return <GlobalLoader />;
  }

  if (error) {
    return <div>Error loading portfolio: {error}</div>;
  }

  if (userPortfolios.length === 0 && !loading) {
    return (
      <PageContainer title="Portafolio">
        <EmptyPortfolioState
          onCreatePortfolio={() => setCreatePortfolioDialogOpen(true)}
          loading={loading}
        />

        <CreatePortfolioDialog
          open={createPortfolioDialogOpen}
          onClose={() => setCreatePortfolioDialogOpen(false)}
          onSubmit={handleCreatePortfolio}
          loading={loading}
        />
      </PageContainer>
    );
  }

  // Check if portfolio is selected and loaded
  if (!portfolio) {
    return <GlobalLoader />;
  }

  return (
    <PageContainer title="Portafolio">
      <PortfolioHeader
        name={portfolio.name}
        totalValue={portfolio.currentValue}
        totalGain={portfolio.totalGain}
        totalGainPercentage={portfolio.totalGainPercentage}
        lastUpdate={portfolio.updatedAt}
        selectedTimeFilter={selectedTimeFilter}
      />

      <Grid container spacing={4}>
        {/* Left Column - Main Chart and Stats */}
        <Grid size={{ xs: 12, md: 'grow' }}>
          <Box sx={{ mb: 3 }}>
            <PortfolioChart
              snapshots={snapshots}
              selectedTimeFilter={selectedTimeFilter}
              timeFilters={Object.values(TIME_FILTERS)}
              onTimeFilterChange={setSelectedTimeFilter}
              loading={loading}
            />
          </Box>
          {/* Holdings/Activity Tabs */}
          <Stack sx={{ mt: 3 }} spacing={4}>
            <Stack direction="row" justifyContent={'space-between'}>
              <Stack direction="row" spacing={1}>
                <Button
                  color="info"
                  variant={
                    selectedTab === 'investments' ? 'contained' : 'outlined'
                  }
                  onClick={() => setSelectedTab('investments')}
                >
                  Investments
                </Button>
                <Button
                  color="info"
                  variant={
                    selectedTab === 'activity' ? 'contained' : 'outlined'
                  }
                  onClick={() => setSelectedTab('activity')}
                >
                  Activity
                </Button>
              </Stack>

              <Stack direction="row" spacing={1}>
                <TableFilter
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  availableFields={
                    selectedTab === 'investments'
                      ? holdingFields
                      : transactionFields
                  }
                />
                <Button
                  startIcon={<Add />}
                  variant={'contained'}
                  onClick={() => setTransactionDialogOpen(true)}
                >
                  Add Transaction
                </Button>
              </Stack>
            </Stack>

            <Box>
              {/* Tab Content */}
              {selectedTab === 'investments' ? (
                <HoldingsTable
                  holdings={holdings}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              ) : (
                <ActivityTable
                  transactions={transactions}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              )}
            </Box>

            <AdminTestingSection />
          </Stack>
        </Grid>

        {/* Right Column - Portfolio Highlights */}
        <Grid size={{ xs: 12, md: 'auto' }}>
          <PortfolioHighlights
            dailyGain={portfolioHighlights.dailyGain}
            dailyGainPercentage={portfolioHighlights.dailyGainPercentage}
            overallGain={portfolioHighlights.overallGain}
            overallGainPercentage={portfolioHighlights.overallGainPercentage}
          />
        </Grid>
      </Grid>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        onSubmit={handleTransactionSubmit}
        portfolioId={portfolio?.id || 'default'}
      />

      {/* Create Portfolio Dialog */}
      <CreatePortfolioDialog
        open={createPortfolioDialogOpen}
        onClose={() => setCreatePortfolioDialogOpen(false)}
        onSubmit={handleCreatePortfolio}
        loading={loading}
      />
    </PageContainer>
  );
};

export default PortafolioPage;
