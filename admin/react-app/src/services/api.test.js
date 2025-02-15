import axios from 'axios';
import api from './api';
import { mockApiResponse, mockApiError } from '../test/test-utils';

// Mock axios
jest.mock('axios');

describe('API Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios instance defaults
    api.defaults = {
      baseURL: '/wp-json/wd-appointments/v1',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.wdAppointments?.nonce,
      },
    };
  });

  describe('Request Interceptors', () => {
    it('adds authorization header when token exists', () => {
      const token = 'test-token';
      localStorage.setItem('auth_token', token);

      const request = {
        headers: {},
      };

      // Get the request interceptor
      const interceptor = api.interceptors.request.handlers[0];
      const modifiedRequest = interceptor.fulfilled(request);

      expect(modifiedRequest.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('does not add authorization header when token does not exist', () => {
      localStorage.removeItem('auth_token');

      const request = {
        headers: {},
      };

      const interceptor = api.interceptors.request.handlers[0];
      const modifiedRequest = interceptor.fulfilled(request);

      expect(modifiedRequest.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptors', () => {
    it('returns response data directly', () => {
      const response = {
        data: { success: true },
      };

      const interceptor = api.interceptors.response.handlers[0];
      const result = interceptor.fulfilled(response);

      expect(result).toEqual(response.data);
    });

    it('handles server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error)).rejects.toThrow('Internal server error');
    });

    it('handles network errors', async () => {
      const error = {
        request: {},
        message: 'Network error',
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error)).rejects.toThrow('No response from server');
    });

    it('handles request setup errors', async () => {
      const error = new Error('Request setup error');

      const interceptor = api.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error)).rejects.toThrow('Error setting up request');
    });
  });

  describe('API Methods', () => {
    it('makes GET request successfully', async () => {
      const mockData = { data: 'test' };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await api.get('/test');

      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith('/test', expect.any(Object));
    });

    it('makes POST request successfully', async () => {
      const postData = { name: 'test' };
      const mockData = { success: true };
      axios.post.mockResolvedValue({ data: mockData });

      const result = await api.post('/test', postData);

      expect(result).toEqual(mockData);
      expect(axios.post).toHaveBeenCalledWith('/test', postData, expect.any(Object));
    });

    it('makes PUT request successfully', async () => {
      const putData = { name: 'test' };
      const mockData = { success: true };
      axios.put.mockResolvedValue({ data: mockData });

      const result = await api.put('/test', putData);

      expect(result).toEqual(mockData);
      expect(axios.put).toHaveBeenCalledWith('/test', putData, expect.any(Object));
    });

    it('makes DELETE request successfully', async () => {
      const mockData = { success: true };
      axios.delete.mockResolvedValue({ data: mockData });

      const result = await api.delete('/test');

      expect(result).toEqual(mockData);
      expect(axios.delete).toHaveBeenCalledWith('/test', expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    it('handles 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };

      axios.get.mockRejectedValue(error);

      await expect(api.get('/test')).rejects.toThrow('Unauthorized');
    });

    it('handles 404 not found error', async () => {
      const error = {
        response: {
          status: 404,
          data: {
            message: 'Not found',
          },
        },
      };

      axios.get.mockRejectedValue(error);

      await expect(api.get('/test')).rejects.toThrow('Not found');
    });

    it('handles network timeout', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      axios.get.mockRejectedValue(error);

      await expect(api.get('/test')).rejects.toThrow('Request timeout');
    });

    it('handles rate limiting', async () => {
      const error = {
        response: {
          status: 429,
          data: {
            message: 'Too many requests',
          },
        },
      };

      axios.get.mockRejectedValue(error);

      await expect(api.get('/test')).rejects.toThrow('Too many requests');
    });
  });

  describe('Request Configuration', () => {
    it('applies correct base URL', () => {
      expect(api.defaults.baseURL).toBe('/wp-json/wd-appointments/v1');
    });

    it('includes correct content type header', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('includes WordPress nonce', () => {
      expect(api.defaults.headers['X-WP-Nonce']).toBe(window.wdAppointments?.nonce);
    });
  });
});
