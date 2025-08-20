// Period type constants and mappings
export const PERIOD_TYPES = {
  SINGLE: 'SINGLE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BI_WEEKLY: 'BI_WEEKLY',
  MONTHLY: 'MONTHLY',
  BI_MONTHLY: 'BI_MONTHLY',
  TRIMESTER: 'TRIMESTER',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUALLY: 'SEMI_ANNUALLY',
  YEARLY: 'YEARLY',
  CUSTOM: 'CUSTOM',
} as const;

export type PeriodType = (typeof PERIOD_TYPES)[keyof typeof PERIOD_TYPES];

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  SINGLE: 'Single Payment',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BI_WEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  BI_MONTHLY: 'Bi-Monthly',
  TRIMESTER: 'Trimester',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-Annually',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom',
} as const;

// Helper function to get period type readable text
export const getPeriodTypeText = (period: PeriodType): string => {
  return PERIOD_TYPE_LABELS[period] || period;
};
