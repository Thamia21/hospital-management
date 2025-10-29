import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../../services/api';

const NurseDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();

  // Fetch nurse appointments with React Query
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['nurseAppointments', user?._id || user?.id],
    queryFn: async () => {
      const nurseId = user._id || user.id;
      return await doctorService.getNurseAppointmentsMongo(nurseId);
    },
    enabled: !!(user?._id || user?.id),
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  // Calculate stats from appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate < tomorrow;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= tomorrow;
  });

  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING');
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED');

  const stats = {
    todayAppointments: todayAppointments.length,
    upcomingAppointments: upcomingAppointments.length,
    pendingAppointments: pendingAppointments.length,
    completedTotal: completedAppointments.length
  };

  if (appointmentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.name || 'Nurse'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your nursing dashboard overview for today
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.todayAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Today's Appointments
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.upcomingAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Upcoming Appointments
                  </Typography>
                </Box>
                <CalendarMonthIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.pendingAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Appointments
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.completedTotal}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed Total
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Schedule */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospitalIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Today's Schedule
              </Typography>
            </Box>
            <Chip
              label={`${todayAppointments.length} appointments`}
              color="primary"
              size="small"
            />
          </Box>

          {todayAppointments.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todayAppointments.map((appointment) => (
                <Paper
                  key={appointment._id || appointment.id}
                  sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Time
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {appointment.time || new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Patient
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {appointment.patientId?.name || 'Unknown Patient'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Reason
                        </Typography>
                        <Typography variant="body1">
                          {appointment.reason || 'General Consultation'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Chip
                        label={appointment.status || 'SCHEDULED'}
                        size="small"
                        sx={{
                          bgcolor: appointment.status === 'COMPLETED' ? '#4caf50' :
                                   appointment.status === 'PENDING' ? '#ff9800' : '#2196f3',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No appointments scheduled for today
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enjoy your day!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NurseDashboard;
