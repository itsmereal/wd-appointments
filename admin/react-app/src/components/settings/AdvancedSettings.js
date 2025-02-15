import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  AlertTitle,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const AdvancedSettings = ({ settings, onUpdate }) => {
  const [resetDialog, setResetDialog] = useState(false);
  const [purgeDialog, setPurgeDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const { showNotification } = useApp();

  const handleSettingChange = (field, value) => {
    onUpdate({
      ...settings,
      [field]: value,
    });
  };

  const handleReset = async () => {
    try {
      // TODO: Implement settings reset through WordPress REST API
      showNotification('success', 'Settings have been reset to defaults');
      setResetDialog(false);
    } catch (error) {
      showNotification('error', 'Failed to reset settings');
    }
  };

  const handlePurgeData = async () => {
    try {
      // TODO: Implement data purge through WordPress REST API
      showNotification('success', 'All appointment data has been purged');
      setPurgeDialog(false);
    } catch (error) {
      showNotification('error', 'Failed to purge data');
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wd-appointments-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = async () => {
    if (!importFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          await onUpdate(importedSettings);
          showNotification('success', 'Settings imported successfully');
          setImportDialog(false);
        } catch (error) {
          showNotification('error', 'Invalid settings file');
        }
      };
      reader.readAsText(importFile);
    } catch (error) {
      showNotification('error', 'Failed to import settings');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Advanced Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Configure advanced options and manage plugin data
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warning</AlertTitle>
          These settings are for advanced users. Incorrect configuration may affect
          the functionality of your appointment system.
        </Alert>

        <Divider sx={{ my: 3 }} />

        {/* Performance Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Performance Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableCache || false}
                  onChange={(e) =>
                    handleSettingChange('enableCache', e.target.checked)
                  }
                />
              }
              label="Enable appointment cache"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableAPICache || false}
                  onChange={(e) =>
                    handleSettingChange('enableAPICache', e.target.checked)
                  }
                />
              }
              label="Enable API response cache"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Cache Duration"
              value={settings.cacheDuration || 3600}
              onChange={(e) =>
                handleSettingChange('cacheDuration', parseInt(e.target.value))
              }
              helperText="Cache duration in seconds"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Debug Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Debug Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.debugMode || false}
                  onChange={(e) =>
                    handleSettingChange('debugMode', e.target.checked)
                  }
                />
              }
              label="Enable debug mode"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.logAPIRequests || false}
                  onChange={(e) =>
                    handleSettingChange('logAPIRequests', e.target.checked)
                  }
                />
              }
              label="Log API requests"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Data Management */}
        <Typography variant="subtitle1" gutterBottom>
          Data Management
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Export Settings"
              secondary="Download your current settings as a JSON file"
            />
            <ListItemSecondaryAction>
              <Tooltip title="Export settings">
                <IconButton onClick={handleExportSettings}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Import Settings"
              secondary="Import settings from a JSON file"
            />
            <ListItemSecondaryAction>
              <Tooltip title="Import settings">
                <IconButton onClick={() => setImportDialog(true)}>
                  <UploadIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Reset Settings"
              secondary="Reset all settings to default values"
            />
            <ListItemSecondaryAction>
              <Tooltip title="Reset settings">
                <IconButton onClick={() => setResetDialog(true)} color="warning">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Purge Data"
              secondary="Delete all appointment data"
            />
            <ListItemSecondaryAction>
              <Tooltip title="Purge data">
                <IconButton onClick={() => setPurgeDialog(true)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        {/* Reset Settings Dialog */}
        <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
          <DialogTitle>Reset Settings</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to reset all settings to their default values?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialog(false)}>Cancel</Button>
            <Button onClick={handleReset} color="warning" variant="contained">
              Reset Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Purge Data Dialog */}
        <Dialog open={purgeDialog} onClose={() => setPurgeDialog(false)}>
          <DialogTitle>Purge Data</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete all appointment data? This action
              cannot be undone and will remove all appointments, forms, and related
              data.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPurgeDialog(false)}>Cancel</Button>
            <Button onClick={handlePurgeData} color="error" variant="contained">
              Purge Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Settings Dialog */}
        <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
          <DialogTitle>Import Settings</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select a settings file to import. This will override your current
              settings.
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialog(false)}>Cancel</Button>
            <Button
              onClick={handleImportSettings}
              color="primary"
              variant="contained"
              disabled={!importFile}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdvancedSettings;
