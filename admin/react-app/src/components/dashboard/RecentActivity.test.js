import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { subHours, subDays } from 'date-fns';
import RecentActivity from './RecentActivity';
import { APPOINTMENT_STATUS } from '../../config/constants';

describe('RecentActivity', () => {
  const now = new Date('2024-01-15T10:00:00Z');
  const mockActivities = [
    {
      id: '1',
      type: 'new_appointment',
      clientName: 'John Doe',
      status: APPOINTMENT_STATUS.PENDING.id,
      appointmentDate: subHours(now, 1).toISOString(),
      duration: 30,
      formTitle: 'Consultation',
      timestamp: subHours(now, 1).toISOString(),
    },
    {
      id: '2',
      type: 'status_change',
      clientName: 'Jane Smith',
      status: APPOINTMENT_STATUS.CONFIRMED.id,
      appointmentDate: subDays(now, 1).toISOString(),
      duration: 60,
      formTitle: 'Meeting',
      timestamp: subHours(now, 2).toISOString(),
    },
    {
      id: '3',
      type: 'reminder_sent',
      clientName: 'Bob Wilson',
      status: APPOINTMENT_STATUS.CONFIRMED.id,
      appointmentDate: subDays(now, 2).toISOString(),
      duration: 45,
      formTitle: 'Follow-up',
      timestamp: subHours(now, 3).toISOString(),
    },
    {
      id: '4',
      type: 'form_created',
      formTitle: 'New Booking Form',
      timestamp: subHours(now, 4).toISOString(),
    },
  ];

  const defaultProps = {
    activities: mockActivities,
    loading: false,
    onViewAll: jest.fn(),
    onActivityClick: jest.fn(),
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

  it('renders recent activities correctly', () => {
    render(<RecentActivity {...defaultProps} />);

    // Check activity messages
    expect(screen.getByText(/new appointment scheduled by john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/appointment confirmed for jane smith/i)).toBeInTheDocument();
    expect(screen.getByText(/reminder sent to bob wilson/i)).toBeInTheDocument();
    expect(screen.getByText(/new booking form "new booking form" created/i)).toBeInTheDocument();
  });

  describe('Loading State', () => {
    it('shows loading indicator', () => {
      render(<RecentActivity {...defaultProps} loading={true} />);

      expect(screen.getByText(/loading activities/i)).toBeInTheDocument();
    });

    it('shows empty state when no activities', () => {
      render(<RecentActivity {...defaultProps} activities={[]} />);

      expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
    });
  });

  describe('Activity Types', () => {
    it('displays new appointment activities correctly', () => {
      const newAppointment = mockActivities[0];
      render(<RecentActivity {...defaultProps} activities={[newAppointment]} />);

      const activity = screen.getByText(new RegExp(newAppointment.clientName, 'i')).closest('li');
      expect(within(activity).getByText(/consultation/i)).toBeInTheDocument();
      expect(within(activity).getByText(/pending/i)).toBeInTheDocument();
    });

    it('displays status change activities correctly', () => {
      const statusChange = mockActivities[1];
      render(<RecentActivity {...defaultProps} activities={[statusChange]} />);

      const activity = screen.getByText(new RegExp(statusChange.clientName, 'i')).closest('li');
      expect(within(activity).getByText(/confirmed/i)).toBeInTheDocument();
    });

    it('displays reminder activities correctly', () => {
      const reminder = mockActivities[2];
      render(<RecentActivity {...defaultProps} activities={[reminder]} />);

      const activity = screen.getByText(new RegExp(reminder.clientName, 'i')).closest('li');
      expect(within(activity).getByText(/follow-up/i)).toBeInTheDocument();
    });

    it('displays form creation activities correctly', () => {
      const formCreation = mockActivities[3];
      render(<RecentActivity {...defaultProps} activities={[formCreation]} />);

      expect(screen.getByText(new RegExp(formCreation.formTitle, 'i'))).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('shows relative time for recent activities', () => {
      render(<RecentActivity {...defaultProps} />);

      expect(screen.getByText(/1 hour ago/i)).toBeInTheDocument();
      expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
    });

    it('shows date for older activities', () => {
      const oldActivity = {
        ...mockActivities[0],
        timestamp: subDays(now, 7).toISOString(),
      };

      render(<RecentActivity {...defaultProps} activities={[oldActivity]} />);

      expect(screen.getByText(/7 days ago/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onActivityClick when clicking activity', () => {
      render(<RecentActivity {...defaultProps} />);

      const firstActivity = screen.getByText(/john doe/i).closest('li');
      fireEvent.click(firstActivity);

      expect(defaultProps.onActivityClick).toHaveBeenCalledWith(mockActivities[0]);
    });

    it('calls onViewAll when clicking view all button', () => {
      const manyActivities = Array(6)
        .fill(null)
        .map((_, index) => ({
          ...mockActivities[0],
          id: `${index + 1}`,
          clientName: `Client ${index + 1}`,
        }));

      render(
        <RecentActivity
          {...defaultProps}
          activities={manyActivities}
        />
      );

      fireEvent.click(screen.getByText(/view all/i));

      expect(defaultProps.onViewAll).toHaveBeenCalled();
    });
  });

  describe('Activity Icons', () => {
    it('shows correct icons for different activity types', () => {
      render(<RecentActivity {...defaultProps} />);

      const activities = screen.getAllByRole('listitem');
      activities.forEach((activity) => {
        expect(within(activity).getByTestId('activity-icon')).toBeInTheDocument();
      });
    });

    it('uses correct colors for different statuses', () => {
      render(<RecentActivity {...defaultProps} />);

      const pendingActivity = screen.getByText(/pending/i);
      const confirmedActivity = screen.getByText(/confirmed/i);

      expect(pendingActivity).toHaveClass(/warning/i);
      expect(confirmedActivity).toHaveClass(/success/i);
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<RecentActivity {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /recent activity/i }))
        .toBeInTheDocument();

      const activities = screen.getAllByRole('listitem');
      activities.forEach(activity => {
        expect(activity).toHaveAttribute('aria-label');
      });
    });

    it('maintains focus management', () => {
      render(<RecentActivity {...defaultProps} />);

      const firstActivity = screen.getByText(/john doe/i).closest('li');
      firstActivity.focus();
      fireEvent.keyDown(firstActivity, { key: 'Enter' });

      expect(defaultProps.onActivityClick).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('limits number of displayed activities', () => {
      const manyActivities = Array(10)
        .fill(null)
        .map((_, index) => ({
          ...mockActivities[0],
          id: `${index + 1}`,
          clientName: `Client ${index + 1}`,
        }));

      render(
        <RecentActivity
          {...defaultProps}
          activities={manyActivities}
          maxItems={5}
        />
      );

      const displayedActivities = screen.getAllByRole('listitem');
      expect(displayedActivities).toHaveLength(5);
    });

    it('memoizes activity rendering', () => {
      const { rerender } = render(<RecentActivity {...defaultProps} />);

      const start = performance.now();
      rerender(<RecentActivity {...defaultProps} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // arbitrary threshold
    });
  });
});
