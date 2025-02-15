// Date formatting
export const formatDate = (date, format = 'default') => {
  const d = new Date(date);
  
  const formats = {
    default: d.toLocaleDateString(),
    time: d.toLocaleTimeString(),
    full: d.toLocaleString(),
    iso: d.toISOString(),
    dateTime: `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`,
  };

  return formats[format] || formats.default;
};

// Status helpers
export const appointmentStatuses = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const getStatusColor = (status) => {
  const colors = {
    [appointmentStatuses.PENDING]: 'warning',
    [appointmentStatuses.CONFIRMED]: 'success',
    [appointmentStatuses.CANCELLED]: 'error',
    [appointmentStatuses.COMPLETED]: 'default'
  };
  return colors[status] || 'default';
};

// Form field types
export const fieldTypes = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  EMAIL: 'email',
  PHONE: 'phone',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  TIME: 'time'
};

// Meeting types
export const meetingTypes = {
  GOOGLE_MEET: 'google_meet',
  ZOOM: 'zoom',
  PHONE: 'phone',
  CUSTOM: 'custom'
};

// Email template variables
export const emailVariables = {
  CLIENT_NAME: '{client_name}',
  CLIENT_EMAIL: '{client_email}',
  APPOINTMENT_DATE: '{appointment_date}',
  APPOINTMENT_TIME: '{appointment_time}',
  MEETING_LINK: '{meeting_link}',
  VERIFICATION_LINK: '{verification_link}',
  CANCELLATION_LINK: '{cancellation_link}',
  BUSINESS_NAME: '{business_name}',
  FORM_TITLE: '{form_title}'
};

// Validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

// Time slot helpers
export const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  let current = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  while (current < end) {
    slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    current = new Date(current.getTime() + duration * 60000); // duration in minutes
  }

  return slots;
};

// Calendar helpers
export const getCalendarProvider = (type) => {
  const providers = {
    [meetingTypes.GOOGLE_MEET]: 'google',
    [meetingTypes.ZOOM]: 'zoom'
  };
  return providers[type] || null;
};

// Error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server';
  } else {
    // Request setup error
    return 'Error setting up request';
  }
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
};

// Shortcode helper
export const generateShortcode = (formId) => {
  return `[wd_appointment_form id="${formId}"]`;
};

// Copy to clipboard helper
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Form field validation
export const validateField = (type, value, required = false) => {
  if (required && (!value || value.length === 0)) {
    return 'This field is required';
  }

  switch (type) {
    case fieldTypes.EMAIL:
      if (value && !validateEmail(value)) {
        return 'Invalid email address';
      }
      break;
    case fieldTypes.PHONE:
      if (value && !validatePhone(value)) {
        return 'Invalid phone number';
      }
      break;
    default:
      return null;
  }

  return null;
};

// Duration formatting
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes 
    ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
    : `${hours} hour${hours > 1 ? 's' : ''}`;
};
