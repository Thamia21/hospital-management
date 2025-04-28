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
  CircularProgress
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { doctorService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  CONFIRMED: 'success',
  CANCELLED: 'error',
  PENDING: 'warning'
};

const AppointmentItem = ({ appointment, onStatusUpdate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status) => {
    onStatusUpdate(appointment.id, status);
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
                {appointment.patientName}
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
                Time: {format(appointment.date.toDate(), 'h:mm a')}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.secondary">
                Email: {appointment.patientEmail}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.secondary">
                Phone: {appointment.patientPhone}
              </Typography>
            </>
          }
        />
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleStatusChange('CONFIRMED')}>
          Confirm Appointment
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('CANCELLED')}>
          Cancel Appointment
        </MenuItem>
      </Menu>
      <Divider />
    </>
  );
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
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

  const handleStatusUpdate = (appointmentId, status) => {
    updateStatusMutation.mutate({ appointmentId, status });
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

      {Object.entries(appointments || {}).map(([date, dayAppointments]) => (
        <Paper key={date} sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 2, py: 1 }}>
            <Typography variant="h6">
              {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>
          <List disablePadding>
            {dayAppointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </List>
        </Paper>
      ))}

      {Object.keys(appointments || {}).length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No appointments scheduled
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
