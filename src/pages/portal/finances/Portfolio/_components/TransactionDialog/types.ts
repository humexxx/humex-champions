// Asset types
export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto';
  exchange?: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

// Transaction form data
export interface TransactionFormData {
  assetId: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  executedAt: string;
  notes: string;
}

// Asset search props
export interface AssetSearchAutocompleteProps {
  selectedAsset: Asset | null;
  onAssetSelect: (asset: Asset | null) => void;
  selectedFilter: 'all' | 'stock' | 'etf' | 'crypto';
  onFilterChange: (filter: 'all' | 'stock' | 'etf' | 'crypto') => void;
  loading?: boolean;
  error?: string | null;
}

// Transaction dialog props
export interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionFormData) => Promise<void>;
  portfolioId: string;
}

// Asset type options
export const ASSET_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'crypto', label: 'Crypto' },
] as const;

export type AssetType = (typeof ASSET_TYPES)[number]['value'];
