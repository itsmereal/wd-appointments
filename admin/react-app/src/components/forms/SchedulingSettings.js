import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  MenuItem,
  IconButton,
  Button,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const SchedulingSettings = ({ settings, onChange }) => {
  const [expandedDay, setExpandedDay] = useState(null);

  const handleDateRangeChange = (field, value) => {
    onChange({
      ...settings,
      dateRange: {
        ...settings.dateRange,
        [field]: value,
      },
    });
  };

  const handleAvailabilityChange = (day, index, field, value) => {
    const newAvailableHours = { ...settings.availableHours };
    
    if (!newAvailableHours[day]) {
      newAvailableHours[day] = [];
    }

    if (index >= newAvailableHours[day].length) {
      newAvailableHours[day].push({ start: '', end: '' });
    }

    newAvailableHours[day][index] = {
      ...newAvailableHours[day][index],
      [field]: format(value, 'HH:mm'),
    };

    onChange({
      ...settings,
      availableHours: newAvailableHours,
    });
  };

  const addTimeSlot = (day) => {
    const newAvailableHours = { ...settings.availableHours };
    if (!newAvailableHours[day]) {
      newAvailableHours[day] = [];
    }
    newAvailableHours[day].push({ start: '09:00', end: '17:00' });
    onChange({
      ...settings,
      availableHours: newAvailableHours,
    });
  };

  const removeTimeSlot = (day, index) => {
    const newAvailableHours = { ...settings.availableHours };
    newAvailableHours[day].splice(index, 1);
    onChange({
      ...settings,
      availableHours: newAvailableHours,
    });
  };

  const parseTime = (timeString) => {
    if (!timeString) return new Date();
    return parse(timeString, 'HH:mm', new Date());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Date Range */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Date Range
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={settings.dateRange.start ? new Date(settings.dateRange.start) : null}
                onChange={(date) => handleDateRangeChange('start', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={settings.dateRange.end ? new Date(settings.dateRange.end) : null}
                onChange={(date) => handleDateRangeChange('end', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={settings.dateRange.start ? new Date(settings.dateRange.start) : null}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Available Hours */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Hours
          </Typography>
          {DAYS_OF_WEEK.map((day) => (
            <Accordion
              key={day.id}
              expanded={expandedDay === day.id}
              onChange={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{day.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {(settings.availableHours[day.id] || []).map((slot, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid item xs={5}>
                        <TimePicker
                          label="Start Time"
                          value={parseTime(slot.start)}
                          onChange={(time) => handleAvailabilityChange(day.id, index, 'start', time)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TimePicker
                          label="End Time"
                          value={parseTime(slot.end)}
                          onChange={(time) => handleAvailabilityChange(day.id, index, 'end', time)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          color="error"
                          onClick={() => removeTimeSlot(day.id, index)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addTimeSlot(day.id)}
                  >
                    Add Time Slot
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        {/* Additional Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Buffer Time (minutes)"
                value={settings.bufferTime}
                onChange={(e) => onChange({
                  ...settings,
                  bufferTime: parseInt(e.target.value),
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Notice (hours)"
                value={settings.minimumNotice}
                onChange={(e) => onChange({
                  ...settings,
                  minimumNotice: parseInt(e.target.value),
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Daily Limit"
                value={settings.dailyLimit}
                onChange={(e) => onChange({
                  ...settings,
                  dailyLimit: parseInt(e.target.value),
                })}
                helperText="Maximum appointments per day (leave empty for no limit)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Timezone Display"
                value={settings.timezone}
                onChange={(e) => onChange({
                  ...settings,
                  timezone: e.target.value,
                })}
              >
                <MenuItem value="host">Host's Timezone</MenuItem>
                <MenuItem value="client">Client's Timezone</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default SchedulingSettings;
