import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import PatientSidebar from '../navigation/PatientSidebar';
import PatientHeader from '../navigation/PatientHeader';

const PatientLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Patient Sidebar */}
      <PatientSidebar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          bgcolor: 'background.default', 
          p: 3,
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* Patient Header */}
        <PatientHeader />
        
        {/* Main Content Container */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default PatientLayout;
