import { Grid, Box, Stack, Button } from '@mui/material';
import {
  CalendarToday,
  AttachMoney,
  Person,
  MonetizationOn,
  Add,
} from '@mui/icons-material';
import { GlobalLoader, PageContent, PageHeader } from 'src/components';
import {
  PortfolioHeader,
  PortfolioChart,
  HoldingsTable,
  PortfolioHighlights,
  ActivityTable,
  TableFilter,
  SortField,
  SortOrder,
} from './_components';
import { ROUTES } from 'src/consts';
import { Page } from 'src/components/layout';
import { useState, useMemo, useCallback } from 'react';
import {
  TIME_FILTERS,
  TimeFilter,
} from '../../../../../shared/enums/finance/timeFilters';
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

  // Memoized callback prevents child component re-renders
  const handleSortChange = useCallback((field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // Using the standardized usePortfolio hook
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
    getAsset,
    setAsset,
    validateTransaction,
  } = usePortfolio('portfolio_1', {
    autoLoad: true,
    forceMock: true,
  });

  // Optimized chart data generation with memoization - MOVED BEFORE EARLY RETURNS
  const chartData = useMemo(() => {
    if (!portfolio || snapshots.length === 0) {
      // Fallback data if no snapshots or portfolio
      return {
        chartData: [
          portfolio?.totalInvested || 0,
          portfolio?.currentValue || 0,
        ],
        chartLabels: ['Initial', 'Current'],
      };
    }

    // Filter snapshots based on selected time filter
    const filterSnapshots = () => {
      const now = new Date();
      let startDate = new Date();

      switch (selectedTimeFilter) {
        case TIME_FILTERS.FIVE_DAYS:
          startDate.setDate(now.getDate() - 5);
          break;
        case TIME_FILTERS.ONE_MONTH:
          startDate.setMonth(now.getMonth() - 1);
          break;
        case TIME_FILTERS.SIX_MONTHS:
          startDate.setMonth(now.getMonth() - 6);
          break;
        case TIME_FILTERS.YTD:
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case TIME_FILTERS.ONE_YEAR:
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case TIME_FILTERS.FIVE_YEARS:
          startDate.setFullYear(now.getFullYear() - 5);
          break;
        case TIME_FILTERS.MAX:
          return snapshots;
        default:
          startDate.setFullYear(now.getFullYear() - 1);
      }

      return snapshots.filter((snapshot) => snapshot.date >= startDate);
    };

    const filteredSnapshots = filterSnapshots();

    return {
      chartData: filteredSnapshots.map((snapshot) => snapshot.totalValue),
      chartLabels: filteredSnapshots.map((snapshot) =>
        snapshot.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      ),
    };
  }, [snapshots, selectedTimeFilter, portfolio]);

  // Optimized sorting with memoization - MOVED BEFORE EARLY RETURNS
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
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
      dailyChange: holding.unrealizedGain, // Using unrealized gain as daily change for now
      dailyChangePercentage: holding.unrealizedGainPercentage,
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
        // For holdings, we can sort by daily change as a proxy
        return sortOrder === 'asc'
          ? a.dailyChange - b.dailyChange
          : b.dailyChange - a.dailyChange;
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

  if (!portfolio) {
    return <div>Portfolio not found</div>;
  }

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
            <Box sx={{ mb: 3 }}>
              <PortfolioChart
                chartData={chartData.chartData}
                chartLabels={chartData.chartLabels}
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
                  <Button startIcon={<Add />} variant={'contained'}>
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

      {/* ==== TEMPORARY DEMO SECTION - DELETE AFTER REVIEW ==== */}
      <div
        style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ccc',
        }}
      >
        <h2>🧪 Demo de Funcionalidades del Portfolio Service</h2>

        {/* Demo: Transactions */}
        <div style={{ marginBottom: '20px' }}>
          <h3>📊 Transacciones ({transactions.length})</h3>
          {transactions.slice(0, 3).map((tx, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                margin: '4px 0',
              }}
            >
              <strong>{tx.type}</strong> {tx.quantity} {tx.assetId} @ $
              {tx.price}
              <small> - {tx.executedAt.toLocaleDateString()}</small>
            </div>
          ))}
        </div>

        {/* Demo: Snapshots */}
        <div style={{ marginBottom: '20px' }}>
          <h3>📈 Snapshots Históricos ({snapshots.length})</h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '10px',
            }}
          >
            {Object.values(TIME_FILTERS).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedTimeFilter(filter)}
                style={{
                  padding: '4px 8px',
                  backgroundColor:
                    selectedTimeFilter === filter ? '#2196F3' : '#f0f0f0',
                  color: selectedTimeFilter === filter ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Filter: <strong>{selectedTimeFilter}</strong> | Chart data:{' '}
            <strong>{chartData.chartData.length}</strong> points | Range:{' '}
            <strong>
              ${Math.min(...chartData.chartData).toLocaleString()}
            </strong>{' '}
            -{' '}
            <strong>
              ${Math.max(...chartData.chartData).toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Demo: User Portfolios */}
        <div style={{ marginBottom: '20px' }}>
          <h3>👤 Portfolios del Usuario ({userPortfolios.length})</h3>
          {userPortfolios.map((p, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                margin: '4px 0',
              }}
            >
              <strong>{p.name}</strong> {p.isDefault && '⭐'}
              <small> - Actualizado: {p.updatedAt.toLocaleDateString()}</small>
            </div>
          ))}
        </div>

        {/* Demo: Action Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <h3>⚡ Acciones Disponibles</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                try {
                  const newPortfolioId = await createPortfolio({
                    name: 'Demo Portfolio',
                    userId: 'user_1',
                    isDraft: false,
                    currentValue: 0,
                    totalGain: 0,
                    totalGainPercentage: 0,
                    dailyGain: 0,
                    dailyGainPercentage: 0,
                    totalInvested: 0,
                    currency: 'USD',
                  });
                  alert(`✅ Portfolio creado con ID: ${newPortfolioId}`);
                } catch (error) {
                  alert(`❌ Error: ${error}`);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              🆕 Crear Portfolio
            </button>

            <button
              onClick={async () => {
                try {
                  const txId = await addTransaction({
                    portfolioId: 'portfolio_1',
                    assetId: 'ETH',
                    type: 'BUY',
                    quantity: 0.5,
                    price: 2500,
                    totalAmount: 1250,
                    fees: 6.25,
                    executedAt: new Date(),
                  });
                  alert(`✅ Transacción agregada con ID: ${txId}`);
                } catch (error) {
                  alert(`❌ Error: ${error}`);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              💰 Agregar Transacción
            </button>

            <button
              onClick={async () => {
                try {
                  const asset = await getAsset('BTC');
                  alert(
                    `📈 Asset encontrado: ${asset?.name} - $${asset?.currentPrice}`
                  );
                } catch (error) {
                  alert(`❌ Error: ${error}`);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              🔍 Obtener Asset BTC
            </button>

            <button
              onClick={async () => {
                try {
                  await setAsset({
                    id: 'ETH',
                    symbol: 'ETH',
                    name: 'Ethereum',
                    category: 'CRYPTO',
                    type: 'CRYPTOCURRENCY',
                    currentPrice: 2500,
                    dayOpenPrice: 2480,
                    previousDayClose: 2480,
                    dailyChange: 20,
                    dailyChangePercentage: 0.81,
                    currency: 'USD',
                    lastPriceUpdate: new Date(),
                  });
                  alert('✅ Asset ETH actualizado');
                } catch (error) {
                  alert(`❌ Error: ${error}`);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              💾 Actualizar Asset ETH
            </button>
          </div>
        </div>

        {/* Demo: Validation */}
        <div style={{ marginBottom: '20px' }}>
          <h3>✅ Validación de Transacciones</h3>
          <button
            onClick={() => {
              const errors = validateTransaction({
                portfolioId: '',
                assetId: 'BTC',
                type: 'BUY',
                quantity: -1,
                price: 0,
              });
              alert(
                `Errores encontrados: ${errors.length > 0 ? errors.join(', ') : 'Ninguno'}`
              );
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            🧪 Probar Validación (con errores)
          </button>
        </div>

        {/* Demo: Current Data Summary */}
        <div>
          <h3>📋 Resumen de Datos Actuales</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <strong>Portfolio</strong>
              <br />
              Name: {portfolio?.name}
              <br />
              Value: ${portfolio?.currentValue?.toLocaleString()}
              <br />
              Gain: ${portfolio?.totalGain?.toLocaleString()}
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <strong>Holdings</strong>
              <br />
              Total: {holdings.length}
              <br />
              Assets: {holdings.map((h) => h.assetId).join(', ')}
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <strong>Transacciones</strong>
              <br />
              Total: {transactions.length}
              <br />
              Última: {transactions[0]?.executedAt?.toLocaleDateString()}
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <strong>Estado</strong>
              <br />
              Loading: {loading ? '🔄' : '✅'}
              <br />
              Error: {error || 'Ninguno'}
            </div>
          </div>
        </div>

        <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
          💡 Esta sección demuestra todas las funcionalidades disponibles del
          usePortfolio hook y portfolioService. Puedes borrar toda esta sección
          cuando hayas terminado de revisar.
        </p>
      </div>
      {/* ==== END TEMPORARY DEMO SECTION ==== */}
    </Page>
  );
};

export default PortafolioPage;
