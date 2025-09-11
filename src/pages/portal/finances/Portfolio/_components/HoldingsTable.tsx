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
  const groupedMap = new Map<string, IPortfolioHolding[]>();

  // Agrupar holdings por assetId
  holdings.forEach((holding) => {
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
            {params.value} ({params.row.holdingsCount} holdings)
          </Typography>
        </Box>
      ),
    },
    {
      field: 'averagePrice',
      headerName: 'AVG PRICE',
      type: 'number',
      width: 120,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'totalQuantity',
      headerName: 'QUANTITY',
      type: 'number',
      width: 120,
      valueFormatter: (value: number) => value.toLocaleString(),
    },
    {
      field: 'totalValue',
      headerName: 'VALUE',
      type: 'number',
      width: 120,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'totalGainPercentage',
      headerName: 'P&L %',
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
      headerName: 'ACTIONS',
      width: 120,
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
        disableColumnSelector
        rowSelection={false}
        rowHeight={80}
        hideFooter
        rows={groupedHoldings}
        columns={columns}
        initialState={{
          sorting: {
            sortModel: [{ field: sortBy, sort: sortOrder }],
          },
        }}
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Holdings Details - {selectedGroup?.symbol}</DialogTitle>
        <DialogContent>
          {selectedGroup && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Individual Holdings ({selectedGroup.holdingsCount} total)
              </Typography>

              {/* Headers */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 120px 120px 120px 100px',
                  gap: 2,
                  p: 2,
                  fontWeight: 'bold',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  mb: 1,
                  bgcolor: 'grey.50',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  HOLDING
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  AVG PRICE
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  QUANTITY
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  VALUE
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  P&L
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  STATUS
                </Typography>
              </Box>

              {/* Datos */}
              <Box sx={{ display: 'grid', gap: 1 }}>
                {selectedGroup.holdings.map((holding, index) => (
                  <Box
                    key={holding.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 120px 120px 120px 100px',
                      gap: 2,
                      p: 2,
                      bgcolor: index % 2 === 0 ? 'grey.25' : 'white',
                      borderRadius: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        Holding #{index + 1}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {holding.createdAt
                          ? holding.createdAt.format('MMM DD, YYYY')
                          : 'Date not available'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" align="center">
                      {holding.totalInvested && holding.quantity
                        ? formatCurrency(
                            holding.totalInvested / holding.quantity
                          )
                        : 'N/A'}
                    </Typography>

                    <Typography variant="body2" align="center">
                      {holding.quantity
                        ? holding.quantity.toLocaleString()
                        : '0'}
                    </Typography>

                    <Typography variant="body2" align="center">
                      {holding.currentValue
                        ? formatCurrency(holding.currentValue)
                        : 'N/A'}
                    </Typography>

                    <Typography
                      variant="body2"
                      align="center"
                      sx={{
                        color:
                          (holding.localCalculations?.unrealizedGain || 0) >= 0
                            ? 'success.main'
                            : 'error.main',
                        fontWeight: 500,
                      }}
                    >
                      {(holding.localCalculations?.unrealizedGain || 0) >= 0
                        ? '+'
                        : ''}
                      {formatCurrency(
                        holding.localCalculations?.unrealizedGain || 0
                      )}
                    </Typography>

                    <Box sx={{ textAlign: 'center' }}>
                      <Chip
                        label={holding.status || 'unknown'}
                        size="small"
                        color={
                          holding.status === 'active' ? 'success' : 'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
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
