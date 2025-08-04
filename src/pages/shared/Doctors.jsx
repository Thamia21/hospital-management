import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DoctorAddAppointment from '../doctor/DoctorAddAppointment';

// Mock data - replace with actual API calls
const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    experience: '15 years',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@hospital.com',
    status: 'Available',
    nextAvailable: '2:00 PM Today'
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 'Neurologist',
    experience: '12 years',
    phone: '(555) 987-6543',
    email: 'michael.chen@hospital.com',
    status: 'In Surgery',
    nextAvailable: '4:30 PM Today'
  },
  {
    id: 3,
    name: 'Dr. Emily Brown',
    specialization: 'Pediatrician',
    experience: '8 years',
    phone: '(555) 456-7890',
    email: 'emily.brown@hospital.com',
    status: 'Available',
    nextAvailable: 'Now'
  }
];

export default function Doctors() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'in surgery':
        return 'error';
      case 'busy':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleAddAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenAppointmentDialog(true);
  };

  const handleCloseAppointmentDialog = () => {
    setOpenAppointmentDialog(false);
    setSelectedDoctor(null);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Doctors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Handle new doctor */}}
        >
          Add Doctor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Next Available</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{doctor.name.charAt(0)}</Avatar>
                    <div>
                      <Typography variant="subtitle2">{doctor.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {doctor.email}
                      </Typography>
                    </div>
                  </Box>
                </TableCell>
                <TableCell>{doctor.specialization}</TableCell>
                <TableCell>{doctor.experience}</TableCell>
                <TableCell>{doctor.phone}</TableCell>
                <TableCell>
                  <Chip 
                    label={doctor.status}
                    color={getStatusColor(doctor.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{doctor.nextAvailable}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleAddAppointment(doctor)}
                    variant="outlined"
                    color="primary"
                  >
                    Add Appointment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedDoctor && (
        <DoctorAddAppointment
          open={openAppointmentDialog}
          onClose={handleCloseAppointmentDialog}
          doctorId={selectedDoctor.id}
          doctorName={selectedDoctor.name}
        />
      )}
    </div>
  );
}
