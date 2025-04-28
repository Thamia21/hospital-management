import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Button,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocalHospital as LocalHospitalIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/api';

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ textAlign: 'center', color: `${color}.main` }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Appointment Item Component
const AppointmentItem = ({ appointment }) => {
  const appointmentTime = appointment.time instanceof Date 
    ? format(appointment.time, 'h:mm a')
    : typeof appointment.time === 'string'
      ? format(parseISO(`2000-01-01T${appointment.time}`), 'h:mm a')
      : format(appointment.time.toDate(), 'h:mm a');

  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {appointment.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {appointmentTime}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {appointment.type} - {appointment.patientPhone}
              </Typography>
              {appointment.status === 'COMPLETED' && (
                <Chip size="small" label="Completed" color="success" />
              )}
              {appointment.status === 'CANCELLED' && (
                <Chip size="small" label="Cancelled" color="error" />
              )}
              {appointment.status === 'PENDING' && (
                <Chip size="small" label="Pending" color="warning" />
              )}
            </Box>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch dashboard stats
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['doctorDashboard', user?.uid],
    queryFn: () => doctorService.getDoctorDashboardStats(user?.uid),
    enabled: !!user?.uid
  });

  // Fetch appointments
  const { data: appointments = {}, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['doctorAppointments', user?.uid],
    queryFn: () => doctorService.getDoctorAppointments(user?.uid),
    enabled: !!user?.uid
  });

  const isLoading = statsLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Get today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments[today] || [];
  const upcomingAppointments = todayAppointments.filter(apt => 
    apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Message */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, Dr. {dashboardData?.doctorName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Patients"
            value={todayAppointments.length}
            icon={<PersonIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completed"
            value={dashboardData?.stats.completedToday || 0}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending"
            value={dashboardData?.stats.pendingToday || 0}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Cancelled"
            value={dashboardData?.stats.cancelledToday || 0}
            icon={<CancelIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Today's Schedule
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={() => navigate('/appointments')}
              >
                View All
              </Button>
            </Box>
            {upcomingAppointments.length > 0 ? (
              <List sx={{ bgcolor: 'background.paper' }}>
                {upcomingAppointments.map((appointment) => (
                  <AppointmentItem key={appointment.id} appointment={appointment} />
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No more appointments scheduled for today
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Weekly Overview
            </Typography>
            
            {/* Patient Load */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Patient Load
                </Typography>
                <Typography variant="body2" color="primary">
                  {dashboardData?.stats.weeklyPatientLoad || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData?.stats.weeklyPatientLoad || 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Satisfaction Rate */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Satisfaction Rate
                </Typography>
                <Typography variant="body2" color="success.main">
                  {dashboardData?.stats.satisfactionRate || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData?.stats.satisfactionRate || 0}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Recent Notifications */}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Recent Notifications
            </Typography>
            <List dense>
              {(dashboardData?.recentNotifications || []).map((notification, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
