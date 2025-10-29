import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  LinearProgress,
  CircularProgress,
  Divider,
  Alert,
  Badge,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarTodayIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time appointment fetching with React Query
  const { 
    data: appointments = [], 
    isLoading: appointmentsLoading, 
    error: appointmentsError,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['doctorAppointments', user?._id, refreshKey],
    queryFn: () => doctorService.getDoctorAppointmentsMongo(user?._id),
    enabled: !!user?._id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true
  });

  // Dashboard stats
  const { 
    data: dashboardStats, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['doctorStats', user?._id],
    queryFn: () => doctorService.getDoctorDashboardStats(user?._id),
    enabled: !!user?._id,
    refetchInterval: 60000 // Refetch every minute
  });

  // Helper functions
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchAppointments();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'scheduled': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <AccessTimeIcon />;
      case 'scheduled': return <EventNoteIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'cancelled': return <WarningIcon />;
      default: return <EventNoteIcon />;
    }
  };

  const formatAppointmentTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatAppointmentDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'prescription': return <LocalPharmacyIcon />;
      case 'consultation': return <PeopleIcon />;
      case 'lab_review': return <AssignmentIcon />;
      case 'appointment': return <EventNoteIcon />;
      default: return <NotificationsIcon />;
    }
  };

  // Mock recent activities data
  const recentActivities = [
    {
      id: 1,
      type: 'prescription',
      action: 'Prescribed medication',
      patient: 'Sarah Johnson',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'lab_review',
      action: 'Reviewed lab results',
      patient: 'Michael Brown',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'consultation',
      action: 'Completed consultation',
      patient: 'Emily Davis',
      time: '6 hours ago'
    }
  ];

  // Filter appointments by status
  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments.filter(apt => {
    const now = new Date();
    const aptDate = new Date(apt.date);
    return aptDate > now;
  });

  const pendingAppointments = appointments.filter(apt => 
    apt.status?.toLowerCase() === 'pending'
  );

  const quickActions = [
    {
      title: t('quickActions.newAppointment', 'Schedule Appointment'),
      description: t('quickActions.newAppointmentDesc', 'Schedule a new patient appointment'),
      icon: <CalendarTodayIcon />,
      color: '#1976d2',
      path: '/doctor-appointments'
    },
    {
      title: t('quickActions.viewPatients', 'View Patients'),
      description: t('quickActions.viewPatientsDesc', 'Access patient records and history'),
      icon: <PeopleIcon />,
      color: '#2e7d32',
      path: '/doctor-patients'
    },
    {
      title: t('quickActions.prescriptions', 'Write Prescription'),
      description: t('quickActions.prescriptionsDesc', 'Create new prescriptions'),
      icon: <LocalPharmacyIcon />,
      color: '#9c27b0',
      path: '/doctor-prescriptions'
    },
    {
      title: t('quickActions.reports', 'Medical Reports'),
      description: t('quickActions.reportsDesc', 'Review and create medical reports'),
      icon: <AssignmentIcon />,
      color: '#d32f2f',
      path: '/doctor-reports'
    }
  ];

  const formatTime = (time) => {
    return new Date(`2024-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };



  // Loading state
  if (appointmentsLoading && statsLoading) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading dashboard data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Error Alert */}
      {appointmentsError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Error loading appointments: {appointmentsError.message}. Please refresh to try again.
        </Alert>
      )}
      
      {/* Welcome Header with Refresh */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {t('dashboard.welcome', 'Welcome back')}, Dr. {user?.name || 'Doctor'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.overview', 'Here\'s your medical practice overview for today.')}
          </Typography>
        </Box>
        <Tooltip title="Refresh appointments">
          <IconButton 
            onClick={handleRefresh} 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {todayAppointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('dashboard.todayAppointments', 'Today\'s Appointments')}
                  </Typography>
                </Box>
                <EventNoteIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {upcomingAppointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('dashboard.upcomingAppointments', 'Upcoming Appointments')}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {pendingAppointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('dashboard.pendingAppointments', 'Pending Appointments')}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {appointments.filter(apt => apt.status?.toLowerCase() === 'completed').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t('dashboard.completedTotal', 'Completed Total')}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('dashboard.todaySchedule', 'Today\'s Schedule')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CalendarTodayIcon />}
                onClick={() => navigate('/doctor-appointments')}
              >
                {t('dashboard.viewAll', 'View All')}
              </Button>
            </Box>
            
            {appointmentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : todayAppointments.length > 0 ? (
              <List>
                {todayAppointments.map((appointment, index) => (
                  <React.Fragment key={appointment._id}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                        border: '1px solid rgba(25, 118, 210, 0.1)'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getStatusColor(appointment.status) }}>
                          {getStatusIcon(appointment.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Box component="span" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {appointment.patientId?.name ||
                               (appointment.patientId && typeof appointment.patientId === 'object' && appointment.patientId.email) ||
                               (typeof appointment.patientId === 'string' ? appointment.patientId : 'Patient')}
                            </Box>
                            <Chip 
                              label={appointment.status}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(appointment.status),
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Box component="span" sx={{ display: 'block', fontSize: '0.875rem', color: 'text.secondary' }}>
                              {formatAppointmentTime(appointment.date)} • {formatAppointmentDate(appointment.date)}
                            </Box>
                            <Box component="span" sx={{ display: 'block', fontSize: '0.875rem', color: 'text.secondary', mt: 0.5 }}>
                              <strong>Reason:</strong> {appointment.reason}
                            </Box>
                            {appointment.patientId?.email && (
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <EmailIcon sx={{ fontSize: 14 }} />
                                <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                  {appointment.patientId.email}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {appointment.patientId?.phone && (
                          <Tooltip title="Call patient">
                            <IconButton size="small" color="primary">
                              <PhoneIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => navigate(`/doctor-patients/${appointment.patientId?._id}`)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < todayAppointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {t('dashboard.noAppointments', 'No appointments scheduled for today')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions & Recent Activity */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('dashboard.quickActions', 'Quick Actions')}
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ color: action.color, mb: 1 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {action.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('dashboard.recentActivity', 'Recent Activity')}
            </Typography>
            {recentActivities && recentActivities.length > 0 ? (
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2', width: 32, height: 32 }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.patient} • {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {t('dashboard.noRecentActivity', 'No recent activity')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
