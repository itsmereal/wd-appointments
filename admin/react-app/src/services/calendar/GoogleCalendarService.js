import {
  CalendarService,
  CalendarError,
  CalendarServiceError,
} from './CalendarService';

export class GoogleCalendarService extends CalendarService {
  constructor(config) {
    super(config);
    this.tokenClient = null;
    this.accessToken = null;
    this.SCOPES = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];
  }

  async initialize() {
    if (!window.google) {
      await this.loadGoogleAPI();
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.config.clientId,
      scope: this.SCOPES.join(' '),
      callback: (response) => {
        if (response.error) {
          throw new CalendarServiceError(
            CalendarError.AUTHENTICATION_FAILED,
            'Failed to authenticate with Google Calendar'
          );
        }
        this.accessToken = response.access_token;
      },
    });
  }

  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async authenticate() {
    if (!this.tokenClient) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.requestAccessToken();
        resolve();
      } catch (error) {
        reject(
          new CalendarServiceError(
            CalendarError.AUTHENTICATION_FAILED,
            'Failed to authenticate with Google Calendar',
            error
          )
        );
      }
    });
  }

  async disconnect() {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken);
      this.accessToken = null;
    }
  }

  async refreshToken() {
    if (!this.tokenClient) {
      await this.initialize();
    }
    await this.authenticate();
  }

  async createEvent(eventData) {
    try {
      const response = await this.makeRequest(
        'POST',
        '/calendar/v3/calendars/primary/events',
        {
          summary: eventData.title,
          description: eventData.description,
          start: {
            dateTime: eventData.startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: eventData.endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          attendees: eventData.attendees?.map((email) => ({ email })),
          conferenceData: eventData.meetingLink
            ? {
                createRequest: {
                  requestId: Math.random().toString(36).substring(2),
                  conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
              }
            : undefined,
        }
      );

      return this.parseEventData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateEvent(eventId, eventData) {
    try {
      const response = await this.makeRequest(
        'PUT',
        `/calendar/v3/calendars/primary/events/${eventId}`,
        {
          summary: eventData.title,
          description: eventData.description,
          start: {
            dateTime: eventData.startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: eventData.endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          attendees: eventData.attendees?.map((email) => ({ email })),
        }
      );

      return this.parseEventData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEvent(eventId) {
    try {
      await this.makeRequest(
        'DELETE',
        `/calendar/v3/calendars/primary/events/${eventId}`
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEvent(eventId) {
    try {
      const response = await this.makeRequest(
        'GET',
        `/calendar/v3/calendars/primary/events/${eventId}`
      );
      return this.parseEventData(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listEvents(params) {
    try {
      const queryParams = new URLSearchParams({
        timeMin: params.startTime.toISOString(),
        timeMax: params.endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const response = await this.makeRequest(
        'GET',
        `/calendar/v3/calendars/primary/events?${queryParams.toString()}`
      );

      return response.items.map((event) => this.parseEventData(event));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailability(startDate, endDate) {
    try {
      const events = await this.listEvents({
        startTime: startDate,
        endTime: endDate,
      });

      return events.map((event) => ({
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  formatEventData(appointmentData) {
    const startTime = new Date(appointmentData.appointmentDate);
    const endTime = new Date(
      startTime.getTime() + appointmentData.duration * 60000
    );

    return {
      title: `Appointment with ${appointmentData.clientName}`,
      description: `Booking: ${appointmentData.formTitle}\nClient: ${appointmentData.clientName}\nEmail: ${appointmentData.clientEmail}`,
      startTime,
      endTime,
      attendees: [appointmentData.clientEmail],
      meetingLink: appointmentData.meetingType === 'google_meet',
    };
  }

  parseEventData(calendarEvent) {
    return {
      id: calendarEvent.id,
      title: calendarEvent.summary,
      description: calendarEvent.description,
      startTime: new Date(
        calendarEvent.start.dateTime || calendarEvent.start.date
      ),
      endTime: new Date(calendarEvent.end.dateTime || calendarEvent.end.date),
      meetingLink: calendarEvent.conferenceData?.entryPoints?.[0]?.uri,
      attendees:
        calendarEvent.attendees?.map((attendee) => attendee.email) || [],
    };
  }

  async makeRequest(method, endpoint, data = null) {
    if (!this.accessToken) {
      throw new CalendarServiceError(
        CalendarError.AUTHENTICATION_FAILED,
        'Not authenticated with Google Calendar'
      );
    }

    try {
      const response = await fetch(`https://www.googleapis.com${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (method !== 'DELETE') {
        return await response.json();
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error instanceof CalendarServiceError) {
      return error;
    }

    if (error.status === 401) {
      return new CalendarServiceError(
        CalendarError.TOKEN_EXPIRED,
        'Google Calendar token expired'
      );
    }

    if (error.status === 403) {
      return new CalendarServiceError(
        CalendarError.PERMISSION_DENIED,
        'Permission denied for Google Calendar'
      );
    }

    if (error.status === 404) {
      return new CalendarServiceError(
        CalendarError.EVENT_NOT_FOUND,
        'Calendar event not found'
      );
    }

    return new CalendarServiceError(
      CalendarError.UNKNOWN_ERROR,
      'An error occurred with Google Calendar',
      error
    );
  }
}
