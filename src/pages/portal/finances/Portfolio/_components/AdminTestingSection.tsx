import { AccountBalance, ExpandMore, Refresh } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { useState } from 'react';

import { CALLABLE_FUNCTION_NAMES } from '@shared/consts';
import { useAuth } from 'src/context/hooks';
import { functions } from 'src/firebase';

// No props needed - component manages its own admin check
const AdminTestingSection = () => {
  // Check admin status at component level - BETTER PRACTICE
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Early return if not admin - component controls its own visibility
  if (!isAdmin) {
    return null;
  }

  const handleUpdateAssetPrices = async () => {
    setLoading('prices');
    setErrors((prev) => ({ ...prev, prices: '' }));

    try {
      // TODO: Replace with actual refresh asset prices function
      const updatePrices = httpsCallable(
        functions,
        CALLABLE_FUNCTION_NAMES.refreshAssetPrices
      );

      const result = await updatePrices({});
      const response = result.data as any;

      if (response.success) {
        setResults((prev) => ({
          ...prev,
          prices: {
            message: response.data.message,
            updatedAssets: response.data.updatedAssets,
            assetList: response.data.assetList,
            timestamp: response.data.timestamp,
          },
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          prices: response.error || 'Unknown error',
        }));
      }
    } catch (error) {
      console.error('Error updating asset prices:', error);
      setErrors((prev) => ({
        ...prev,
        prices: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setLoading(null);
    }
  };

  const handleUpdatePortfolioSnapshots = async () => {
    setLoading('snapshots');
    setErrors((prev) => ({ ...prev, snapshots: '' }));

    try {
      // TODO: Replace with actual admin generate snapshots function
      const updateSnapshots = httpsCallable(
        functions,
        CALLABLE_FUNCTION_NAMES.adminGenerateSnapshots
      );

      const result = await updateSnapshots({});
      const response = result.data as any;

      if (response.success) {
        setResults((prev) => ({
          ...prev,
          snapshots: {
            message: response.data.message,
            updatedUsers: response.data.updatedUsers,
            updatedPortfolios: response.data.updatedPortfolios,
            updatedSnapshots: response.data.updatedSnapshots,
            errors: response.data.errors,
            timestamp: response.data.timestamp,
          },
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          snapshots: response.error || 'Unknown error',
        }));
      }
    } catch (error) {
      console.error('Error updating portfolio snapshots:', error);
      setErrors((prev) => ({
        ...prev,
        snapshots: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card sx={{ mt: 3, border: '2px solid', borderColor: 'warning.main' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
          🛠️ Admin Testing Section
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          This section is only visible to administrators. Use these functions to
          manually trigger portfolio calculations and updates.
        </Alert>

        <Stack spacing={3}>
          {/* Update Asset Prices */}
          <Box>
            <Button
              variant="outlined"
              startIcon={
                loading === 'prices' ? (
                  <CircularProgress size={20} />
                ) : (
                  <Refresh />
                )
              }
              onClick={handleUpdateAssetPrices}
              disabled={loading === 'prices'}
              sx={{
                mb: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                minWidth: 200,
              }}
            >
              {loading === 'prices'
                ? 'Updating Prices...'
                : 'Update Asset Prices'}
            </Button>

            {errors.prices && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.prices}
              </Alert>
            )}

            {results.prices && (
              <Accordion sx={{ mt: 1 }} variant="outlined">
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${results.prices.updatedAssets} Assets`}
                      size="small"
                      color="success"
                    />
                    <Typography variant="body2">
                      {results.prices.message}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {results.prices.assetList?.map(
                      (asset: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={asset} />
                        </ListItem>
                      )
                    )}
                  </List>
                  <Typography variant="caption" color="text.secondary">
                    Updated at:{' '}
                    {new Date(results.prices.timestamp).toLocaleString()}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>

          {/* Update Portfolio Snapshots */}
          <Box>
            <Button
              variant="outlined"
              startIcon={
                loading === 'snapshots' ? (
                  <CircularProgress size={20} />
                ) : (
                  <AccountBalance />
                )
              }
              onClick={handleUpdatePortfolioSnapshots}
              disabled={loading === 'snapshots'}
              sx={{
                mb: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                minWidth: 200,
              }}
            >
              {loading === 'snapshots'
                ? 'Updating Portfolios...'
                : 'Update Portfolios'}
            </Button>

            {errors.snapshots && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.snapshots}
              </Alert>
            )}

            {results.snapshots && (
              <Accordion sx={{ mt: 1 }} variant="outlined">
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${results.snapshots.updatedUsers} Users`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={`${results.snapshots.updatedPortfolios} Portfolios`}
                      size="small"
                      color="success"
                    />
                    <Chip
                      label={`${results.snapshots.updatedSnapshots} Snapshots`}
                      size="small"
                      color="info"
                    />
                    <Typography variant="body2">
                      {results.snapshots.message}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        📊 Batch Update Results
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={`${results.snapshots.updatedUsers} users processed`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${results.snapshots.updatedPortfolios} portfolios updated`}
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={`${results.snapshots.updatedSnapshots} snapshots created`}
                          color="info"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    {results.snapshots.errors &&
                      results.snapshots.errors.length > 0 && (
                        <Box>
                          <Typography variant="h6" color="error" gutterBottom>
                            ⚠️ Errors ({results.snapshots.errors.length})
                          </Typography>
                          <List dense>
                            {results.snapshots.errors.map(
                              (error: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={error}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      color: 'error',
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>
                        </Box>
                      )}

                    <Typography variant="caption" color="text.secondary">
                      Updated at:{' '}
                      {new Date(results.snapshots.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AdminTestingSection;
