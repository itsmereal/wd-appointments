import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { MEETING_TYPES } from '../../config/constants';
import { formatDuration } from '../../utils/helpers';

const BookingFormCard = ({
  form,
  onEdit,
  onDelete,
  onPreview,
  onCopyShortcode,
  onCopyLink,
  showStats = true,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    switch (action) {
      case 'edit':
        onEdit(form);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'preview':
        onPreview(form);
        break;
      case 'shortcode':
        onCopyShortcode(form.id);
        break;
      case 'link':
        onCopyLink(form.id);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDelete(form.id);
  };

  const getMeetingTypeLabel = () => {
    const meetingType = Object.values(MEETING_TYPES).find(
      (type) => type.id === form.type
    );
    return meetingType?.label || 'Custom';
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: (theme) => theme.shadows[4],
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Typography variant="h6" component="div" gutterBottom>
              {form.title}
            </Typography>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label="form options"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<ScheduleIcon />}
              label={formatDuration(form.duration)}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={getMeetingTypeLabel()}
              size="small"
              variant="outlined"
            />
          </Box>

          {form.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {form.description}
            </Typography>
          )}

          {showStats && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 'auto',
              }}
            >
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Total Bookings
                </Typography>
                <Typography variant="h6">
                  {form.stats?.totalBookings || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  This Month
                </Typography>
                <Typography variant="h6">
                  {form.stats?.monthlyBookings || 0}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => handleAction('preview')}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Shortcode">
            <IconButton size="small" onClick={() => handleAction('shortcode')}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Link">
            <IconButton size="small" onClick={() => handleAction('link')}>
              <LinkIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Form</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('preview')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('shortcode')}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Shortcode</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('link')}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Booking Form</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{form.title}"? This action cannot be
            undone, and all associated appointments will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingFormCard;
