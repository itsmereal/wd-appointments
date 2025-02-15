import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Apple as AppleIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useCalendar } from '../../context/CalendarContext';
import { useApp } from '../../context/AppContext';

const CalendarIntegration = ({ settings, onUpdate }) => {
  const [expanded, setExpanded] = useState('');
  const [loading, setLoading] = useState(false);
  const { authenticate, disconnect, isAuthenticated, provider } = useCalendar();
  const { showNotification } = useApp();

  const handleExpand = (section) => {
    setExpanded(expanded === section ? '' : section);
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await authenticate('google');
      showNotification('success', 'Successfully connected to Google Calendar');
      onUpdate({
        ...settings,
        provider: 'google',
      });
    } catch (error) {
      showNotification('error', 'Failed to connect to Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleICloudAuth = async () => {
    try {
      setLoading(true);
      await authenticate('icloud');
      showNotification('success', 'Successfully connected to iCloud Calendar');
      onUpdate({
        ...settings,
        provider: 'icloud',
      });
    } catch (error) {
      showNotification('error', 'Failed to connect to iCloud Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await disconnect();
      showNotification('success', 'Successfully disconnected calendar');
      onUpdate({
        ...settings,
        provider: null,
      });
    } catch (error) {
      showNotification('error', 'Failed to disconnect calendar');
    } finally {
      setLoading(false);
    }
  };

  const renderGoogleSection = () => (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Client ID"
            value={settings.googleClientId || ''}
            onChange={(e) =>
              onUpdate({
                ...settings,
                googleClientId: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Client Secret"
            type="password"
            value={settings.googleClientSecret || ''}
            onChange={(e) =>
              onUpdate({
                ...settings,
                googleClientSecret: e.target.value,
              })
            }
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <AlertTitle>Setup Instructions</AlertTitle>
          <Typography variant="body2" paragraph>
            To use Google Calendar integration:
          </Typography>
          <ol>
            <li>Go to the Google Cloud Console</li>
            <li>Create a new project or select an existing one</li>
            <li>Enable the Google Calendar API</li>
            <li>Configure the OAuth consent screen</li>
            <li>Create OAuth 2.0 credentials</li>
            <li>Add authorized redirect URIs</li>
            <li>Copy the Client ID and Client Secret here</li>
          </ol>
        </Alert>
      </Box>
    </Box>
  );

  const renderICloudSection = () => (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="iCloud Email"
            value={settings.icloudEmail || ''}
            onChange={(e) =>
              onUpdate({
                ...settings,
                icloudEmail: e.target.value,
              })
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="App-Specific Password"
            type="password"
            value={settings.icloudPassword || ''}
            onChange={(e) =>
              onUpdate({
                ...settings,
                icloudPassword: e.target.value,
              })
            }
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <AlertTitle>Setup Instructions</AlertTitle>
          <Typography variant="body2" paragraph>
            To use iCloud Calendar integration:
          </Typography>
          <ol>
            <li>Sign in to your Apple ID account page</li>
            <li>Go to Security &gt; App-Specific Passwords</li>
            <li>Generate a new app-specific password</li>
            <li>Enter your iCloud email and the generated password here</li>
          </ol>
        </Alert>
      </Box>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Calendar Integration
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Connect your calendar to automatically sync appointments
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Connection Status */}
        <Box sx={{ mb: 3 }}>
          <Alert
            severity={isAuthenticated ? 'success' : 'info'}
            icon={isAuthenticated ? <CheckIcon /> : <SyncIcon />}
          >
            <AlertTitle>
              {isAuthenticated
                ? `Connected to ${
                    provider === 'google' ? 'Google Calendar' : 'iCloud Calendar'
                  }`
                : 'Not Connected'}
            </AlertTitle>
            {isAuthenticated ? (
              <Button
                size="small"
                onClick={handleDisconnect}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                Disconnect
              </Button>
            ) : (
              'Choose a calendar provider below to get started'
            )}
          </Alert>
        </Box>

        {/* Calendar Options */}
        <List>
          {/* Google Calendar */}
          <ListItem
            button
            onClick={() => handleExpand('google')}
            selected={expanded === 'google'}
          >
            <ListItemIcon>
              <GoogleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Google Calendar"
              secondary={
                provider === 'google' ? 'Connected' : 'Click to configure'
              }
            />
            <ListItemSecondaryAction>
              {expanded === 'google' ? (
                <ExpandMoreIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={expanded === 'google'}>
            <Box sx={{ p: 3 }}>
              {renderGoogleSection()}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleGoogleAuth}
                  disabled={loading || !settings.googleClientId || !settings.googleClientSecret}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Connect Google Calendar'
                  )}
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* iCloud Calendar */}
          <ListItem
            button
            onClick={() => handleExpand('icloud')}
            selected={expanded === 'icloud'}
          >
            <ListItemIcon>
              <AppleIcon />
            </ListItemIcon>
            <ListItemText
              primary="iCloud Calendar"
              secondary={
                provider === 'icloud' ? 'Connected' : 'Click to configure'
              }
            />
            <ListItemSecondaryAction>
              {expanded === 'icloud' ? (
                <ExpandMoreIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={expanded === 'icloud'}>
            <Box sx={{ p: 3 }}>
              {renderICloudSection()}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleICloudAuth}
                  disabled={loading || !settings.icloudEmail || !settings.icloudPassword}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Connect iCloud Calendar'
                  )}
                </Button>
              </Box>
            </Box>
          </Collapse>
        </List>

        <Divider sx={{ my: 3 }} />

        {/* Additional Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Calendar Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSync || false}
                  onChange={(e) =>
                    onUpdate({
                      ...settings,
                      autoSync: e.target.checked,
                    })
                  }
                />
              }
              label="Automatically sync appointments"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.addReminders || false}
                  onChange={(e) =>
                    onUpdate({
                      ...settings,
                      addReminders: e.target.checked,
                    })
                  }
                />
              }
              label="Add calendar reminders"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;
