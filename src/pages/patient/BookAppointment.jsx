import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, set } from 'date-fns';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { doctorService, patientService, leaveService } from '../../services/api';

const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 17   // 5 PM
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [staffType, setStaffType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [leaveWarning, setLeaveWarning] = useState('');
  const [alternativeStaff, setAlternativeStaff] = useState([]);
  const [checkingLeave, setCheckingLeave] = useState(false);

  // Fetch available doctors
  const { 
    data: doctors = [], 
    isLoading: isLoadingDoctors,
    error: doctorsError
  } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const result = await doctorService.getDoctors();
      return result;
    },
    enabled: staffType === 'doctor',
    retry: 1,
    onError: (error) => {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  // Fetch available nurses
  const {
    data: nurses = [],
    isLoading: isLoadingNurses,
    error: nursesError
  } = useQuery({
    queryKey: ['nurses'],
    queryFn: async () => {
      const result = await doctorService.getNurses();
      return result;
    },
    enabled: staffType === 'nurse',
    retry: 1,
    onError: (error) => {
      console.error('Error fetching nurses:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  // Reset staff selection when staff type changes
  useEffect(() => {
    setSelectedStaff('');
  }, [staffType]);

  // Get available staff based on selected type
  const availableStaff = useMemo(() => {
    if (staffType === 'doctor') {
      return doctors;
    }
    if (staffType === 'nurse') {
      return nurses;
    }
    return [];
  }, [staffType, doctors, nurses]);

  // Handle errors
  useEffect(() => {
    if (doctorsError) {
      console.error('Doctors error:', doctorsError);
      setError('Failed to fetch doctors: ' + doctorsError.message);
    } else if (nursesError) {
      console.error('Nurses error:', nursesError);
      setError('Failed to fetch nurses: ' + nursesError.message);
    } else {
      setError('');
    }
  }, [doctorsError, nursesError]);

  // Fetch available time slots for selected staff and date
  const { 
    data: availableSlots, 
    isLoading: isLoadingTimeSlots 
  } = useQuery({
    queryKey: ['timeSlots', selectedStaff, selectedDate],
    queryFn: () => {
      if (!selectedStaff || !selectedDate) return [];
      return doctorService.getAvailableTimeSlots(
        selectedStaff, 
        selectedDate
      );
    },
    enabled: !!(selectedStaff && selectedDate),
    onError: (error) => {
      console.error('Failed to fetch time slots:', error);
      setError('Unable to load available time slots. Please try again.');
    }
  });

  // Mutation for booking appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: (appointmentData) => patientService.bookAppointment(appointmentData),
    onSuccess: (data) => {
      console.log('Appointment booked successfully:', data);
      navigate('/appointments', { 
        state: { 
          message: 'Appointment booked successfully!', 
          severity: 'success' 
        } 
      });
    },
    onError: (error) => {
      console.error('Appointment booking error:', error);
      setError(error.message || 'Failed to book appointment');
    }
  });

  // Check if selected staff is on leave and suggest alternatives
  const checkStaffAvailability = async (staffId, date) => {
    if (!staffId || !date) return;
    
    setCheckingLeave(true);
    setLeaveWarning('');
    setAlternativeStaff([]);
    
    try {
      // Check if staff is on leave
      const leaveCheck = await leaveService.checkStaffLeave(staffId, date.toISOString());
      
      if (leaveCheck.isOnLeave) {
        const leave = leaveCheck.leave;
        setLeaveWarning(
          `${leave.staffId.name} is on ${leave.leaveType.toLowerCase()} leave from ${format(new Date(leave.startDate), 'MMM dd')} to ${format(new Date(leave.endDate), 'MMM dd, yyyy')}.`
        );
        
        // Get alternative staff
        const alternatives = await leaveService.getAvailableStaff({
          date: date.toISOString(),
          staffType: staffType.toUpperCase(),
          specialization: staffType === 'doctor' ? doctors.find(d => d.id === staffId)?.specialization : undefined
        });
        
        setAlternativeStaff(alternatives.availableStaff || []);
      }
    } catch (error) {
      console.error('Error checking staff availability:', error);
    } finally {
      setCheckingLeave(false);
    }
  };

  // Check availability when staff or date changes
  useEffect(() => {
    if (selectedStaff && selectedDate) {
      checkStaffAvailability(selectedStaff, selectedDate);
    } else {
      setLeaveWarning('');
      setAlternativeStaff([]);
    }
  }, [selectedStaff, selectedDate, staffType, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedStaff || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    // Format date and time for API
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(selectedTime.getHours());
    appointmentDateTime.setMinutes(selectedTime.getMinutes());
    appointmentDateTime.setSeconds(0);
    appointmentDateTime.setMilliseconds(0);

    try {
      const appointmentData = {
        patientId: user.uid,
        date: appointmentDateTime.toISOString(),
        reason,
        status: 'PENDING',
        type: staffType.toUpperCase()
      };

      // Add the appropriate staff ID
      if (staffType === 'doctor') {
        appointmentData.doctorId = selectedStaff;
      } else if (staffType === 'nurse') {
        appointmentData.nurseId = selectedStaff;
      }

      console.log('Submitting appointment:', appointmentData);
      await bookAppointmentMutation.mutateAsync(appointmentData);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Failed to book appointment');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
          Book an Appointment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Schedule your appointment with our healthcare professionals
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {bookAppointmentMutation.isLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Processing your appointment request...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Staff Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Staff Type</InputLabel>
                <Select
                  value={staffType}
                  label="Staff Type"
                  onChange={(e) => setStaffType(e.target.value)}
                >
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Staff Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!staffType || isLoadingDoctors || isLoadingNurses}>
                <InputLabel>{staffType === 'doctor' ? 'Select Doctor' : 'Select Nurse'}</InputLabel>
                <Select
                  value={selectedStaff}
                  label={staffType === 'doctor' ? 'Select Doctor' : 'Select Nurse'}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  {availableStaff.map((staff) => (
                    <MenuItem 
                      key={staff.id} 
                      value={staff.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        py: 1
                      }}
                    >
                      <Typography variant="subtitle1">
                        {staff.firstName} {staff.lastName}
                      </Typography>
                      {staff.specialization && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {staff.specialization}
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Leave Warning and Alternative Staff */}
            {checkingLeave && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Checking staff availability...
                </Alert>
              </Grid>
            )}

            {leaveWarning && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Staff Unavailable:</strong> {leaveWarning}
                  </Typography>
                  {alternativeStaff.length > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Available Alternatives:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {alternativeStaff.map((staff) => (
                          <Button
                            key={staff._id}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedStaff(staff._id);
                              setLeaveWarning('');
                              setAlternativeStaff([]);
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            {staff.name} - {staff.specialization}
                          </Button>
                        ))}
                      </Box>
                    </>
                  )}
                </Alert>
              </Grid>
            )}

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!selectedStaff}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newDate) => {
                      setSelectedDate(newDate);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    minDate={new Date()} // Can't select past dates
                    renderInput={(params) => <TextField {...params} />}
                    shouldDisableDate={(date) => {
                      // Disable weekends
                      return date.getDay() === 0 || date.getDay() === 6;
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            {/* Time Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!selectedDate}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Select Time"
                    value={selectedTime}
                    onChange={setSelectedTime}
                    renderInput={(params) => <TextField {...params} />}
                    minTime={new Date(0, 0, 0, 9)} // 9 AM
                    maxTime={new Date(0, 0, 0, 17)} // 5 PM
                    minutesStep={30} // 30-minute intervals
                    shouldDisableTime={(time) => {
                      const hours = time.getHours();
                      const minutes = time.getMinutes();
                      // Disable lunch hour (12-1 PM)
                      if (hours === 12) return true;
                      // Only allow appointments on the hour and half hour
                      return minutes !== 0 && minutes !== 30;
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            {/* Reason for Visit */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Reason for Visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe your symptoms or reason for the appointment"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={!selectedStaff || !selectedDate || !selectedTime || !reason || bookAppointmentMutation.isLoading}
                startIcon={bookAppointmentMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {bookAppointmentMutation.isLoading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
