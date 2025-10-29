import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import NurseSidebar from './NurseSidebar';
import NurseHeader from './NurseHeader';

const drawerWidth = 260;

const NurseLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <NurseHeader />
      <NurseSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default NurseLayout;
