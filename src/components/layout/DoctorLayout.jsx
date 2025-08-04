import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../navigation/DoctorSidebar';
import DoctorHeader from '../navigation/DoctorHeader';

const DoctorLayout = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <DoctorHeader 
        onMenuClick={handleSidebarToggle}
        drawerOpen={sidebarOpen}
      />
      
      {/* Sidebar */}
      <DoctorSidebar 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: sidebarOpen ? 0 : '-280px',
          width: sidebarOpen ? 'calc(100% - 280px)' : '100%',
          mt: '64px', // Height of AppBar
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f5f7fa',
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorLayout;
