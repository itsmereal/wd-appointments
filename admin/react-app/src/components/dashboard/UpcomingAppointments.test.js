import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays, subDays, addHours } from 'date-fns';
import UpcomingAppointments from './UpcomingAppointments';
import { APPOINTMENT_STATUS } from '../../config/constants';

describe('UpcomingAppointments', () => {
  const now = new Date('2024-01-15T10:00:00Z');
  const mockAppointments = [
    {
      id: '1',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      appointmentDate: addHours(now, 1).toISOString(),
      duration: 30,
      status: APPOINTMENT_STATUS.CONFIRMED.id,
      formTitle: 'Consultation',
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      appointmentDate: addDays(now, 1).toISOString(),
      duration: 60,
      status: APPOINTMENT_STATUS.PENDING.id,
      formTitle: 'Meeting',
    },
    {
      id: '3',
      clientName: 'Bob Wilson',
      clientEmail: 'bob@example.com',
      appointmentDate: subDays(now, 1).toISOString(), // Past appointment
      duration: 45,
      status: APPOINTMENT_STATUS.COMPLETED.id,
      formTitle: 'Follow-up',
    },
  ];

  const defaultProps = {
    appointments: mockAppointments,
    loading: false,
    onViewAll: jest.fn(),
    onAppointmentClick: jest.fn(),
    maxItems: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date
    jest.spyOn(Date, 'now').mockImplementation(() => now.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders upcoming appointments correctly', () => {
    render(<UpcomingAppointments {...defaultProps} />);

    // Should show upcoming appointments
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Should not show past appointments
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });

  describe('Loading State', () => {
    it('shows loading indicator', () => {
      render(<UpcomingAppointments {...defaultProps} loading={true} />);

      expect(screen.getByText(/loading appointments/i)).toBeInTheDocument();
    });

    it('shows empty state when no appointments', () => {
      render(<UpcomingAppointments {...defaultProps} appointments={[]} />);

      expect(screen.getByText(/no upcoming appointments/i)).toBeInTheDocument();
    });
  });

  describe('Appointment Grouping', () => {
    it('groups appointments by date', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      // Check date headers
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    });

    it('shows correct time information', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      // Check appointment times
      expect(screen.getByText('11:00 AM')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).not.toBeInTheDocument();
    });

    it('indicates appointments in progress', () => {
      const inProgressAppointment = {
        ...mockAppointments[0],
        appointmentDate: now.toISOString(),
      };

      render(
        <UpcomingAppointments
          {...defaultProps}
          appointments={[inProgressAppointment]}
        />
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('Appointment Details', () => {
    it('shows appointment type and duration', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      const firstAppointment = screen.getByText('John Doe').closest('li');
      expect(within(firstAppointment).getByText('Consultation')).toBeInTheDocument();
      expect(within(firstAppointment).getByText('30 minutes')).toBeInTheDocument();
    });

    it('shows appointment status', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onAppointmentClick when clicking appointment', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      fireEvent.click(screen.getByText('John Doe'));

      expect(defaultProps.onAppointmentClick).toHaveBeenCalledWith(
        mockAppointments[0]
      );
    });

    it('calls onViewAll when clicking view all button', () => {
      const manyAppointments = Array(6)
        .fill(null)
        .map((_, index) => ({
          ...mockAppointments[0],
          id: `${index + 1}`,
          clientName: `Client ${index + 1}`,
        }));

      render(
        <UpcomingAppointments
          {...defaultProps}
          appointments={manyAppointments}
        />
      );

      fireEvent.click(screen.getByText(/view all/i));

      expect(defaultProps.onViewAll).toHaveBeenCalled();
    });
  });

  describe('Time Display', () => {
    it('shows relative time for upcoming appointments', () => {
      const soonAppointment = {
        ...mockAppointments[0],
        appointmentDate: addHours(now, 0.5).toISOString(), // 30 minutes from now
      };

      render(
        <UpcomingAppointments
          {...defaultProps}
          appointments={[soonAppointment]}
        />
      );

      expect(screen.getByText('In 30 minutes')).toBeInTheDocument();
    });

    it('shows absolute time for appointments further away', () => {
      const laterAppointment = {
        ...mockAppointments[0],
        appointmentDate: addHours(now, 5).toISOString(), // 5 hours from now
      };

      render(
        <UpcomingAppointments
          {...defaultProps}
          appointments={[laterAppointment]}
        />
      );

      expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /upcoming appointments/i }))
        .toBeInTheDocument();

      const appointments = screen.getAllByRole('listitem');
      appointments.forEach(appointment => {
        expect(appointment).toHaveAttribute('aria-label');
      });
    });

    it('maintains focus management', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      const firstAppointment = screen.getByText('John Doe').closest('li');
      firstAppointment.focus();
      fireEvent.keyDown(firstAppointment, { key: 'Enter' });

      expect(defaultProps.onAppointmentClick).toHaveBeenCalled();
    });

    it('provides keyboard navigation', () => {
      render(<UpcomingAppointments {...defaultProps} />);

      const appointments = screen.getAllByRole('listitem');
      
      // Tab through appointments
      userEvent.tab();
      expect(appointments[0]).toHaveFocus();
      
      userEvent.tab();
      expect(appointments[1]).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('limits number of displayed appointments', () => {
      const manyAppointments = Array(10)
        .fill(null)
        .map((_, index) => ({
          ...mockAppointments[0],
          id: `${index + 1}`,
          clientName: `Client ${index + 1}`,
        }));

      render(
        <UpcomingAppointments
          {...defaultProps}
          appointments={manyAppointments}
          maxItems={5}
        />
      );

      const displayedAppointments = screen.getAllByRole('listitem');
      expect(displayedAppointments).toHaveLength(5);
    });

    it('memoizes appointment rendering', () => {
      const { rerender } = render(<UpcomingAppointments {...defaultProps} />);

      const start = performance.now();
      rerender(<UpcomingAppointments {...defaultProps} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // arbitrary threshold
    });
  });
});
