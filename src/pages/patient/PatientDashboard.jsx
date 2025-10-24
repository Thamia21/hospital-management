import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Stack,
  Divider,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LocalHospital,
  Science as ScienceIcon,
  Medication as MedicationIcon,
  Event as EventIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  CalendarMonth,
  AccessTime,
  Person as DoctorIcon,
  Notifications as NotificationsIcon,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

// Format currency as South African Rand
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentTestResults: [],
    activePrescriptions: [],
    unreadMessages: 0,
    pendingBills: [],
    healthSummary: {
      totalAppointments: 0,
      pendingTests: 0,
      activeMedications: 0,
      outstandingBalance: 0,
    },
  });

  useEffect(() => {
    console.log('PatientDashboard - User object:', user);
    if (user && (user.uid || user._id || user.id)) {
      console.log('PatientDashboard - User ID found, fetching data');
      fetchDashboardData();
    } else {
      console.log('PatientDashboard - No user ID found, user:', user);
      setLoading(false);
    }
  }, [user?.uid, user?._id, user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get the correct user ID
      const userId = user.uid || user._id || user.id;
      console.log('Fetching dashboard data for user:', userId);
      
      if (!userId) {
        console.error('No user ID available for fetching data');
        setLoading(false);
        return;
      }
      
      // Fetch data with proper error handling and defaults
      let upcomingAppointments = [];
      let activePrescriptions = [];
      let pendingBills = [];
      
      try {
        upcomingAppointments = await patientService.getAppointments(userId) || [];
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
      
      try {
        activePrescriptions = await patientService.getPrescriptions(userId) || [];
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      }
      
      try {
        pendingBills = await patientService.getBills(userId) || [];
      } catch (err) {
        console.error('Error fetching bills:', err);
      }
      
      // Mock recent test results for now (can be added to patientService later)
      const recentTestResults = [];

      setDashboardData({
        upcomingAppointments: Array.isArray(upcomingAppointments) ? upcomingAppointments : [],
        recentTestResults: Array.isArray(recentTestResults) ? recentTestResults : [],
        activePrescriptions: Array.isArray(activePrescriptions) ? activePrescriptions : [],
        unreadMessages: 0, // This would come from your message service
        pendingBills: Array.isArray(pendingBills) ? pendingBills : [],
        healthSummary: {
          totalAppointments: Array.isArray(upcomingAppointments) ? upcomingAppointments.length : 0,
          pendingTests: Array.isArray(recentTestResults) ? recentTestResults.filter(test => test.status === 'pending').length : 0,
          activeMedications: Array.isArray(activePrescriptions) ? activePrescriptions.length : 0,
          outstandingBalance: Array.isArray(pendingBills) ? pendingBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) : 0,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty state on error
      setDashboardData({
        upcomingAppointments: [],
        recentTestResults: [],
        activePrescriptions: [],
        unreadMessages: 0,
        pendingBills: [],
        healthSummary: {
          totalAppointments: 0,
          pendingTests: 0,
          activeMedications: 0,
          outstandingBalance: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const QuickActionCard = ({ title, description, icon, color, onClick, badge }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              mx: 'auto',
            }}
          >
            {icon}
          </Avatar>
          {badge && (
            <Badge
              badgeContent={badge}
              color="error"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
              }}
            />
          )}
        </Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const SummaryCard = ({ title, value, icon, color, trend }) => (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <Avatar sx={{ bgcolor: color, width: 40, height: 40, mr: 1 }}>
          {icon}
        </Avatar>
        {trend && (
          <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
        )}
      </Box>
      <Typography variant="h4" color={color} gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Please log in to view your dashboard
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText', position: 'relative' }}>
        {/* Language Selector */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <LanguageSelector variant="chip" size="small" />
        </Box>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.welcome', 'Welcome')}, {user?.name || t('demo.patient', 'Patient')}!
        </Typography>
        <Typography variant="body1">
          {t('dashboard.overview', "Here's an overview of your health information and upcoming activities.")}
        </Typography>
      </Paper>

      {/* Health Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title={t('dashboard.upcomingAppointments', 'Upcoming Appointments')}
            value={dashboardData.healthSummary.totalAppointments}
            icon={<EventIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title={t('dashboard.activeMedications', 'Active Medications')}
            value={dashboardData.healthSummary.activeMedications}
            icon={<MedicationIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title={t('dashboard.pendingTests', 'Pending Tests')}
            value={dashboardData.healthSummary.pendingTests}
            icon={<ScienceIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title={t('dashboard.outstandingBalance', 'Outstanding Balance')}
            value={formatCurrency(dashboardData.healthSummary.outstandingBalance)}
            icon={<PaymentIcon />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {t('dashboard.quickActions', 'Quick Actions')}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title={t('quickActions.bookAppointment', 'Book Appointment')}
            description={t('quickActions.bookAppointmentDesc', 'Schedule a new appointment with your healthcare provider')}
            icon={<CalendarMonth />}
            color="primary.main"
            onClick={() => navigate('/book-appointment')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title={t('quickActions.messages', 'Messages')}
            description={t('quickActions.messagesDesc', 'View and send messages to your healthcare team')}
            icon={<MessageIcon />}
            color="info.main"
            badge={dashboardData.unreadMessages > 0 ? dashboardData.unreadMessages : null}
            onClick={() => navigate('/messages')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title={t('quickActions.testResults', 'View Test Results')}
            description={t('quickActions.testResultsDesc', 'Check your latest lab results and reports')}
            icon={<ScienceIcon />}
            color="success.main"
            onClick={() => navigate('/test-results')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title={t('quickActions.prescriptions', 'Prescriptions')}
            description={t('quickActions.prescriptionsDesc', 'Manage your current medications and refills')}
            icon={<MedicationIcon />}
            color="warning.main"
            onClick={() => navigate('/patient-prescriptions')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title={t('quickActions.medicalRecords', 'Medical Records')}
            description={t('quickActions.medicalRecordsDesc', 'Access your complete medical history')}
            icon={<AssignmentIcon />}
            color="secondary.main"
            onClick={() => navigate('/medical-records')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title={t('quickActions.billing', 'Billing & Payments')}
            description={t('quickActions.billingDesc', 'View bills and make payments online')}
            icon={<ReceiptIcon />}
            color="error.main"
            badge={dashboardData.pendingBills.length > 0 ? dashboardData.pendingBills.length : null}
            onClick={() => navigate('/patient-billing')}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 1 }} />
              {t('dashboard.upcomingAppointments', 'Upcoming Appointments')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData.upcomingAppointments.length > 0 ? (
              <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                <List>
                  {dashboardData.upcomingAppointments.slice(0, 5).map((appointment, index) => (
                    <ListItem key={appointment._id || appointment.id || index} divider>
                      <ListItemIcon>
                        <Schedule color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Dr. ${appointment.doctorName || 'TBD'}`}
                        secondary={`${new Date(appointment.date).toLocaleDateString()} at ${appointment.time || 'TBD'}`}
                      />
                      <Chip
                        label={appointment.status}
                        color="primary"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                {t('dashboard.noUpcomingAppointments', 'No upcoming appointments')}
              </Typography>
            )}
            {dashboardData.upcomingAppointments.length > 5 && (
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate('/appointments')}
              >
                {t('dashboard.viewAllAppointments', 'View All Appointments')}
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Recent Test Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ScienceIcon sx={{ mr: 1 }} />
              {t('dashboard.recentTestResults', 'Recent Test Results')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData.recentTestResults.length > 0 ? (
              <List>
                {dashboardData.recentTestResults.map((result, index) => (
                  <ListItem key={result._id || result.id || index} divider>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.testName}
                      secondary={result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Date not available'}
                    />
                    <Chip 
                      label={result.status} 
                      color={result.status === 'completed' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                {t('dashboard.noRecentTestResults', 'No recent test results')}
              </Typography>
            )}
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/test-results')}
            >
              {t('dashboard.viewAllResults', 'View All Results')}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Health Tips or Notifications */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          {t('dashboard.healthReminders', 'Health Reminders')}
        </Typography>
        <Stack spacing={1}>
          <Alert severity="info">
            {t('dashboard.medicationReminder', 'Remember to take your daily medications as prescribed.')}
          </Alert>
          {dashboardData.upcomingAppointments.length > 0 && (
            <Alert severity="warning">
              {t('dashboard.appointmentReminder', 'You have {{count}} upcoming appointment(s) this week.').replace('{{count}}', dashboardData.upcomingAppointments.length)}
            </Alert>
          )}
          {dashboardData.pendingBills.length > 0 && (
            <Alert severity="error">
              {t('dashboard.billReminder', 'You have {{count}} pending bill(s) that require attention.').replace('{{count}}', dashboardData.pendingBills.length)}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
