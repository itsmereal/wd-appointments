import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppProvider } from '../context/AppContext';
import { SettingsProvider } from '../context/SettingsContext';
import { CalendarProvider } from '../context/CalendarContext';
import theme from '../config/theme';

// Custom render function that includes providers
function render(ui, {
  route = '/',
  initialSettings = {},
  ...renderOptions
} = {}) {
  // Set up window location for the test
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppProvider>
              <SettingsProvider initialSettings={initialSettings}>
                <CalendarProvider>
                  {children}
                </CalendarProvider>
              </SettingsProvider>
            </AppProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock data generators
const generateMockAppointment = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  clientName: 'John Doe',
  clientEmail: 'john@example.com',
  appointmentDate: new Date().toISOString(),
  duration: 30,
  status: 'pending',
  formId: 1,
  formTitle: 'Test Form',
  type: 'google_meet',
  notes: '',
  calendarEventId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const generateMockForm = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  title: 'Test Form',
  duration: 30,
  type: 'google_meet',
  description: '',
  settings: {
    scheduling: {
      dateRange: {
        start: null,
        end: null,
      },
      availableHours: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [],
        sunday: [],
      },
      bufferTime: 0,
      minimumNotice: 24,
      dailyLimit: null,
      timezone: 'host',
    },
    fields: [],
    notifications: {
      templates: {},
    },
  },
  stats: {
    totalBookings: 0,
    monthlyBookings: 0,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock API responses
const mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

// Mock error responses
const mockApiError = (message, status = 400) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { message },
  };
  return Promise.reject(error);
};

// Test data builders
const buildTestSettings = (overrides = {}) => ({
  general: {
    businessName: 'Test Business',
    timezone: 'UTC',
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    ...overrides.general,
  },
  email: {
    fromName: 'Test Business',
    fromEmail: 'test@example.com',
    adminEmail: 'admin@example.com',
    ...overrides.email,
  },
  appearance: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    ...overrides.appearance,
  },
  calendar: {
    provider: 'google',
    ...overrides.calendar,
  },
  ...overrides,
});

// Custom test matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received);
    return {
      message: () =>
        `expected ${received} to be a valid date`,
      pass,
    };
  },
  toBeValidISOString(received) {
    const pass = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(received);
    return {
      message: () =>
        `expected ${received} to be a valid ISO string`,
      pass,
    };
  },
});

// Export everything
export * from '@testing-library/react';
export {
  render,
  generateMockAppointment,
  generateMockForm,
  mockApiResponse,
  mockApiError,
  buildTestSettings,
};
