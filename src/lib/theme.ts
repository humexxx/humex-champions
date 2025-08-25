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
      h1: {
        fontSize: '1.875rem', // Much smaller for Google-like subtlety
        fontWeight: 300, // Lighter weight like Google
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 300,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 400,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '0.9375rem', // Smaller and lighter
        fontWeight: 400, // Less bold than before
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '0.8125rem', // Smaller body text like Google
        lineHeight: 1.5,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.75rem', // Even smaller for secondary text
        lineHeight: 1.5,
        fontWeight: 400,
      },
      button: {
        textTransform: 'none',
        fontWeight: 400, // Much lighter, not bold like Google
        fontSize: '0.75rem', // Smaller buttons
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.6875rem',
        lineHeight: 1.4,
        fontWeight: 300, // Very light for captions
      },
    },
    shape: {
      borderRadius: 8, // Google uses more rounded corners
    },
    spacing: 8, // Google's 8px spacing system
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24, // Google's pill-shaped buttons
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            },
          },
          contained: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            '&:hover': {
              boxShadow:
                '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
            },
          },
          outlined: {
            borderWidth: '1px',
            '&:hover': {
              borderWidth: '1px',
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
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
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          },
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
            fontWeight: 400, // Much lighter like Google
            fontSize: '0.6875rem', // Even smaller to match Google's subtle style
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
