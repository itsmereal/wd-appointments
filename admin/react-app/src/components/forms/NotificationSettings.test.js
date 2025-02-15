import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationSettings from './NotificationSettings';
import { DEFAULT_SETTINGS } from '../../config/constants';

describe('NotificationSettings', () => {
  const mockSettings = {
    emailVerification: true,
    adminEmail: 'admin@example.com',
    fromName: 'Test Business',
    fromEmail: 'noreply@example.com',
    templates: {
      verification: {
        subject: 'Verify your appointment',
        body: 'Please verify your appointment: {verification_link}',
      },
      confirmation: {
        subject: 'Appointment Confirmed',
        body: 'Your appointment has been confirmed for {appointment_date} at {appointment_time}.',
      },
      reminder: {
        subject: 'Appointment Reminder',
        body: 'Reminder: You have an appointment scheduled for {appointment_date}.',
      },
      cancelled: {
        subject: 'Appointment Cancelled',
        body: 'Your appointment has been cancelled.',
      },
    },
  };

  const defaultProps = {
    settings: mockSettings,
    onChange: jest.fn(),
    isGlobalSettings: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification settings correctly', () => {
    render(<NotificationSettings {...defaultProps} />);

    // Check sections
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Templates')).toBeInTheDocument();

    // Check email settings
    expect(screen.getByLabelText(/from name/i)).toHaveValue('Test Business');
    expect(screen.getByLabelText(/from email/i)).toHaveValue('noreply@example.com');
    expect(screen.getByLabelText(/admin email/i)).toHaveValue('admin@example.com');
  });

  describe('General Settings', () => {
    it('toggles email verification', async () => {
      render(<NotificationSettings {...defaultProps} />);

      const verificationToggle = screen.getByRole('checkbox', {
        name: /enable email verification/i,
      });

      await userEvent.click(verificationToggle);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerification: false,
        })
      );
    });

    it('updates email settings', async () => {
      render(<NotificationSettings {...defaultProps} />);

      // Update From Name
      const fromNameInput = screen.getByLabelText(/from name/i);
      await userEvent.clear(fromNameInput);
      await userEvent.type(fromNameInput, 'New Business Name');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fromName: 'New Business Name',
        })
      );
    });

    it('validates email addresses', async () => {
      render(<NotificationSettings {...defaultProps} />);

      const fromEmailInput = screen.getByLabelText(/from email/i);
      await userEvent.clear(fromEmailInput);
      await userEvent.type(fromEmailInput, 'invalid-email');

      expect(fromEmailInput).toBeInvalid();
    });
  });

  describe('Email Templates', () => {
    it('displays all email templates', () => {
      render(<NotificationSettings {...defaultProps} />);

      expect(screen.getByText('Verification Email')).toBeInTheDocument();
      expect(screen.getByText('Confirmation Email')).toBeInTheDocument();
      expect(screen.getByText('Reminder Email')).toBeInTheDocument();
      expect(screen.getByText('Cancellation Email')).toBeInTheDocument();
    });

    it('allows editing template subject and body', async () => {
      render(<NotificationSettings {...defaultProps} />);

      // Expand verification template
      fireEvent.click(screen.getByText('Verification Email'));

      // Edit subject
      const subjectInput = screen.getByLabelText(/subject/i);
      await userEvent.clear(subjectInput);
      await userEvent.type(subjectInput, 'New Verification Subject');

      // Edit body
      const bodyInput = screen.getByLabelText(/body/i);
      await userEvent.clear(bodyInput);
      await userEvent.type(bodyInput, 'New verification body with {verification_link}');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          templates: expect.objectContaining({
            verification: {
              subject: 'New Verification Subject',
              body: 'New verification body with {verification_link}',
            },
          }),
        })
      );
    });

    it('shows available variables', () => {
      render(<NotificationSettings {...defaultProps} />);

      // Expand verification template
      fireEvent.click(screen.getByText('Verification Email'));

      expect(screen.getByText('{client_name}')).toBeInTheDocument();
      expect(screen.getByText('{appointment_date}')).toBeInTheDocument();
      expect(screen.getByText('{verification_link}')).toBeInTheDocument();
    });

    it('resets template to default', async () => {
      render(<NotificationSettings {...defaultProps} />);

      // Expand verification template
      fireEvent.click(screen.getByText('Verification Email'));

      // Click reset button
      fireEvent.click(screen.getByText('Reset to Default'));

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          templates: expect.objectContaining({
            verification: DEFAULT_SETTINGS.notifications.templates.verification,
          }),
        })
      );
    });
  });

  describe('Form-Specific Settings', () => {
    it('hides global settings when not in global mode', () => {
      render(<NotificationSettings {...defaultProps} isGlobalSettings={false} />);

      expect(screen.queryByText(/enable email verification/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/from name/i)).not.toBeInTheDocument();
    });

    it('shows form-specific notification options', () => {
      render(<NotificationSettings {...defaultProps} isGlobalSettings={false} />);

      expect(screen.getByLabelText(/admin email/i)).toBeInTheDocument();
      expect(screen.getByText(/email templates/i)).toBeInTheDocument();
    });
  });

  describe('Variable Tooltips', () => {
    it('shows tooltips for template variables', async () => {
      render(<NotificationSettings {...defaultProps} />);

      // Expand verification template
      fireEvent.click(screen.getByText('Verification Email'));

      // Hover over variable
      const clientNameVar = screen.getByText('{client_name}');
      fireEvent.mouseOver(clientNameVar);

      expect(screen.getByRole('tooltip')).toHaveTextContent("Client's full name");
    });
  });

  describe('Accessibility', () => {
    it('maintains proper focus management', () => {
      render(<NotificationSettings {...defaultProps} />);

      const emailInput = screen.getByLabelText(/admin email/i);
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      userEvent.tab();
      expect(screen.getByText('Verification Email')).toHaveFocus();
    });

    it('provides proper ARIA labels', () => {
      render(<NotificationSettings {...defaultProps} />);

      // Check template sections
      const templates = screen.getAllByRole('button');
      templates.forEach(template => {
        expect(template).toHaveAttribute('aria-expanded');
      });

      // Check form controls
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });
    });

    it('handles keyboard navigation in template editor', () => {
      render(<NotificationSettings {...defaultProps} />);

      // Expand template
      const templateButton = screen.getByText('Verification Email');
      templateButton.focus();
      fireEvent.keyDown(templateButton, { key: 'Enter' });

      // Navigate to subject field
      userEvent.tab();
      expect(screen.getByLabelText(/subject/i)).toHaveFocus();

      // Navigate to body field
      userEvent.tab();
      expect(screen.getByLabelText(/body/i)).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('validates required fields', async () => {
      render(<NotificationSettings {...defaultProps} />);

      const adminEmailInput = screen.getByLabelText(/admin email/i);
      await userEvent.clear(adminEmailInput);

      expect(adminEmailInput).toBeInvalid();
    });

    it('validates template variables', async () => {
      render(<NotificationSettings {...defaultProps} />);

      // Expand verification template
      fireEvent.click(screen.getByText('Verification Email'));

      // Remove required variable
      const bodyInput = screen.getByLabelText(/body/i);
      await userEvent.clear(bodyInput);
      await userEvent.type(bodyInput, 'Template without verification link');

      expect(screen.getByText(/verification link variable is required/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes template editors', () => {
      const { rerender } = render(<NotificationSettings {...defaultProps} />);

      // Expand template
      fireEvent.click(screen.getByText('Verification Email'));

      const initialEditor = screen.getByLabelText(/body/i);
      
      rerender(<NotificationSettings {...defaultProps} />);
      
      const newEditor = screen.getByLabelText(/body/i);
      
      expect(initialEditor).toBe(newEditor);
    });
  });
});
