import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { People as PeopleIcon, LocalHospital as HospitalIcon, Healing as HealingIcon } from '@mui/icons-material';

const PatientStatsWidget = ({ 
  stats = {
    totalPatients: 0,
    inpatientCount: 0,
    outpatientCount: 0
  }, 
  loading = false 
}) => {
  // Default values
  const { 
    totalPatients = 0, 
    inpatientCount = 0, 
    outpatientCount = 0 
  } = stats || {};

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Patient Statistics</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ textAlign: 'center', width: '30%' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width={40} height={30} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width={80} height={20} sx={{ mx: 'auto' }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Patient Statistics</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <PeopleIcon color="primary" fontSize="large" />
            <Typography variant="h6">{totalPatients}</Typography>
            <Typography variant="body2" color="text.secondary">Total Patients</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <HospitalIcon color="secondary" fontSize="large" />
            <Typography variant="h6">{inpatientCount}</Typography>
            <Typography variant="body2" color="text.secondary">Inpatients</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <HealingIcon color="success" fontSize="large" />
            <Typography variant="h6">{outpatientCount}</Typography>
            <Typography variant="body2" color="text.secondary">Outpatients</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PatientStatsWidget;
