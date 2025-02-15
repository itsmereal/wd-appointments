import { createTheme } from '@mui/material/styles';

// Get settings from window object (provided by WordPress)
const settings = window.wdAppointments?.settings || {};

// Create theme configuration
const createAppTheme = (mode = 'light') => {
  const primaryColor = settings?.colors?.primary || '#007bff';
  const secondaryColor = settings?.colors?.secondary || '#6c757d';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: adjustColor(primaryColor, 20),
        dark: adjustColor(primaryColor, -20),
      },
      secondary: {
        main: secondaryColor,
        light: adjustColor(secondaryColor, 20),
        dark: adjustColor(secondaryColor, -20),
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: settings?.typography?.fontFamily || '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '4px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow: mode === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.05)'
              : '0 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(0,0,0,0.05)'
              : '0 1px 3px rgba(0,0,0,0.2)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            border: 'none',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            margin: '4px 8px',
            width: 'auto',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
          },
        },
      },
    },
    shape: {
      borderRadius: 4,
    },
  });
};

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  return color;
  // Note: In a production environment, you would implement
  // proper color manipulation here. For now, we're returning
  // the original color to avoid adding additional dependencies.
}

export default createAppTheme;
