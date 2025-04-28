import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  EventAvailable as EventIcon,
  Person as DoctorIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const steps = ['Select Doctor', 'Choose Date & Time', 'Confirm Booking'];

export default function BookAppointment({ onClose, appointmentToReschedule }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [appointmentData, setAppointmentData] = useState({
    doctorId: appointmentToReschedule?.doctorId || '',
    selectedDoctor: null,
    date: appointmentToReschedule?.date?.toDate() || null,
    time: appointmentToReschedule?.date?.toDate() || null,
    reason: appointmentToReschedule?.reason || ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Pre-fill data if rescheduling
    if (appointmentToReschedule && doctors.length > 0) {
      const selectedDoc = doctors.find(d => d.id === appointmentToReschedule.doctorId);
      if (selectedDoc) {
        setAppointmentData(prev => ({
          ...prev,
          selectedDoctor: selectedDoc
        }));
      }
    }
  }, [appointmentToReschedule, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const doctorsQuery = query(collection(db, 'doctors'));
      const doctorsSnapshot = await getDocs(doctorsQuery);
      const doctorsData = doctorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoctors(doctorsData);
    } catch (err) {
      setError('Error fetching doctors. Please try again.');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    console.log('Current step:', activeStep); // Debug log
    console.log('Current appointment data:', appointmentData); // Debug log
    
    if (activeStep === 0) {
      if (!appointmentData.selectedDoctor) {
        setError('Please select a doctor');
        return;
      }
    } else if (activeStep === 1) {
      if (!appointmentData.date || !appointmentData.time) {
        setError('Please select both date and time');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    setError(null);
  };

  const handleDoctorSelect = (doctor) => {
    console.log('Selected doctor:', doctor); // Debug log
    setAppointmentData(prev => ({
      ...prev,
      doctorId: doctor.id,
      selectedDoctor: doctor
    }));
  };

  const handleDateChange = (newDate) => {
    setAppointmentData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const handleTimeChange = (newTime) => {
    setAppointmentData(prev => ({
      ...prev,
      time: newTime
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Combine date and time
      const appointmentDateTime = new Date(appointmentData.date);
      const timeDate = new Date(appointmentData.time);
      appointmentDateTime.setHours(timeDate.getHours());
      appointmentDateTime.setMinutes(timeDate.getMinutes());

      const newAppointmentData = {
        patientId: user.uid,
        patientName: user.displayName || 'Patient',
        doctorId: appointmentData.selectedDoctor.id,
        doctorName: `Dr. ${appointmentData.selectedDoctor.firstName} ${appointmentData.selectedDoctor.lastName}`,
        date: appointmentDateTime,
        time: format(appointmentDateTime, 'HH:mm'),
        type: 'Regular Checkup',
        status: 'PENDING',
        reason: appointmentData.reason,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (appointmentToReschedule) {
        // Update existing appointment
        const appointmentRef = doc(db, 'appointments', appointmentToReschedule.id);
        await updateDoc(appointmentRef, {
          ...newAppointmentData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new appointment
        const appointmentRef = collection(db, 'appointments');
        await addDoc(appointmentRef, newAppointmentData);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(appointmentToReschedule ? 'Error rescheduling appointment. Please try again.' : 'Error booking appointment. Please try again.');
      console.error('Error with appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {doctors.map((doctor) => (
              <Grid item xs={12} sm={6} key={doctor.id}>
                <Card 
                  onClick={() => handleDoctorSelect(doctor)}
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    transform: appointmentData.selectedDoctor?.id === doctor.id ? 'scale(1.02)' : 'scale(1)',
                    border: appointmentData.selectedDoctor?.id === doctor.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                    bgcolor: appointmentData.selectedDoctor?.id === doctor.id ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 3,
                      bgcolor: appointmentData.selectedDoctor?.id === doctor.id ? 'action.selected' : 'action.hover',
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: appointmentData.selectedDoctor?.id === doctor.id ? 
                            theme.palette.primary.dark : theme.palette.primary.main,
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        <DoctorIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.specialty}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" paragraph>
                      {doctor.description || 'Experienced healthcare professional dedicated to patient care.'}
                    </Typography>
                    <Chip 
                      label={doctor.specialty} 
                      color={appointmentData.selectedDoctor?.id === doctor.id ? "primary" : "default"}
                      variant={appointmentData.selectedDoctor?.id === doctor.id ? "filled" : "outlined"}
                      size="small" 
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Appointment Date"
                  value={appointmentData.date}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={new Date()}
                  disablePast
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Appointment Time"
                  value={appointmentData.time}
                  onChange={handleTimeChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Visit"
                  multiline
                  rows={4}
                  value={appointmentData.reason}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 2:
        return (
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Appointment Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DoctorIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>
                    Dr. {appointmentData.selectedDoctor?.firstName} {appointmentData.selectedDoctor?.lastName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>
                    {appointmentData.date?.toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>
                    {appointmentData.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Reason for Visit: {appointmentData.reason}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, textAlign: 'center' }}>
        {appointmentToReschedule ? 'Reschedule Appointment' : 'Book an Appointment'}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success ? (
        <Alert 
          icon={<CheckIcon fontSize="inherit" />} 
          severity="success"
          sx={{ mb: 3 }}
        >
          {appointmentToReschedule ? 'Appointment rescheduled successfully!' : 'Appointment booked successfully!'}
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Box>
              <Button
                onClick={onClose}
                variant="outlined"
                color="secondary"
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={
                  loading || 
                  (activeStep === 0 && !appointmentData.selectedDoctor) ||
                  (activeStep === 1 && (!appointmentData.date || !appointmentData.time))
                }
              >
                {activeStep === steps.length - 1 
                  ? (appointmentToReschedule ? 'Reschedule' : 'Book Appointment') 
                  : 'Next'}
              </Button>
            </Box>
          </Box>
        </>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption">
          Debug: Step: {activeStep}, 
          Doctor Selected: {appointmentData.selectedDoctor ? 'Yes' : 'No'}, 
          Doctor ID: {appointmentData.doctorId}
        </Typography>
      </Box>
    </Box>
  );
}
