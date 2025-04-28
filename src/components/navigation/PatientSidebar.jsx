import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Box 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  Payments as PaymentsIcon,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

const PatientSidebar = () => {
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/patient-portal' 
    },
    { 
      text: 'Messages', 
      icon: <ChatIcon />, 
      path: '/messages' 
    },
    { 
      text: 'Appointments', 
      icon: <EventNoteIcon />, 
      path: '/book-appointment' 
    },
    { 
      text: 'Medical Records', 
      icon: <MedicalServicesIcon />, 
      path: '/patient-records' 
    },
    { 
      text: 'Prescriptions', 
      icon: <MedicationIcon />, 
      path: '/patient-prescriptions' 
    },
    { 
      text: 'Billing', 
      icon: <PaymentsIcon />, 
      path: '/patient-billing' 
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings' 
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: '#f4f4f4'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={RouterLink} 
              to={item.path}
              sx={{
                '&:hover': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default PatientSidebar;
