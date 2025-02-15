import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const SystemInfo = () => {
  const [copyDialog, setCopyDialog] = useState(false);
  const { showNotification } = useApp();

  const getStatusChip = (status, label = '') => {
    const statusConfig = {
      ok: { color: 'success', icon: <CheckCircleIcon /> },
      error: { color: 'error', icon: <ErrorIcon /> },
      warning: { color: 'warning', icon: <WarningIcon /> },
    };

    const config = statusConfig[status] || statusConfig.warning;

    return (
      <Chip
        icon={config.icon}
        label={label || status}
        color={config.color}
        size="small"
      />
    );
  };

  const systemInfo = {
    wordpress: {
      version: '6.4.2',
      multisite: false,
      memory_limit: '256M',
      max_upload_size: '64M',
      php_version: '8.1.0',
      mysql_version: '8.0.26',
      server_software: 'Apache/2.4.41',
      timezone: 'UTC',
      language: 'en_US',
      permalink_structure: '/%postname%/',
    },
    plugin: {
      version: '1.0.0',
      database_version: '1.0.0',
      active_forms: 5,
      total_appointments: 128,
      cache_enabled: true,
      debug_mode: false,
    },
    requirements: {
      php: { min: '7.4.0', current: '8.1.0', status: 'ok' },
      mysql: { min: '5.7.0', current: '8.0.26', status: 'ok' },
      wordpress: { min: '5.8.0', current: '6.4.2', status: 'ok' },
      ssl: { required: true, enabled: true, status: 'ok' },
      curl: { required: true, enabled: true, status: 'ok' },
      gd: { required: true, enabled: true, status: 'ok' },
    },
    directories: {
      uploads: { path: '/wp-content/uploads', writable: true, status: 'ok' },
      temp: { path: '/wp-content/uploads/temp', writable: true, status: 'ok' },
    },
  };

  const handleCopyInfo = () => {
    const info = JSON.stringify(systemInfo, null, 2);
    navigator.clipboard.writeText(info);
    showNotification('success', 'System information copied to clipboard');
    setCopyDialog(false);
  };

  const handleDownloadInfo = () => {
    const info = JSON.stringify(systemInfo, null, 2);
    const blob = new Blob([info], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wd-appointments-system-info.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderInfoTable = (data, title) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            {Object.entries(data).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ width: '30%', fontWeight: 500 }}
                >
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </TableCell>
                <TableCell>
                  {typeof value === 'object' ? (
                    value.status ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          {value.current || value.enabled?.toString()}
                        </Typography>
                        {getStatusChip(value.status)}
                      </Box>
                    ) : (
                      JSON.stringify(value)
                    )
                  ) : (
                    value.toString()
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">System Information</Typography>
          <Box>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={() => setCopyDialog(true)}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download as JSON">
              <IconButton onClick={handleDownloadInfo}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>System Diagnostic Information</AlertTitle>
          This information can be helpful when contacting support or
          troubleshooting issues.
        </Alert>

        {/* System Requirements Check */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            System Requirements Check
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(systemInfo.requirements).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {key.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {value.current || (value.enabled ? 'Enabled' : 'Disabled')}
                    </Typography>
                  </Box>
                  {getStatusChip(value.status)}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* WordPress Information */}
        {renderInfoTable(systemInfo.wordpress, 'WordPress Information')}

        {/* Plugin Information */}
        {renderInfoTable(systemInfo.plugin, 'Plugin Information')}

        {/* Directory Information */}
        {renderInfoTable(systemInfo.directories, 'Directory Information')}

        {/* Copy Dialog */}
        <Dialog open={copyDialog} onClose={() => setCopyDialog(false)}>
          <DialogTitle>Copy System Information</DialogTitle>
          <DialogContent>
            <Typography>
              This will copy all system information to your clipboard. Would you
              like to proceed?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCopyDialog(false)}>Cancel</Button>
            <Button onClick={handleCopyInfo} variant="contained">
              Copy Information
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SystemInfo;
