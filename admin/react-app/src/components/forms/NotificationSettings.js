import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { DEFAULT_SETTINGS } from '../../config/constants';

const AVAILABLE_VARIABLES = [
  { key: '{client_name}', description: 'Client\'s full name' },
  { key: '{client_email}', description: 'Client\'s email address' },
  { key: '{appointment_date}', description: 'Appointment date' },
  { key: '{appointment_time}', description: 'Appointment time' },
  { key: '{form_title}', description: 'Booking form title' },
  { key: '{meeting_link}', description: 'Virtual meeting link (if applicable)' },
  { key: '{verification_link}', description: 'Email verification link' },
  { key: '{cancellation_link}', description: 'Appointment cancellation link' },
  { key: '{business_name}', description: 'Your business name' },
];

const EMAIL_TEMPLATES = [
  {
    id: 'verification',
    label: 'Verification Email',
    description: 'Sent when email verification is enabled',
    variables: [
      '{client_name}',
      '{appointment_date}',
      '{appointment_time}',
      '{form_title}',
      '{verification_link}',
      '{business_name}',
    ],
  },
  {
    id: 'confirmation',
    label: 'Confirmation Email',
    description: 'Sent after appointment is confirmed',
    variables: [
      '{client_name}',
      '{appointment_date}',
      '{appointment_time}',
      '{form_title}',
      '{meeting_link}',
      '{cancellation_link}',
      '{business_name}',
    ],
  },
  {
    id: 'reminder',
    label: 'Reminder Email',
    description: 'Sent before the appointment',
    variables: [
      '{client_name}',
      '{appointment_date}',
      '{appointment_time}',
      '{form_title}',
      '{meeting_link}',
      '{cancellation_link}',
      '{business_name}',
    ],
  },
  {
    id: 'cancelled',
    label: 'Cancellation Email',
    description: 'Sent when appointment is cancelled',
    variables: [
      '{client_name}',
      '{appointment_date}',
      '{appointment_time}',
      '{form_title}',
      '{business_name}',
    ],
  },
];

const NotificationSettings = ({ settings, onChange, isGlobalSettings = false }) => {
  const [expandedTemplate, setExpandedTemplate] = React.useState('');

  const handleChange = (field, value) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const handleTemplateChange = (templateId, field, value) => {
    const newTemplates = {
      ...settings.templates,
      [templateId]: {
        ...settings.templates[templateId],
        [field]: value,
      },
    };
    handleChange('templates', newTemplates);
  };

  const resetTemplate = (templateId) => {
    const defaultTemplate = DEFAULT_SETTINGS.notifications.templates[templateId];
    handleTemplateChange(templateId, 'subject', defaultTemplate.subject);
    handleTemplateChange(templateId, 'body', defaultTemplate.body);
  };

  const renderVariableHelp = (variables) => (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="subtitle2" color="textSecondary">
        Available Variables:
      </Typography>
      <Grid container spacing={1}>
        {variables.map((variable) => (
          <Grid item key={variable}>
            <Tooltip
              title={AVAILABLE_VARIABLES.find(v => v.key === variable)?.description || ''}
              arrow
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  bgcolor: 'action.hover',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  cursor: 'help',
                }}
              >
                {variable}
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* General Notification Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Grid container spacing={3}>
          {isGlobalSettings && (
            <>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailVerification}
                      onChange={(e) => handleChange('emailVerification', e.target.checked)}
                    />
                  }
                  label="Enable Email Verification"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={settings.fromName}
                  onChange={(e) => handleChange('fromName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  value={settings.fromEmail}
                  onChange={(e) => handleChange('fromEmail', e.target.value)}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Admin Email"
              value={settings.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              helperText="Notifications will be sent to this email address"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Email Templates */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Email Templates</Typography>
          <Tooltip title="These templates will be used for sending automated emails">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {EMAIL_TEMPLATES.map((template) => (
          <Accordion
            key={template.id}
            expanded={expandedTemplate === template.id}
            onChange={() => setExpandedTemplate(expandedTemplate === template.id ? '' : template.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography>{template.label}</Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ ml: 2 }}
                >
                  {template.description}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      startIcon={<RestartAltIcon />}
                      onClick={() => resetTemplate(template.id)}
                    >
                      Reset to Default
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={settings.templates[template.id]?.subject || ''}
                    onChange={(e) => handleTemplateChange(template.id, 'subject', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Email Body"
                    value={settings.templates[template.id]?.body || ''}
                    onChange={(e) => handleTemplateChange(template.id, 'body', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  {renderVariableHelp(template.variables)}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default NotificationSettings;
