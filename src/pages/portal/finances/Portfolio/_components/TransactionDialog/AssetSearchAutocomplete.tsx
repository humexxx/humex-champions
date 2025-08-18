import React, { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Chip,
  CircularProgress,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../../../firebase';
import { Asset, AssetSearchAutocompleteProps, ASSET_TYPES } from './types';

// Firebase Functions
const searchTradableAssets = httpsCallable(functions, 'searchTradableAssets');

const AssetSearchAutocomplete: React.FC<AssetSearchAutocompleteProps> = ({
  selectedAsset,
  onAssetSelect,
  selectedFilter,
  onFilterChange,
  loading: externalLoading = false,
  error: externalError = null,
}) => {
  // Local state
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCache, setSearchCache] = useState<Map<string, Asset[]>>(
    new Map()
  );

  // Filter assets based on selected filter
  const filteredAssets = useMemo(() => {
    let filtered = availableAssets;

    console.log('Available assets:', availableAssets.length);
    console.log('Selected filter:', selectedFilter);

    // Filter by type if not "all"
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((asset) => asset.type === selectedFilter);
      console.log('Filtered assets:', filtered.length);
    }

    return filtered;
  }, [availableAssets, selectedFilter]);

  // Asset search function
  const searchAssets = async (
    query: string,
    type: 'all' | 'stocks' | 'etfs' | 'crypto' = 'all'
  ) => {
    if (query.length < 2) {
      setAvailableAssets([]);
      return;
    }

    // Check cache first
    const cacheKey = `${query.toLowerCase()}-${type}`;
    if (searchCache.has(cacheKey)) {
      const cachedAssets = searchCache.get(cacheKey) || [];
      console.log('Using cached assets:', cachedAssets.length);
      setAvailableAssets(cachedAssets);
      return;
    }

    console.log('Searching assets for query:', query);
    setSearchLoading(true);

    try {
      const result = await searchTradableAssets({
        query,
        type,
        limit: 10,
      });

      console.log('Search result:', result.data);

      const assets = (result.data as any).assets.map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        exchange: asset.exchange,
        price: asset.price,
        change: asset.change,
        changePercent: asset.changePercent,
      }));

      console.log('Mapped assets:', assets);
      setAvailableAssets(assets);

      // Cache the result
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
      if (assetSearchQuery && assetSearchQuery.length >= 2) {
        searchAssets(assetSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [assetSearchQuery]);

  // Handle filter changes
  const clearFilters = (_event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clearing filters');
    onFilterChange('all');
  };

  const isLoading = searchLoading || externalLoading;

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
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Asset"
            placeholder="Search by symbol or name (e.g., AAPL, Bitcoin)"
            fullWidth
            error={!!externalError}
            helperText={externalError}
            InputProps={{
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
                      option.type === 'crypto'
                        ? 'warning'
                        : option.type === 'etf'
                          ? 'info'
                          : 'default'
                    }
                  />
                </Box>
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
                    </Typography>
                    {option.changePercent !== undefined && (
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
          assetSearchQuery.length < 2
            ? 'Type at least 2 characters to search'
            : filteredAssets.length === 0 && availableAssets.length > 0
              ? 'No assets match your filters'
              : 'No assets found'
        }
        PaperComponent={({ children, ...props }) => (
          <Paper {...props}>
            {/* Filter Section Inside Dropdown */}
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
            {children}
          </Paper>
        )}
      />

      {/* Results Summary */}
      {availableAssets.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Showing {filteredAssets.length} of {availableAssets.length} results
          {filteredAssets.length !== availableAssets.length && ' (filtered)'}
        </Typography>
      )}
    </Box>
  );
};

export default AssetSearchAutocomplete;
