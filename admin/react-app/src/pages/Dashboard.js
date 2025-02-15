import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Event as EventIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  // In a real implementation, these would be fetched from the WordPress REST API
  const stats = {
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalForms: 0,
  };

  const recentAppointments = [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalAppointments}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Total Appointments
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">
                  {stats.upcomingAppointments}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Upcoming Appointments
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon
                sx={{ fontSize: 40, mr: 2, color: 'primary.main' }}
              />
              <Box>
                <Typography variant="h4">{stats.totalForms}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Booking Forms
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Appointments */}
      <Card>
        <CardHeader
          title="Recent Appointments"
          action={
            <IconButton>
              <ArrowForwardIcon />
            </IconButton>
          }
        />
        <CardContent>
          {recentAppointments.length > 0 ? (
            <List>
              {recentAppointments.map((appointment) => (
                <ListItem key={appointment.id}>
                  <ListItemText
                    primary={appointment.clientName}
                    secondary={new Date(appointment.date).toLocaleString()}
                  />
                  <ListItemSecondaryAction>
                    <Typography color="textSecondary">
                      {appointment.status}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary" align="center">
              No recent appointments
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
