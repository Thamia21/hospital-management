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
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  MedicalServices as MedicalServicesIcon,
  HealthAndSafety as HealthAndSafetyIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const drawerWidth = 280;

const DoctorSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    {
      text: t('nav.dashboard', 'Dashboard'),
      icon: <DashboardIcon />,
      path: '/doctor-dashboard',
      color: '#1976d2'
    },
    {
      text: t('nav.patients', 'My Patients'),
      icon: <PeopleIcon />,
      path: '/doctor-patients',
      color: '#2e7d32'
    },
    {
      text: t('nav.appointments', 'Appointments'),
      icon: <EventNoteIcon />,
      path: '/doctor-appointments',
      color: '#ed6c02'
    },
    {
      text: t('nav.prescriptions', 'Prescriptions'),
      icon: <LocalPharmacyIcon />,
      path: '/doctor-prescriptions',
      color: '#9c27b0'
    },
    {
      text: t('nav.medicalRecords', 'Medical Records'),
      icon: <AssignmentIcon />,
      path: '/doctor-medical-records',
      color: '#d32f2f'
    },
    {
      text: t('nav.consultations', 'Consultations'),
      icon: <MedicalServicesIcon />,
      path: '/doctor-consultations',
      color: '#0288d1'
    },
    {
      text: t('nav.reports', 'Reports & Analytics'),
      icon: <AssessmentIcon />,
      path: '/doctor-reports',
      color: '#f57c00'
    },
    {
      text: t('nav.messages', 'Messages'),
      icon: <ChatIcon />,
      path: '/doctor-messages',
      color: '#388e3c'
    }
  ];

  const bottomMenuItems = [
    {
      text: t('nav.profile', 'Profile'),
      icon: <PersonIcon />,
      path: '/doctor-profile',
      color: '#5e35b1'
    },
    {
      text: t('nav.settings', 'Settings'),
      icon: <SettingsIcon />,
      path: '/doctor-settings',
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
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            bgcolor: 'rgba(255,255,255,0.2)',
            fontSize: '1.5rem'
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'D'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Dr. {user?.name || 'Doctor'}
        </Typography>
        <Chip 
          label={t('role.doctor', 'Doctor')}
          size="small"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 500
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          {user?.specialization || t('general.practitioner', 'General Practitioner')}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      {/* Main Navigation */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.8)',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mx: 2 }} />

      {/* Bottom Navigation */}
      <List sx={{ px: 2, py: 1 }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.8)',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
        
        {/* Logout */}
        <ListItem
          onClick={handleLogout}
          sx={{
            mb: 1,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
              transform: 'translateX(4px)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: 'rgba(255,255,255,0.8)',
            minWidth: 40
          }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('nav.logout', 'Logout')}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.95rem'
              }
            }}
          />
        </ListItem>
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', opacity: 0.6 }}>
        <Typography variant="caption">
          {t('healthcare.system', 'Healthcare Management System')}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default DoctorSidebar;
