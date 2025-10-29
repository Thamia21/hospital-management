import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const NurseHeader = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?._id && !user?.id) return;
    
    try {
      const userId = user._id || user.id;
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/patients/${userId}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const unread = response.data.filter(n => !n.read);
      setNotifications(unread);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchNotifications();
    }
  }, [user?._id, user?.id, fetchNotifications]);

  // Don't render if user is not loaded yet
  if (!user) {
    return null;
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfile = () => {
    navigate('/nurse-profile');
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    navigate('/nurse-settings');
    handleProfileMenuClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
    handleProfileMenuClose();
  };

  const markAsRead = async (notificationId) => {
    if (!user?._id && !user?.id) return;
    
    try {
      const userId = user._id || user.id;
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/patients/${userId}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {currentDate}
        </Typography>

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={handleNotificationOpen}
          sx={{
            mr: 2,
            '&:hover': {
              bgcolor: alpha('#fff', 0.1)
            }
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Profile Menu */}
        <IconButton
          onClick={handleProfileMenuOpen}
          sx={{
            '&:hover': {
              bgcolor: alpha('#fff', 0.1)
            }
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'white',
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          >
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'N'}
          </Avatar>
        </IconButton>

        {/* Profile Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.name || user?.email?.split('@')[0] || 'Nurse'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="error">Logout</Typography>
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              maxWidth: 360,
              maxHeight: 400,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem
                key={notification._id || notification.id}
                onClick={() => {
                  markAsRead(notification._id || notification.id);
                  handleNotificationClose();
                }}
                sx={{
                  whiteSpace: 'normal',
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.85rem',
                    sx: { mt: 0.5 }
                  }}
                />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText
                primary="No new notifications"
                primaryTypographyProps={{
                  textAlign: 'center',
                  color: 'text.secondary'
                }}
              />
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NurseHeader;
