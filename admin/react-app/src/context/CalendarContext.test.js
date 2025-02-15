import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CalendarProvider, useCalendar } from './CalendarContext';
import { createCalendarService } from '../services/calendar/CalendarService';
import { useApp } from './AppContext';
import { useSettings } from './SettingsContext';

// Mock dependencies
jest.mock('./AppContext');
jest.mock('./SettingsContext');
jest.mock('../services/calendar/CalendarService');

describe('CalendarContext', () => {
  const mockSettings = {
    calendar: {
      provider: 'google',
      credentials: {
        google: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
        },
      },
    },
  };

  const mockCalendarService = {
    authenticate: jest.fn(),
    disconnect: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    getAvailability: jest.fn(),
    isAuthenticated: jest.fn(),
  };

  const mockShowNotification = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useApp hook
    useApp.mockReturnValue({
      showNotification: mockShowNotification,
    });

    // Mock useSettings hook
    useSettings.mockReturnValue({
      settings: mockSettings,
    });

    // Mock calendar service creation
    createCalendarService.mockReturnValue(mockCalendarService);
  });

  describe('useCalendar hook', () => {
    it('initializes with default state', () => {
      const wrapper = ({ children }) => (
        <CalendarProvider>{children}</CalendarProvider>
      );

      const { result } = renderHook(() => useCalendar(), { wrapper });

      expect(result.current.provider).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('initializes calendar service when settings change', async () => {
      const wrapper = ({ children }) => (
        <CalendarProvider>{children}</CalendarProvider>
      );

      const { result } = renderHook(() => useCalendar(), { wrapper });

      expect(createCalendarService).toHaveBeenCalledWith(
        'google',
        mockSettings.calendar.credentials.google
      );
    });

    describe('authentication', () => {
      it('authenticates successfully', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        mockCalendarService.authenticate.mockResolvedValue(undefined);

        await act(async () => {
          await result.current.authenticate();
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'success',
          'Successfully connected to calendar'
        );
      });

      it('handles authentication errors', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        const error = new Error('Authentication failed');
        mockCalendarService.authenticate.mockRejectedValue(error);

        await act(async () => {
          await result.current.authenticate();
        });

        expect(result.current.error).toBe(error.message);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'error',
          'Failed to connect to calendar'
        );
      });

      it('disconnects successfully', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        mockCalendarService.disconnect.mockResolvedValue(undefined);

        await act(async () => {
          await result.current.disconnect();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'success',
          'Successfully disconnected from calendar'
        );
      });
    });

    describe('event management', () => {
      it('creates event successfully', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        const mockEvent = {
          title: 'Test Event',
          startTime: new Date(),
          endTime: new Date(),
        };

        mockCalendarService.createEvent.mockResolvedValue(mockEvent);

        let createdEvent;
        await act(async () => {
          createdEvent = await result.current.createEvent(mockEvent);
        });

        expect(createdEvent).toEqual(mockEvent);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'success',
          'Event created successfully'
        );
      });

      it('updates event successfully', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        const mockEvent = {
          id: 'event-1',
          title: 'Updated Event',
        };

        mockCalendarService.updateEvent.mockResolvedValue(mockEvent);

        let updatedEvent;
        await act(async () => {
          updatedEvent = await result.current.updateEvent('event-1', mockEvent);
        });

        expect(updatedEvent).toEqual(mockEvent);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'success',
          'Event updated successfully'
        );
      });

      it('deletes event successfully', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        mockCalendarService.deleteEvent.mockResolvedValue(undefined);

        await act(async () => {
          await result.current.deleteEvent('event-1');
        });

        expect(mockShowNotification).toHaveBeenCalledWith(
          'success',
          'Event deleted successfully'
        );
      });

      it('gets availability successfully', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        const mockAvailability = [
          { start: new Date(), end: new Date() },
        ];

        mockCalendarService.getAvailability.mockResolvedValue(mockAvailability);

        let availability;
        await act(async () => {
          availability = await result.current.getAvailability(new Date(), new Date());
        });

        expect(availability).toEqual(mockAvailability);
      });
    });

    describe('error handling', () => {
      it('handles service errors', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        const error = new Error('Service error');
        mockCalendarService.createEvent.mockRejectedValue(error);

        await act(async () => {
          await result.current.createEvent({});
        });

        expect(result.current.error).toBe(error.message);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'error',
          'Failed to create event'
        );
      });

      it('handles network errors', async () => {
        const wrapper = ({ children }) => (
          <CalendarProvider>{children}</CalendarProvider>
        );

        const { result } = renderHook(() => useCalendar(), { wrapper });

        const error = new Error('Network error');
        mockCalendarService.getAvailability.mockRejectedValue(error);

        await act(async () => {
          await result.current.getAvailability(new Date(), new Date());
        });

        expect(result.current.error).toBe(error.message);
        expect(mockShowNotification).toHaveBeenCalledWith(
          'error',
          'Failed to fetch availability'
        );
      });
    });
  });
});
