// Payoff method constants and mappings
export const PAYOFF_METHODS = {
  AVALANCHE: 'AVALANCHE',
  SNOWBALL: 'SNOWBALL',
} as const;

export type PayoffMethod = (typeof PAYOFF_METHODS)[keyof typeof PAYOFF_METHODS];

export const PAYOFF_METHOD_LABELS: Record<PayoffMethod, string> = {
  AVALANCHE: 'Avalanche Method',
  SNOWBALL: 'Snowball Method',
} as const;

// Helper function to get payoff method readable text
export const getPayoffMethodText = (method: PayoffMethod): string => {
  return PAYOFF_METHOD_LABELS[method] || method;
};
