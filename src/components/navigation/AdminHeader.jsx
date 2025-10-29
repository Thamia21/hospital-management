import React, { useState, useEffect } from 'react';
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
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock notifications - replace with API call
    const mockNotifications = [
      {
        id: 1,
        title: 'New Staff Registration',
        message: 'Dr. Sarah Johnson has registered',
        time: '5 minutes ago',
        read: false,
        type: 'staff'
      },
      {
        id: 2,
        title: 'Leave Request',
        message: 'Dr. Michael Brown requested leave',
        time: '1 hour ago',
        read: false,
        type: 'leave'
      },
      {
        id: 3,
        title: 'System Alert',
        message: 'Database backup completed successfully',
        time: '2 hours ago',
        read: true,
        type: 'system'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElProfile(null);
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/admin/profile');
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate('/admin/dashboard');
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Hospital Management System
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* System Status */}
          <Chip
            label="System Online"
            size="small"
            sx={{
              bgcolor: alpha('#4caf50', 0.2),
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: 600
            }}
          />

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationsMenuOpen}
            sx={{
              '&:hover': { bgcolor: alpha('#fff', 0.1) }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              p: 0.5,
              '&:hover': { bgcolor: alpha('#fff', 0.1) }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha('#fff', 0.2),
                border: '2px solid white',
                fontWeight: 700
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorElProfile}
        open={Boolean(anchorElProfile)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 250,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {user?.name || 'Administrator'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || 'admin@hospital.com'}
          </Typography>
          <Chip
            label="System Administrator"
            size="small"
            sx={{ mt: 1, bgcolor: alpha('#667eea', 0.1), color: '#667eea' }}
          />
        </Box>
        <Divider />

        <MenuItem onClick={handleDashboardClick}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            color: 'error.main',
            '&:hover': { bgcolor: alpha('#f44336', 0.1) }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 360,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                bgcolor: notification.read ? 'transparent' : alpha('#667eea', 0.05),
                '&:hover': {
                  bgcolor: alpha('#667eea', 0.1)
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {notification.title}
                  </Typography>
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#667eea',
                        mt: 0.5
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </AppBar>
  );
};

export default AdminHeader;
