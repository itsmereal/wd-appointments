import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isWithinInterval,
} from 'date-fns';
import { CALENDAR_VIEWS } from '../../config/constants';
import { formatDate } from '../../utils/helpers';

const CalendarView = ({
  appointments = [],
  selectedDate = new Date(),
  onDateSelect,
  onAppointmentClick,
  view = CALENDAR_VIEWS.MONTH,
  availableSlots = [],
  minDate,
  maxDate,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handlePrevious = () => {
    if (view === CALENDAR_VIEWS.MONTH) {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === CALENDAR_VIEWS.WEEK) {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === CALENDAR_VIEWS.MONTH) {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === CALENDAR_VIEWS.WEEK) {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const isDateAvailable = (date) => {
    return availableSlots.some(slot =>
      isWithinInterval(date, {
        start: new Date(slot.start),
        end: new Date(slot.end)
      })
    );
  };

  const isDateSelectable = (date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <Box>
        {/* Weekday headers */}
        <Grid container>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid
              item
              xs
              key={day}
              sx={{
                textAlign: 'center',
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2">{day}</Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar grid */}
        <Grid container>
          {days.map((day) => {
            const dayAppointments = appointments.filter((apt) =>
              isSameDay(new Date(apt.appointmentDate), day)
            );

            return (
              <Grid
                item
                xs
                key={day.toISOString()}
                sx={{
                  height: 120,
                  border: 1,
                  borderColor: 'divider',
                  p: 1,
                  bgcolor: !isSameMonth(day, currentDate)
                    ? 'action.hover'
                    : 'background.paper',
                  cursor: isDateSelectable(day) ? 'pointer' : 'not-allowed',
                  '&:hover': isDateSelectable(day) && {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => isDateSelectable(day) && handleDateClick(day)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Badge
                    color={isDateAvailable(day) ? 'success' : 'default'}
                    variant="dot"
                  >
                    <Typography
                      variant="body2"
                      color={
                        isSameDay(day, new Date())
                          ? 'primary'
                          : !isSameMonth(day, currentDate)
                          ? 'text.disabled'
                          : 'text.primary'
                      }
                    >
                      {format(day, 'd')}
                    </Typography>
                  </Badge>
                  {dayAppointments.length > 0 && (
                    <Typography variant="caption" color="primary">
                      {dayAppointments.length} apt
                    </Typography>
                  )}
                </Box>

                {/* Appointment previews */}
                <Box sx={{ overflow: 'hidden' }}>
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <Tooltip
                      key={apt.id}
                      title={`${apt.clientName} - ${format(
                        new Date(apt.appointmentDate),
                        'h:mm a'
                      )}`}
                    >
                      <Box
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          p: 0.5,
                          borderRadius: 1,
                          mb: 0.5,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(apt);
                        }}
                      >
                        {format(new Date(apt.appointmentDate), 'h:mm a')} -{' '}
                        {apt.clientName}
                      </Box>
                    </Tooltip>
                  ))}
                  {dayAppointments.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayAppointments.length - 2} more
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <Box>
        <Grid container spacing={2}>
          {days.map((day) => (
            <Grid item xs key={day.toISOString()}>
              <Paper
                sx={{
                  p: 2,
                  height: '80vh',
                  overflow: 'auto',
                  cursor: isDateSelectable(day) ? 'pointer' : 'not-allowed',
                }}
                onClick={() => isDateSelectable(day) && handleDateClick(day)}
              >
                <Typography
                  variant="subtitle1"
                  align="center"
                  color={isSameDay(day, new Date()) ? 'primary' : 'textPrimary'}
                  gutterBottom
                >
                  {format(day, 'EEE')}
                  <br />
                  {format(day, 'd')}
                </Typography>
                <Box>
                  {appointments
                    .filter((apt) =>
                      isSameDay(new Date(apt.appointmentDate), day)
                    )
                    .map((apt) => (
                      <Box
                        key={apt.id}
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          p: 1,
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(apt);
                        }}
                      >
                        <Typography variant="body2">
                          {format(new Date(apt.appointmentDate), 'h:mm a')}
                        </Typography>
                        <Typography variant="subtitle2">
                          {apt.clientName}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {/* Calendar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handlePrevious}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNext}>
            <ChevronRightIcon />
          </IconButton>
          <Button
            startIcon={<TodayIcon />}
            onClick={handleToday}
            sx={{ ml: 1 }}
          >
            Today
          </Button>
        </Box>
        <Typography variant="h6">
          {format(
            currentDate,
            view === CALENDAR_VIEWS.MONTH ? 'MMMM yyyy' : 'MMM d - ',
          )}
          {view === CALENDAR_VIEWS.WEEK &&
            format(endOfWeek(currentDate), 'MMM d, yyyy')}
        </Typography>
      </Box>

      {/* Calendar Grid */}
      {view === CALENDAR_VIEWS.MONTH ? renderMonthView() : renderWeekView()}

      {/* Appointment Details Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Client</Typography>
                  <Typography>{selectedAppointment.clientName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Date & Time</Typography>
                  <Typography>
                    {formatDate(selectedAppointment.appointmentDate, 'full')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Duration</Typography>
                  <Typography>
                    {selectedAppointment.duration} minutes
                  </Typography>
                </Grid>
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Notes</Typography>
                    <Typography>{selectedAppointment.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAppointment(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarView;
