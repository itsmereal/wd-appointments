import React, { createContext, useContext, useReducer, useEffect } from 'react';
import settingsService, {
  defaultSettings,
  SettingsSection,
} from '../services/settings';
import { useApp } from './AppContext';

// Create context
const SettingsContext = createContext();

// Action types
const ActionTypes = {
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_SETTINGS: 'RESET_SETTINGS',
};

// Initial state
const initialState = {
  settings: defaultSettings,
  loading: false,
  error: null,
  initialized: false,
};

// Reducer
function settingsReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SETTINGS:
      return {
        ...state,
        settings: action.payload,
        initialized: true,
        error: null,
      };
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.section]: {
            ...state.settings[action.payload.section],
            ...action.payload.settings,
          },
        },
        error: null,
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case ActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: defaultSettings,
        error: null,
      };
    default:
      return state;
  }
}

// Provider component
export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { showNotification } = useApp();

  // Load all settings
  const loadSettings = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const settings = await settingsService.getSettings();
      dispatch({ type: ActionTypes.SET_SETTINGS, payload: settings });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to load settings');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Update settings for a specific section
  const updateSettings = async (section, settings) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      // Update local state immediately for better UX
      dispatch({
        type: ActionTypes.UPDATE_SETTINGS,
        payload: { section, settings },
      });

      // Send update to server
      await settingsService.updateSettings({
        ...state.settings,
        [section]: {
          ...state.settings[section],
          ...settings,
        },
      });

      showNotification('success', 'Settings updated successfully');
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to update settings');

      // Reload settings to ensure consistency
      await loadSettings();
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await settingsService.resetSettings();
      dispatch({ type: ActionTypes.RESET_SETTINGS });
      showNotification('success', 'Settings reset to defaults');
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to reset settings');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Import settings
  const importSettings = async (settings) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await settingsService.importSettings(settings);
      await loadSettings(); // Reload settings after import
      showNotification('success', 'Settings imported successfully');
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to import settings');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Export settings
  const exportSettings = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const exportData = await settingsService.exportSettings();
      return exportData;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to export settings');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Get settings for a specific section
  const getSettings = (section) => {
    return state.settings[section] || defaultSettings[section];
  };

  // Context value
  const value = {
    ...state,
    updateSettings,
    resetSettings,
    importSettings,
    exportSettings,
    getSettings,
    loadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Export context for advanced use cases
export default SettingsContext;

// Export sections enum
export { SettingsSection };
