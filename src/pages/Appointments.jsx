import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Container,
  Button,
  FormControl,
  InputLabel,
  Select,
  Toolbar
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, parse } from 'date-fns';
import { doctorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewAndShareModal from '../components/ReviewAndShareModal';
import Sidebar from '../components/Sidebar';
import '../pages/NurseDashboard.css';

const formatAppointmentDateTime = (appointment) => {
  try {
    // Format date
    let dateStr = '';
    if (appointment.date) {
      const date = appointment.date?.toDate?.() || parseISO(appointment.date);
      dateStr = format(date, 'yyyy-MM-dd');
    }

    // Format time
    let timeStr = '';
    if (appointment.time) {
      if (typeof appointment.time === 'string') {
        // If time is in HH:mm format
        const timeDate = parse(appointment.time, 'HH:mm', new Date());
        timeStr = format(timeDate, 'hh:mm a');
      } else if (appointment.time?.toDate) {
        // If time is a Firestore timestamp
        timeStr = format(appointment.time.toDate(), 'hh:mm a');
      }
    }

    return { dateStr, timeStr };
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return { dateStr: 'Invalid date', timeStr: 'Invalid time' };
  }
};

const statusColors = {
  CONFIRMED: 'success',
  CANCELLED: 'error',
  PENDING: 'warning'
};

const appointmentTypes = [
  'Regular Checkup',
  'Follow-up',
  'Consultation',
  'Emergency',
  'Vaccination',
  'Lab Test',
  'Surgery',
  'Other'
];

const Appointments = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doctorAppointments', user?.uid],
    queryFn: () => doctorService.getDoctorAppointments(user?.uid),
    enabled: !!user?.uid
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }) => 
      doctorService.updateAppointmentStatus(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctorAppointments', user?.uid]);
    }
  });

  const handleMenuClick = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleStatusUpdate = (status) => {
    if (selectedAppointment) {
      updateStatusMutation.mutate({
        appointmentId: selectedAppointment.id,
        status
      });
    }
    handleMenuClose();
  };

  const filteredAppointments = Object.values(appointments).flat().filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    if (statusFilter === 'all') {
      return (
        appointment.patientName?.toLowerCase().includes(searchLower) ||
        appointment.type?.toLowerCase().includes(searchLower) ||
        appointment.status?.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        appointment.status === statusFilter &&
        (
          appointment.patientName?.toLowerCase().includes(searchLower) ||
          appointment.type?.toLowerCase().includes(searchLower)
        )
      );
    }
  });

  const handleReview = (appointment) => {
    setIsReviewModalOpen(true);
    setSelectedAppointment(appointment);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="nurse-dashboard">
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        notifications={[]} // Pass notifications if needed
      />

      {/* Main Content */}
      <Box className="nurse-dashboard__main">
        <Toolbar />
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Appointments
            </Typography>
            
            {/* Search and Filter Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {/* Handle new appointment */}}
              >
                New Appointment
              </Button>
            </Box>

            {/* Appointments Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((appointment) => {
                    const { dateStr, timeStr } = formatAppointmentDateTime(appointment);
                    return (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonthIcon fontSize="small" color="action" />
                            {dateStr}
                            <AccessTimeIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                            {timeStr}
                          </Box>
                        </TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status || 'PENDING'}
                            color={statusColors[appointment.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, appointment)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Button
                            size="small"
                            onClick={() => handleReview(appointment)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate('CONFIRMED')}>
          Confirm Appointment
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('CANCELLED')}>
          Cancel Appointment
        </MenuItem>
      </Menu>

      {selectedAppointment && (
        <ReviewAndShareModal
          open={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedAppointment(null);
          }}
          data={selectedAppointment}
          type="appointment"
          patientId={selectedAppointment.patientId}
          patientName={selectedAppointment.patientName}
        />
      )}
    </Box>
  );
};

export default Appointments;
