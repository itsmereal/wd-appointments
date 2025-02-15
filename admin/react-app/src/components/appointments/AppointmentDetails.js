import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Event as EventIcon,
  ContentCopy as ContentCopyIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { APPOINTMENT_STATUS } from '../../config/constants';
import { formatDate, formatDuration } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { useCalendar } from '../../context/CalendarContext';

const AppointmentDetails = ({
  appointment,
  onUpdate,
  onDelete,
  onSendReminder,
  isDialog = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editedData, setEditedData] = useState(appointment);
  const { showNotification } = useApp();
  const { updateEvent } = useCalendar();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Update calendar event if exists
      if (appointment.calendarEventId) {
        await updateEvent(appointment.calendarEventId, {
          title: `Appointment with ${editedData.clientName}`,
          description: editedData.notes,
          startTime: new Date(editedData.appointmentDate),
          endTime: new Date(new Date(editedData.appointmentDate).getTime() + editedData.duration * 60000),
        });
      }

      onUpdate(editedData);
      setIsEditing(false);
      showNotification('success', 'Appointment updated successfully');
    } catch (error) {
      showNotification('error', 'Failed to update appointment');
    }
  };

  const handleCancel = () => {
    setEditedData(appointment);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteAppointment = async () => {
    try {
      await onDelete(appointment.id);
      showNotification('success', 'Appointment deleted successfully');
      setConfirmDelete(false);
    } catch (error) {
      showNotification('error', 'Failed to delete appointment');
    }
  };

  const handleSendReminder = async () => {
    try {
      await onSendReminder(appointment.id);
      showNotification('success', 'Reminder sent successfully');
    } catch (error) {
      showNotification('error', 'Failed to send reminder');
    }
  };

  const copyMeetingLink = () => {
    if (appointment.meetingLink) {
      navigator.clipboard.writeText(appointment.meetingLink);
      showNotification('success', 'Meeting link copied to clipboard');
    }
  };

  const renderContent = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6">
            Appointment with {appointment.clientName}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            ID: {appointment.id}
          </Typography>
        </Box>
        <Chip
          label={APPOINTMENT_STATUS[appointment.status]?.label || appointment.status}
          color={APPOINTMENT_STATUS[appointment.status]?.color || 'default'}
        />
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Client Information
            </Typography>
            {isEditing ? (
              <>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={editedData.clientName}
                  onChange={(e) =>
                    setEditedData({ ...editedData, clientName: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Client Email"
                  value={editedData.clientEmail}
                  onChange={(e) =>
                    setEditedData({ ...editedData, clientEmail: e.target.value })
                  }
                />
              </>
            ) : (
              <>
                <Typography>{appointment.clientName}</Typography>
                <Link href={`mailto:${appointment.clientEmail}`}>
                  {appointment.clientEmail}
                </Link>
              </>
            )}
          </Paper>
        </Grid>

        {/* Appointment Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Appointment Details
            </Typography>
            {isEditing ? (
              <>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={editedData.status}
                  onChange={(e) =>
                    setEditedData({ ...editedData, status: e.target.value })
                  }
                  sx={{ mb: 2 }}
                >
                  {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Date & Time"
                  value={format(
                    new Date(editedData.appointmentDate),
                    "yyyy-MM-dd'T'HH:mm"
                  )}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      appointmentDate: new Date(e.target.value),
                    })
                  }
                />
              </>
            ) : (
              <>
                <Typography>
                  Date: {formatDate(appointment.appointmentDate, 'full')}
                </Typography>
                <Typography>
                  Duration: {formatDuration(appointment.duration)}
                </Typography>
                {appointment.meetingLink && (
                  <Box sx={{ mt: 1 }}>
                    <Link href={appointment.meetingLink} target="_blank">
                      Join Meeting
                    </Link>
                    <IconButton size="small" onClick={copyMeetingLink}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notes
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editedData.notes}
                onChange={(e) =>
                  setEditedData({ ...editedData, notes: e.target.value })
                }
              />
            ) : (
              <Typography>
                {appointment.notes || 'No notes available'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {isEditing ? (
          <>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={handleSendReminder}
            >
              Send Reminder
            </Button>
            {appointment.calendarEventId && (
              <Tooltip title="View in Calendar">
                <IconButton onClick={() => window.open(appointment.calendarEventLink)}>
                  <CalendarTodayIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this appointment? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteAppointment}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return isDialog ? (
    <Dialog
      open={true}
      onClose={() => onUpdate(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  ) : (
    renderContent()
  );
};

export default AppointmentDetails;
