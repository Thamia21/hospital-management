import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { EventAvailable as EventAvailableIcon, EventBusy as EventBusyIcon } from '@mui/icons-material';

const AppointmentStatusWidget = ({ appointments }) => {
  const total = appointments?.total || 1; // Avoid division by zero
  const completed = appointments?.completed || 0;
  const pending = appointments?.pending || 0;
  const cancelled = appointments?.cancelled || 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Appointment Status</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Completed</Typography>
            <Typography variant="body2">{completed} ({(completed/total*100).toFixed(1)}%)</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(completed/total)*100} color="success" sx={{ height: 8, borderRadius: 5 }} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Pending</Typography>
            <Typography variant="body2">{pending} ({(pending/total*100).toFixed(1)}%)</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(pending/total)*100} color="warning" sx={{ height: 8, borderRadius: 5 }} />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Cancelled</Typography>
            <Typography variant="body2">{cancelled} ({(cancelled/total*100).toFixed(1)}%)</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(cancelled/total)*100} color="error" sx={{ height: 8, borderRadius: 5 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentStatusWidget;
