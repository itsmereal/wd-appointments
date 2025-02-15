import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Tooltip,
  Chip,
  AvatarGroup,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { format, isToday, isTomorrow, differenceInMinutes } from 'date-fns';
import { MEETING_TYPES, APPOINTMENT_STATUS } from '../../config/constants';
import { formatDuration } from '../../utils/helpers';

const getMeetingIcon = (type) => {
  switch (type) {
    case MEETING_TYPES.GOOGLE_MEET.id:
    case MEETING_TYPES.ZOOM.id:
      return <VideoCallIcon />;
    case MEETING_TYPES.PHONE.id:
      return <PhoneIcon />;
    case MEETING_TYPES.CUSTOM.id:
      return <LocationOnIcon />;
    default:
      return <EventIcon />;
  }
};

const getTimeLabel = (date) => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  return format(date, 'EEE, MMM d');
};

const UpcomingAppointments = ({
  appointments = [],
  loading = false,
  onViewAll,
  onAppointmentClick,
  maxItems = 5,
}) => {
  const now = new Date();

  const renderAppointmentTime = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const minutesUntil = differenceInMinutes(appointmentDate, now);
    const timeString = format(appointmentDate, 'h:mm a');

    if (minutesUntil <= 0) {
      return (
        <Typography variant="body2" color="error">
          In Progress
        </Typography>
      );
    }

    if (minutesUntil < 60) {
      return (
        <Typography variant="body2" color="warning.main">
          In {minutesUntil} minutes
        </Typography>
      );
    }

    return (
      <Typography variant="body2" color="textSecondary">
        {timeString}
      </Typography>
    );
  };

  const renderMeetingType = (type) => {
    const meetingType = Object.values(MEETING_TYPES).find(t => t.id === type);
    if (!meetingType) return null;

    return (
      <Tooltip title={meetingType.label}>
        <IconButton size="small">
          {getMeetingIcon(type)}
        </IconButton>
      </Tooltip>
    );
  };

  const groupAppointmentsByDate = () => {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = format(new Date(appointment.appointmentDate), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .slice(0, maxItems);
  };

  return (
    <Card>
      <CardHeader
        title="Upcoming Appointments"
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
            <Typography color="textSecondary">Loading appointments...</Typography>
          </Box>
        ) : appointments.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">No upcoming appointments</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {groupAppointmentsByDate().map(([date, dayAppointments], index) => (
              <React.Fragment key={date}>
                <ListItem
                  sx={{
                    bgcolor: 'action.hover',
                    py: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {getTimeLabel(new Date(date))}
                      </Typography>
                    }
                  />
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                    {dayAppointments.map((apt) => (
                      <Tooltip key={apt.id} title={apt.clientName}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {apt.clientName.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </ListItem>
                {dayAppointments.map((appointment) => (
                  <ListItem
                    key={appointment.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => onAppointmentClick?.(appointment)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <AccessTimeIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {appointment.clientName}
                          </Typography>
                          <Chip
                            label={formatDuration(appointment.duration)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {renderAppointmentTime(appointment)}
                          {renderMeetingType(appointment.type)}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={APPOINTMENT_STATUS[appointment.status]?.label}
                        color={APPOINTMENT_STATUS[appointment.status]?.color}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                ))}
                {index < groupAppointmentsByDate().length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
        {appointments.length > maxItems && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button color="primary" onClick={onViewAll}>
              View All Appointments
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
