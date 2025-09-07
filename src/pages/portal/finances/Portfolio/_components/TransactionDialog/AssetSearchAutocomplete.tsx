import { Search as SearchIcon } from '@mui/icons-material';
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
import {
  AssetFilterType,
  IAsset,
  SearchTradableAssetsInput,
} from '@shared/types/finances/portfolio';
import { ICallableResponse } from '@shared/types/functions';
import { httpsCallable } from 'firebase/functions';
import React, { useEffect, useMemo, useState } from 'react';
import { functions } from 'src/firebase';
import { formatPercentage } from 'src/utils';
import { getMarketColor } from './SelectedAssetView';

export const ASSET_TYPES: { value: AssetFilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'fx', label: 'FX' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'otc', label: 'OTC' },
  { value: 'indices', label: 'Indices' },
  { value: 'system', label: 'HumEx Products' },
];

interface AssetSearchAutocompleteProps {
  selectedAsset: IAsset | null;
  onAssetSelect: (asset: IAsset | null) => void;
  selectedFilter: AssetFilterType;
  onFilterChange: (filter: AssetFilterType) => void;
  showInternalProducts: boolean;
  loading?: boolean;
  error?: string | null;
}

// Firebase Functions
const searchTradableAssets = httpsCallable<
  SearchTradableAssetsInput,
  ICallableResponse<IAsset[]>
>(functions, CALLABLE_FUNCTIONS.finances.portfolio.searchTradableAssets);

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
  const [availableAssets, setAvailableAssets] = useState<IAsset[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, IAsset[]>>(
    new Map()
  );

  // Filter assets based on selected filter
  const filteredAssets = useMemo(() => {
    let filtered = availableAssets;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((asset) => asset.market === selectedFilter);
    }

    return filtered;
  }, [availableAssets, selectedFilter]);

  // Asset search function
  const searchAssets = async (query: string, type: AssetFilterType = 'all') => {
    if (query.length < 2 && !showInternalProducts) {
      setAvailableAssets([]);
      return;
    }

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
        type: showInternalProducts ? 'system' : type,
        limit: 10,
      });

      if (!result.data.success) {
        console.error('Error searching assets:', result.data.error);
        setAvailableAssets([]);
        return;
      }

      const assets = result.data.data as IAsset[];
      setAvailableAssets(assets);

      // Cache the external result
      setSearchCache((prev) => new Map(prev).set(cacheKey, assets));
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
      if (
        showInternalProducts ||
        (assetSearchQuery && assetSearchQuery.length >= 2)
      ) {
        searchAssets(assetSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [assetSearchQuery, showInternalProducts]); // Add showInternalProducts dependency

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
                    label={option.market.toUpperCase()}
                    size="small"
                    color={getMarketColor(option.market)}
                  />
                </Box>
                {!!option.systemAssetDetails && (
                  <>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ fontWeight: 'medium' }}
                    >
                      Monthly Yield:{' '}
                      {formatPercentage(
                        option.systemAssetDetails?.monthlyYield
                      )}{' '}
                      • Risk: {option.systemAssetDetails?.riskLevel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.systemAssetDetails?.description}
                    </Typography>
                  </>
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
