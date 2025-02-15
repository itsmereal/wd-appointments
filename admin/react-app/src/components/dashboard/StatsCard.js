import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  loading = false,
  error = null,
  color = 'primary',
  progress,
}) => {
  const theme = useTheme();

  const getTrendColor = () => {
    if (trend > 0) return theme.palette.success.main;
    if (trend < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const renderTrend = () => {
    if (trend === undefined || trend === null) return null;

    const TrendIcon = trend >= 0 ? TrendingUpIcon : TrendingDownIcon;
    const trendColor = getTrendColor();

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: trendColor,
          mt: 1,
        }}
      >
        <TrendIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
        <Typography variant="body2" component="span">
          {Math.abs(trend)}%
        </Typography>
        {trendLabel && (
          <Typography
            variant="body2"
            component="span"
            color="textSecondary"
            sx={{ ml: 0.5 }}
          >
            {trendLabel}
          </Typography>
        )}
      </Box>
    );
  };

  const renderValue = () => {
    if (loading) {
      return <CircularProgress size={24} />;
    }

    if (error) {
      return (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      );
    }

    return (
      <Typography
        variant="h4"
        component="div"
        sx={{
          fontWeight: 500,
          color: `${color}.main`,
        }}
      >
        {value}
      </Typography>
    );
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {Icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  width: 40,
                  height: 40,
                  bgcolor: `${color}.light`,
                  color: `${color}.main`,
                  mr: 2,
                }}
              >
                <Icon />
              </Box>
            )}
            <Typography
              variant="subtitle1"
              component="div"
              color="textSecondary"
            >
              {title}
            </Typography>
          </Box>
          {description && (
            <Tooltip title={description} arrow>
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {renderValue()}
          {renderTrend()}
        </Box>

        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="textSecondary">
                Progress
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={color}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
