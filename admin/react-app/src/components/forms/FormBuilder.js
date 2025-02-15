import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  DragHandle as DragHandleIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FIELD_TYPES, MEETING_TYPES } from '../../config/constants';

const FormBuilder = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    type: MEETING_TYPES.GOOGLE_MEET.id,
    description: '',
    fields: [],
    ...initialData,
  });

  const [newField, setNewField] = useState({
    type: FIELD_TYPES.TEXT.id,
    label: '',
    required: true,
    options: [],
  });

  // Handle form data changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle field changes
  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...formData.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };
    handleChange('fields', updatedFields);
  };

  // Add new field
  const handleAddField = () => {
    if (!newField.label) return;

    const field = {
      ...newField,
      id: Date.now().toString(),
      order: formData.fields.length,
    };

    handleChange('fields', [...formData.fields, field]);
    setNewField({
      type: FIELD_TYPES.TEXT.id,
      label: '',
      required: true,
      options: [],
    });
  };

  // Remove field
  const handleRemoveField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    handleChange('fields', updatedFields);
  };

  // Handle field reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const fields = Array.from(formData.fields);
    const [reorderedField] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, reorderedField);

    handleChange('fields', fields);
  };

  return (
    <Box>
      {/* General Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Form Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Meeting Type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              {Object.values(MEETING_TYPES).map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description/Instructions"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Form Fields */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Form Fields
        </Typography>

        {/* Field List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {formData.fields.map((field, index) => (
                  <Draggable
                    key={field.id}
                    draggableId={field.id}
                    index={index}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        component={Card}
                        sx={{ mb: 2 }}
                      >
                        <CardContent sx={{ width: '100%' }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>
                              <IconButton {...provided.dragHandleProps}>
                                <DragHandleIcon />
                              </IconButton>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Field Label"
                                value={field.label}
                                onChange={(e) =>
                                  handleFieldChange(index, 'label', e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                select
                                label="Field Type"
                                value={field.type}
                                onChange={(e) =>
                                  handleFieldChange(index, 'type', e.target.value)
                                }
                              >
                                {Object.values(FIELD_TYPES).map((type) => (
                                  <MenuItem key={type.id} value={type.id}>
                                    {type.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={field.required}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        index,
                                        'required',
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label="Required"
                              />
                            </Grid>
                            <Grid item>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveField(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>

                          {/* Field Options (for select, radio, checkbox) */}
                          {['select', 'radio', 'checkbox'].includes(
                            field.type
                          ) && (
                            <Box sx={{ mt: 2 }}>
                              <TextField
                                fullWidth
                                label="Options (comma-separated)"
                                value={field.options.join(', ')}
                                onChange={(e) =>
                                  handleFieldChange(index, 'options', 
                                    e.target.value.split(',').map((opt) => opt.trim())
                                  )
                                }
                                helperText="Enter options separated by commas"
                              />
                            </Box>
                          )}
                        </CardContent>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add New Field */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Field
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Field Label"
                value={newField.label}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Field Type"
                value={newField.type}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
              >
                {Object.values(FIELD_TYPES).map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newField.required}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        required: e.target.checked,
                      }))
                    }
                  />
                }
                label="Required"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddField}
                disabled={!newField.label}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSave(formData)}
          disabled={!formData.title}
        >
          Save Form
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilder;
