// API Endpoints
export const API = {
  BASE_URL: window.wdAppointments?.apiUrl || '/wp-json/wd-appointments/v1',
  ENDPOINTS: {
    SETTINGS: '/settings',
    FORMS: '/forms',
    APPOINTMENTS: '/appointments',
    CALENDAR: '/calendar'
  }
};

// Default Settings
export const DEFAULT_SETTINGS = {
  general: {
    businessName: '',
    timezone: 'UTC',
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    weekStartsOn: 1, // 0 = Sunday, 1 = Monday
    defaultDuration: 30,
    bufferTime: 0
  },
  calendar: {
    provider: 'google',
    credentials: {
      google: {
        clientId: '',
        clientSecret: ''
      },
      icloud: {
        email: '',
        password: ''
      }
    }
  },
  appearance: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '4px'
  },
  notifications: {
    emailVerification: true,
    adminEmail: '',
    fromName: '',
    fromEmail: '',
    templates: {
      verification: {
        subject: 'Verify your appointment request',
        body: `Dear {client_name},

Please verify your appointment request by clicking the link below:

{verification_link}

Appointment Details:
Date: {appointment_date}
Time: {appointment_time}
Type: {form_title}

This link will expire in 24 hours.

Best regards,
{business_name}`
      },
      confirmation: {
        subject: 'Appointment Confirmed',
        body: `Dear {client_name},

Your appointment has been confirmed.

Appointment Details:
Date: {appointment_date}
Time: {appointment_time}
Type: {form_title}
{meeting_link}

You can cancel this appointment using this link:
{cancellation_link}

Best regards,
{business_name}`
      },
      reminder: {
        subject: 'Appointment Reminder',
        body: `Dear {client_name},

This is a reminder about your upcoming appointment.

Appointment Details:
Date: {appointment_date}
Time: {appointment_time}
Type: {form_title}
{meeting_link}

You can cancel this appointment using this link:
{cancellation_link}

Best regards,
{business_name}`
      },
      cancelled: {
        subject: 'Appointment Cancelled',
        body: `Dear {client_name},

Your appointment has been cancelled.

Appointment Details:
Date: {appointment_date}
Time: {appointment_time}
Type: {form_title}

You can book a new appointment at any time.

Best regards,
{business_name}`
      }
    }
  }
};

// Form Field Types
export const FIELD_TYPES = {
  TEXT: {
    id: 'text',
    label: 'Text',
    icon: 'text_fields'
  },
  TEXTAREA: {
    id: 'textarea',
    label: 'Text Area',
    icon: 'notes'
  },
  EMAIL: {
    id: 'email',
    label: 'Email',
    icon: 'email'
  },
  PHONE: {
    id: 'phone',
    label: 'Phone',
    icon: 'phone'
  },
  SELECT: {
    id: 'select',
    label: 'Dropdown',
    icon: 'arrow_drop_down_circle'
  },
  RADIO: {
    id: 'radio',
    label: 'Radio Buttons',
    icon: 'radio_button_checked'
  },
  CHECKBOX: {
    id: 'checkbox',
    label: 'Checkbox',
    icon: 'check_box'
  }
};

// Meeting Types
export const MEETING_TYPES = {
  GOOGLE_MEET: {
    id: 'google_meet',
    label: 'Google Meet',
    icon: 'video_call'
  },
  ZOOM: {
    id: 'zoom',
    label: 'Zoom',
    icon: 'videocam'
  },
  PHONE: {
    id: 'phone',
    label: 'Phone Call',
    icon: 'phone'
  },
  CUSTOM: {
    id: 'custom',
    label: 'Custom Location',
    icon: 'location_on'
  }
};

// Appointment Statuses
export const APPOINTMENT_STATUS = {
  PENDING: {
    id: 'pending',
    label: 'Pending',
    color: 'warning'
  },
  CONFIRMED: {
    id: 'confirmed',
    label: 'Confirmed',
    color: 'success'
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    color: 'error'
  },
  COMPLETED: {
    id: 'completed',
    label: 'Completed',
    color: 'default'
  }
};

// Time Increments (in minutes)
export const TIME_INCREMENTS = [
  15, 30, 45, 60, 90, 120
];

// Default Form Settings
export const DEFAULT_FORM_SETTINGS = {
  title: '',
  duration: 30,
  type: MEETING_TYPES.GOOGLE_MEET.id,
  description: '',
  scheduling: {
    dateRange: {
      start: null,
      end: null
    },
    availableHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    },
    bufferTime: 0,
    minimumNotice: 24,
    dailyLimit: null,
    timezone: 'host'
  },
  fields: [
    {
      type: FIELD_TYPES.TEXT.id,
      label: 'Name',
      required: true,
      order: 0
    },
    {
      type: FIELD_TYPES.EMAIL.id,
      label: 'Email',
      required: true,
      order: 1
    }
  ]
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'wd_appointments_settings',
  AUTH_TOKEN: 'wd_appointments_auth_token',
  USER_PREFERENCES: 'wd_appointments_user_prefs'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Calendar Views
export const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda'
};

// Date/Time Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  FULL: 'dddd, MMMM D, YYYY'
};

export const TIME_FORMATS = {
  H24: 'HH:mm',
  H12: 'hh:mm A'
};
