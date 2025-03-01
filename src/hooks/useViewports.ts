import { useMediaQuery, useTheme } from '@mui/material';

export default function useViewports(): {
  isMobile: boolean;
  isDesktop: boolean;
} {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  return {
    isMobile,
    isDesktop,
  };
}
