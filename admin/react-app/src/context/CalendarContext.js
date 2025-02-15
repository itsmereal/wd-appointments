import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { createCalendarService } from '../services/calendar/CalendarService';
import { useApp } from './AppContext';

// Initial state
const initialState = {
  provider: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  events: [],
  availability: []
};

// Action types
const ActionTypes = {
  SET_PROVIDER: 'SET_PROVIDER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_EVENTS: 'SET_EVENTS',
  SET_AVAILABILITY: 'SET_AVAILABILITY',
  RESET: 'RESET'
};

// Reducer
function calendarReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload,
        error: null
      };
    case ActionTypes.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
        error: null
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case ActionTypes.SET_EVENTS:
      return {
        ...state,
        events: action.payload,
        error: null
      };
    case ActionTypes.SET_AVAILABILITY:
      return {
        ...state,
        availability: action.payload,
        error: null
      };
    case ActionTypes.RESET:
      return initialState;
    default:
      return state;
  }
}

// Create context
const CalendarContext = createContext();

// Provider component
export function CalendarProvider({ children }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const { settings, showNotification } = useApp();
  const [calendarService, setCalendarService] = React.useState(null);

  // Initialize calendar service when provider changes
  const initializeCalendarService = useCallback(async (provider, config) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const service = createCalendarService(provider, config);
      setCalendarService(service);
      dispatch({ type: ActionTypes.SET_PROVIDER, payload: provider });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to initialize calendar service');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [showNotification]);

  // Authentication methods
  const authenticate = async () => {
    if (!calendarService) return;

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await calendarService.authenticate();
      dispatch({ type: ActionTypes.SET_AUTHENTICATED, payload: true });
      showNotification('success', 'Successfully connected to calendar');
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to connect to calendar');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const disconnect = async () => {
    if (!calendarService) return;

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await calendarService.disconnect();
      dispatch({ type: ActionTypes.SET_AUTHENTICATED, payload: false });
      showNotification('success', 'Successfully disconnected from calendar');
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to disconnect from calendar');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Event methods
  const createEvent = async (eventData) => {
    if (!calendarService) return null;

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const event = await calendarService.createEvent(eventData);
      showNotification('success', 'Event created successfully');
      return event;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to create event');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const updateEvent = async (eventId, eventData) => {
    if (!calendarService) return null;

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const event = await calendarService.updateEvent(eventId, eventData);
      showNotification('success', 'Event updated successfully');
      return event;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to update event');
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteEvent = async (eventId) => {
    if (!calendarService) return false;

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await calendarService.deleteEvent(eventId);
      showNotification('success', 'Event deleted successfully');
      return true;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to delete event');
      return false;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const getAvailability = async (startDate, endDate) => {
    if (!calendarService) return [];

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const availability = await calendarService.getAvailability(startDate, endDate);
      dispatch({ type: ActionTypes.SET_AVAILABILITY, payload: availability });
      return availability;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      showNotification('error', 'Failed to fetch availability');
      return [];
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Initialize calendar service when settings change
  React.useEffect(() => {
    if (settings?.calendar?.provider && settings?.calendar?.credentials) {
      initializeCalendarService(
        settings.calendar.provider,
        settings.calendar.credentials[settings.calendar.provider]
      );
    }
  }, [settings?.calendar, initializeCalendarService]);

  // Context value
  const value = {
    ...state,
    authenticate,
    disconnect,
    createEvent,
    updateEvent,
    deleteEvent,
    getAvailability,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

// Custom hook to use the calendar context
export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

export default CalendarContext;
