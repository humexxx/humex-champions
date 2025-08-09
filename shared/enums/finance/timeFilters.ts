// Time filter constants and mappings
export const TIME_FILTERS = {
  ONE_DAY: '1 d.',
  FIVE_DAYS: '5 d.',
  ONE_MONTH: '1 m.',
  SIX_MONTHS: '6 m.',
  YTD: 'YTD',
  ONE_YEAR: '1 a.',
  FIVE_YEARS: '5 a.',
  MAX: 'MÁX.',
} as const;

export type TimeFilter = (typeof TIME_FILTERS)[keyof typeof TIME_FILTERS];

export const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
  [TIME_FILTERS.ONE_DAY]: '1 day',
  [TIME_FILTERS.FIVE_DAYS]: '5 days',
  [TIME_FILTERS.ONE_MONTH]: '1 month',
  [TIME_FILTERS.SIX_MONTHS]: '6 months',
  [TIME_FILTERS.YTD]: 'YTD',
  [TIME_FILTERS.ONE_YEAR]: '1 year',
  [TIME_FILTERS.FIVE_YEARS]: '5 years',
  [TIME_FILTERS.MAX]: 'all time',
} as const;

// Helper function to get time filter readable text
export const getTimeFilterText = (filter: TimeFilter): string => {
  return TIME_FILTER_LABELS[filter] || filter;
};
