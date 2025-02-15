import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentDetails from './AppointmentDetails';
import { useCalendar } from '../../context/CalendarContext';
import { useApp } from '../../context/AppContext';
import { APPOINTMENT_STATUS } from '../../config/constants';

// Mock hooks
jest.mock('../../context/CalendarContext');
jest.mock('../../context/AppContext');

describe('AppointmentDetails', () => {
  const mockAppointment = {
    id: '1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    appointmentDate: '2024-01-15T10:00:00Z',
    duration: 30,
    status: APPOINTMENT_STATUS.CONFIRMED.id,
    type: 'google_meet',
    notes: 'Test notes',
    calendarEventId: 'event-123',
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    formTitle: 'Consultation',
  };

  const defaultProps = {
    appointment: mockAppointment,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onSendReminder: jest.fn(),
    isDialog: false,
  };

  const mockUpdateEvent = jest.fn();
  const mockShowNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useCalendar.mockReturnValue({
      updateEvent: mockUpdateEvent,
    });

    useApp.mockReturnValue({
      showNotification: mockShowNotification,
    });
  });

  it('renders appointment details correctly', () => {
    render(<AppointmentDetails {...defaultProps} />);

    // Check basic information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  describe('Edit Mode', () => {
    it('enters edit mode when edit button is clicked', async () => {
      render(<AppointmentDetails {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      // Check if form fields are present
      expect(screen.getByLabelText(/client name/i)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/client email/i)).toHaveValue('john@example.com');
      expect(screen.getByLabelText(/status/i)).toHaveValue(APPOINTMENT_STATUS.CONFIRMED.id);
    });

    it('updates appointment successfully', async () => {
      render(<AppointmentDetails {...defaultProps} />);

      // Enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      // Make changes
      await userEvent.clear(screen.getByLabelText(/client name/i));
      await userEvent.type(screen.getByLabelText(/client name/i), 'Jane Doe');
      
      // Save changes
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Check if onUpdate was called with new data
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: 'Jane Doe',
        })
      );
    });

    it('cancels edit mode without saving', async () => {
      render(<AppointmentDetails {...defaultProps} />);

      // Enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      // Make changes
      await userEvent.clear(screen.getByLabelText(/client name/i));
      await userEvent.type(screen.getByLabelText(/client name/i), 'Jane Doe');

      // Cancel edit
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Check if original data is displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('shows delete confirmation dialog', () => {
      render(<AppointmentDetails {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    it('deletes appointment when confirmed', async () => {
      render(<AppointmentDetails {...defaultProps} />);

      // Open delete dialog
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      // Confirm deletion
      fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAppointment.id);
    });

    it('cancels deletion', () => {
      render(<AppointmentDetails {...defaultProps} />);

      // Open delete dialog
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      // Cancel deletion
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(defaultProps.onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Reminder Functionality', () => {
    it('sends reminder email', async () => {
      render(<AppointmentDetails {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /send reminder/i }));

      expect(defaultProps.onSendReminder).toHaveBeenCalledWith(mockAppointment.id);
    });
  });

  describe('Calendar Integration', () => {
    it('updates calendar event when appointment is updated', async () => {
      render(<AppointmentDetails {...defaultProps} />);

      // Enter edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      // Make changes
      await userEvent.clear(screen.getByLabelText(/client name/i));
      await userEvent.type(screen.getByLabelText(/client name/i), 'Jane Doe');

      // Save changes
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(mockUpdateEvent).toHaveBeenCalledWith(
        mockAppointment.calendarEventId,
        expect.any(Object)
      );
    });

    it('displays meeting link when available', () => {
      render(<AppointmentDetails {...defaultProps} />);

      expect(screen.getByText('Join Meeting')).toHaveAttribute(
        'href',
        mockAppointment.meetingLink
      );
    });

    it('copies meeting link to clipboard', async () => {
      const mockClipboard = {
        writeText: jest.fn(),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(<AppointmentDetails {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /copy link/i }));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockAppointment.meetingLink
      );
    });
  });

  describe('Dialog Mode', () => {
    it('renders in dialog mode', () => {
      render(<AppointmentDetails {...defaultProps} isDialog={true} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes dialog when clicking outside', () => {
      render(<AppointmentDetails {...defaultProps} isDialog={true} />);

      fireEvent.click(screen.getByRole('dialog').parentElement);

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(null);
    });
  });

  describe('Accessibility', () => {
    it('maintains focus management', () => {
      render(<AppointmentDetails {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();
      fireEvent.click(editButton);

      // First input should be focused
      expect(screen.getByLabelText(/client name/i)).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      render(<AppointmentDetails {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();
      fireEvent.keyDown(editButton, { key: 'Enter' });

      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    it('provides proper ARIA labels', () => {
      render(<AppointmentDetails {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /appointment with/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /delete/i })).toHaveAttribute('aria-label');
    });
  });
});
