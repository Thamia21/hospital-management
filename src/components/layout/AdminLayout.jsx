import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import AdminSidebar from '../navigation/AdminSidebar';
import AdminHeader from '../navigation/AdminHeader';

const drawerWidth = 280;

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <CssBaseline />
      
      {/* Header */}
      <AdminHeader />
      
      {/* Sidebar */}
      <AdminSidebar open={true} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${drawerWidth}px`,
          mt: '64px', // AppBar height
          p: 3,
          minHeight: 'calc(100vh - 64px)',
          bgcolor: '#f5f7fa'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
