import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  Paper,
  FormControlLabel,
  Switch,
  Slider,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  FormatColorFill as ColorIcon,
  Palette as PaletteIcon,
  Style as StyleIcon,
} from '@mui/icons-material';

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Helvetica Neue", sans-serif', label: 'Helvetica' },
  { value: '"Roboto", sans-serif', label: 'Roboto' },
  { value: '"Open Sans", sans-serif', label: 'Open Sans' },
  { value: '"Lato", sans-serif', label: 'Lato' },
  { value: 'system-ui, sans-serif', label: 'System Default' },
];

const BORDER_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'none', label: 'None' },
];

const AppearanceSettings = ({ settings, onUpdate }) => {
  const [previewHover, setPreviewHover] = useState(false);

  const handleSettingChange = (field, value) => {
    onUpdate({
      ...settings,
      [field]: value,
    });
  };

  const renderColorPicker = (label, field, defaultColor) => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <TextField
        fullWidth
        type="color"
        value={settings[field] || defaultColor}
        onChange={(e) => handleSettingChange(field, e.target.value)}
      />
    </Box>
  );

  const renderPreview = () => (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        border: `1px ${settings.borderStyle || 'solid'} ${
          settings.borderColor || '#e0e0e0'
        }`,
        borderRadius: `${settings.borderRadius || 4}px`,
        transition: 'all 0.3s ease',
        ...(previewHover && {
          boxShadow: 3,
        }),
      }}
      onMouseEnter={() => setPreviewHover(true)}
      onMouseLeave={() => setPreviewHover(false)}
    >
      <Typography
        variant="h6"
        sx={{
          color: settings.primaryColor || '#007bff',
          fontFamily: settings.fontFamily || 'Arial, sans-serif',
          mb: 2,
        }}
      >
        Sample Booking Form
      </Typography>
      <Box
        sx={{
          bgcolor: settings.backgroundColor || '#ffffff',
          p: 2,
          borderRadius: `${settings.borderRadius || 4}px`,
        }}
      >
        <TextField
          fullWidth
          label="Sample Input"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: `${settings.borderRadius || 4}px`,
            },
          }}
        />
        <Button
          variant="contained"
          sx={{
            bgcolor: settings.primaryColor || '#007bff',
            color: settings.buttonTextColor || '#ffffff',
            '&:hover': {
              bgcolor: settings.primaryColorHover || '#0056b3',
            },
            borderRadius: `${settings.borderRadius || 4}px`,
          }}
        >
          Sample Button
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appearance Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Customize the look and feel of your booking forms
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Colors */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Colors
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderColorPicker('Primary Color', 'primaryColor', '#007bff')}
              </Grid>
              <Grid item xs={12}>
                {renderColorPicker(
                  'Secondary Color',
                  'secondaryColor',
                  '#6c757d'
                )}
              </Grid>
              <Grid item xs={12}>
                {renderColorPicker(
                  'Background Color',
                  'backgroundColor',
                  '#ffffff'
                )}
              </Grid>
              <Grid item xs={12}>
                {renderColorPicker('Text Color', 'textColor', '#000000')}
              </Grid>
            </Grid>
          </Grid>

          {/* Typography */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Typography
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Font Family"
                  value={settings.fontFamily || FONT_FAMILIES[0].value}
                  onChange={(e) =>
                    handleSettingChange('fontFamily', e.target.value)
                  }
                >
                  {FONT_FAMILIES.map((font) => (
                    <MenuItem key={font.value} value={font.value}>
                      {font.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Base Font Size"
                  value={settings.fontSize || 16}
                  onChange={(e) =>
                    handleSettingChange('fontSize', parseInt(e.target.value))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">px</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Borders & Spacing */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Borders & Spacing
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Border Style"
                  value={settings.borderStyle || 'solid'}
                  onChange={(e) =>
                    handleSettingChange('borderStyle', e.target.value)
                  }
                >
                  {BORDER_STYLES.map((style) => (
                    <MenuItem key={style.value} value={style.value}>
                      {style.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                {renderColorPicker('Border Color', 'borderColor', '#e0e0e0')}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Border Radius
                </Typography>
                <Slider
                  value={settings.borderRadius || 4}
                  onChange={(e, value) =>
                    handleSettingChange('borderRadius', value)
                  }
                  min={0}
                  max={24}
                  step={1}
                  marks={[
                    { value: 0, label: '0px' },
                    { value: 12, label: '12px' },
                    { value: 24, label: '24px' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}px`}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Additional Options */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Additional Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableShadows || false}
                      onChange={(e) =>
                        handleSettingChange('enableShadows', e.target.checked)
                      }
                    />
                  }
                  label="Enable shadows on elements"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableAnimations || false}
                      onChange={(e) =>
                        handleSettingChange(
                          'enableAnimations',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable animations"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Live Preview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Live Preview
          </Typography>
          {renderPreview()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
