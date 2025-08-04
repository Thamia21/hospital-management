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
  Tabs,
  Tab,
  Chip,
  Alert,
  Stack,
  Divider,
  Avatar,
  CircularProgress,
  Dialog,
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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { patientService } from '../../services/api';
// Removed imports for deleted components - using patient-specific versions instead


function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function PatientPortal() {
  const { user } = useAuth();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchPatientData();
    fetchAppointments();
    fetchBills();
  }, [user.uid]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch medical records
      try {
        const recordsData = await patientService.getMedicalRecords(user.uid);
        setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
      } catch (recordError) {
        console.error('Error fetching medical records:', recordError);
        setMedicalRecords([]);
      }

      // Fetch test results
      try {
        const testResultsData = await patientService.getTestResults(user.uid);
        setTestResults(Array.isArray(testResultsData) ? testResultsData : []);
      } catch (testError) {
        console.error('Error fetching test results:', testError);
        setTestResults([]);
      }

      // Fetch prescriptions
      try {
        const prescriptionsData = await patientService.getPrescriptions(user.uid);
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
      } catch (prescError) {
        console.error('Error fetching prescriptions:', prescError);
        setPrescriptions([]);
      }

    } catch (err) {
      console.error('Error in fetchPatientData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const appointmentsData = await patientService.getAppointments(user.uid);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  const fetchBills = async () => {
    try {
      const billsData = await patientService.getBills(user.uid);
      setBills(Array.isArray(billsData) ? billsData : []);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOpenBooking = (appointment = null) => {
    setSelectedAppointment(appointment);
    setOpenBooking(true);
  };

  const handleCloseBooking = () => {
    setOpenBooking(false);
    setSelectedAppointment(null);
    // Refresh appointments after booking
    fetchAppointments();
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await patientService.cancelAppointment(appointmentId);
      // Refresh appointments
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  const handleReschedule = (appointment) => {
    handleOpenBooking(appointment);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header and Stats */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white'
        }}
      >
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: theme.palette.secondary.main 
              }}
            >
              {user.displayName?.charAt(0) || 'P'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.name || user.displayName || (user.email && user.email.split('@')[0]) || 'Patient'}
            </Typography>
            <Typography variant="subtitle1">
              Your Health Dashboard
            </Typography>
          </Grid>
          <Grid item>
            {/* Notifications are not available in this version. */}
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.info.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Medical Records</Typography>
              <Typography variant="h3">{medicalRecords.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.success.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Test Results</Typography>
              <Typography variant="h3">{testResults.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.warning.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Prescriptions</Typography>
              <Typography variant="h3">{prescriptions.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.error.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Appointments</Typography>
              <Typography variant="h3">{appointments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Updated Tabs */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="patient portal tabs">
            <Tab 
              icon={<AssignmentIcon />} 
              label="Medical Records" 
              {...a11yProps(0)}
              sx={{ '& .MuiTab-iconWrapper': { mb: 1 } }}
            />
            <Tab 
              icon={<ScienceIcon />} 
              label="Test Results" 
              {...a11yProps(1)}
              sx={{ '& .MuiTab-iconWrapper': { mb: 1 } }}
            />
            <Tab 
              icon={<MedicationIcon />} 
              label="Prescriptions" 
              {...a11yProps(2)}
              sx={{ '& .MuiTab-iconWrapper': { mb: 1 } }}
            />
            <Tab 
              icon={<EventIcon />} 
              label="Appointments" 
              {...a11yProps(3)}
              sx={{ '& .MuiTab-iconWrapper': { mb: 1 } }}
            />
            <Tab 
              icon={<ReceiptIcon />} 
              label="Billing" 
              {...a11yProps(4)}
              sx={{ '& .MuiTab-iconWrapper': { mb: 1 } }}
            />
          </Tabs>
        </Box>

        {/* Medical Records Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            {medicalRecords.map((record) => (
              <Grid item xs={12} key={record.id}>
                <Card sx={{ 
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {record.diagnosis || 'General Checkup'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {record.description || 'No description available'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Date: {record.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Doctor: {record.doctorName || 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Test Results Tab */}
        <TabPanel value={value} index={1}>
          <Grid container spacing={3}>
            {testResults.map((test) => (
              <Grid item xs={12} key={test.id}>
                <Card sx={{ 
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {test.testName || 'Test Result'}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {test.result || 'Results pending'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Date: {test.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </Typography>
                      <Chip 
                        label={test.status || 'Completed'} 
                        color={test.status === 'Pending' ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Prescriptions Tab */}
        <TabPanel value={value} index={2}>
          <Grid container spacing={3}>
            {prescriptions.map((prescription) => (
              <Grid item xs={12} key={prescription.id}>
                <Card sx={{ 
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {prescription.medication || 'Medication'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Dosage: {prescription.dosage || 'N/A'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Instructions: {prescription.instructions || 'N/A'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Prescribed: {prescription.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Doctor: {prescription.doctorName || 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Appointments Tab */}
        <TabPanel value={value} index={3}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
              Your Appointments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your upcoming and past appointments
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EventIcon />}
              onClick={() => handleOpenBooking(null)}
              sx={{ mt: 2 }}
            >
              Book New Appointment
            </Button>
          </Box>

          <Grid container spacing={3}>
            {appointments.map((appointment) => (
              <Grid item xs={12} sm={6} key={appointment.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: 20,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: '50%',
                      padding: 1,
                      boxShadow: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 
                          appointment.status === 'Completed' ? theme.palette.success.main :
                          appointment.status === 'Cancelled' ? theme.palette.error.main :
                          theme.palette.primary.main,
                        width: 56,
                        height: 56
                      }}
                    >
                      <EventIcon />
                    </Avatar>
                  </Box>

                  <CardContent sx={{ pt: 5 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={appointment.status || 'Scheduled'} 
                        color={
                          appointment.status === 'Completed' ? 'success' :
                          appointment.status === 'Cancelled' ? 'error' :
                          'primary'
                        }
                        size="small"
                        sx={{ float: 'right' }}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                      Dr. {appointment.doctorName || 'N/A'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {appointment.doctorSpecialty || 'General Practice'}
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarMonth sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              {appointment.date?.toDate().toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
                            <Typography variant="body2">
                              {appointment.date?.toDate().toLocaleTimeString([], { 
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }) || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>

                  <Box sx={{ flexGrow: 1 }} />

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
                      <>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          sx={{ mr: 1 }}
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="primary"
                          onClick={() => handleOpenBooking(appointment)}
                        >
                          Reschedule
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}

            {appointments.length === 0 && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    px: 2,
                    backgroundColor: theme.palette.grey[50],
                    borderRadius: 2
                  }}
                >
                  <EventIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Appointments Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You don't have any appointments scheduled at the moment.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    startIcon={<EventIcon />}
                    onClick={() => handleOpenBooking(null)}
                  >
                    Book an Appointment
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel value={value} index={4}>
          <Grid container spacing={3}>
            {bills.map((bill) => (
              <Grid item xs={12} key={bill.id}>
                <Card sx={{ 
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Invoice #{bill.invoiceNumber || bill.id.slice(0, 8)}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      R{bill.amount?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {bill.description || 'Medical Services'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Date: {bill.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </Typography>
                      <Chip 
                        label={bill.status || 'Pending'} 
                        color={
                          bill.status === 'Paid' ? 'success' :
                          bill.status === 'Overdue' ? 'error' :
                          'warning'
                        }
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  {bill.status !== 'Paid' && (
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary"
                        startIcon={<PaymentIcon />}
                      >
                        Pay Now
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Box>
      <Dialog
        open={openBooking}
        onClose={handleCloseBooking}
        maxWidth="md"
        fullWidth
      >
        <BookAppointment 
          onClose={handleCloseBooking} 
          appointmentToReschedule={selectedAppointment}
        />
      </Dialog>
    </Box>
  );
}
