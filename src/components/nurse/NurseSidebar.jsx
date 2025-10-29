import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  MedicalInformation as MedicalInformationIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const NurseSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/nurse-dashboard' },
    { text: 'My Patients', icon: <PeopleIcon />, path: '/nurse-patients' },
    { text: 'Appointments', icon: <CalendarMonthIcon />, path: '/nurse-appointments' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/nurse-tasks' },
    { text: 'Medical Records', icon: <MedicalInformationIcon />, path: '/nurse-medical-records' },
    { text: 'Messages', icon: <MessageIcon />, path: '/nurse-messages' }
  ];

  const bottomMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/nurse-profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/nurse-settings' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          borderRight: 'none'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LocalHospitalIcon sx={{ fontSize: 32, color: 'white' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
          Nurse Portal
        </Typography>
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.2), mx: 2 }} />

      {/* User Profile */}
      <Box sx={{ p: 2.5, mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha('#fff', 0.1),
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: alpha('#fff', 0.15),
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'white',
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: '1.2rem'
            }}
          >
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'N'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.name || user?.email?.split('@')[0] || 'Nurse'}
            </Typography>
            <Chip
              label="Nurse"
              size="small"
              sx={{
                mt: 0.5,
                height: 20,
                fontSize: '0.7rem',
                bgcolor: alpha('#fff', 0.2),
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Navigation */}
      <List sx={{ px: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: isActive(item.path) ? alpha('#fff', 0.2) : 'transparent',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
                transform: 'translateX(8px)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 600 : 400,
                fontSize: '0.95rem'
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: alpha('#fff', 0.2), mx: 2, my: 1 }} />

      {/* Bottom Navigation */}
      <List sx={{ px: 2, pb: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: isActive(item.path) ? alpha('#fff', 0.2) : 'transparent',
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
                transform: 'translateX(8px)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 600 : 400,
                fontSize: '0.95rem'
              }}
            />
          </ListItem>
        ))}

        {/* Logout */}
        <ListItem
          onClick={handleLogout}
          sx={{
            mt: 1,
            borderRadius: 2,
            cursor: 'pointer',
            bgcolor: alpha('#fff', 0.1),
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: alpha('#f44336', 0.2),
              transform: 'translateX(8px)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default NurseSidebar;
