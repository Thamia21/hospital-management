import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  ListItemButton,
  MenuList,
  Paper,
  Popper,
  ClickAwayListener,
  Grow,
  Stack,
  Button
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const PatientHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  // Notification handlers
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    if (!user?.uid) return;
    
    try {
      // Try to mark as read via API
      await axios.put(
        `${API_URL}/patients/${user.uid}/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeader() }
      );
    } catch (error) {
      // If API doesn't exist, just update locally
      console.log('Notification API not implemented, updating locally');
    }
    
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    updateUnreadCount();
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await axios.put(
        `${API_URL}/patients/${user.uid}/notifications/read-all`,
        {},
        { headers: getAuthHeader() }
      );
    } catch (error) {
      console.log('Notification API not implemented, updating locally');
    }
    
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const updateUnreadCount = () => {
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  };

  const fetchNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await axios.get(
        `${API_URL}/patients/${user.uid}/notifications`,
        { headers: getAuthHeader() }
      );
      setNotifications(response.data || []);
    } catch (error) {
      // If API doesn't exist, use mock data
      if (error.response?.status === 404) {
        const mockNotifications = [
          {
            id: '1',
            type: 'appointment',
            title: 'Upcoming Appointment',
            message: 'You have an appointment with Dr. Smith tomorrow at 10:00 AM',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: 'high'
          },
          {
            id: '2',
            type: 'test_result',
            title: 'Test Results Available',
            message: 'Your blood test results are now available for review',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: 'medium'
          },
          {
            id: '3',
            type: 'billing',
            title: 'Payment Reminder',
            message: 'Your outstanding balance of R 450.00 is due in 3 days',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            priority: 'medium'
          },
          {
            id: '4',
            type: 'medication',
            title: 'Medication Reminder',
            message: 'Time to take your prescribed medication',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
            priority: 'high'
          },
          {
            id: '5',
            type: 'message',
            title: 'New Message',
            message: 'Dr. Johnson sent you a message about your treatment plan',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            read: true,
            priority: 'low'
          }
        ];
        setNotifications(mockNotifications);
      }
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
    }
  }, [user?.uid]);

  useEffect(() => {
    updateUnreadCount();
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <ScheduleIcon />;
      case 'test_result':
        return <MedicalIcon />;
      case 'billing':
        return <PaymentIcon />;
      case 'medication':
        return <MedicalIcon />;
      case 'message':
        return <MessageIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Don't render if user is not loaded yet
  if (!user) {
    return null;
  }

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'white' 
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ flexGrow: 1, color: 'primary.main' }}
        >
          Patient Portal
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton 
            color="inherit"
            onClick={handleMenuOpen}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main' 
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : <AccountCircleIcon />}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>

          {/* Notification Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 400,
                maxHeight: 500,
                overflow: 'auto'
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Notifications</Typography>
                {unreadCount > 0 && (
                  <Button 
                    size="small" 
                    onClick={markAllAsRead}
                    sx={{ textTransform: 'none' }}
                  >
                    Mark all as read
                  </Button>
                )}
              </Stack>
            </Box>
            
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification._id || notification.id || index}>
                    <ListItemButton
                      onClick={() => markAsRead(notification._id || notification.id)}
                      sx={{
                        backgroundColor: notification.read ? 'transparent' : 'action.hover',
                        '&:hover': {
                          backgroundColor: 'action.selected'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Box sx={{ 
                          color: notification.read ? 'text.secondary' : getNotificationColor(notification.priority) + '.main'
                        }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: notification.read ? 'normal' : 'bold',
                                color: notification.read ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(notification.timestamp)}
                              </Typography>
                              {!notification.read && (
                                <Box 
                                  sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main' 
                                  }} 
                                />
                              )}
                            </Stack>
                          </Stack>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: notification.read ? 'text.secondary' : 'text.primary',
                              mt: 0.5
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {notifications.length > 0 && (
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                <Button 
                  size="small" 
                  onClick={() => {
                    navigate('/patient-messages');
                    handleNotificationClose();
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  View All Messages
                </Button>
              </Box>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PatientHeader;
