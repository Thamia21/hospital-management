import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector';

const DoctorHeader = ({ onMenuClick, drawerOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationClose = () => setNotificationAnchor(null);

  const handleProfile = () => {
    navigate('/doctor-profile');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/doctor-settings');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // Mock notifications - in real app, fetch from API
  const notifications = [
    {
      id: 1,
      title: t('notifications.newAppointment', 'New Appointment Request'),
      message: t('notifications.appointmentFrom', 'Appointment request from John Doe'),
      time: '5 min ago',
      read: false
    },
    {
      id: 2,
      title: t('notifications.labResults', 'Lab Results Ready'),
      message: t('notifications.labResultsFor', 'Lab results ready for Sarah Wilson'),
      time: '15 min ago',
      read: false
    },
    {
      id: 3,
      title: t('notifications.urgentConsult', 'Urgent Consultation'),
      message: t('notifications.urgentConsultFor', 'Urgent consultation needed for patient #1234'),
      time: '30 min ago',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <MedicalServicesIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {t('doctor.portal', 'Doctor Portal')}
        </Typography>

        {/* Current Time */}
        <Typography variant="body2" sx={{ mr: 3, opacity: 0.9 }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Typography>

        {/* Language Selector */}
        <Box sx={{ mr: 2 }}>
          <LanguageSelector variant="chip" size="small" />
        </Box>

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={(e) => setNotificationAnchor(e.currentTarget)}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Profile Menu */}
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 0, ml: 1 }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </Avatar>
        </IconButton>

        {/* Profile Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 280,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          {/* User Info */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Dr. {user?.name || 'Doctor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Chip 
              label={user?.specialization || t('general.practitioner', 'General Practitioner')}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleProfile}>
            <PersonIcon sx={{ mr: 1 }} /> 
            {t('nav.profile', 'Profile')}
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 1 }} /> 
            {t('nav.settings', 'Settings')}
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} /> 
            {t('nav.logout', 'Logout')}
          </MenuItem>
        </Menu>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              maxWidth: 360,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('notifications.title', 'Notifications')}
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="body2" color="primary">
                {unreadCount} {t('notifications.unread', 'unread')}
              </Typography>
            )}
          </Box>
          
          <Divider />
          
          {notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              sx={{ 
                py: 2,
                borderLeft: notification.read ? 'none' : '4px solid #1976d2',
                bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          <Divider />
          
          <MenuItem onClick={() => navigate('/doctor-notifications')}>
            <Typography variant="body2" color="primary" sx={{ textAlign: 'center', width: '100%' }}>
              {t('notifications.viewAll', 'View All Notifications')}
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DoctorHeader;
