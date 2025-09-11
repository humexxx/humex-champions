import { ExpandMore, Schedule, Update } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { useState } from 'react';

import { CALLABLE_FUNCTIONS } from '@shared/consts';
import { IAsset, IPortfolioHolding } from '@shared/types/finances';
import { AdminCard } from 'src/components';
import ChangeChip from 'src/components/finance/ChangeChip';
import { functions } from 'src/firebase';
import { formatCurrency } from 'src/utils';

interface SchedulerResult {
  assetsUpdated?: IAsset[];
  holdingsUpdated: IPortfolioHolding[];
  timestamp?: string;
  message?: string;
}

const AdminTestingSection = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: SchedulerResult }>(
    {}
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleUpdatePortfolios = async () => {
    setLoading('updatePortfolios');
    setErrors((prev) => ({ ...prev, updatePortfolios: '' }));

    try {
      const updatePortfolios = httpsCallable(
        functions,
        CALLABLE_FUNCTIONS.finances.portfolio.updatePortfolios
      );

      const result = await updatePortfolios({});
      const response = result.data as SchedulerResult;

      setResults((prev) => ({
        ...prev,
        updatePortfolios: {
          ...response,
          message: 'Portfolios updated successfully',
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error updating portfolios:', error);
      setErrors((prev) => ({
        ...prev,
        updatePortfolios:
          error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setLoading(null);
    }
  };

  const handleUpdatePortfoliosWithSystemHoldings = async () => {
    setLoading('updateSystemHoldings');
    setErrors((prev) => ({ ...prev, updateSystemHoldings: '' }));

    try {
      const updateSystemHoldings = httpsCallable(
        functions,
        CALLABLE_FUNCTIONS.finances.portfolio.updatePortfoliosWithSystemHoldings
      );

      const result = await updateSystemHoldings({});
      const response = result.data as SchedulerResult;

      setResults((prev) => ({
        ...prev,
        updateSystemHoldings: {
          ...response,
          message: 'Portfolios updated with system holdings successfully',
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error updating portfolios with system holdings:', error);
      setErrors((prev) => ({
        ...prev,
        updateSystemHoldings:
          error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setLoading(null);
    }
  };

  const renderResultsTable = (data: SchedulerResult) => {
    if (!data) return null;

    const hasAssets = data.assetsUpdated && data.assetsUpdated.length > 0;
    const hasHoldings = data.holdingsUpdated && data.holdingsUpdated.length > 0;

    return (
      <Accordion sx={{ mt: 1 }} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasAssets && (
              <Chip
                label={`${data.assetsUpdated!.length} Assets`}
                size="small"
                color="success"
              />
            )}
            <Chip
              label={`${data.holdingsUpdated.length} Holdings`}
              size="small"
              color="info"
            />
            <Typography variant="body2">
              {data.message || 'Operation completed'}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {hasAssets && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  📈 Assets Updated ({data.assetsUpdated!.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Change %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data
                        .assetsUpdated!.slice(0, 5)
                        .map((asset: IAsset, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{asset.symbol}</TableCell>

                            <TableCell align="right">
                              {formatCurrency(asset.priceData?.price)}
                            </TableCell>
                            <TableCell align="right">
                              <ChangeChip
                                change={asset.priceData?.change || 0}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {data.assetsUpdated!.length > 5 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Showing 5 of {data.assetsUpdated!.length} assets
                  </Typography>
                )}
              </Box>
            )}

            {hasHoldings && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  💼 Holdings Updated ({data.holdingsUpdated.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Gain/Loss</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.holdingsUpdated
                        .slice(0, 5)
                        .map((holding: IPortfolioHolding, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{holding.assetId}</TableCell>
                            <TableCell align="right">
                              {holding.quantity || 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(holding.currentValue || 0)}
                            </TableCell>
                            <TableCell align="center">
                              <Box>
                                <ChangeChip
                                  change={
                                    holding.currentValue - holding.totalInvested
                                  }
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {data.holdingsUpdated.length > 5 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Showing 5 of {data.holdingsUpdated.length} holdings
                  </Typography>
                )}
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              Updated at:{' '}
              {data.timestamp
                ? new Date(data.timestamp).toLocaleString()
                : 'N/A'}
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <AdminCard>
      <Stack spacing={3}>
        {/* Update Portfolios Scheduler */}
        <Box>
          <Button
            variant="outlined"
            startIcon={
              loading === 'updatePortfolios' ? (
                <CircularProgress size={20} />
              ) : (
                <Update />
              )
            }
            onClick={handleUpdatePortfolios}
            disabled={loading === 'updatePortfolios'}
            sx={{
              mb: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              minWidth: 280,
            }}
          >
            {loading === 'updatePortfolios'
              ? 'Updating Portfolios...'
              : 'Update Portfolios (Market Scheduler)'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Updates asset prices, holdings, and portfolio snapshots (normally
            runs at market open/close)
          </Typography>

          {errors.updatePortfolios && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errors.updatePortfolios}
            </Alert>
          )}

          {renderResultsTable(results.updatePortfolios)}
        </Box>

        {/* Update Portfolios with System Holdings Scheduler */}
        <Box>
          <Button
            variant="outlined"
            startIcon={
              loading === 'updateSystemHoldings' ? (
                <CircularProgress size={20} />
              ) : (
                <Schedule />
              )
            }
            onClick={handleUpdatePortfoliosWithSystemHoldings}
            disabled={loading === 'updateSystemHoldings'}
            sx={{
              mb: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              minWidth: 280,
            }}
          >
            {loading === 'updateSystemHoldings'
              ? 'Updating System Holdings...'
              : 'Update Portfolios with System Holdings'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            Updates system holdings and portfolio snapshots (normally runs
            monthly on the 1st).
          </Typography>

          {errors.updateSystemHoldings && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errors.updateSystemHoldings}
            </Alert>
          )}

          {renderResultsTable(results.updateSystemHoldings)}
        </Box>
      </Stack>
    </AdminCard>
  );
};
export default AdminTestingSection;
