import GoogleCalendarService from './GoogleCalendarService';
import { CalendarError, CalendarServiceError } from './CalendarService';

describe('GoogleCalendarService', () => {
  let service;
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset localStorage
    localStorage.clear();

    // Create new service instance
    service = new GoogleCalendarService(mockConfig);

    // Mock Google API
    global.google = {
      accounts: {
        oauth2: {
          initTokenClient: jest.fn().mockReturnValue({
            requestAccessToken: jest.fn(),
          }),
          revoke: jest.fn(),
        },
      },
    };

    // Mock fetch
    global.fetch = jest.fn();
  });

  describe('initialization', () => {
    it('creates service instance with config', () => {
      expect(service.config).toEqual(mockConfig);
      expect(service.tokenClient).toBeNull();
      expect(service.accessToken).toBeNull();
    });

    it('initializes with correct scopes', () => {
      expect(service.SCOPES).toContain('https://www.googleapis.com/auth/calendar');
      expect(service.SCOPES).toContain('https://www.googleapis.com/auth/calendar.events');
    });
  });

  describe('authentication', () => {
    it('initializes Google API client on first authentication', async () => {
      await service.initialize();
      
      expect(global.google.accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
        client_id: mockConfig.clientId,
        scope: expect.any(String),
        callback: expect.any(Function),
      });
    });

    it('authenticates successfully', async () => {
      const mockTokenClient = {
        requestAccessToken: jest.fn().mockImplementation((callback) => {
          callback({ access_token: 'test-token' });
        }),
      };

      global.google.accounts.oauth2.initTokenClient.mockReturnValue(mockTokenClient);

      await service.authenticate();

      expect(service.accessToken).toBe('test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('handles authentication errors', async () => {
      const mockTokenClient = {
        requestAccessToken: jest.fn().mockImplementation((callback) => {
          callback({ error: 'auth_error' });
        }),
      };

      global.google.accounts.oauth2.initTokenClient.mockReturnValue(mockTokenClient);

      await expect(service.authenticate()).rejects.toThrow(CalendarServiceError);
    });

    it('disconnects successfully', async () => {
      service.accessToken = 'test-token';

      await service.disconnect();

      expect(global.google.accounts.oauth2.revoke).toHaveBeenCalledWith('test-token');
      expect(service.accessToken).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('event management', () => {
    beforeEach(() => {
      service.accessToken = 'test-token';
    });

    it('creates event successfully', async () => {
      const mockEvent = {
        title: 'Test Event',
        description: 'Test Description',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        attendees: ['test@example.com'],
      };

      const mockResponse = {
        id: 'event-1',
        summary: mockEvent.title,
        description: mockEvent.description,
        start: { dateTime: mockEvent.startTime.toISOString() },
        end: { dateTime: mockEvent.endTime.toISOString() },
        attendees: [{ email: 'test@example.com' }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.createEvent(mockEvent);

      expect(result.id).toBe('event-1');
      expect(result.title).toBe(mockEvent.title);
      expect(result.startTime).toEqual(mockEvent.startTime);
    });

    it('updates event successfully', async () => {
      const eventId = 'event-1';
      const mockEvent = {
        title: 'Updated Event',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
      };

      const mockResponse = {
        id: eventId,
        summary: mockEvent.title,
        start: { dateTime: mockEvent.startTime.toISOString() },
        end: { dateTime: mockEvent.endTime.toISOString() },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.updateEvent(eventId, mockEvent);

      expect(result.id).toBe(eventId);
      expect(result.title).toBe(mockEvent.title);
    });

    it('deletes event successfully', async () => {
      const eventId = 'event-1';

      global.fetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.deleteEvent(eventId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(eventId),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('lists events successfully', async () => {
      const mockParams = {
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-01-31'),
      };

      const mockResponse = {
        items: [
          {
            id: 'event-1',
            summary: 'Test Event',
            start: { dateTime: '2024-01-01T10:00:00Z' },
            end: { dateTime: '2024-01-01T11:00:00Z' },
          },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await service.listEvents(mockParams);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('event-1');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      service.accessToken = 'test-token';
    });

    it('handles unauthorized errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(service.listEvents({})).rejects.toThrow(CalendarServiceError);
    });

    it('handles rate limit errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      await expect(service.listEvents({})).rejects.toThrow(CalendarServiceError);
    });

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.listEvents({})).rejects.toThrow(CalendarServiceError);
    });

    it('requires authentication for API calls', async () => {
      service.accessToken = null;

      await expect(service.listEvents({})).rejects.toThrow(
        new CalendarServiceError(
          CalendarError.AUTHENTICATION_FAILED,
          'Not authenticated with Google Calendar'
        )
      );
    });
  });

  describe('data formatting', () => {
    it('formats event data correctly', () => {
      const appointmentData = {
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        appointmentDate: '2024-01-01T10:00:00Z',
        duration: 60,
        formTitle: 'Consultation',
        meetingType: 'google_meet',
      };

      const result = service.formatEventData(appointmentData);

      expect(result).toMatchObject({
        title: expect.stringContaining('John Doe'),
        description: expect.stringContaining('Consultation'),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        attendees: ['john@example.com'],
        meetingLink: true,
      });
    });

    it('parses event data correctly', () => {
      const calendarEvent = {
        id: 'event-1',
        summary: 'Meeting with John Doe',
        description: 'Consultation',
        start: { dateTime: '2024-01-01T10:00:00Z' },
        end: { dateTime: '2024-01-01T11:00:00Z' },
        attendees: [{ email: 'john@example.com' }],
        conferenceData: {
          entryPoints: [{ uri: 'https://meet.google.com/xxx-yyyy-zzz' }],
        },
      };

      const result = service.parseEventData(calendarEvent);

      expect(result).toMatchObject({
        id: 'event-1',
        title: 'Meeting with John Doe',
        description: 'Consultation',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        meetingLink: 'https://meet.google.com/xxx-yyyy-zzz',
        attendees: ['john@example.com'],
      });
    });
  });
});
