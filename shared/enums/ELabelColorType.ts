export const ELabelColorType = {
  INHERIT: 'inherit',
  ACTION: 'action',
  DISABLED: 'disabled',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
} as const;

export type ELabelColorType =
  (typeof ELabelColorType)[keyof typeof ELabelColorType];
