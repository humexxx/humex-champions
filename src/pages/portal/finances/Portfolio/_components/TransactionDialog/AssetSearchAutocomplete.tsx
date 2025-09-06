import {
  Search as SearchIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { CALLABLE_FUNCTIONS } from '@shared/consts';
import { ICallableResponse } from '@shared/types';
import { Asset, AssetFilterType } from '@shared/types/finances/portfolio';
import { httpsCallable } from 'firebase/functions';
import React, { useEffect, useMemo, useState } from 'react';
import { functions } from 'src/firebase';

export const ASSET_TYPES: { value: AssetFilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'system', label: 'HumEx Products' },
];

interface AssetSearchAutocompleteProps {
  selectedAsset: Asset | null;
  onAssetSelect: (asset: Asset | null) => void;
  selectedFilter: AssetFilterType;
  onFilterChange: (filter: AssetFilterType) => void;
  showInternalProducts: boolean;
  loading?: boolean;
  error?: string | null;
}

// Firebase Functions
const searchTradableAssets = httpsCallable<
  SearchTradableAssetsInput,
  ICallableResponse<Asset[]>
>(functions, CALLABLE_FUNCTIONS.finances.searchTradableAssets);

const getSystemAssets = httpsCallable<
  undefined,
  ICallableResponse<{ assets: Asset[]; count: number }>
>(functions, CALLABLE_FUNCTIONS.finances.getSystemAssets);

const AssetSearchAutocomplete: React.FC<AssetSearchAutocompleteProps> = ({
  selectedAsset,
  onAssetSelect,
  selectedFilter,
  onFilterChange,
  showInternalProducts,
  loading: externalLoading = false,
  error: externalError = null,
}) => {
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, Asset[]>>(
    new Map()
  );

  // Filter assets based on selected filter
  const filteredAssets = useMemo(() => {
    let filtered = availableAssets;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((asset) => asset.type === selectedFilter);
    }

    return filtered;
  }, [availableAssets, selectedFilter]);

  // Get system assets filtered by search query
  const getFilteredSystemAssets = async (query: string): Promise<Asset[]> => {
    if (!showInternalProducts) return [];

    try {
      const result = await getSystemAssets();

      if (!result.data.success) {
        console.error('Error getting system assets:', result.data.error);
        return [];
      }

      const systemAssets = result.data.data.assets as Asset[];

      if (!query || query.length < 2) {
        return systemAssets;
      }

      // Filter by query if provided
      const lowerQuery = query.toLowerCase();
      return systemAssets.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(lowerQuery) ||
          asset.name.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error fetching system assets:', error);
      return [];
    }
  };

  // Asset search function
  const searchAssets = async (
    query: string,
    type: 'all' | 'stocks' | 'etfs' | 'crypto' | 'system' = 'all'
  ) => {
    // For internal products, always get them (no minimum query length)
    if (showInternalProducts) {
      const systemAssets = await getFilteredSystemAssets(query);
      setAvailableAssets(systemAssets);
      return;
    }

    // For external products, require at least 2 characters
    if (query.length < 2) {
      setAvailableAssets([]);
      return;
    }

    // Check cache first for external assets
    const cacheKey = `${query.toLowerCase()}-${type}`;
    if (searchCache.has(cacheKey)) {
      const cachedAssets = searchCache.get(cacheKey) || [];
      console.log('Using cached assets:', cachedAssets.length);
      setAvailableAssets(cachedAssets);
      return;
    }

    console.log('Searching external assets for query:', query);
    setSearchLoading(true);

    try {
      const result = await searchTradableAssets({
        query,
        type: type === 'system' ? 'all' : type, // Don't pass 'system' to Firebase
        limit: 10,
      });

      console.log('Search result:', result.data);

      if (!result.data.success) {
        console.error('Error searching assets:', result.data.error);
        setAvailableAssets([]);
        return;
      }

      const externalAssets = result.data.data.map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        exchange: asset.exchange,
        price: asset.price,
        change: asset.change,
        changePercent: asset.changePercent,
        isSystemAsset: false, // Mark as external asset
      }));

      console.log('Mapped external assets:', externalAssets);
      setAvailableAssets(externalAssets);

      // Cache the external result
      setSearchCache((prev) => new Map(prev).set(cacheKey, externalAssets));
    } catch (err: any) {
      console.error('Error searching assets:', err);
      setAvailableAssets([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce asset search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // For internal products, search immediately even with short queries
      if (
        showInternalProducts ||
        (assetSearchQuery && assetSearchQuery.length >= 2)
      ) {
        searchAssets(assetSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [assetSearchQuery, showInternalProducts]); // Add showInternalProducts dependency

  // Load internal products immediately when switching to internal mode
  useEffect(() => {
    if (showInternalProducts) {
      searchAssets(''); // Empty query to load all internal products
    } else {
      setAvailableAssets([]); // Clear when switching to external
    }
  }, [showInternalProducts]);

  // Handle filter changes
  const clearFilters = (_event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clearing filters');
    onFilterChange('all');
  };

  const isLoading = searchLoading || externalLoading;

  // Custom Paper component for the dropdown
  const CustomPaper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
  >((props, ref) => (
    <Paper ref={ref} {...props} elevation={1}>
      {/* Filter Section Inside Dropdown */}
      {!showInternalProducts && filteredAssets.length > 0 && (
        <>
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle2">Filters</Typography>
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>

            {/* Asset Type Filter */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Asset Type:
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.preventDefault()}
              >
                {ASSET_TYPES.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={
                      selectedFilter === value ? 'contained' : 'outlined'
                    }
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      console.log('Filter change:', value);
                      onFilterChange(value);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    sx={{
                      minWidth: 'auto',
                      textTransform: 'none',
                      borderRadius: 1,
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Active Filter Display */}
            {selectedFilter !== 'all' && (
              <Typography variant="body2" color="text.secondary">
                Showing:{' '}
                {
                  ASSET_TYPES.find((type) => type.value === selectedFilter)
                    ?.label
                }
              </Typography>
            )}
          </Box>
          <Divider />
        </>
      )}
      {props.children}
    </Paper>
  ));

  CustomPaper.displayName = 'CustomPaper';

  return (
    <Box>
      <Autocomplete
        options={filteredAssets}
        getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
        value={selectedAsset}
        onChange={(_, newValue) => onAssetSelect(newValue)}
        inputValue={assetSearchQuery}
        onInputChange={(_, newInputValue) => setAssetSearchQuery(newInputValue)}
        loading={isLoading}
        disableCloseOnSelect={false}
        slots={{
          paper: CustomPaper,
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Asset"
            placeholder={
              showInternalProducts
                ? 'Search HumEx products (e.g., HUMEX-YIELD)'
                : 'Search by symbol or name (e.g., AAPL, Bitcoin)'
            }
            fullWidth
            error={!!externalError}
            helperText={externalError}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </Box>
                ),
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box component="li" key={key} {...otherProps}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body1">
                    <strong>{option.symbol}</strong> - {option.name}
                  </Typography>
                  <Chip
                    label={option.type.toUpperCase()}
                    size="small"
                    color={
                      option.type === 'system'
                        ? 'primary'
                        : option.type === 'crypto'
                          ? 'warning'
                          : option.type === 'etf'
                            ? 'info'
                            : 'default'
                    }
                  />
                </Box>
                {option.isSystemAsset && option.monthlyYield && (
                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ fontWeight: 'medium' }}
                  >
                    Monthly Yield: {(option.monthlyYield * 100).toFixed(2)}% •
                    Risk: {option.riskLevel}
                  </Typography>
                )}
                {option.description && option.isSystemAsset && (
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
                {option.price && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      ${option.price.toFixed(2)}
                      {option.isSystemAsset && ' (Base Price)'}
                    </Typography>
                    {option.changePercent !== undefined &&
                      !option.isSystemAsset && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {option.changePercent >= 0 ? (
                            <TrendingUpIcon color="success" fontSize="small" />
                          ) : (
                            <TrendingDownIcon color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="body2"
                            color={
                              option.changePercent >= 0
                                ? 'success.main'
                                : 'error.main'
                            }
                          >
                            {option.changePercent > 0 ? '+' : ''}
                            {option.changePercent.toFixed(2)}%
                          </Typography>
                        </Box>
                      )}
                  </Box>
                )}
              </Box>
            </Box>
          );
        }}
        noOptionsText={
          showInternalProducts
            ? 'No HumEx products found'
            : assetSearchQuery.length < 2
              ? 'Type at least 2 characters to search external assets'
              : filteredAssets.length === 0 && availableAssets.length > 0
                ? 'No assets match your filters'
                : 'No external assets found'
        }
      />
    </Box>
  );
};

export default AssetSearchAutocomplete;
