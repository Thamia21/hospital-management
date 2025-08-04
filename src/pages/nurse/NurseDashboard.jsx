import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Avatar,
  Badge,
  Paper,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  CircularProgress,
  Backdrop,
  Menu,
  MenuItem,
  Container
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  LocalHospital as LocalHospitalIcon,
  CalendarMonth as CalendarMonthIcon,
  MedicalInformation as MedicalInformationIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../../services/api';

import './NurseDashboard.css';

const drawerWidth = 240;

const NurseDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const { user, logout } = useAuth();
  const [nurseData, setNurseData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'NURSE') {
      navigate('/unauthorized');
      return;
    }

    const fetchNurseData = async () => {
      try {
        setLoading(true);
        // Get nurse profile
        const nurseRef = doc(db, 'users', user.uid);
        const nurseDoc = await getDoc(nurseRef);
        const nurseProfile = nurseDoc.data();

        setNurseData({
          displayName: nurseProfile?.displayName || 
            (nurseProfile?.firstName && nurseProfile?.lastName 
              ? `${nurseProfile.firstName} ${nurseProfile.lastName}` 
              : user.email.split('@')[0]),
          role: nurseProfile?.position || 'Nurse',
          avatar: (nurseProfile?.firstName?.[0] || user.email[0])?.toUpperCase()
        });

        // Fetch statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get total patients
        const patientsQuery = query(collection(db, 'users'), where('role', '==', 'PATIENT'));
        const patientsSnapshot = await getDocs(patientsQuery);
        
        // Get today's appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'), 
          where('date', '>=', today),
          where('date', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000))
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const todayAppointments = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(todayAppointments);

        // Get tasks
        const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', user.uid));
        const tasksSnapshot = await getDocs(tasksQuery);
        const nurseTasks = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(nurseTasks);
        
        setStats({
          totalPatients: patientsSnapshot.size,
          todayAppointments: todayAppointments.length,
          completedTasks: nurseTasks.filter(task => task.status === 'completed').length,
          pendingTasks: nurseTasks.filter(task => task.status === 'pending').length
        });

      } catch (error) {
        console.error('Error fetching nurse data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          where('read', '==', false),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        setNotifications(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNurseData();
    fetchNotifications();
  }, [user, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/nurse-dashboard' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
    { text: 'Appointments', icon: <CalendarMonthIcon />, path: '/appointments' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
    { text: 'Medical Records', icon: <MedicalInformationIcon />, path: '/records' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const renderSidebar = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <LocalHospitalIcon color="primary" sx={{ fontSize: 30 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Nurse Portal
        </Typography>
        <IconButton
          color="inherit"
          onClick={handleNotificationClick}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{nurseData?.avatar || 'N'}</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {nurseData?.displayName || 'Loading...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {nurseData?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
                '& .MuiListItemText-primary': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              '& .MuiListItemIcon-root': { color: 'error.main' },
              '& .MuiListItemText-primary': { color: 'error.main' }
            }
          }}
        >
          <ListItemIcon>
            <ExitToAppIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box className="nurse-dashboard">
      {/* Mobile Drawer */}
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onOpen={() => setMobileOpen(true)}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {renderSidebar}
      </SwipeableDrawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
        open
      >
        {renderSidebar}
      </Drawer>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            maxHeight: 300,
            width: '300px',
            mt: 1
          }
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              onClick={() => {
                markNotificationAsRead(notification.id);
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
                secondaryTypographyProps={{
                  sx: { 
                    fontSize: '0.875rem',
                    mt: 0.5
                  }
                }}
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <ListItemText primary="No new notifications" />
          </MenuItem>
        )}
      </Menu>

      {/* Main Content */}
      <Box className="nurse-dashboard__main">
        <Toolbar />
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 4, md: 6 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box className="nurse-dashboard__content">
              <Box className="nurse-dashboard__header">
                <Typography variant="h4" gutterBottom className="nurse-dashboard__title">
                  Hospital Management System
                </Typography>
                <Typography variant="h5" className="nurse-dashboard__welcome">
                  Welcome, {nurseData?.displayName || 'Nurse'}
                </Typography>
              </Box>

              <div className="nurse-dashboard__stats-container">
                <Paper
                  elevation={2}
                  className="nurse-dashboard__stats-card"
                  sx={{ bgcolor: 'primary.main', color: 'white' }}
                >
                  <Typography className="nurse-dashboard__stats-title">
                    Total Patients
                  </Typography>
                  <Typography className="nurse-dashboard__stats-value">
                    {stats.totalPatients}
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  className="nurse-dashboard__stats-card"
                  sx={{ bgcolor: 'secondary.main', color: 'white' }}
                >
                  <Typography className="nurse-dashboard__stats-title">
                    Today's Appointments
                  </Typography>
                  <Typography className="nurse-dashboard__stats-value">
                    {stats.todayAppointments}
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  className="nurse-dashboard__stats-card"
                  sx={{ bgcolor: 'success.main', color: 'white' }}
                >
                  <Typography className="nurse-dashboard__stats-title">
                    Tasks Completed
                  </Typography>
                  <Typography className="nurse-dashboard__stats-value">
                    {stats.completedTasks}
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  className="nurse-dashboard__stats-card"
                  sx={{ bgcolor: 'warning.main', color: 'white' }}
                >
                  <Typography className="nurse-dashboard__stats-title">
                    Pending Tasks
                  </Typography>
                  <Typography className="nurse-dashboard__stats-value">
                    {stats.pendingTasks}
                  </Typography>
                </Paper>
              </div>

              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ boxShadow: 3, height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Today's Appointments
                        </Typography>
                        <EventIcon color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {appointments.length > 0 ? (
                          appointments.slice(0, 3).map((appointment) => (
                            <Paper key={appointment.id} sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Typography>
                                {new Date(appointment.date.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appointment.patientName}
                              </Typography>
                            </Paper>
                          ))
                        ) : (
                          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No appointments scheduled for today
                          </Typography>
                        )}
                      </Box>
                      <Button variant="outlined" color="primary" sx={{ mt: 2 }} fullWidth>
                        View All Appointments
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card sx={{ boxShadow: 3, height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Recent Tasks
                        </Typography>
                        <AssignmentIcon color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tasks.length > 0 ? (
                          tasks.slice(0, 3).map((task) => (
                            <Paper key={task.id} sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Typography>
                                {task.description} - Room {task.room}
                              </Typography>
                            </Paper>
                          ))
                        ) : (
                          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No tasks assigned
                          </Typography>
                        )}
                      </Box>
                      <Button variant="outlined" color="primary" sx={{ mt: 2 }} fullWidth>
                        View All Tasks
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default NurseDashboard;
