import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Chip,
  MenuItem,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { APPOINTMENT_STATUS } from '../../config/constants';
import { formatDate, formatDuration } from '../../utils/helpers';
import AppointmentDetails from './AppointmentDetails';

const AppointmentList = ({
  appointments,
  onUpdate,
  onDelete,
  onSendReminder,
  onRefresh,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('appointmentDate');
  const [order, setOrder] = useState('desc');
  const [filter, setFilter] = useState({
    search: '',
    status: 'all',
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filtering
  const handleFilterChange = (field, value) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appointment) => {
      const searchMatch =
        filter.search === '' ||
        appointment.clientName.toLowerCase().includes(filter.search.toLowerCase()) ||
        appointment.clientEmail.toLowerCase().includes(filter.search.toLowerCase());

      const statusMatch =
        filter.status === 'all' || appointment.status === filter.status;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      const getValue = (obj) => {
        const value = obj[orderBy];
        return typeof value === 'string' ? value.toLowerCase() : value;
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });

  // Get paginated data
  const paginatedAppointments = filteredAppointments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentUpdate = async (updatedAppointment) => {
    await onUpdate(updatedAppointment);
    setSelectedAppointment(null);
  };

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search appointments..."
            value={filter.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <TextField
            select
            size="small"
            value={filter.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value.label}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Appointments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'appointmentDate'}
                  direction={orderBy === 'appointmentDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('appointmentDate')}
                >
                  Date & Time
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'clientName'}
                  direction={orderBy === 'clientName' ? order : 'asc'}
                  onClick={() => handleRequestSort('clientName')}
                >
                  Client
                </TableSortLabel>
              </TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAppointments.map((appointment) => (
              <TableRow
                key={appointment.id}
                hover
                onClick={() => handleAppointmentClick(appointment)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {formatDate(appointment.appointmentDate, 'full')}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{appointment.clientName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {appointment.clientEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{formatDuration(appointment.duration)}</TableCell>
                <TableCell>
                  <Chip
                    label={APPOINTMENT_STATUS[appointment.status]?.label}
                    color={APPOINTMENT_STATUS[appointment.status]?.color}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Reminder">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendReminder(appointment.id);
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(appointment.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onUpdate={handleAppointmentUpdate}
          onDelete={onDelete}
          onSendReminder={onSendReminder}
          isDialog={true}
        />
      )}
    </Box>
  );
};

export default AppointmentList;
