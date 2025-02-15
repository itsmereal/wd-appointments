// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import 'jest-canvas-mock';
import 'whatwg-fetch';

// Increase timeout for async operations
jest.setTimeout(10000);

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
});

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock WordPress globals
global.wp = {
  element: {
    createElement: jest.fn(),
    Fragment: jest.fn(),
  },
  components: {},
  i18n: {
    __: (text) => text,
    _x: (text) => text,
    sprintf: (text, ...args) => text,
  },
  apiFetch: jest.fn(),
  url: {
    addQueryArgs: jest.fn(),
  },
};

// Mock WordPress admin functions
global.ajaxurl = 'http://localhost/wp-admin/admin-ajax.php';

// Mock plugin globals
global.wdAppointments = {
  apiUrl: 'http://localhost/wp-json/wd-appointments/v1',
  nonce: 'test-nonce',
  settings: {},
  translations: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    confirmDelete: 'Are you sure you want to delete this item?',
    success: 'Success!',
    error: 'Error!',
  },
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock date-fns locale
jest.mock('date-fns/locale', () => ({
  enUS: {},
}));

// Mock Material-UI components that use Portal
jest.mock('@mui/material/Modal', () => {
  return function MockModal({ children, open }) {
    return open ? children : null;
  };
});

jest.mock('@mui/material/Popper', () => {
  return function MockPopper({ children, open }) {
    return open ? children : null;
  };
});

// Clean up after each test
afterEach(() => {
  // Clean up any mounted components
  document.body.innerHTML = '';
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear local storage
  localStorage.clear();
  
  // Reset any timers
  jest.clearAllTimers();
});

// Add custom matchers
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expectedArgs) {
    const calls = received.mock.calls;
    const match = calls.some(call =>
      expectedArgs.every((arg, i) =>
        typeof arg === 'object'
          ? expect.objectContaining(arg).asymmetricMatch(call[i])
          : arg === call[i]
      )
    );

    return {
      pass: match,
      message: () =>
        `expected ${received.getMockName()} to have been called with arguments matching ${expectedArgs}`,
    };
  },
});
