/**
 * Base Calendar Service class that defines the interface
 * for calendar integrations
 */
export class CalendarService {
  constructor(config) {
    if (this.constructor === CalendarService) {
      throw new Error(
        "Abstract class 'CalendarService' cannot be instantiated."
      );
    }
    this.config = config;
  }

  // Authentication methods
  async authenticate() {
    throw new Error('authenticate() must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }

  async refreshToken() {
    throw new Error('refreshToken() must be implemented');
  }

  // Event methods
  async createEvent(eventData) {
    throw new Error('createEvent() must be implemented');
  }

  async updateEvent(eventId, eventData) {
    throw new Error('updateEvent() must be implemented');
  }

  async deleteEvent(eventId) {
    throw new Error('deleteEvent() must be implemented');
  }

  async getEvent(eventId) {
    throw new Error('getEvent() must be implemented');
  }

  async listEvents(params) {
    throw new Error('listEvents() must be implemented');
  }

  // Availability methods
  async getAvailability(startDate, endDate) {
    throw new Error('getAvailability() must be implemented');
  }

  // Helper methods
  isAuthenticated() {
    throw new Error('isAuthenticated() must be implemented');
  }

  formatEventData(appointmentData) {
    throw new Error('formatEventData() must be implemented');
  }

  parseEventData(calendarEvent) {
    throw new Error('parseEventData() must be implemented');
  }
}

/**
 * Factory function to create calendar service instances
 */
export const createCalendarService = async (type, config) => {
  let service;
  switch (type) {
    case 'google': {
      const module = await import('./GoogleCalendarService');
      service = new module.GoogleCalendarService(config);
      break;
    }
    case 'icloud':
      // TODO: Implement iCloud calendar service
      throw new Error('iCloud calendar service not implemented yet');
    default:
      throw new Error(`Unsupported calendar type: ${type}`);
  }
  return service;
};

/**
 * Event data interface
 * @typedef {Object} EventData
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {Date} startTime - Event start time
 * @property {Date} endTime - Event end time
 * @property {string} [location] - Event location (optional)
 * @property {string} [meetingLink] - Virtual meeting link (optional)
 * @property {Array<string>} [attendees] - List of attendee email addresses
 */

/**
 * Appointment data interface
 * @typedef {Object} AppointmentData
 * @property {string} clientName - Client's name
 * @property {string} clientEmail - Client's email
 * @property {Date} appointmentDate - Appointment date and time
 * @property {number} duration - Duration in minutes
 * @property {string} formTitle - Booking form title
 * @property {string} [location] - Appointment location
 * @property {string} [meetingType] - Type of meeting (google_meet, zoom, phone, custom)
 */

export const CalendarError = {
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  INVALID_DATA: 'INVALID_DATA',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export class CalendarServiceError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'CalendarServiceError';
    this.type = type;
    this.originalError = originalError;
  }
}
