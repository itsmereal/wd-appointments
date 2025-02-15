import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays } from 'date-fns';
import SchedulingSettings from './SchedulingSettings';

describe('SchedulingSettings', () => {
  const mockSettings = {
    dateRange: {
      start: null,
      end: null,
    },
    availableHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: [],
    },
    bufferTime: 0,
    minimumNotice: 24,
    dailyLimit: null,
    timezone: 'host',
  };

  const defaultProps = {
    settings: mockSettings,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders scheduling settings correctly', () => {
    render(<SchedulingSettings {...defaultProps} />);

    // Check sections
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Available Hours')).toBeInTheDocument();
    expect(screen.getByText('Additional Settings')).toBeInTheDocument();

    // Check days of week
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  describe('Date Range Settings', () => {
    it('allows setting date range', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const startDate = addDays(new Date(), 1);
      const endDate = addDays(new Date(), 30);

      // Set start date
      const startDateInput = screen.getByLabelText(/start date/i);
      await userEvent.type(startDateInput, startDate.toLocaleDateString());

      // Set end date
      const endDateInput = screen.getByLabelText(/end date/i);
      await userEvent.type(endDateInput, endDate.toLocaleDateString());

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: {
            start: expect.any(Date),
            end: expect.any(Date),
          },
        })
      );
    });

    it('validates date range', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const startDate = addDays(new Date(), 30);
      const endDate = addDays(new Date(), 1);

      // Try to set invalid date range
      const startDateInput = screen.getByLabelText(/start date/i);
      await userEvent.type(startDateInput, startDate.toLocaleDateString());

      const endDateInput = screen.getByLabelText(/end date/i);
      await userEvent.type(endDateInput, endDate.toLocaleDateString());

      expect(endDateInput).toBeInvalid();
    });
  });

  describe('Available Hours', () => {
    it('displays current available hours', () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Expand Monday section
      fireEvent.click(screen.getByText('Monday'));

      // Check time slots
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('17:00')).toBeInTheDocument();
    });

    it('allows adding time slots', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Expand Monday section
      fireEvent.click(screen.getByText('Monday'));

      // Add new time slot
      fireEvent.click(screen.getByText('Add Time Slot'));

      // Set new slot times
      const timeInputs = screen.getAllByRole('textbox', { type: 'time' });
      await userEvent.type(timeInputs[2], '13:00');
      await userEvent.type(timeInputs[3], '15:00');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          availableHours: expect.objectContaining({
            monday: expect.arrayContaining([
              { start: '09:00', end: '17:00' },
              { start: '13:00', end: '15:00' },
            ]),
          }),
        })
      );
    });

    it('allows removing time slots', () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Expand Monday section
      fireEvent.click(screen.getByText('Monday'));

      // Remove time slot
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          availableHours: expect.objectContaining({
            monday: [],
          }),
        })
      );
    });

    it('validates time slots', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Expand Monday section
      fireEvent.click(screen.getByText('Monday'));

      // Try to set invalid time range
      const timeInputs = screen.getAllByRole('textbox', { type: 'time' });
      await userEvent.type(timeInputs[0], '17:00');
      await userEvent.type(timeInputs[1], '09:00');

      expect(timeInputs[1]).toBeInvalid();
    });
  });

  describe('Additional Settings', () => {
    it('allows setting buffer time', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const bufferInput = screen.getByLabelText(/buffer time/i);
      await userEvent.type(bufferInput, '15');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          bufferTime: 15,
        })
      );
    });

    it('allows setting minimum notice', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const noticeInput = screen.getByLabelText(/minimum notice/i);
      await userEvent.type(noticeInput, '48');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          minimumNotice: 48,
        })
      );
    });

    it('allows setting daily limit', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const limitInput = screen.getByLabelText(/daily limit/i);
      await userEvent.type(limitInput, '5');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dailyLimit: 5,
        })
      );
    });

    it('allows setting timezone display', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const timezoneSelect = screen.getByLabelText(/timezone display/i);
      await userEvent.selectOptions(timezoneSelect, 'client');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          timezone: 'client',
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('maintains proper focus management', () => {
      render(<SchedulingSettings {...defaultProps} />);

      const sections = screen.getAllByRole('button');
      sections.forEach(section => {
        section.focus();
        expect(section).toHaveFocus();
      });
    });

    it('provides proper ARIA labels', () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Check accordion sections
      const sections = screen.getAllByRole('button');
      sections.forEach(section => {
        expect(section).toHaveAttribute('aria-expanded');
      });

      // Check time inputs
      const timeInputs = screen.getAllByRole('textbox', { type: 'time' });
      timeInputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation', () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Tab through form controls
      const firstInput = screen.getByLabelText(/start date/i);
      firstInput.focus();

      userEvent.tab();
      expect(screen.getByLabelText(/end date/i)).toHaveFocus();

      userEvent.tab();
      expect(screen.getByText('Monday')).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('validates numeric inputs', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      const bufferInput = screen.getByLabelText(/buffer time/i);
      await userEvent.type(bufferInput, '-5');

      expect(bufferInput).toBeInvalid();
    });

    it('prevents overlapping time slots', async () => {
      render(<SchedulingSettings {...defaultProps} />);

      // Expand Monday section
      fireEvent.click(screen.getByText('Monday'));

      // Add overlapping time slot
      fireEvent.click(screen.getByText('Add Time Slot'));
      const timeInputs = screen.getAllByRole('textbox', { type: 'time' });
      await userEvent.type(timeInputs[2], '10:00');
      await userEvent.type(timeInputs[3], '16:00');

      expect(screen.getByText(/overlapping time slots/i)).toBeInTheDocument();
    });
  });
});
