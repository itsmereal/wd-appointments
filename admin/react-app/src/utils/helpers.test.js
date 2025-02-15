import {
  formatDate,
  validateEmail,
  validatePhone,
  generateTimeSlots,
  formatDuration,
  getStatusColor,
  getCalendarProvider,
  handleApiError,
  storage,
  generateShortcode,
  copyToClipboard,
  validateField,
} from './helpers';
import { APPOINTMENT_STATUS, MEETING_TYPES, FIELD_TYPES } from '../config/constants';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    const testDate = new Date('2024-01-01T10:30:00Z');

    it('formats date with default format', () => {
      expect(formatDate(testDate)).toBe(testDate.toLocaleDateString());
    });

    it('formats date with time', () => {
      expect(formatDate(testDate, 'time')).toBe(testDate.toLocaleTimeString());
    });

    it('formats date with full format', () => {
      expect(formatDate(testDate, 'full')).toBe(testDate.toLocaleString());
    });

    it('formats date as ISO string', () => {
      expect(formatDate(testDate, 'iso')).toBe(testDate.toISOString());
    });

    it('handles invalid dates', () => {
      expect(formatDate('invalid date')).toBe('Invalid Date');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('invalidates incorrect email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
      expect(validatePhone('(123) 456-7890')).toBe(true);
    });

    it('invalidates incorrect phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc-def-ghij')).toBe(false);
    });
  });

  describe('generateTimeSlots', () => {
    it('generates correct time slots', () => {
      const slots = generateTimeSlots('09:00', '11:00', 30);
      expect(slots).toHaveLength(5); // 09:00, 09:30, 10:00, 10:30, 11:00
      expect(slots[0]).toMatch(/^09:00/);
      expect(slots[slots.length - 1]).toMatch(/^11:00/);
    });

    it('handles different durations', () => {
      const slots = generateTimeSlots('09:00', '10:00', 15);
      expect(slots).toHaveLength(5); // 09:00, 09:15, 09:30, 09:45, 10:00
    });
  });

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      expect(formatDuration(30)).toBe('30 minutes');
      expect(formatDuration(45)).toBe('45 minutes');
    });

    it('formats hours correctly', () => {
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(120)).toBe('2 hours');
    });

    it('formats hours and minutes correctly', () => {
      expect(formatDuration(90)).toBe('1 hour 30 minutes');
      expect(formatDuration(150)).toBe('2 hours 30 minutes');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct colors for different statuses', () => {
      expect(getStatusColor(APPOINTMENT_STATUS.CONFIRMED.id)).toBe('success');
      expect(getStatusColor(APPOINTMENT_STATUS.PENDING.id)).toBe('warning');
      expect(getStatusColor(APPOINTMENT_STATUS.CANCELLED.id)).toBe('error');
    });

    it('returns default color for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('default');
    });
  });

  describe('getCalendarProvider', () => {
    it('returns correct provider for meeting types', () => {
      expect(getCalendarProvider(MEETING_TYPES.GOOGLE_MEET.id)).toBe('google');
      expect(getCalendarProvider(MEETING_TYPES.ZOOM.id)).toBe('zoom');
    });

    it('returns null for unsupported meeting types', () => {
      expect(getCalendarProvider(MEETING_TYPES.PHONE.id)).toBeNull();
      expect(getCalendarProvider(MEETING_TYPES.CUSTOM.id)).toBeNull();
    });
  });

  describe('handleApiError', () => {
    it('handles server errors', () => {
      const error = {
        response: {
          data: { message: 'Server error' },
        },
      };
      expect(handleApiError(error)).toBe('Server error');
    });

    it('handles network errors', () => {
      const error = { request: {} };
      expect(handleApiError(error)).toBe('No response from server');
    });

    it('handles request setup errors', () => {
      const error = new Error('Setup error');
      expect(handleApiError(error)).toBe('Error setting up request');
    });
  });

  describe('storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('sets and gets items correctly', () => {
      const testData = { test: 'value' };
      storage.set('test', testData);
      expect(storage.get('test')).toEqual(testData);
    });

    it('removes items correctly', () => {
      storage.set('test', 'value');
      storage.remove('test');
      expect(storage.get('test')).toBeNull();
    });

    it('handles JSON parsing errors', () => {
      localStorage.setItem('test', 'invalid json');
      expect(storage.get('test')).toBeNull();
    });
  });

  describe('generateShortcode', () => {
    it('generates correct shortcode format', () => {
      expect(generateShortcode('123')).toBe('[wd_appointment_form id="123"]');
    });
  });

  describe('copyToClipboard', () => {
    it('copies text to clipboard', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const result = await copyToClipboard('test text');
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('handles clipboard errors', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard error')),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const result = await copyToClipboard('test text');
      expect(result).toBe(false);
    });
  });

  describe('validateField', () => {
    it('validates required fields', () => {
      expect(validateField(FIELD_TYPES.TEXT.id, '', true))
        .toBe('This field is required');
      expect(validateField(FIELD_TYPES.TEXT.id, 'value', true))
        .toBeNull();
    });

    it('validates email fields', () => {
      expect(validateField(FIELD_TYPES.EMAIL.id, 'invalid', false))
        .toBe('Invalid email address');
      expect(validateField(FIELD_TYPES.EMAIL.id, 'test@example.com', false))
        .toBeNull();
    });

    it('validates phone fields', () => {
      expect(validateField(FIELD_TYPES.PHONE.id, '123', false))
        .toBe('Invalid phone number');
      expect(validateField(FIELD_TYPES.PHONE.id, '123-456-7890', false))
        .toBeNull();
    });
  });
});
