import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { settingsAPI } from '../services/api';

// Initial state
const initialState = {
  settings: null,
  loading: false,
  error: null,
  notifications: [],
};

// Action types
const ActionTypes = {
  SET_SETTINGS: 'SET_SETTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SETTINGS:
      return {
        ...state,
        settings: action.payload,
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
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showNotification = (severity, message) => {
    const id = Date.now();
    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: {
        id,
        severity,
        message,
      },
    });
    setTimeout(() => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    }, 5000);
  };

  const loadSettings = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const settings = await settingsAPI.getSettings();
      dispatch({ type: ActionTypes.SET_SETTINGS, payload: settings });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to load settings');
    }
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  };

  const updateSettings = async (newSettings) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const updated = await settingsAPI.updateSettings(newSettings);
      dispatch({ type: ActionTypes.SET_SETTINGS, payload: updated });
      showNotification('success', 'Settings updated successfully');
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to update settings');
    }
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Context value
  const value = {
    ...state,
    updateSettings,
    showNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
