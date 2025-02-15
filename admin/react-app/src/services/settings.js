import api from './api';

/**
 * Settings service for managing plugin settings
 */
class SettingsService {
  /**
   * Get all settings
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update settings
   * @param {Object} settings - Settings object to update
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(settings) {
    try {
      const response = await api.post('/settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get system information
   * @returns {Promise<Object>} System information
   */
  async getSystemInfo() {
    try {
      const response = await api.get('/settings/system-info');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Test email settings
   * @param {Object} params - Email test parameters
   * @returns {Promise<Object>} Test result
   */
  async testEmail(params) {
    try {
      const response = await api.post('/settings/test-email', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Activate license
   * @param {string} licenseKey - License key to activate
   * @returns {Promise<Object>} Activation result
   */
  async activateLicense(licenseKey) {
    try {
      const response = await api.post('/settings/license/activate', { licenseKey });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deactivate license
   * @returns {Promise<Object>} Deactivation result
   */
  async deactivateLicense() {
    try {
      const response = await api.post('/settings/license/deactivate');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check for plugin updates
   * @returns {Promise<Object>} Update information
   */
  async checkUpdates() {
    try {
      const response = await api.get('/settings/updates');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Import settings
   * @param {Object} settings - Settings to import
   * @returns {Promise<Object>} Import result
   */
  async importSettings(settings) {
    try {
      const response = await api.post('/settings/import', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export settings
   * @returns {Promise<Object>} Settings export
   */
  async exportSettings() {
    try {
      const response = await api.get('/settings/export');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset settings to defaults
   * @returns {Promise<Object>} Reset result
   */
  async resetSettings() {
    try {
      const response = await api.post('/settings/reset');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Purge all plugin data
   * @returns {Promise<Object>} Purge result
   */
  async purgeData() {
    try {
      const response = await api.post('/settings/purge');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   * @private
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      const errorCode = error.response.data?.code || 'unknown_error';
      const newError = new Error(message);
      newError.code = errorCode;
      return newError;
    }
    
    if (error.request) {
      // Request made but no response
      return new Error('No response from server');
    }
    
    // Request setup error
    return new Error('Error setting up request');
  }
}

// Settings service singleton
const settingsService = new SettingsService();

export default settingsService;

// Settings types
export const SettingsSection = {
  GENERAL: 'general',
  EMAIL: 'email',
  APPEARANCE: 'appearance',
  CALENDAR: 'calendar',
  LICENSE: 'license',
  ADVANCED: 'advanced',
};

// Default settings
export const defaultSettings = {
  [SettingsSection.GENERAL]: {
    businessName: '',
    timezone: 'UTC',
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    weekStartsOn: 1,
    defaultDuration: 30,
    bufferTime: 0,
    minimumNotice: 24,
    maxFutureDays: 90,
    allowCancellations: true,
    allowRescheduling: true,
    showTimezoneSelect: true,
  },
  [SettingsSection.EMAIL]: {
    fromName: '',
    fromEmail: '',
    adminEmail: '',
    emailVerification: true,
    adminNotifications: true,
    reminderEmails: true,
    reminderHours: 24,
    templates: {
      verification: {
        subject: 'Verify your appointment',
        body: 'Please verify your appointment...',
      },
      confirmation: {
        subject: 'Appointment Confirmed',
        body: 'Your appointment has been confirmed...',
      },
      reminder: {
        subject: 'Appointment Reminder',
        body: 'This is a reminder for your upcoming appointment...',
      },
      cancelled: {
        subject: 'Appointment Cancelled',
        body: 'Your appointment has been cancelled...',
      },
    },
  },
  [SettingsSection.APPEARANCE]: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: 4,
    enableShadows: true,
    enableAnimations: true,
  },
  [SettingsSection.CALENDAR]: {
    provider: null,
    googleClientId: '',
    googleClientSecret: '',
    icloudEmail: '',
    icloudPassword: '',
    autoSync: true,
    addReminders: true,
  },
  [SettingsSection.LICENSE]: {
    licenseKey: '',
    licenseStatus: 'inactive',
    licenseExpiry: null,
    licenseDomain: null,
    licenseType: 'standard',
  },
  [SettingsSection.ADVANCED]: {
    enableCache: true,
    enableAPICache: true,
    cacheDuration: 3600,
    debugMode: false,
    logAPIRequests: false,
  },
};
