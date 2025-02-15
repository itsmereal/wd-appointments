import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingFormCard from './BookingFormCard';
import { MEETING_TYPES } from '../../config/constants';

describe('BookingFormCard', () => {
  const mockForm = {
    id: '1',
    title: 'Test Booking Form',
    description: 'This is a test booking form',
    duration: 30,
    type: MEETING_TYPES.GOOGLE_MEET.id,
    stats: {
      totalBookings: 150,
      monthlyBookings: 25,
    },
  };

  const defaultProps = {
    form: mockForm,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPreview: jest.fn(),
    onCopyShortcode: jest.fn(),
    onCopyLink: jest.fn(),
    showStats: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form information correctly', () => {
    render(<BookingFormCard {...defaultProps} />);

    // Check basic information
    expect(screen.getByText('Test Booking Form')).toBeInTheDocument();
    expect(screen.getByText('This is a test booking form')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('Google Meet')).toBeInTheDocument();
  });

  describe('Statistics Display', () => {
    it('shows booking statistics when enabled', () => {
      render(<BookingFormCard {...defaultProps} />);

      expect(screen.getByText('150')).toBeInTheDocument(); // Total bookings
      expect(screen.getByText('25')).toBeInTheDocument(); // Monthly bookings
    });

    it('hides statistics when disabled', () => {
      render(<BookingFormCard {...defaultProps} showStats={false} />);

      expect(screen.queryByText('Total Bookings')).not.toBeInTheDocument();
    });
  });

  describe('Actions Menu', () => {
    it('opens actions menu when clicking more button', () => {
      render(<BookingFormCard {...defaultProps} />);

      fireEvent.click(screen.getByLabelText(/form options/i));

      expect(screen.getByText('Edit Form')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Copy Shortcode')).toBeInTheDocument();
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls edit handler when selecting edit option', () => {
      render(<BookingFormCard {...defaultProps} />);

      fireEvent.click(screen.getByLabelText(/form options/i));
      fireEvent.click(screen.getByText('Edit Form'));

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockForm);
    });

    it('shows delete confirmation dialog', () => {
      render(<BookingFormCard {...defaultProps} />);

      // Open menu and click delete
      fireEvent.click(screen.getByLabelText(/form options/i));
      fireEvent.click(screen.getByText('Delete'));

      // Check if confirmation dialog is shown
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('previews form when clicking preview button', () => {
      render(<BookingFormCard {...defaultProps} />);

      fireEvent.click(screen.getByLabelText(/preview/i));

      expect(defaultProps.onPreview).toHaveBeenCalledWith(mockForm);
    });

    it('copies shortcode when clicking shortcode button', () => {
      render(<BookingFormCard {...defaultProps} />);

      fireEvent.click(screen.getByLabelText(/copy shortcode/i));

      expect(defaultProps.onCopyShortcode).toHaveBeenCalledWith(mockForm.id);
    });

    it('copies link when clicking link button', () => {
      render(<BookingFormCard {...defaultProps} />);

      fireEvent.click(screen.getByLabelText(/copy link/i));

      expect(defaultProps.onCopyLink).toHaveBeenCalledWith(mockForm.id);
    });
  });

  describe('Delete Confirmation', () => {
    it('calls delete handler when confirming deletion', () => {
      render(<BookingFormCard {...defaultProps} />);

      // Open menu and click delete
      fireEvent.click(screen.getByLabelText(/form options/i));
      fireEvent.click(screen.getByText('Delete'));

      // Confirm deletion
      fireEvent.click(screen.getByText(/delete$/i));

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockForm.id);
    });

    it('cancels deletion when clicking cancel', () => {
      render(<BookingFormCard {...defaultProps} />);

      // Open menu and click delete
      fireEvent.click(screen.getByLabelText(/form options/i));
      fireEvent.click(screen.getByText('Delete'));

      // Cancel deletion
      fireEvent.click(screen.getByText(/cancel/i));

      expect(defaultProps.onDelete).not.toHaveBeenCalled();
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('shows hover state', () => {
      render(<BookingFormCard {...defaultProps} />);

      const card = screen.getByRole('article');
      fireEvent.mouseEnter(card);

      expect(card).toHaveStyle({ boxShadow: expect.any(String) });
    });

    it('shows active state when clicking', () => {
      render(<BookingFormCard {...defaultProps} />);

      const card = screen.getByRole('article');
      fireEvent.mouseDown(card);

      expect(card).toHaveStyle({ transform: expect.any(String) });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<BookingFormCard {...defaultProps} />);

      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Test Booking Form')
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('maintains focus management', () => {
      render(<BookingFormCard {...defaultProps} />);

      // Open menu
      const menuButton = screen.getByLabelText(/form options/i);
      menuButton.focus();
      fireEvent.keyDown(menuButton, { key: 'Enter' });

      // First menu item should be focused
      expect(screen.getByText('Edit Form')).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      render(<BookingFormCard {...defaultProps} />);

      // Tab through quick action buttons
      userEvent.tab();
      expect(screen.getByLabelText(/preview/i)).toHaveFocus();

      userEvent.tab();
      expect(screen.getByLabelText(/copy shortcode/i)).toHaveFocus();

      userEvent.tab();
      expect(screen.getByLabelText(/copy link/i)).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when stats fail to load', () => {
      const formWithError = {
        ...mockForm,
        stats: {
          error: 'Failed to load statistics',
        },
      };

      render(<BookingFormCard {...defaultProps} form={formWithError} />);

      expect(screen.getByText(/failed to load statistics/i)).toBeInTheDocument();
    });

    it('handles missing description gracefully', () => {
      const formWithoutDescription = {
        ...mockForm,
        description: null,
      };

      render(<BookingFormCard {...defaultProps} form={formWithoutDescription} />);

      expect(screen.queryByText(/this is a test booking form/i)).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes callback handlers', () => {
      const { rerender } = render(<BookingFormCard {...defaultProps} />);

      const initialHandlers = {
        edit: screen.getByLabelText(/form options/i).onclick,
        preview: screen.getByLabelText(/preview/i).onclick,
      };

      rerender(<BookingFormCard {...defaultProps} />);

      const newHandlers = {
        edit: screen.getByLabelText(/form options/i).onclick,
        preview: screen.getByLabelText(/preview/i).onclick,
      };

      expect(initialHandlers.edit).toBe(newHandlers.edit);
      expect(initialHandlers.preview).toBe(newHandlers.preview);
    });
  });
});
