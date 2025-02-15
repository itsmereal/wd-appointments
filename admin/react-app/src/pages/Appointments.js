import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Event as EventIcon,
} from '@mui/icons-material';

// Custom TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointments-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Appointments = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // In a real implementation, these would be fetched from the WordPress REST API
  const appointments = [];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleSaveAppointment = () => {
    // TODO: Implement appointment update logic
    handleCloseDialog();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'error',
      completed: 'default',
    };
    return statusColors[status] || 'default';
  };

  const renderAppointmentDialog = () => {
    if (!selectedAppointment) return null;

    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={selectedAppointment.clientName}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Email"
                value={selectedAppointment.clientEmail}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date & Time"
                type="datetime-local"
                value={selectedAppointment.dateTime}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    dateTime: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={selectedAppointment.status}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    status: e.target.value,
                  })
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={selectedAppointment.notes}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAppointment}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Appointments
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Cancelled" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Form</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {new Date(appointment.dateTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1">
                            {appointment.clientName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {appointment.clientEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.formTitle}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EmailIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EventIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">
                        No appointments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Past appointments table */}
          <Typography>Past appointments will be displayed here</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Cancelled appointments table */}
          <Typography>Cancelled appointments will be displayed here</Typography>
        </TabPanel>
      </Paper>

      {renderAppointmentDialog()}
    </Box>
  );
};

export default Appointments;
