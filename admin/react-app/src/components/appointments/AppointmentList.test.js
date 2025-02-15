import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentList from './AppointmentList';
import { APPOINTMENT_STATUS } from '../../config/constants';
import { formatDate } from '../../utils/helpers';

describe('AppointmentList', () => {
  const mockAppointments = [
    {
      id: '1',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      appointmentDate: '2024-01-15T10:00:00Z',
      duration: 30,
      status: APPOINTMENT_STATUS.CONFIRMED.id,
      formTitle: 'Consultation',
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      appointmentDate: '2024-01-15T14:00:00Z',
      duration: 60,
      status: APPOINTMENT_STATUS.PENDING.id,
      formTitle: 'Meeting',
    },
    {
      id: '3',
      clientName: 'Bob Wilson',
      clientEmail: 'bob@example.com',
      appointmentDate: '2024-01-16T09:00:00Z',
      duration: 45,
      status: APPOINTMENT_STATUS.CANCELLED.id,
      formTitle: 'Follow-up',
    },
  ];

  const defaultProps = {
    appointments: mockAppointments,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onSendReminder: jest.fn(),
    onRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders appointments list correctly', () => {
    render(<AppointmentList {...defaultProps} />);

    // Check if all appointments are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
  });

  describe('Filtering', () => {
    it('filters appointments by search term', async () => {
      render(<AppointmentList {...defaultProps} />);

      // Search for "John"
      const searchInput = screen.getByPlaceholderText(/search appointments/i);
      await userEvent.type(searchInput, 'John');

      // Should only show John's appointment
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('filters appointments by status', async () => {
      render(<AppointmentList {...defaultProps} />);

      // Filter by confirmed status
      const statusFilter = screen.getByLabelText(/status/i);
      await userEvent.selectOptions(statusFilter, APPOINTMENT_STATUS.CONFIRMED.id);

      // Should only show confirmed appointments
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('combines search and status filters', async () => {
      render(<AppointmentList {...defaultProps} />);

      // Apply both filters
      const searchInput = screen.getByPlaceholderText(/search appointments/i);
      await userEvent.type(searchInput, 'John');

      const statusFilter = screen.getByLabelText(/status/i);
      await userEvent.selectOptions(statusFilter, APPOINTMENT_STATUS.CONFIRMED.id);

      // Should only show appointments matching both criteria
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts appointments by date', async () => {
      render(<AppointmentList {...defaultProps} />);

      // Click date header to sort
      const dateHeader = screen.getByRole('columnheader', { name: /date & time/i });
      fireEvent.click(dateHeader);

      // Get all appointment rows
      const rows = screen.getAllByRole('row').slice(1); // Skip header row
      
      // Check if dates are in ascending order
      const dates = rows.map(row => 
        within(row).getByText(/\d{1,2}:\d{2}/i).textContent
      );
      
      expect(dates).toEqual([...dates].sort());
    });

    it('sorts appointments by client name', async () => {
      render(<AppointmentList {...defaultProps} />);

      // Click client name header to sort
      const nameHeader = screen.getByRole('columnheader', { name: /client/i });
      fireEvent.click(nameHeader);

      // Get all client names
      const rows = screen.getAllByRole('row').slice(1);
      const names = rows.map(row => 
        within(row).getByText(/[A-Za-z]+ [A-Za-z]+/).textContent
      );

      expect(names).toEqual([...names].sort());
    });

    it('toggles sort direction', async () => {
      render(<AppointmentList {...defaultProps} />);

      const nameHeader = screen.getByRole('columnheader', { name: /client/i });
      
      // First click - ascending
      fireEvent.click(nameHeader);
      let names = screen.getAllByRole('row').slice(1)
        .map(row => within(row).getByText(/[A-Za-z]+ [A-Za-z]+/).textContent);
      expect(names).toEqual([...names].sort());

      // Second click - descending
      fireEvent.click(nameHeader);
      names = screen.getAllByRole('row').slice(1)
        .map(row => within(row).getByText(/[A-Za-z]+ [A-Za-z]+/).textContent);
      expect(names).toEqual([...names].sort().reverse());
    });
  });

  describe('Pagination', () => {
    it('paginates appointments correctly', () => {
      const manyAppointments = Array(25).fill(null).map((_, index) => ({
        ...mockAppointments[0],
        id: `${index + 1}`,
        clientName: `Client ${index + 1}`,
      }));

      render(<AppointmentList {...defaultProps} appointments={manyAppointments} />);

      // Should show first 10 appointments by default
      expect(screen.getAllByRole('row')).toHaveLength(11); // 10 + header row

      // Change page size
      const rowsPerPageSelect = screen.getByLabelText(/rows per page/i);
      fireEvent.change(rowsPerPageSelect, { target: { value: '25' } });

      // Should show 25 appointments
      expect(screen.getAllByRole('row')).toHaveLength(26); // 25 + header row
    });

    it('navigates between pages', () => {
      const manyAppointments = Array(25).fill(null).map((_, index) => ({
        ...mockAppointments[0],
        id: `${index + 1}`,
        clientName: `Client ${index + 1}`,
      }));

      render(<AppointmentList {...defaultProps} appointments={manyAppointments} />);

      // Go to next page
      const nextPageButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextPageButton);

      // Should show appointments 11-20
      expect(screen.getByText('Client 11')).toBeInTheDocument();
      expect(screen.queryByText('Client 1')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('opens appointment details on row click', () => {
      render(<AppointmentList {...defaultProps} />);

      const firstRow = screen.getAllByRole('row')[1];
      fireEvent.click(firstRow);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/appointment details/i)).toBeInTheDocument();
    });

    it('sends reminder email', async () => {
      render(<AppointmentList {...defaultProps} />);

      const reminderButton = screen.getAllByRole('button', { name: /send reminder/i })[0];
      fireEvent.click(reminderButton);

      expect(defaultProps.onSendReminder).toHaveBeenCalledWith('1');
    });

    it('deletes appointment', async () => {
      render(<AppointmentList {...defaultProps} />);

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      fireEvent.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
    });

    it('refreshes appointment list', () => {
      render(<AppointmentList {...defaultProps} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has sortable column headers', () => {
      render(<AppointmentList {...defaultProps} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('aria-sort');
      });
    });

    it('provides status information to screen readers', () => {
      render(<AppointmentList {...defaultProps} />);

      const statusChips = screen.getAllByRole('status');
      expect(statusChips).toHaveLength(mockAppointments.length);
    });

    it('maintains focus after actions', async () => {
      render(<AppointmentList {...defaultProps} />);

      const reminderButton = screen.getAllByRole('button', { name: /send reminder/i })[0];
      reminderButton.focus();
      fireEvent.click(reminderButton);

      expect(reminderButton).toHaveFocus();
    });
  });
});
