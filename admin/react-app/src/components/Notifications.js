import React from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useApp } from '../context/AppContext';

const Notifications = () => {
  const { notifications } = useApp();

  return (
    <Stack
      spacing={2}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Alert
            severity={notification.severity}
            variant="filled"
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default Notifications;
