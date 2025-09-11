import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IPortfolioHolding } from '@shared/types/finances';
import { calculateLocalCalculations } from '@shared/utils';
import { useMemo, useState } from 'react';
import ChangeChip from 'src/components/finance/ChangeChip';
import { formatCurrency } from 'src/utils';
import { SortField, SortOrder } from './index';

interface GroupedHolding {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  totalGain: number;
  totalGainPercentage: number;
  holdingsCount: number;
  holdings: IPortfolioHolding[];
}

interface HoldingsTableProps {
  holdings: IPortfolioHolding[];
  sortBy: SortField;
  sortOrder: SortOrder;
}

// Función para agrupar holdings por assetId
const groupHoldingsByAsset = (
  holdings: IPortfolioHolding[]
): GroupedHolding[] => {
  // Primero calcular el valor total del portfolio para poder calcular porcentajes
  const totalPortfolioValue = holdings.reduce(
    (sum, h) => sum + (h.currentValue || 0),
    0
  );

  // Calcular localCalculations para cada holding
  const holdingsWithCalculations = holdings.map((holding) => ({
    ...holding,
    localCalculations: calculateLocalCalculations(holding, totalPortfolioValue),
  }));

  const groupedMap = new Map<string, IPortfolioHolding[]>();

  // Agrupar holdings por assetId
  holdingsWithCalculations.forEach((holding) => {
    if (!groupedMap.has(holding.assetId)) {
      groupedMap.set(holding.assetId, []);
    }
    groupedMap.get(holding.assetId)!.push(holding);
  });

  // Convertir a GroupedHolding con cálculos agregados
  return Array.from(groupedMap.entries()).map(([assetId, holdingsGroup]) => {
    const totalQuantity = holdingsGroup.reduce(
      (sum, h) => sum + (h.quantity || 0),
      0
    );
    const totalValue = holdingsGroup.reduce(
      (sum, h) => sum + (h.currentValue || 0),
      0
    );
    const totalInvested = holdingsGroup.reduce(
      (sum, h) => sum + (h.totalInvested || 0),
      0
    );
    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;
    const totalGain = holdingsGroup.reduce(
      (sum, h) => sum + (h.localCalculations?.unrealizedGain || 0),
      0
    );
    const totalGainPercentage =
      totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return {
      id: assetId,
      assetId,
      symbol: assetId, // Temporal hasta tener el símbolo real
      name: assetId, // Temporal hasta tener el nombre real
      totalQuantity,
      totalValue,
      averagePrice,
      totalGain,
      totalGainPercentage,
      holdingsCount: holdingsGroup.length,
      holdings: holdingsGroup,
    };
  });
};

const HoldingsTable = ({ holdings, sortBy, sortOrder }: HoldingsTableProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedHolding | null>(
    null
  );

  // Agrupar holdings por asset
  const groupedHoldings = useMemo(() => {
    return groupHoldingsByAsset(holdings);
  }, [holdings]);

  const handleViewDetails = (group: GroupedHolding) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGroup(null);
  };

  const columns: GridColDef<GroupedHolding>[] = [
    {
      field: 'symbol',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'averagePrice',
      headerName: 'Avg Price',
      type: 'number',
      width: 100,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'totalQuantity',
      headerName: 'Qty',
      type: 'number',
      width: 80,
      valueFormatter: (value: number) => value.toLocaleString(),
    },
    {
      field: 'totalValue',
      headerName: 'Value',
      type: 'number',
      width: 100,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'totalGainPercentage',
      headerName: 'P&L %',
      headerAlign: 'center',
      type: 'number',
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <ChangeChip
            change={params.row.totalGain}
            changePercentage={params.value}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleViewDetails(params.row)}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          Details
        </Button>
      ),
    },
  ];

  if (groupedHoldings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No holdings found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        '& .profit-cell': {
          color: 'success.main',
          fontWeight: 500,
        },
        '& .loss-cell': {
          color: 'error.main',
          fontWeight: 500,
        },
      }}
    >
      <DataGrid
        disableColumnMenu
        disableColumnSelector
        rowSelection={false}
        rowHeight={80}
        hideFooter
        rows={groupedHoldings}
        columns={columns}
        sortModel={[{ field: sortBy, sort: sortOrder }]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'default',
          },
        }}
      />

      {/* Dialog para mostrar detalles de holdings */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Holdings Details - {selectedGroup?.symbol}</DialogTitle>
        <DialogContent>
          {selectedGroup && (
            <Box sx={{ mt: 2 }}>
              <DataGrid
                disableColumnSelector
                rowSelection={false}
                rowHeight={60}
                hideFooter
                rows={selectedGroup.holdings}
                columns={[
                  {
                    field: 'id',
                    headerName: 'HOLDING',
                    flex: 1,
                    renderCell: (params) => (
                      <Box
                        sx={{
                          display: 'flex',
                          height: '100%',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" fontWeight="500">
                          Holding #
                          {selectedGroup.holdings.findIndex(
                            (h) => h.id === params.value
                          ) + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {params.row.createdAt
                            ? params.row.createdAt.format('MMM DD, YYYY')
                            : 'Date not available'}
                        </Typography>
                      </Box>
                    ),
                  },
                  {
                    field: 'averagePrice',
                    headerName: 'AVG PRICE',
                    type: 'number',
                    width: 120,
                    valueGetter: (_, row) => {
                      return row.localCalculations?.averageBuyPrice || 0;
                    },
                    valueFormatter: (value: number) => formatCurrency(value),
                  },
                  {
                    field: 'quantity',
                    headerName: 'QUANTITY',
                    type: 'number',
                    width: 120,
                    valueFormatter: (value: number) =>
                      value?.toLocaleString() || '0',
                  },
                  {
                    field: 'currentValue',
                    headerName: 'VALUE',
                    type: 'number',
                    width: 120,
                    valueFormatter: (value: number) =>
                      formatCurrency(value || 0),
                  },
                  {
                    field: 'unrealizedGain',
                    headerName: 'P&L',
                    type: 'number',
                    width: 120,
                    valueGetter: (_, row) => {
                      return row.localCalculations?.unrealizedGain || 0;
                    },
                    renderCell: (params) => (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              params.value >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 500,
                          }}
                        >
                          {params.value >= 0 ? '+' : ''}
                          {formatCurrency(params.value)}
                        </Typography>
                      </Box>
                    ),
                  },
                  {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 100,
                    renderCell: (params) => (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'center',
                        }}
                      >
                        <Chip
                          label={params.value || 'unknown'}
                          size="small"
                          color={
                            params.value === 'active' ? 'success' : 'default'
                          }
                          variant="outlined"
                        />
                      </Box>
                    ),
                  },
                ]}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-row:hover': {
                    cursor: 'default',
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HoldingsTable;
