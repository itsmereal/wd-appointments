import axios from 'axios';

// Validate WordPress environment
const validateWPEnvironment = () => {
  if (typeof window.wdAppointments === 'undefined') {
    throw new Error(
      'WordPress environment not detected. Make sure the plugin is properly activated.'
    );
  }
  if (!window.wdAppointments.apiUrl) {
    throw new Error(
      'API URL not found. Check WordPress REST API configuration.'
    );
  }
  if (!window.wdAppointments.nonce) {
    throw new Error('Security nonce not found. Try refreshing the page.');
  }
};

// Initialize API configuration
const initializeAPI = () => {
  validateWPEnvironment();
  console.log('Initializing API with URL:', window.wdAppointments.apiUrl);
  console.log('Using nonce:', window.wdAppointments.nonce);

  const instance = axios.create({
    baseURL: window.wdAppointments.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.wdAppointments.nonce,
    },
    // Add credentials to enable cookies
    withCredentials: true,
  });

  // Add request interceptor for debugging
  instance.interceptors.request.use(
    (config) => {
      console.log('Making request to:', config.url);
      console.log('Request headers:', config.headers);
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create axios instance with default config
const api = initializeAPI();

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    try {
      console.log('Fetching settings...');
      const response = await api.get('/settings');
      console.log('Settings response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      if (error.response?.status === 404) {
        throw new Error(
          'Settings endpoint not found. Please check if the plugin is properly activated and permalinks are updated.'
        );
      }
      throw error;
    }
  },
  updateSettings: (settings) => api.post('/settings', settings),
};

// Forms API
export const formsAPI = {
  getForms: () => api.get('/forms'),
  getForm: (id) => api.get(`/forms/${id}`),
  createForm: (form) => api.post('/forms', form),
  updateForm: (id, form) => api.put(`/forms/${id}`, form),
  deleteForm: (id) => api.delete(`/forms/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, appointment) =>
    api.put(`/appointments/${id}`, appointment),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  sendReminder: (id) => api.post(`/appointments/${id}/remind`),
};

// Calendar API
export const calendarAPI = {
  authenticate: (provider) => api.post(`/calendar/${provider}/auth`),
  disconnect: (provider) => api.post(`/calendar/${provider}/disconnect`),
  getEvents: (params) => api.get('/calendar/events', { params }),
};

// Enhanced error handler middleware
api.interceptors.response.use(
  (response) => {
    console.log('Successful response:', response);
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    // Handle different types of errors
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response);
      switch (error.response.status) {
        case 404:
          throw new Error(
            'API endpoint not found. Check plugin activation and permalinks.'
          );
        case 401:
          throw new Error('Authentication required. Please refresh the page.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 500:
          throw new Error('Server error. Please check WordPress error logs.');
        default:
          throw new Error(error.response.data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
      throw new Error(
        'No response from server. Check your WordPress installation.'
      );
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      throw new Error(error.message || 'Error setting up request');
    }
  }
);

export default api;
