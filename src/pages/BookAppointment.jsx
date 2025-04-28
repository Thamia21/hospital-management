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
import { useAuth } from '../context/AuthContext';
import { doctorService, patientService } from '../services/api';

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

  // Fetch available doctors
  const { 
    data: doctors = [], 
    isLoading: isLoadingDoctors,
    error: doctorsError
  } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getDoctors(),
    enabled: staffType === 'doctor'
  });

  // Fetch available nurses
  const {
    data: nurses = [],
    isLoading: isLoadingNurses,
    error: nursesError
  } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => doctorService.getNurses(),
    enabled: staffType === 'nurse'
  });

  // Reset staff selection when staff type changes
  useEffect(() => {
    setSelectedStaff('');
  }, [staffType]);

  // Get available staff based on selected type
  const availableStaff = useMemo(() => {
    console.log('Staff type changed:', staffType);
    console.log('Current doctors data:', doctors?.map(d => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
      department: d.department,
      specialization: d.specialization,
      allFields: Object.keys(d)
    })));
    console.log('Current nurses data:', nurses?.map(n => ({
      id: n.id,
      name: `${n.firstName} ${n.lastName}`,
      specialization: n.specialization,
      licenseNumber: n.nursingLicenseNumber,
      allFields: Object.keys(n)
    })));
    
    if (staffType === 'doctor') {
      console.log('Returning doctors with fields:', doctors);
      return doctors;
    }
    if (staffType === 'nurse') {
      console.log('Returning nurses with fields:', nurses);
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
    onSuccess: () => {
      navigate('/patient-portal', { 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedStaff || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    const appointmentDate = set(selectedDate, {
      hours: selectedTime.getHours(),
      minutes: selectedTime.getMinutes()
    });

    try {
      await bookAppointmentMutation.mutateAsync({
        patientId: user.uid,
        [staffType + 'Id']: selectedStaff,
        date: appointmentDate,
        reason,
        status: 'PENDING',
        type: staffType.toUpperCase()
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Book an Appointment
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
                disabled={!selectedStaff || !selectedDate || !selectedTime || !reason}
              >
                Book Appointment
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
