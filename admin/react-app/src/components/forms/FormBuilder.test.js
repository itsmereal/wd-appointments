import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormBuilder from './FormBuilder';
import { FIELD_TYPES, MEETING_TYPES } from '../../config/constants';

describe('FormBuilder', () => {
  const defaultProps = {
    initialData: {
      title: '',
      duration: 30,
      type: MEETING_TYPES.GOOGLE_MEET.id,
      description: '',
      fields: [],
    },
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default values', () => {
    render(<FormBuilder {...defaultProps} />);

    expect(screen.getByLabelText(/form title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toHaveValue(30);
    expect(screen.getByLabelText(/meeting type/i)).toHaveValue(MEETING_TYPES.GOOGLE_MEET.id);
  });

  it('loads initial data correctly', () => {
    const initialData = {
      title: 'Test Form',
      duration: 60,
      type: MEETING_TYPES.ZOOM.id,
      description: 'Test Description',
      fields: [
        {
          id: '1',
          type: FIELD_TYPES.TEXT.id,
          label: 'Name',
          required: true,
        },
      ],
    };

    render(<FormBuilder {...defaultProps} initialData={initialData} />);

    expect(screen.getByLabelText(/form title/i)).toHaveValue('Test Form');
    expect(screen.getByLabelText(/duration/i)).toHaveValue(60);
    expect(screen.getByLabelText(/meeting type/i)).toHaveValue(MEETING_TYPES.ZOOM.id);
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  describe('Field Management', () => {
    it('adds a new field', async () => {
      render(<FormBuilder {...defaultProps} />);

      // Fill in new field details
      await userEvent.type(screen.getByLabelText(/field label/i), 'Test Field');
      await userEvent.selectOptions(screen.getByLabelText(/field type/i), FIELD_TYPES.TEXT.id);
      
      // Add the field
      fireEvent.click(screen.getByText('Add'));

      // Verify field was added
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });

    it('removes a field', async () => {
      const initialData = {
        ...defaultProps.initialData,
        fields: [
          {
            id: '1',
            type: FIELD_TYPES.TEXT.id,
            label: 'Test Field',
            required: true,
          },
        ],
      };

      render(<FormBuilder {...defaultProps} initialData={initialData} />);

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      // Verify field was removed
      expect(screen.queryByText('Test Field')).not.toBeInTheDocument();
    });

    it('reorders fields via drag and drop', async () => {
      const initialData = {
        ...defaultProps.initialData,
        fields: [
          { id: '1', type: FIELD_TYPES.TEXT.id, label: 'Field 1', required: true },
          { id: '2', type: FIELD_TYPES.TEXT.id, label: 'Field 2', required: true },
        ],
      };

      render(<FormBuilder {...defaultProps} initialData={initialData} />);

      // Get drag handles
      const dragHandles = screen.getAllByTestId('drag-handle');
      
      // Simulate drag and drop
      fireEvent.dragStart(dragHandles[0]);
      fireEvent.dragOver(dragHandles[1]);
      fireEvent.drop(dragHandles[1]);

      // Verify order changed
      const fields = screen.getAllByRole('listitem');
      expect(within(fields[0]).getByText('Field 2')).toBeInTheDocument();
      expect(within(fields[1]).getByText('Field 1')).toBeInTheDocument();
    });

    it('handles field type specific options', async () => {
      render(<FormBuilder {...defaultProps} />);

      // Add a select field
      await userEvent.type(screen.getByLabelText(/field label/i), 'Options Field');
      await userEvent.selectOptions(screen.getByLabelText(/field type/i), FIELD_TYPES.SELECT.id);
      
      // Options input should appear
      expect(screen.getByLabelText(/options/i)).toBeInTheDocument();

      // Add options
      await userEvent.type(screen.getByLabelText(/options/i), 'Option 1, Option 2');
      
      fireEvent.click(screen.getByText('Add'));

      // Verify options were saved
      const field = screen.getByText('Options Field').closest('li');
      expect(within(field).getByText(/Option 1, Option 2/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('requires a title', async () => {
      render(<FormBuilder {...defaultProps} />);

      fireEvent.click(screen.getByText('Save Form'));
      
      expect(defaultProps.onSave).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/form title/i)).toBeInvalid();
    });

    it('validates duration', async () => {
      render(<FormBuilder {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration/i);
      await userEvent.clear(durationInput);
      await userEvent.type(durationInput, '-30');

      expect(durationInput).toBeInvalid();
    });

    it('saves form when valid', async () => {
      render(<FormBuilder {...defaultProps} />);

      // Fill required fields
      await userEvent.type(screen.getByLabelText(/form title/i), 'Test Form');
      
      // Save form
      fireEvent.click(screen.getByText('Save Form'));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Form',
          duration: 30,
          type: MEETING_TYPES.GOOGLE_MEET.id,
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('maintains focus management', async () => {
      render(<FormBuilder {...defaultProps} />);

      // Focus should start on title
      const titleInput = screen.getByLabelText(/form title/i);
      expect(titleInput).toHaveFocus();

      // Tab to next field
      userEvent.tab();
      expect(screen.getByLabelText(/duration/i)).toHaveFocus();
    });

    it('provides proper ARIA labels', () => {
      render(<FormBuilder {...defaultProps} />);

      // Check for proper section headings
      expect(screen.getByRole('heading', { name: /general settings/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /form fields/i })).toBeInTheDocument();

      // Check for field group labels
      const fieldGroups = screen.getAllByRole('group');
      fieldGroups.forEach(group => {
        expect(group).toHaveAttribute('aria-label');
      });
    });

    it('handles keyboard navigation for drag and drop', async () => {
      const initialData = {
        ...defaultProps.initialData,
        fields: [
          { id: '1', type: FIELD_TYPES.TEXT.id, label: 'Field 1', required: true },
          { id: '2', type: FIELD_TYPES.TEXT.id, label: 'Field 2', required: true },
        ],
      };

      render(<FormBuilder {...defaultProps} initialData={initialData} />);

      // Focus first drag handle
      const dragHandles = screen.getAllByTestId('drag-handle');
      dragHandles[0].focus();

      // Move with keyboard
      fireEvent.keyDown(dragHandles[0], { key: 'Space' });
      fireEvent.keyDown(dragHandles[0], { key: 'ArrowDown' });
      fireEvent.keyDown(dragHandles[0], { key: 'Space' });

      // Verify order changed
      const fields = screen.getAllByRole('listitem');
      expect(within(fields[0]).getByText('Field 2')).toBeInTheDocument();
      expect(within(fields[1]).getByText('Field 1')).toBeInTheDocument();
    });
  });
});
