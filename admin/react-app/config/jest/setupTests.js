'use strict';

// Add any global test setup here
require('@testing-library/jest-dom');

// Mock fetch globally
global.fetch = require('jest-fetch-mock');

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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
const locationMock = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  pathname: '/wp-admin/admin.php',
  search: '',
  hash: '',
  href: 'http://localhost/wp-admin/admin.php',
  origin: 'http://localhost',
};
delete window.location;
window.location = locationMock;

// Mock console methods to catch test warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillMount') ||
        args[0].includes('componentWillReceiveProps'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };

  // Silence console.log during tests
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toHaveBeenCalledAfter(received, other) {
    const receivedCalls = received.mock.invocationCallOrder;
    const otherCalls = other.mock.invocationCallOrder;

    if (receivedCalls.length === 0) {
      return {
        message: () => 'Expected function to have been called',
        pass: false,
      };
    }

    if (otherCalls.length === 0) {
      return {
        message: () => 'Expected comparison function to have been called',
        pass: false,
      };
    }

    const pass = Math.min(...receivedCalls) > Math.max(...otherCalls);

    return {
      message: () =>
        `expected ${received.getMockName()} to have been called after ${other.getMockName()}`,
      pass,
    };
  },
});

// Set timezone for consistent date testing
process.env.TZ = 'UTC';

// Increase timeout for async tests
jest.setTimeout(10000);
