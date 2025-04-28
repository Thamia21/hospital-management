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
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { format, parseISO, set } from 'date-fns';

const APPOINTMENT_TYPES = [
  { value: 'check-up', label: 'Check-up' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' }
];

const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine'
];

const BUSINESS_HOURS = {
  start: 8,
  end: 17
};

export default function NewAppointmentDialog({ 
  open, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [networkError, setNetworkError] = useState(false);
  const [timeError, setTimeError] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    date: new Date(),
    time: set(new Date(), { hours: 9, minutes: 0, seconds: 0 }), // Default to 9 AM
    type: '',
    notes: ''
  });

  useEffect(() => {
    const fetchDoctorsAndPatients = async () => {
      try {
        // Check network status
        const isConnected = await networkStatus();
        if (!isConnected) {
          setNetworkError(true);
          return;
        }

        // Fetch doctors
        const doctorsRef = collection(db, 'doctors');
        const q = query(
          doctorsRef, 
          where('registered', '==', true),
          where('active', '==', true)
        );
        const doctorsSnap = await getDocs(q);
        const doctorsList = doctorsSnap.docs.map(doc => ({
          id: doc.id,
          name: `Dr. ${doc.data().firstName} ${doc.data().lastName}`,
          ...doc.data()
        }));
        setDoctors(doctorsList);

        // Fetch patients
        const patientsRef = collection(db, 'patients');
        const patientsSnap = await getDocs(patientsRef);
        const patientsList = patientsSnap.docs.map(doc => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
          ...doc.data()
        }));
        setPatients(patientsList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load doctors and patients data');
        setNetworkError(true);
      }
    };

    if (open) {
      fetchDoctorsAndPatients();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If department changes, reset doctorId
      if (name === 'department') {
        return {
          ...prev,
          [name]: value,
          doctorId: '' // Reset doctor when department changes
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const isWithinBusinessHours = (time) => {
    const hours = time.getHours();
    return hours >= BUSINESS_HOURS.start && hours < BUSINESS_HOURS.end;
  };

  const handleTimeChange = (newTime) => {
    if (!newTime) return;

    // Ensure the time is within business hours
    if (!isWithinBusinessHours(newTime)) {
      setTimeError(`Please select a time between ${BUSINESS_HOURS.start}:00 AM and ${BUSINESS_HOURS.end}:00 PM`);
      return;
    }

    setTimeError(''); // Clear any existing error
    setFormData(prev => ({
      ...prev,
      time: newTime
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Check network status
      const isConnected = await networkStatus();
      if (!isConnected) {
        setNetworkError(true);
        throw new Error('No internet connection. Please check your network.');
      }

      // Validation
      const { patientId, doctorId, department, date, time, type } = formData;
      if (!patientId || !doctorId || !department || !date || !time || !type) {
        throw new Error('Please fill in all required fields');
      }

      // Find doctor and patient details
      const selectedDoctor = doctors.find(d => d.id === doctorId);
      const selectedPatient = patients.find(p => p.id === patientId);

      // Create appointment
      const appointmentData = {
        patientId,
        patientName: selectedPatient.name,
        doctorId,
        doctorName: selectedDoctor.name,
        department,
        date: Timestamp.fromDate(formData.date),
        time: Timestamp.fromDate(set(formData.date, {
          hours: formData.time.getHours(),
          minutes: formData.time.getMinutes(),
          seconds: 0
        })),
        type,
        notes: formData.notes || '',
        status: 'Active', // Set initial status to Active
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const appointmentsRef = collection(db, 'appointments');
      await addDoc(appointmentsRef, appointmentData);

      // Send notification to doctor
      toast.info('Notifications are not available in this version.'); // sendNotification removed

      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        department: '',
        date: new Date(),
        time: set(new Date(), { hours: 9, minutes: 0, seconds: 0 }), // Default to 9 AM
        type: '',
        notes: ''
      });

    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNetworkError = () => {
    setNetworkError(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="inherit" component="span">
              New Appointment
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    name="patientId"
                    value={formData.patientId}
                    label="Patient"
                    onChange={handleChange}
                  >
                    {patients.map((patient) => (
                      <MenuItem 
                        key={patient.id} 
                        value={patient.id}
                      >
                        {patient.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    label="Department"
                    onChange={handleChange}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    name="doctorId"
                    value={formData.doctorId}
                    label="Doctor"
                    onChange={handleChange}
                    disabled={!formData.department}
                  >
                    {doctors
                      .filter(doctor => 
                        formData.department ? 
                          doctor.department === formData.department : 
                          true
                      )
                      .map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    label="Appointment Type"
                    onChange={handleChange}
                  >
                    {APPOINTMENT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Date"
                      value={formData.date}
                      onChange={(newDate) => handleDateChange(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={new Date()}
                      disableToolbar
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TimePicker
                      label="Time"
                      value={formData.time}
                      onChange={(newTime) => handleTimeChange(newTime)}
                      renderInput={(params) => <TextField {...params} fullWidth error={!!timeError} helperText={timeError} />}
                      minTime={set(new Date(), { hours: BUSINESS_HOURS.start, minutes: 0 })}
                      maxTime={set(new Date(), { hours: BUSINESS_HOURS.end, minutes: 0 })}
                      minutesStep={30}
                      ampm={true}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes or instructions"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={networkError}
        autoHideDuration={6000}
        onClose={handleCloseNetworkError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNetworkError} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          No internet connection. Please check your network and try again.
        </Alert>
      </Snackbar>
    </>
  );
}
