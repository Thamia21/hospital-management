import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { getDoctors } from '../../services/firebaseService';
import { createAppointment } from '../../services/firebaseService';

const appointmentTypes = [
  'Check-up',
  'Follow-up',
  'Consultation',
  'Emergency',
  'Surgery',
  'Vaccination'
];

const AppointmentForm = ({ open, onClose, appointment = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(
    appointment || {
      patientName: '',
      doctorName: '',
      department: '',
      date: null,
      time: '',
      type: '',
      notes: '',
      doctorId: '',
      reason: '',
    }
  );

  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch doctors from Firebase
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsList = await getDoctors();
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again.');
      }
    };
    fetchDoctors();
  }, []);

  // Generate available time slots
  useEffect(() => {
    const generateTimeSlots = () => {
      const slots = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      const interval = 30; // 30 minutes

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const time = format(
            new Date().setHours(hour, minute),
            'h:mm a'
          );
          slots.push(time);
        }
      }
      setAvailableTimes(slots);
    };

    generateTimeSlots();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const appointmentData = {
        patientId: user.uid,
        doctorId: formData.doctorId,
        date: format(formData.date, 'yyyy-MM-dd'),
        time: formData.time,
        reason: formData.reason,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      await createAppointment(appointmentData);
      alert('Appointment scheduled successfully!');
      
      setFormData({
        patientName: '',
        doctorName: '',
        department: '',
        date: null,
        time: '',
        type: '',
        notes: '',
        doctorId: '',
        reason: '',
      });
      onClose();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => setError(null)}>
          Try Again
        </Button>
      </Paper>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {appointment ? 'Edit Appointment' : 'New Appointment'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Doctor</InputLabel>
                <Select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {`Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty || 'General Physician'}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Appointment Type"
                  required
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" required />
                  )}
                  minDate={new Date()}
                  disablePast
                  disabled={loading}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Time</InputLabel>
                <Select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {availableTimes.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="reason"
                label="Reason for Visit"
                value={formData.reason}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Scheduling...' : (appointment ? 'Update' : 'Create')} Appointment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;
