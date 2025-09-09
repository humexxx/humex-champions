import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { EThemeType } from 'src/enums';

function getTheme(mode: EThemeType) {
  const theme = createTheme({
    palette: {
      mode,
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 12, // Reduced even more to match Google's lighter feel
    },
    shape: {
      borderRadius: 8, // Google uses more rounded corners
    },
    spacing: 8, // Google's 8px spacing system
    components: {
      MuiButton: {
        defaultProps: {
          sx: {
            boxShadow: 'none',
          },
        },
        styleOverrides: {
          root: {
            borderRadius: 24, // Google's pill-shaped buttons
            textTransform: 'none',
          },
          outlined: {
            borderWidth: '1px',
          },
          text: {
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
          },
        },
      },
      MuiCard: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          margin: 'normal',
          size: 'medium',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0,0,0,0.87)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minHeight: 36, // More compact
            padding: '6px 12px', // Tighter padding
            '&.Mui-selected': {
              fontWeight: 400, // Don't make bold when selected
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            fontSize: '0.6875rem',
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontSize: '0.6875rem', // Match the smaller typography
            fontWeight: 300, // Much lighter like Google
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
          elevation2: {
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          },
          elevation3: {
            boxShadow:
              '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,0,0,0.08)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.12)',
              },
            },
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}

export default getTheme;
