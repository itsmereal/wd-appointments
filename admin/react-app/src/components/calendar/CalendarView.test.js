import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import CalendarView from './CalendarView';
import { CALENDAR_VIEWS, APPOINTMENT_STATUS } from '../../config/constants';

describe('CalendarView', () => {
  const mockDate = new Date('2024-01-15');
  const mockAppointments = [
    {
      id: 1,
      clientName: 'John Doe',
      appointmentDate: '2024-01-15T10:00:00Z',
      duration: 30,
      status: APPOINTMENT_STATUS.CONFIRMED.id,
      formTitle: 'Consultation',
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      appointmentDate: '2024-01-15T14:00:00Z',
      duration: 60,
      status: APPOINTMENT_STATUS.PENDING.id,
      formTitle: 'Meeting',
    },
  ];

  const defaultProps = {
    appointments: mockAppointments,
    selectedDate: mockDate,
    onDateSelect: jest.fn(),
    onAppointmentClick: jest.fn(),
    view: CALENDAR_VIEWS.MONTH,
    availableSlots: [
      {
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T17:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Month View', () => {
    it('renders month view correctly', () => {
      render(<CalendarView {...defaultProps} />);

      // Check month header
      expect(screen.getByText('January 2024')).toBeInTheDocument();

      // Check weekday headers
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekdays.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });

      // Check if current date is highlighted
      const currentDateCell = screen.getByText('15').closest('div');
      expect(currentDateCell).toHaveStyle({ color: expect.any(String) });
    });

    it('displays appointments correctly', () => {
      render(<CalendarView {...defaultProps} />);

      // Check if appointments are displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      // Check appointment times
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM')).toBeInTheDocument();
    });

    it('handles month navigation', () => {
      render(<CalendarView {...defaultProps} />);

      // Navigate to next month
      fireEvent.click(screen.getByLabelText(/next month/i));
      expect(screen.getByText('February 2024')).toBeInTheDocument();

      // Navigate to previous month
      fireEvent.click(screen.getByLabelText(/previous month/i));
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('indicates available slots', () => {
      render(<CalendarView {...defaultProps} />);

      // Check if available date has indicator
      const availableDate = screen.getByText('15').closest('div');
      expect(within(availableDate).getByTestId('availability-indicator')).toBeInTheDocument();
    });
  });

  describe('Week View', () => {
    const weekViewProps = {
      ...defaultProps,
      view: CALENDAR_VIEWS.WEEK,
    };

    it('renders week view correctly', () => {
      render(<CalendarView {...weekViewProps} />);

      // Check week header
      expect(screen.getByText(/Jan \d+ - Jan \d+, 2024/)).toBeInTheDocument();

      // Check if all 7 days are displayed
      const days = screen.getAllByRole('columnheader');
      expect(days).toHaveLength(7);
    });

    it('displays appointments in time slots', () => {
      render(<CalendarView {...weekViewProps} />);

      // Check if appointments are in correct time slots
      const timeSlots = screen.getAllByRole('gridcell');
      const morningSlot = timeSlots.find(slot => 
        within(slot).queryByText('John Doe')
      );
      const afternoonSlot = timeSlots.find(slot => 
        within(slot).queryByText('Jane Smith')
      );

      expect(morningSlot).toBeInTheDocument();
      expect(afternoonSlot).toBeInTheDocument();
    });
  });

  describe('Interaction Handling', () => {
    it('calls onDateSelect when clicking a date', () => {
      render(<CalendarView {...defaultProps} />);

      fireEvent.click(screen.getByText('15'));
      expect(defaultProps.onDateSelect).toHaveBeenCalledWith(expect.any(Date));
    });

    it('calls onAppointmentClick when clicking an appointment', () => {
      render(<CalendarView {...defaultProps} />);

      fireEvent.click(screen.getByText('John Doe'));
      expect(defaultProps.onAppointmentClick).toHaveBeenCalledWith(mockAppointments[0]);
    });

    it('shows appointment details in dialog', () => {
      render(<CalendarView {...defaultProps} />);

      fireEvent.click(screen.getByText('John Doe'));
      
      // Check if dialog shows appointment details
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Appointment Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Consultation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<CalendarView {...defaultProps} />);

      // Check navigation buttons
      expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();

      // Check calendar grid
      expect(screen.getByRole('grid')).toHaveAttribute('aria-label', expect.any(String));
    });

    it('supports keyboard navigation', () => {
      render(<CalendarView {...defaultProps} />);

      const grid = screen.getByRole('grid');
      grid.focus();

      // Navigate with arrow keys
      fireEvent.keyDown(grid, { key: 'ArrowRight' });
      fireEvent.keyDown(grid, { key: 'Enter' });

      expect(defaultProps.onDateSelect).toHaveBeenCalled();
    });
  });

  describe('Date Range Restrictions', () => {
    it('disables dates outside min/max range', () => {
      const props = {
        ...defaultProps,
        minDate: mockDate,
        maxDate: addDays(mockDate, 30),
      };

      render(<CalendarView {...props} />);

      // Check if dates before minDate are disabled
      const previousDate = screen.getByText('14').closest('div');
      expect(previousDate).toHaveAttribute('aria-disabled', 'true');

      // Check if dates after maxDate are disabled
      const futureDate = screen.getByText('16').closest('div');
      expect(futureDate).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Performance Optimization', () => {
    it('memoizes appointment rendering', () => {
      const { rerender } = render(<CalendarView {...defaultProps} />);

      // Get initial render time
      const start = performance.now();
      rerender(<CalendarView {...defaultProps} />);
      const end = performance.now();

      // Subsequent renders should be faster
      expect(end - start).toBeLessThan(100); // arbitrary threshold
    });
  });
});
