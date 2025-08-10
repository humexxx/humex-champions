import { Grid } from '@mui/material';
import { GlobalLoader, PageContent, PageHeader } from 'src/components';
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

  if (loading) {
    return <GlobalLoader />;
  }

  if (error) {
    return <div>Error loading portfolio: {error}</div>;
  }

  if (!portfolio) {
    return <div>Portfolio not found</div>;
  }

  // Generate chart data from snapshots
  const generateChartData = () => {
    if (snapshots.length === 0) {
      // Fallback data if no snapshots
      return {
        chartData: [
          portfolio?.totalInvested || 0,
          portfolio?.currentValue || 0,
        ],
        chartLabels: ['Inicial', 'Actual'],
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
        snapshot.date.toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        })
      ),
    };
  };

  const { chartData, chartLabels } = generateChartData();

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
            Filtro actual: <strong>{selectedTimeFilter}</strong> | Datos en
            chart: <strong>{chartData.length}</strong> puntos | Rango:{' '}
            <strong>${Math.min(...chartData).toLocaleString()}</strong> -{' '}
            <strong>${Math.max(...chartData).toLocaleString()}</strong>
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
              Nombre: {portfolio?.name}
              <br />
              Valor: ${portfolio?.currentValue?.toLocaleString()}
              <br />
              Ganancia: ${portfolio?.totalGain?.toLocaleString()}
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
