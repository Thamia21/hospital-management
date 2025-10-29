import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { MoreVert as MoreVertIcon, Schedule as ScheduleIcon, Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { doctorService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const statusColors = {
  CONFIRMED: 'success',
  CANCELLED: 'error',
  PENDING: 'warning'
};

// Reschedule Dialog Component
const RescheduleDialog = ({ open, onClose, appointment, onReschedule }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onReschedule(appointment._id || appointment.id, {
        date: new Date(`${newDate}T${newTime}`),
        time: newTime
      });
      onClose();
    } catch (err) {
      setError('Failed to reschedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Reschedule Appointment
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Appointment:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Patient: {appointment?.patientId?.name || 'Unknown'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date: {new Date(appointment?.date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Time: {appointment?.time || 'TBD'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="New Date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split('T')[0]
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="New Time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleReschedule} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <ScheduleIcon />}
        >
          {loading ? 'Rescheduling...' : 'Reschedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AppointmentCard = ({ appointment, onStatusUpdate, onReschedule }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRescheduleClick = () => {
    setRescheduleOpen(true);
    handleMenuClose();
  };

  const handleStatusChange = (status) => {
    onStatusUpdate(appointment._id || appointment.id, status);
    handleMenuClose();
  };

  const statusColor = {
    CONFIRMED: '#4caf50',
    COMPLETED: '#1976d2',
    CANCELLED: '#f44336',
    PENDING: '#ff9800',
  }[appointment.status] || '#1976d2';

  return (
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 8,
          minHeight: 180,
          background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
          p: 0,
          position: 'relative',
          borderLeft: `8px solid ${statusColor}`,
          transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.03)',
            boxShadow: 16,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 26, boxShadow: 2, flexShrink: 0 }}>
                {appointment.patientId?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.19rem', mb: 0.5, wordBreak: 'break-word' }}>
                  {appointment.patientId?.name || appointment.patientName || 'Patient Name Not Available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  {(() => {
                    const email = appointment.patientId?.email || appointment.patientEmail;
                    return email ? email : '';
                  })()}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={appointment.status || 'PENDING'}
              sx={{
                background: statusColor,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                px: 1.5,
                py: 0.5,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderRadius: 2,
                boxShadow: 2,
                flexShrink: 0,
              }}
              icon={<ScheduleIcon sx={{ color: '#fff', fontSize: 18 }} />}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScheduleIcon sx={{ color: statusColor, fontSize: 22 }}/>
            <Typography variant="h5" sx={{ fontWeight: 600, color: statusColor, letterSpacing: 1 }}>
              {(() => {
                try {
                  return format(new Date(appointment.date), 'h:mm a');
                } catch (error) {
                  return 'Time not available';
                }
              })()} {appointment.time ? `(${appointment.time})` : ''}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            <strong>Reason:</strong> {appointment.reason || 'No reason provided'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleRescheduleClick}>
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
            Reschedule
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('COMPLETED')}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Mark as Completed
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('CANCELLED')}>
            <CancelIcon sx={{ mr: 1, color: 'error.main' }} />
            Cancel Appointment
          </MenuItem>
        </Menu>
        <RescheduleDialog
          open={rescheduleOpen}
          onClose={() => setRescheduleOpen(false)}
          appointment={appointment}
          onReschedule={onReschedule}
        />
      </Card>
    </Grid>
  );
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointmentsArray, isLoading } = useQuery({
    queryKey: ['doctorAppointments', user?._id || user?.id],
    queryFn: () => doctorService.getDoctorAppointmentsMongo(user?._id || user?.id),
    enabled: !!(user?._id || user?.id)
  });

  // Group appointments by date
  const appointments = React.useMemo(() => {
    if (!appointmentsArray || !Array.isArray(appointmentsArray)) {
      return {};
    }

    return appointmentsArray.reduce((grouped, appointment) => {
      try {
        // Parse the appointment date
        const appointmentDate = new Date(appointment.date);
        if (isNaN(appointmentDate.getTime())) {
          console.warn('Invalid date for appointment:', appointment);
          return grouped;
        }

        // Format date as YYYY-MM-DD for grouping
        const dateKey = format(appointmentDate, 'yyyy-MM-dd');
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        
        grouped[dateKey].push({
          ...appointment,
          parsedDate: appointmentDate
        });
        
        return grouped;
      } catch (error) {
        console.warn('Error processing appointment:', appointment, error);
        return grouped;
      }
    }, {});
  }, [appointmentsArray]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }) => 
      doctorService.updateAppointmentStatusMongo(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctorAppointments', user?._id || user?.id]);
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ appointmentId, updateData }) => 
      doctorService.updateAppointmentMongo(appointmentId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctorAppointments', user?._id || user?.id]);
    }
  });

  const handleStatusUpdate = (appointmentId, status) => {
    updateStatusMutation.mutate({ appointmentId, status });
  };

  const handleReschedule = async (appointmentId, rescheduleData) => {
    return rescheduleMutation.mutateAsync({ 
      appointmentId, 
      updateData: {
        date: rescheduleData.date.toISOString(),
        time: rescheduleData.time
      }
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Appointments
      </Typography>

      {Object.entries(appointments || {})
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([date, dayAppointments]) => {
        let formattedDate;
        try {
          formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
        } catch (error) {
          console.warn('Error formatting date:', date, error);
          formattedDate = date; // Fallback to raw date string
        }
        
        return (
          <Box key={date} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <ScheduleIcon sx={{ color: 'primary.main', fontSize: 28 }}/>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
                {formattedDate}
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {[...dayAppointments]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((appointment, index) => (
                  <AppointmentCard
                    key={appointment._id || appointment.id || `${date}-${index}`}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                    onReschedule={handleReschedule}
                  />
                ))}
            </Grid>
          </Box>
        );
      })}

      {Object.keys(appointments || {}).length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No appointments scheduled
          </Typography>
          <Typography color="text.secondary">
            Your appointment schedule will appear here once patients book appointments with you.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
