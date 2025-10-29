import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../../services/api';

const NurseAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch nurse appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['nurseAppointments', user?._id || user?.id],
    queryFn: async () => {
      const nurseId = user._id || user.id;
      return await doctorService.getNurseAppointmentsMongo(nurseId);
    },
    enabled: !!(user?._id || user?.id),
    refetchInterval: 30000
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }) =>
      doctorService.updateAppointmentStatusMongo(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['nurseAppointments']);
      handleMenuClose();
    }
  });

  const handleMenuOpen = (event, appointment) => {
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
        appointmentId: selectedAppointment._id || selectedAppointment.id,
        status
      });
    }
  };

  // Filter appointments based on tab and search
  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by status based on tab
    switch (selectedTab) {
      case 1: // Pending
        filtered = filtered.filter(apt => apt.status === 'PENDING');
        break;
      case 2: // Scheduled
        filtered = filtered.filter(apt => apt.status === 'SCHEDULED');
        break;
      case 3: // Completed
        filtered = filtered.filter(apt => apt.status === 'COMPLETED');
        break;
      default: // All
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAppointments = filterAppointments();

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ff9800';
      case 'SCHEDULED':
        return '#2196f3';
      case 'COMPLETED':
        return '#4caf50';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <AccessTimeIcon />;
      case 'SCHEDULED':
        return <EventNoteIcon />;
      case 'COMPLETED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <EventNoteIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track your patient appointments
        </Typography>
      </Box>

      {/* Search and Tabs */}
      <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by patient name or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${appointments.length})`} />
            <Tab label={`Pending (${appointments.filter(a => a.status === 'PENDING').length})`} />
            <Tab label={`Scheduled (${appointments.filter(a => a.status === 'SCHEDULED').length})`} />
            <Tab label={`Completed (${appointments.filter(a => a.status === 'COMPLETED').length})`} />
          </Tabs>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredAppointments.map((appointment) => (
            <Grid item xs={12} key={appointment._id || appointment.id}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="subtitle2" color="text.secondary">
                              Patient
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {appointment.patientId?.name || 'Unknown Patient'}
                          </Typography>
                          {appointment.patientId?.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {appointment.patientId.email}
                              </Typography>
                            </Box>
                          )}
                          {appointment.patientId?.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {appointment.patientId.phone}
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Date & Time
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {new Date(appointment.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time || new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Reason
                          </Typography>
                          <Typography variant="body1">
                            {appointment.reason || 'General Consultation'}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Status
                          </Typography>
                          <Chip
                            icon={getStatusIcon(appointment.status)}
                            label={appointment.status || 'SCHEDULED'}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(appointment.status),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <IconButton
                      onClick={(e) => handleMenuOpen(e, appointment)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventNoteIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'You have no appointments in this category'}
          </Typography>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate('SCHEDULED')}>
          <ListItemIcon>
            <EventNoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Scheduled</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('COMPLETED')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Completed</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('CANCELLED')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error">Cancel Appointment</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NurseAppointments;
