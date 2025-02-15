import React from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PageHeader = ({
  title,
  breadcrumbs = [],
  action,
  actionLabel,
  onActionClick
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 1 }}>
              {breadcrumbs.map((crumb, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={crumb.path}
                  color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                  underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
                >
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          )}
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
        </Box>
        {action && actionLabel && (
          <Button
            variant="contained"
            color="primary"
            onClick={onActionClick}
            startIcon={action}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default PageHeader;
