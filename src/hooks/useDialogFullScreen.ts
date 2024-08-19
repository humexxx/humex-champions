import { useMediaQuery, useTheme } from '@mui/material';

function useDialogFullScreen(): boolean {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return fullScreen;
}

export default useDialogFullScreen;
