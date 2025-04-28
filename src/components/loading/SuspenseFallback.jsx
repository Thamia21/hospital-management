import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function SuspenseFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <LocalHospitalIcon 
        sx={{ 
          fontSize: 60, 
          color: 'primary.main',
          animation: 'pulse 2s infinite'
        }} 
      />
      <CircularProgress size={24} />
      <Typography variant="h6" color="textSecondary">
        Loading...
      </Typography>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
}
