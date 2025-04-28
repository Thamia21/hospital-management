import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addHours, format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'routine_check', label: 'Routine Check' }
];

export default function DoctorAddAppointment({ 
  open, 
  onClose, 
  doctorId, 
  doctorName 
}) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: null,
    patientName: '',
    appointmentType: '',
    startTime: new Date(),
    duration: 30, // Default 30 minutes
    notes: ''
  });

  // Fetch patients for autocomplete
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef);
        const querySnapshot = await getDocs(q);
        
        const patientList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPatients(patientList);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      patientId: newValue ? newValue.id : null,
      patientName: newValue ? newValue.firstName + ' ' + newValue.lastName : ''
    }));
  };

  const handleTimeChange = (newTime) => {
    setFormData(prev => ({
      ...prev,
      startTime: newTime
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate form data
      const { 
        patientId, 
        appointmentType, 
        startTime, 
        duration, 
        notes 
      } = formData;

      if (!patientId || !appointmentType) {
        throw new Error('Please select a patient and appointment type');
      }

      // Calculate end time
      const endTime = addHours(startTime, duration / 60);

      // Check for scheduling conflicts
      const appointmentsRef = collection(db, 'appointments');
      const conflictQuery = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        where('startTime', '<', endTime),
        where('endTime', '>', startTime)
      );

      const conflictSnapshot = await getDocs(conflictQuery);
      if (!conflictSnapshot.empty) {
        throw new Error('Time slot is already booked');
      }

      // Create appointment
      await addDoc(appointmentsRef, {
        patientId,
        patientName: formData.patientName,
        doctorId,
        doctorName,
        appointmentType,
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        duration,
        notes,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Close dialog and reset form
      onClose();
      setFormData({
        patientId: null,
        patientName: '',
        appointmentType: '',
        startTime: new Date(),
        duration: 30,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      // TODO: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        Schedule New Appointment
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={patients}
              getOptionLabel={(patient) => 
                `${patient.firstName} ${patient.lastName}`
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Patient" 
                  variant="outlined" 
                  fullWidth 
                />
              )}
              onChange={handlePatientSelect}
              value={
                patients.find(p => p.id === formData.patientId) || null
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                name="appointmentType"
                value={formData.appointmentType}
                label="Appointment Type"
                onChange={handleChange}
              >
                {APPOINTMENT_TYPES.map((type) => (
                  <MenuItem 
                    key={type.value} 
                    value={type.value}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Appointment Start Time"
                value={formData.startTime}
                onChange={handleTimeChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined" 
                  />
                )}
                minDateTime={new Date()}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Appointment Duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            >
              {[30, 45, 60, 90].map((duration) => (
                <MenuItem key={duration} value={duration}>
                  {duration} minutes
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any specific instructions or notes for the appointment"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
