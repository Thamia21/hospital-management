import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Box, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

import { collection, addDoc } from 'firebase/firestore';

const AppointmentScheduler = () => {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'
  ];

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleTimeSlotChange = (event) => {
    setTimeSlot(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!timeSlot) return;

    try {
      const appointmentData = {
        date: date.toISOString(),
        timeSlot,
        patientId: 'example-patient-id', // Replace with actual patient ID
      };

      await addDoc(collection(db, 'appointments'), appointmentData);
      alert(`Appointment booked for ${date.toDateString()} at ${timeSlot}`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <h2>Schedule an Appointment</h2>
      <Calendar onChange={handleDateChange} value={date} />
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="time-slot-label">Select Time Slot</InputLabel>
        <Select
          labelId="time-slot-label"
          value={timeSlot}
          onChange={handleTimeSlotChange}
        >
          {timeSlots.map((slot) => (
            <MenuItem key={slot} value={slot}>{slot}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit} disabled={!timeSlot}>
        Book Appointment
      </Button>
    </Box>
  );
};

export default AppointmentScheduler;
