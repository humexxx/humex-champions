import { Theme } from '@emotion/react';
import { SxProps } from '@mui/material';
import { AnimatedLineProps } from '@mui/x-charts';

export interface CustomAnimatedLineProps extends AnimatedLineProps {
  limit?: number;
  sxBefore?: SxProps<Theme>;
  sxAfter?: SxProps<Theme>;
}
