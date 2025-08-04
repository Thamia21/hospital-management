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
  Alert
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

const AppointmentItem = ({ appointment, onStatusUpdate, onReschedule }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status) => {
    onStatusUpdate(appointment._id || appointment.id, status);
    handleClose();
  };

  const handleRescheduleClick = () => {
    setRescheduleOpen(true);
    handleClose();
  };

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton edge="end" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
        }
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1">
                {appointment.patientId?.name || appointment.patientName || 'Patient Name Not Available'}
              </Typography>
              <Chip
                size="small"
                label={appointment.status || 'PENDING'}
                color={statusColors[appointment.status] || 'default'}
              />
            </Box>
          }
          secondary={
            <>
              <Typography component="span" variant="body2">
                Time: {(() => {
                  try {
                    return format(new Date(appointment.date), 'h:mm a');
                  } catch (error) {
                    console.warn('Error formatting appointment time:', appointment.date, error);
                    return 'Time not available';
                  }
                })()}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.secondary">
                Email: {appointment.patientId?.email || appointment.patientEmail || 'Email not available'}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.secondary">
                Phone: {appointment.patientId?.phone || appointment.patientPhone || 'Phone not available'}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.secondary">
                Reason: {appointment.reason || 'No reason provided'}
              </Typography>
            </>
          }
        />
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
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
      <Divider />
    </>
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

      {Object.entries(appointments || {}).map(([date, dayAppointments]) => {
        let formattedDate;
        try {
          formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
        } catch (error) {
          console.warn('Error formatting date:', date, error);
          formattedDate = date; // Fallback to raw date string
        }
        
        return (
          <Paper key={date} sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 2, py: 1 }}>
              <Typography variant="h6">
                {formattedDate}
              </Typography>
            </Box>
            <List disablePadding>
              {dayAppointments.map((appointment, index) => (
                <AppointmentItem
                  key={appointment._id || appointment.id || `${date}-${index}`}
                  appointment={appointment}
                  onStatusUpdate={handleStatusUpdate}
                  onReschedule={handleReschedule}
                />
              ))}
            </List>
          </Paper>
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
