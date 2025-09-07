import {
  Add,
  AttachMoney,
  CalendarToday,
  MonetizationOn,
  Person,
} from '@mui/icons-material';
import { Box, Button, Grid, Stack } from '@mui/material';
import { IAsset } from '@shared/types/finances';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { TransactionFormData } from './_components/TransactionDialog/TransactionDialog';
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

  // Using the updated usePortfolio hook that brings all portfolios
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
    snapshotDeps: [selectedTimeFilter], // Dependencies that trigger snapshot reload
  });

  // Seleccionar automáticamente el primer portfolio cuando se cargan
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(
    null
  );

  // Efecto para seleccionar el primer portfolio automáticamente
  useEffect(() => {
    if (userPortfolios.length > 0 && !selectedPortfolioId) {
      const defaultPortfolio = userPortfolios.find((p) => p.isDefault);
      const firstPortfolio = defaultPortfolio || userPortfolios[0];
      setSelectedPortfolioId(firstPortfolio.id);
      loadPortfolioData(firstPortfolio.id);
    }
  }, [userPortfolios, selectedPortfolioId, loadPortfolioData]);

  // Handle transaction dialog submission
  const handleTransactionSubmit = useCallback(
    async (transactionData: TransactionFormData, asset: IAsset) => {
      if (!selectedPortfolioId) {
        throw new Error('No portfolio selected');
      }

      if (!asset) {
        throw new Error('No asset selected');
      }

      try {
        const totalAmount = transactionData.quantity * transactionData.price;
        const result = await addTransaction(selectedPortfolioId, {
          assetId: transactionData.assetId,
          type: transactionData.type,
          quantity: transactionData.quantity,
          price: transactionData.price,
          totalAmount: totalAmount,
          fees: 0, // Default to 0 fees for now
          executedAt: dayjs(transactionData.executedAt),
          notes: transactionData.notes || '',
          requiresApproval: asset.isSystemAsset || false,
          status: 'pending', // Default to pending for approval workflow
        });

        console.log('Transaction added successfully:', result);

        setTimeout(() => {
          loadPortfolioData(selectedPortfolioId);
        }, 1000); // Small delay to allow Firebase function to complete
      } catch (error) {
        console.error('Error adding transaction:', error);
        throw error; // Re-throw so the dialog can handle it
      }
    },
    [selectedPortfolioId, addTransaction, loadPortfolioData]
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

  // Optimized sorting with memoization - MOVED BEFORE EARLY RETURNS
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.executedAt.valueOf();
        const dateB = b.executedAt.valueOf();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'amount') {
        const amountA = a.quantity * a.price;
        const amountB = b.quantity * b.price;
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      }
      return 0;
    });
  }, [transactions, sortBy, sortOrder]);

  // Transform and sort holdings with memoization - MOVED BEFORE EARLY RETURNS
  const sortedHoldings = useMemo(() => {
    const mappedHoldings = holdings.map((holding) => ({
      symbol: holding.assetId, // Will be replaced with actual asset symbol later
      name: holding.assetId, // Will be replaced with actual asset name later
      price: holding.currentPrice,
      quantity: holding.quantity,
      totalGain: holding.unrealizedGain, // Using unrealized gain as total gain
      totalGainPercentage: holding.unrealizedGainPercentage,
      value: holding.currentValue,
    }));

    return [...mappedHoldings].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'value') {
        return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
      } else if (sortBy === 'date') {
        // For holdings, we can sort by total gain as a proxy
        return sortOrder === 'asc'
          ? a.totalGain - b.totalGain
          : b.totalGain - a.totalGain;
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
      }
      return 0;
    });
  }, [holdings, sortBy, sortOrder]);

  // Memoized portfolio highlights - MOVED BEFORE EARLY RETURNS
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

  // Memoized field definitions - MOVED BEFORE EARLY RETURNS
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
              loading={false}
            />
          </Box>{' '}
          {/* Holdings/Activity Tabs */}
          <Box sx={{ mt: 3 }}>
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

            {/* Tab Content */}
            {selectedTab === 'investments' ? (
              <HoldingsTable
                holdings={sortedHoldings}
                transactions={sortedTransactions}
              />
            ) : (
              <ActivityTable transactions={sortedTransactions} />
            )}
          </Box>
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

      {/* Admin Testing Section */}
      <AdminTestingSection />

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
