import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Update as UpdateIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const LicenseSettings = ({ settings, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const { showNotification } = useApp();

  const handleActivateLicense = async () => {
    if (!settings.licenseKey) {
      showNotification('error', 'Please enter a license key');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement license activation through WordPress REST API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

      onUpdate({
        ...settings,
        licenseStatus: 'active',
        licenseExpiry: '2025-12-31',
        licenseDomain: window.location.hostname,
      });

      showNotification('success', 'License activated successfully');
    } catch (error) {
      showNotification('error', 'Failed to activate license');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateLicense = async () => {
    try {
      setLoading(true);
      // TODO: Implement license deactivation through WordPress REST API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

      onUpdate({
        ...settings,
        licenseStatus: 'inactive',
        licenseExpiry: null,
        licenseDomain: null,
      });

      showNotification('success', 'License deactivated successfully');
    } catch (error) {
      showNotification('error', 'Failed to deactivate license');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUpdates = async () => {
    try {
      setLoading(true);
      // TODO: Implement update check through WordPress REST API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      setUpdateDialog(true);
    } catch (error) {
      showNotification('error', 'Failed to check for updates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      // TODO: Implement plugin update through WordPress REST API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      showNotification('success', 'Plugin updated successfully');
      setUpdateDialog(false);
    } catch (error) {
      showNotification('error', 'Failed to update plugin');
    } finally {
      setLoading(false);
    }
  };

  const renderLicenseStatus = () => {
    const isActive = settings.licenseStatus === 'active';
    return (
      <Alert
        severity={isActive ? 'success' : 'warning'}
        icon={isActive ? <CheckCircleIcon /> : <ErrorIcon />}
        sx={{ mb: 3 }}
      >
        <AlertTitle>
          {isActive ? 'License Active' : 'License Inactive'}
        </AlertTitle>
        {isActive ? (
          <>
            Your license is active and valid until{' '}
            {new Date(settings.licenseExpiry).toLocaleDateString()}
          </>
        ) : (
          'Please enter and activate your license key to receive updates and support'
        )}
      </Alert>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          License Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Manage your WD Appointments license and updates
        </Typography>

        {renderLicenseStatus()}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="License Key"
              value={settings.licenseKey || ''}
              onChange={(e) =>
                onUpdate({
                  ...settings,
                  licenseKey: e.target.value,
                })
              }
              disabled={settings.licenseStatus === 'active'}
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {settings.licenseStatus === 'active' ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeactivateLicense}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <KeyIcon />
                  }
                >
                  Deactivate License
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleActivateLicense}
                  disabled={loading || !settings.licenseKey}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <KeyIcon />
                  }
                >
                  Activate License
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleCheckUpdates}
                disabled={loading || settings.licenseStatus !== 'active'}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <UpdateIcon />
                }
              >
                Check for Updates
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          License Information
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText
              primary="Licensed Domain"
              secondary={settings.licenseDomain || 'Not activated'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CalendarIcon />
            </ListItemIcon>
            <ListItemText
              primary="License Type"
              secondary={settings.licenseType || 'Standard License'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ScheduleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Expiration Date"
              secondary={
                settings.licenseExpiry
                  ? new Date(settings.licenseExpiry).toLocaleDateString()
                  : 'Not activated'
              }
            />
            {settings.licenseExpiry && (
              <ListItemSecondaryAction>
                <Chip
                  label={
                    new Date(settings.licenseExpiry) > new Date()
                      ? 'Valid'
                      : 'Expired'
                  }
                  color={
                    new Date(settings.licenseExpiry) > new Date()
                      ? 'success'
                      : 'error'
                  }
                  size="small"
                />
              </ListItemSecondaryAction>
            )}
          </ListItem>
        </List>

        {/* Update Dialog */}
        <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)}>
          <DialogTitle>Update Available</DialogTitle>
          <DialogContent>
            <DialogContentText>
              A new version (2.0.0) of WD Appointments is available. Would you
              like to update now?
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                What&apos;s New:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Improved calendar integration" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Enhanced email notifications" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Bug fixes and performance improvements" />
                </ListItem>
              </List>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <UpdateIcon />
              }
            >
              Update Now
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LicenseSettings;
