import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  AlertTitle,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const EmailSettings = ({ settings, onUpdate }) => {
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailType, setTestEmailType] = useState('verification');
  const [sending, setSending] = useState(false);
  const { showNotification } = useApp();

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      showNotification('error', 'Please enter a test email address');
      return;
    }

    try {
      setSending(true);
      // TODO: Implement test email sending through WordPress REST API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      showNotification('success', 'Test email sent successfully');
      setTestEmailDialog(false);
    } catch (error) {
      showNotification('error', 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

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
          Email Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Configure email notifications and settings for appointments
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Email Provider Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Email Provider
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Name"
              value={settings.fromName || ''}
              onChange={(e) => handleSettingChange('fromName', e.target.value)}
              helperText="Name that appears in the From field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Email"
              value={settings.fromEmail || ''}
              onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
              helperText="Email address that sends the notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>WordPress Mail Settings</AlertTitle>
              By default, emails are sent using WordPress mail settings. For better
              deliverability, consider using an SMTP plugin.
            </Alert>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Notification Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Notification Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailVerification || false}
                  onChange={(e) =>
                    handleSettingChange('emailVerification', e.target.checked)
                  }
                />
              }
              label="Require email verification for appointments"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.adminNotifications || false}
                  onChange={(e) =>
                    handleSettingChange('adminNotifications', e.target.checked)
                  }
                />
              }
              label="Send admin notifications for new appointments"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reminderEmails || false}
                  onChange={(e) =>
                    handleSettingChange('reminderEmails', e.target.checked)
                  }
                />
              }
              label="Send reminder emails"
            />
          </Grid>
          {settings.reminderEmails && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Reminder Hours"
                value={settings.reminderHours || 24}
                onChange={(e) =>
                  handleSettingChange('reminderHours', parseInt(e.target.value))
                }
                helperText="Hours before appointment to send reminder"
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Admin Notification Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Admin Notifications
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Admin Email"
              value={settings.adminEmail || ''}
              onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              helperText="Email address to receive admin notifications"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setTestEmailDialog(true)}
          >
            Send Test Email
          </Button>
        </Box>

        {/* Test Email Dialog */}
        <Dialog
          open={testEmailDialog}
          onClose={() => setTestEmailDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Test Email Address"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Email Type"
                  value={testEmailType}
                  onChange={(e) => setTestEmailType(e.target.value)}
                >
                  <MenuItem value="verification">Verification Email</MenuItem>
                  <MenuItem value="confirmation">Confirmation Email</MenuItem>
                  <MenuItem value="reminder">Reminder Email</MenuItem>
                  <MenuItem value="cancellation">Cancellation Email</MenuItem>
                  <MenuItem value="admin">Admin Notification</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleTestEmail}
              disabled={sending || !testEmailAddress}
              startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send Test
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
