import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Checkbox,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { validateField } from '../../utils/helpers';
import { FIELD_TYPES } from '../../config/constants';

const FormPreview = ({ formData, onSubmit }) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleFieldChange = (fieldId, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate date and time
    if (!selectedDate) {
      newErrors.date = 'Please select a date';
      isValid = false;
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a time';
      isValid = false;
    }

    // Validate custom fields
    formData.fields.forEach((field) => {
      const value = formValues[field.id];
      const error = validateField(field.type, value, field.required);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const appointmentDateTime = selectedDate && selectedTime ? 
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes()
        ) : null;

      onSubmit({
        ...formValues,
        appointmentDateTime,
      });
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case FIELD_TYPES.TEXT.id:
      case FIELD_TYPES.EMAIL.id:
        return (
          <TextField
            fullWidth
            label={field.label}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            required={field.required}
            type={field.type === FIELD_TYPES.EMAIL.id ? 'email' : 'text'}
          />
        );

      case FIELD_TYPES.TEXTAREA.id:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            required={field.required}
          />
        );

      case FIELD_TYPES.SELECT.id:
        return (
          <FormControl fullWidth error={!!errors[field.id]} required={field.required}>
            <Select
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>{field.label}</em>
              </MenuItem>
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors[field.id] && (
              <FormHelperText>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      case FIELD_TYPES.RADIO.id:
        return (
          <FormControl component="fieldset" error={!!errors[field.id]} required={field.required}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
            </Typography>
            <RadioGroup
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {errors[field.id] && (
              <FormHelperText>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      case FIELD_TYPES.CHECKBOX.id:
        return (
          <FormControl error={!!errors[field.id]} required={field.required}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues[field.id] || false}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                />
              }
              label={field.label}
            />
            {errors[field.id] && (
              <FormHelperText>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Form Header */}
          <Typography variant="h5" gutterBottom>
            {formData.title}
          </Typography>
          {formData.description && (
            <Typography variant="body1" color="textSecondary" paragraph>
              {formData.description}
            </Typography>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            Duration: {formData.duration} minutes
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Date and Time Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.date}
                      helperText={errors.date}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Time"
                  value={selectedTime}
                  onChange={setSelectedTime}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.time}
                      helperText={errors.time}
                      required
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Custom Fields */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
            <Grid container spacing={3}>
              {formData.fields.map((field) => (
                <Grid item xs={12} key={field.id}>
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
            >
              Schedule Appointment
            </Button>
          </Box>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default FormPreview;
