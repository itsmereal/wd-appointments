import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  AlertTitle,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const TIME_ZONES = Intl.supportedValuesOf('timeZone').map(zone => ({
  value: zone,
  label: zone.replace(/_/g, ' ')
}));

const DATE_FORMATS = [
  { value: 'Y-m-d', label: 'YYYY-MM-DD (2024-01-31)' },
  { value: 'd/m/Y', label: 'DD/MM/YYYY (31/01/2024)' },
  { value: 'm/d/Y', label: 'MM/DD/YYYY (01/31/2024)' },
  { value: 'F j, Y', label: 'Month D, YYYY (January 31, 2024)' },
];

const TIME_FORMATS = [
  { value: 'H:i', label: '24-hour (14:30)' },
  { value: 'h:i A', label: '12-hour (02:30 PM)' },
];

const WEEK_STARTS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
];

const GeneralSettings = ({ settings, onUpdate }) => {
  const handleSettingChange = (field, value) => {
    onUpdate({
      ...settings,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Configure basic settings for your appointment system
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Business Information */}
        <Typography variant="subtitle1" gutterBottom>
          Business Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={settings.businessName || ''}
              onChange={(e) => handleSettingChange('businessName', e.target.value)}
              helperText="Displayed in emails and booking forms"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Website"
              value={settings.businessWebsite || ''}
              onChange={(e) => handleSettingChange('businessWebsite', e.target.value)}
              helperText="Optional: Link to your website"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Date and Time Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Date and Time Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Timezone"
              value={settings.timezone || 'UTC'}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
            >
              {TIME_ZONES.map((zone) => (
                <MenuItem key={zone.value} value={zone.value}>
                  {zone.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Week Starts On"
              value={settings.weekStartsOn || 0}
              onChange={(e) => handleSettingChange('weekStartsOn', e.target.value)}
            >
              {WEEK_STARTS.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Date Format"
              value={settings.dateFormat || 'Y-m-d'}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            >
              {DATE_FORMATS.map((format) => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Time Format"
              value={settings.timeFormat || 'H:i'}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
            >
              {TIME_FORMATS.map((format) => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Booking Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Booking Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Default Appointment Duration"
              value={settings.defaultDuration || 30}
              onChange={(e) => handleSettingChange('defaultDuration', parseInt(e.target.value))}
              helperText="Default duration in minutes"
              InputProps={{
                endAdornment: (
                  <Tooltip title="This will be the default duration for new booking forms">
                    <IconButton size="small">
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Buffer Time"
              value={settings.bufferTime || 0}
              onChange={(e) => handleSettingChange('bufferTime', parseInt(e.target.value))}
              helperText="Minutes between appointments"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Notice"
              value={settings.minimumNotice || 24}
              onChange={(e) => handleSettingChange('minimumNotice', parseInt(e.target.value))}
              helperText="Minimum hours notice required for booking"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Future Days"
              value={settings.maxFutureDays || 90}
              onChange={(e) => handleSettingChange('maxFutureDays', parseInt(e.target.value))}
              helperText="How far in advance can appointments be booked"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Additional Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Additional Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowCancellations || false}
                  onChange={(e) =>
                    handleSettingChange('allowCancellations', e.target.checked)
                  }
                />
              }
              label="Allow clients to cancel appointments"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowRescheduling || false}
                  onChange={(e) =>
                    handleSettingChange('allowRescheduling', e.target.checked)
                  }
                />
              }
              label="Allow clients to reschedule appointments"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showTimezoneSelect || false}
                  onChange={(e) =>
                    handleSettingChange('showTimezoneSelect', e.target.checked)
                  }
                />
              }
              label="Show timezone selector in booking forms"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <AlertTitle>Timezone Handling</AlertTitle>
            All appointments are stored in UTC and converted to the selected timezone
            for display. Make sure your WordPress timezone settings are correctly
            configured.
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
