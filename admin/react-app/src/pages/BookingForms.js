import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Fab,
  Tooltip,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

const BookingForms = () => {
  const [forms, setForms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formTab, setFormTab] = useState(0);

  // Form dialog state
  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    type: 'google_meet',
    description: '',
    fields: [],
  });

  const handleCreateForm = () => {
    setSelectedForm(null);
    setFormData({
      title: '',
      duration: 30,
      type: 'google_meet',
      description: '',
      fields: [],
    });
    setOpenDialog(true);
  };

  const handleEditForm = (form) => {
    setSelectedForm(form);
    setFormData(form);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedForm(null);
    setFormTab(0);
  };

  const handleSaveForm = () => {
    // TODO: Implement form saving logic
    handleCloseDialog();
  };

  const handleCopyShortcode = (formId) => {
    navigator.clipboard.writeText(`[wd_appointment_form id="${formId}"]`);
    // TODO: Show success notification
  };

  const renderFormDialog = () => {
    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedForm ? 'Edit Booking Form' : 'Create Booking Form'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={formTab}
              onChange={(e, newValue) => setFormTab(newValue)}
            >
              <Tab label="General" />
              <Tab label="Fields" />
              <Tab label="Schedule" />
              <Tab label="Notifications" />
            </Tabs>
          </Box>

          {formTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Form Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description/Instructions"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}

          {formTab === 1 && (
            <Typography>Form fields configuration will go here</Typography>
          )}

          {formTab === 2 && (
            <Typography>Schedule settings will go here</Typography>
          )}

          {formTab === 3 && (
            <Typography>Notification settings will go here</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveForm} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Booking Forms</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateForm}
        >
          Create Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        {forms.length > 0 ? (
          forms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {form.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Duration: {form.duration} minutes
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Type: {form.type}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleEditForm(form)}
                    title="Edit form"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyShortcode(form.id)}
                    title="Copy shortcode"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton size="small" color="error" title="Delete form">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                No booking forms yet
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateForm}
              >
                Create Your First Form
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {renderFormDialog()}
    </Box>
  );
};

export default BookingForms;
