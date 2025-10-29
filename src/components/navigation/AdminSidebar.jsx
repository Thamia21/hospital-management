import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  LocalHospital as HospitalIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const AdminSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      color: '#1976d2'
    },
    {
      text: 'Staff Management',
      icon: <PeopleIcon />,
      path: '/admin/staff-management',
      color: '#2e7d32'
    },
    {
      text: 'Add Staff',
      icon: <PersonAddIcon />,
      path: '/admin/add-staff',
      color: '#388e3c'
    },
    {
      text: 'Patient Management',
      icon: <AssignmentIcon />,
      path: '/admin/patient-management',
      color: '#ed6c02'
    },
    {
      text: 'Add Patient',
      icon: <PersonAddIcon />,
      path: '/admin/add-patient',
      color: '#f57c00'
    },
    {
      text: 'Leave Management',
      icon: <EventNoteIcon />,
      path: '/admin/leave-management',
      color: '#9c27b0'
    },
    {
      text: 'Facilities',
      icon: <BusinessIcon />,
      path: '/admin/facilities',
      color: '#0288d1'
    },
    {
      text: 'Reports & Analytics',
      icon: <BarChartIcon />,
      path: '/admin/reports',
      color: '#d32f2f'
    },
    {
      text: 'Billing',
      icon: <ReceiptIcon />,
      path: '/billing',
      color: '#f57c00'
    },
    {
      text: 'Messages',
      icon: <ChatIcon />,
      path: '/admin/messages',
      color: '#388e3c'
    }
  ];

  const bottomMenuItems = [
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/admin/profile',
      color: '#5e35b1'
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      color: '#616161'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: alpha('#000', 0.2),
        borderBottom: `1px solid ${alpha('#fff', 0.1)}`
      }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            bgcolor: alpha('#fff', 0.2),
            border: '3px solid white',
            fontSize: '2rem',
            fontWeight: 700
          }}
        >
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
          {user?.name || 'Administrator'}
        </Typography>
        <Chip
          icon={<AdminIcon sx={{ color: 'white !important' }} />}
          label="System Admin"
          size="small"
          sx={{
            bgcolor: alpha('#fff', 0.2),
            color: 'white',
            fontWeight: 600,
            border: `1px solid ${alpha('#fff', 0.3)}`
          }}
        />
      </Box>

      {/* Main Menu */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              bgcolor: isActive(item.path) ? alpha('#fff', 0.25) : 'transparent',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
                transform: 'translateX(8px)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              }
            }}
          >
            <ListItemIcon
              sx={{
                color: 'white',
                minWidth: 45,
                '& .MuiSvgIcon-root': {
                  fontSize: 24,
                  filter: isActive(item.path) ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                }
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive(item.path) ? 700 : 500,
                sx: {
                  textShadow: isActive(item.path) ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: alpha('#fff', 0.1), mx: 2 }} />

      {/* Bottom Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              bgcolor: isActive(item.path) ? alpha('#fff', 0.25) : 'transparent',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
                transform: 'translateX(8px)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive(item.path) ? 700 : 500
              }}
            />
          </ListItem>
        ))}

        {/* Logout Button */}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            transition: 'all 0.3s ease',
            bgcolor: alpha('#f44336', 0.2),
            border: `1px solid ${alpha('#f44336', 0.3)}`,
            '&:hover': {
              bgcolor: alpha('#f44336', 0.3),
              transform: 'translateX(8px)',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          />
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{
        p: 2,
        textAlign: 'center',
        background: alpha('#000', 0.2),
        borderTop: `1px solid ${alpha('#fff', 0.1)}`
      }}>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          MediConnect Admin v1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
