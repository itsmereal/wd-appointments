import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  Button,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { APPOINTMENT_STATUS } from '../../config/constants';

const getStatusIcon = (status) => {
  switch (status) {
    case APPOINTMENT_STATUS.CONFIRMED.id:
      return <CheckCircleIcon color="success" />;
    case APPOINTMENT_STATUS.CANCELLED.id:
      return <CancelIcon color="error" />;
    case APPOINTMENT_STATUS.PENDING.id:
      return <ScheduleIcon color="warning" />;
    default:
      return <EventIcon />;
  }
};

const getActivityMessage = (activity) => {
  switch (activity.type) {
    case 'new_appointment':
      return `New appointment scheduled by ${activity.clientName}`;
    case 'status_change':
      return `Appointment ${activity.status.toLowerCase()} for ${activity.clientName}`;
    case 'reminder_sent':
      return `Reminder sent to ${activity.clientName}`;
    case 'form_created':
      return `New booking form "${activity.formTitle}" created`;
    default:
      return activity.message;
  }
};

const RecentActivity = ({
  activities = [],
  loading = false,
  onViewAll,
  onActivityClick,
  maxItems = 5,
}) => {
  const renderActivityIcon = (activity) => {
    switch (activity.type) {
      case 'new_appointment':
      case 'status_change':
        return (
          <Avatar sx={{ bgcolor: APPOINTMENT_STATUS[activity.status]?.color + '.light' }}>
            {getStatusIcon(activity.status)}
          </Avatar>
        );
      case 'reminder_sent':
        return (
          <Avatar sx={{ bgcolor: 'info.light' }}>
            <EventIcon color="info" />
          </Avatar>
        );
      case 'form_created':
        return (
          <Avatar sx={{ bgcolor: 'success.light' }}>
            <PersonIcon color="success" />
          </Avatar>
        );
      default:
        return (
          <Avatar>
            <EventIcon />
          </Avatar>
        );
    }
  };

  const renderActivitySecondary = (activity) => {
    const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
      addSuffix: true,
    });

    let details = [];

    if (activity.appointmentDate) {
      details.push(format(new Date(activity.appointmentDate), 'PPp'));
    }

    if (activity.duration) {
      details.push(`${activity.duration} minutes`);
    }

    return (
      <Box>
        {details.length > 0 && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {details.join(' • ')}
          </Typography>
        )}
        <Typography variant="caption" color="textSecondary">
          {timeAgo}
        </Typography>
      </Box>
    );
  };

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">Loading activities...</Typography>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">No recent activity</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {activities.slice(0, maxItems).map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <ListItemAvatar>
                    {renderActivityIcon(activity)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {getActivityMessage(activity)}
                        </Typography>
                        {activity.status && (
                          <Chip
                            label={APPOINTMENT_STATUS[activity.status]?.label}
                            color={APPOINTMENT_STATUS[activity.status]?.color}
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={renderActivitySecondary(activity)}
                  />
                  <Tooltip title="View Details">
                    <IconButton edge="end" size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
                {index < Math.min(activities.length, maxItems) - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        {activities.length > maxItems && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button color="primary" onClick={onViewAll}>
              View All Activities
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
