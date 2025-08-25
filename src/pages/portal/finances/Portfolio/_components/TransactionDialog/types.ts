// Asset types
export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'system';
  exchange?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  // Para instrumentos del sistema
  isSystemAsset?: boolean;
  monthlyYield?: number; // 0.007 para 0.7% mensual
  description?: string;
  riskLevel?: 'low' | 'medium' | 'high';
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
  selectedFilter: 'all' | 'stock' | 'etf' | 'crypto' | 'system';
  onFilterChange: (
    filter: 'all' | 'stock' | 'etf' | 'crypto' | 'system'
  ) => void;
  showSystemAssets?: boolean;
  onToggleSystemAssets?: (show: boolean) => void;
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
  { value: 'system', label: 'HumEx Products' },
] as const;

export type AssetType = (typeof ASSET_TYPES)[number]['value'];
