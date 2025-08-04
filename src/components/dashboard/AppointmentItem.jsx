import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const AppointmentItem = ({ appointment }) => {
  const appointmentTime = appointment.time instanceof Date 
    ? format(appointment.time, 'h:mm a')
    : typeof appointment.time === 'string'
      ? format(parseISO(`2000-01-01T${appointment.time}`), 'h:mm a')
      : format(appointment.time.toDate(), 'h:mm a');

  const getStatusChip = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Chip size="small" label="Completed" color="success" />;
      case 'CANCELLED':
        return <Chip size="small" label="Cancelled" color="error" />;
      case 'PENDING':
        return <Chip size="small" label="Pending" color="warning" />;
      default:
        return null;
    }
  };

  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {appointment.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {appointmentTime}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {appointment.type} - {appointment.patientPhone}
              </Typography>
              {getStatusChip(appointment.status)}
            </Box>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

export default AppointmentItem;
