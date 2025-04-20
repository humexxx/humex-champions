import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { EThemeType } from 'src/enums';

function getTheme(mode: EThemeType) {
  const theme = createTheme({
    palette: {
      mode,
    },
    // palette: {
    //   mode: 'light', // o 'dark' si prefieres estilo nocturno
    //   primary: {
    //     main: '#000000', // Negro Uber
    //     contrastText: '#FFFFFF',
    //   },
    //   secondary: {
    //     main: '#F6F6F6', // Gris claro
    //     contrastText: '#000000',
    //   },
    //   background: {
    //     default: '#FFFFFF',
    //     paper: '#FAFAFA', // fondos para tarjetas, inputs, etc.
    //   },
    //   text: {
    //     primary: '#1C1C1C',
    //     secondary: '#6B6B6B',
    //   },
    // },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 12,
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
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
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'filled',
          margin: 'dense',
          size: 'small',
        },
        styleOverrides: {
          root: {
            backgroundColor: '#fff',
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}

export default getTheme;
