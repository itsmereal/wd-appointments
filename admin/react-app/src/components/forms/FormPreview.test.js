import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays } from 'date-fns';
import FormPreview from './FormPreview';
import { FIELD_TYPES } from '../../config/constants';

describe('FormPreview', () => {
  const mockFormData = {
    title: 'Test Booking Form',
    duration: 30,
    type: 'google_meet',
    description: 'This is a test booking form',
    fields: [
      {
        id: '1',
        type: FIELD_TYPES.TEXT.id,
        label: 'Name',
        required: true,
      },
      {
        id: '2',
        type: FIELD_TYPES.EMAIL.id,
        label: 'Email',
        required: true,
      },
      {
        id: '3',
        type: FIELD_TYPES.SELECT.id,
        label: 'Preferred Time',
        required: true,
        options: ['Morning', 'Afternoon', 'Evening'],
      },
      {
        id: '4',
        type: FIELD_TYPES.TEXTAREA.id,
        label: 'Additional Notes',
        required: false,
      },
    ],
  };

  const defaultProps = {
    formData: mockFormData,
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form preview correctly', () => {
    render(<FormPreview {...defaultProps} />);

    // Check form title and description
    expect(screen.getByText('Test Booking Form')).toBeInTheDocument();
    expect(screen.getByText('This is a test booking form')).toBeInTheDocument();
    expect(screen.getByText('Duration: 30 minutes')).toBeInTheDocument();

    // Check all fields are rendered
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Preferred Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Additional Notes')).toBeInTheDocument();
  });

  describe('Date and Time Selection', () => {
    it('allows date selection', async () => {
      render(<FormPreview {...defaultProps} />);

      const dateInput = screen.getByLabelText(/date/i);
      const futureDate = addDays(new Date(), 1);
      
      await userEvent.click(dateInput);
      await userEvent.type(dateInput, futureDate.toLocaleDateString());

      expect(dateInput).toHaveValue(expect.any(String));
    });

    it('allows time selection', async () => {
      render(<FormPreview {...defaultProps} />);

      const timeInput = screen.getByLabelText(/time/i);
      await userEvent.click(timeInput);
      await userEvent.type(timeInput, '14:00');

      expect(timeInput).toHaveValue(expect.any(String));
    });

    it('validates date and time selection', async () => {
      render(<FormPreview {...defaultProps} />);

      // Try to submit without selecting date and time
      fireEvent.click(screen.getByText(/schedule appointment/i));

      expect(screen.getByText(/please select a date/i)).toBeInTheDocument();
      expect(screen.getByText(/please select a time/i)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders different field types correctly', () => {
      render(<FormPreview {...defaultProps} />);

      // Text field
      expect(screen.getByLabelText('Name')).toHaveAttribute('type', 'text');

      // Email field
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');

      // Select field
      const selectField = screen.getByLabelText('Preferred Time');
      expect(selectField.tagName.toLowerCase()).toBe('select');
      expect(screen.getAllByRole('option')).toHaveLength(3);

      // Textarea field
      const textareaField = screen.getByLabelText('Additional Notes');
      expect(textareaField.tagName.toLowerCase()).toBe('textarea');
    });

    it('indicates required fields', () => {
      render(<FormPreview {...defaultProps} />);

      const nameLabel = screen.getByText('Name');
      expect(nameLabel).toHaveTextContent(/\*/);

      const notesLabel = screen.getByText('Additional Notes');
      expect(notesLabel).not.toHaveTextContent(/\*/);
    });

    it('validates required fields', async () => {
      render(<FormPreview {...defaultProps} />);

      // Try to submit without filling required fields
      fireEvent.click(screen.getByText(/schedule appointment/i));

      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('validates email format', async () => {
      render(<FormPreview {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'invalid-email');

      fireEvent.click(screen.getByText(/schedule appointment/i));

      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      render(<FormPreview {...defaultProps} />);

      // Fill in date and time
      const dateInput = screen.getByLabelText(/date/i);
      const timeInput = screen.getByLabelText(/time/i);
      await userEvent.type(dateInput, '2024-01-15');
      await userEvent.type(timeInput, '14:00');

      // Fill in required fields
      await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
      await userEvent.selectOptions(screen.getByLabelText('Preferred Time'), 'Morning');

      // Submit form
      fireEvent.click(screen.getByText(/schedule appointment/i));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentDateTime: expect.any(Date),
          Name: 'John Doe',
          Email: 'john@example.com',
          'Preferred Time': 'Morning',
        })
      );
    });

    it('prevents submission with invalid data', async () => {
      render(<FormPreview {...defaultProps} />);

      // Submit without filling any fields
      fireEvent.click(screen.getByText(/schedule appointment/i));

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper focus management', async () => {
      render(<FormPreview {...defaultProps} />);

      const dateInput = screen.getByLabelText(/date/i);
      const timeInput = screen.getByLabelText(/time/i);
      const nameInput = screen.getByLabelText('Name');

      // Tab through fields
      userEvent.tab();
      expect(dateInput).toHaveFocus();

      userEvent.tab();
      expect(timeInput).toHaveFocus();

      userEvent.tab();
      expect(nameInput).toHaveFocus();
    });

    it('provides proper ARIA attributes', () => {
      render(<FormPreview {...defaultProps} />);

      // Check form
      expect(screen.getByRole('form')).toHaveAttribute('aria-label');

      // Check required fields
      const requiredInputs = screen.getAllByRole('textbox', { required: true });
      requiredInputs.forEach(input => {
        expect(input).toHaveAttribute('aria-required', 'true');
      });

      // Check error messages
      fireEvent.click(screen.getByText(/schedule appointment/i));
      const errorMessages = screen.getAllByRole('alert');
      errorMessages.forEach(message => {
        expect(message).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts layout for mobile screens', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<FormPreview {...defaultProps} />);

      const form = screen.getByRole('form');
      expect(form).toHaveStyle({ maxWidth: '100%' });
    });

    it('adjusts layout for desktop screens', () => {
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      render(<FormPreview {...defaultProps} />);

      const form = screen.getByRole('form');
      expect(form).toHaveStyle({ maxWidth: '600px' });
    });
  });
});
