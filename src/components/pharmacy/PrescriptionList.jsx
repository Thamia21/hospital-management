import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Mock data - replace with API calls
const prescriptions = [
  {
    id: 1,
    patientName: 'John Doe',
    patientId: 'P001',
    doctorName: 'Dr. Sarah Johnson',
    date: '2023-12-08',
    status: 'Pending',
    priority: 'Normal',
    medications: [
      { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days' },
      { name: 'Amoxicillin 250mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '7 days' }
    ]
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    patientId: 'P002',
    doctorName: 'Dr. Michael Chen',
    date: '2023-12-08',
    status: 'Processing',
    priority: 'Urgent',
    medications: [
      { name: 'Insulin Regular', dosage: '10 units', frequency: 'Before meals', duration: '30 days' }
    ]
  }
];

export default function PrescriptionList({ searchTerm }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Prescription Details</TableCell>
            <TableCell>Medications</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPrescriptions.map((prescription) => (
            <TableRow key={prescription.id}>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Typography variant="subtitle2">
                      {prescription.patientName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ({prescription.patientId})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon color="action" />
                    <Typography variant="body2">
                      {prescription.doctorName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color="action" />
                    <Typography variant="body2">
                      {prescription.date}
                    </Typography>
                  </Box>
                  <Chip
                    label={prescription.priority}
                    color={getPriorityColor(prescription.priority)}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                {prescription.medications.map((med, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{med.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {med.dosage} - {med.frequency}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Duration: {med.duration}
                    </Typography>
                  </Box>
                ))}
              </TableCell>
              <TableCell>
                <Chip
                  label={prescription.status}
                  color={getStatusColor(prescription.status)}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {/* Handle process */}}
                    disabled={prescription.status === 'Completed'}
                  >
                    Process
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {/* Handle view details */}}
                  >
                    View Details
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
