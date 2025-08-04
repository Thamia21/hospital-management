import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

const WelcomeHeader = ({ userName }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {userName ? `Welcome back, Dr. ${userName.split(' ').pop()}` : 'Welcome back, Doctor'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </Typography>
    </Box>
  );
};

export default WelcomeHeader;
