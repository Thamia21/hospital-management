import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Medication as MedicationIcon,
  Schedule as ScheduleIcon,
  Person as DoctorIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/api';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [user.uid]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPrescriptions(user.uid);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'discontinued':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <ActiveIcon />;
      case 'completed':
        return <CheckCircle />;
      case 'discontinued':
      case 'expired':
        return <InactiveIcon />;
      default:
        return <MedicationIcon />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const openDetailDialog = (prescription) => {
    setSelectedPrescription(prescription);
    setDetailDialog(true);
  };

  const closeDetailDialog = () => {
    setSelectedPrescription(null);
    setDetailDialog(false);
  };

  const handlePrint = (prescription) => {
    // In a real app, this would generate a printable prescription
    window.print();
  };

  const handleDownload = (prescription) => {
    // In a real app, this would download a PDF of the prescription
    console.log('Download prescription:', prescription.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Prescriptions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View all your current and past prescriptions prescribed by your healthcare providers.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {prescriptions.filter(p => p.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Prescriptions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <MedicationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {prescriptions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Prescriptions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {prescriptions.filter(p => p.status === 'expired').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expired
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <InactiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {prescriptions.filter(p => p.status === 'discontinued').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discontinued
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MedicationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No prescriptions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any prescriptions yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {prescriptions.map((prescription) => (
            <Grid item xs={12} md={6} key={prescription.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => openDetailDialog(prescription)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div">
                      {prescription.medicationName || prescription.diagnosis || 'Prescription'}
                    </Typography>
                    <Chip
                      label={prescription.status || 'Unknown'}
                      color={getStatusColor(prescription.status)}
                      size="small"
                      icon={getStatusIcon(prescription.status)}
                    />
                  </Box>

                  <List dense>
                    {prescription.medications && prescription.medications.length > 0 ? (
                      prescription.medications.slice(0, 2).map((med, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon>
                            <MedicationIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={med.name}
                            secondary={`${med.dosage} - ${med.frequency}`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <MedicationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={prescription.medicationName || 'Medication details'}
                          secondary={prescription.dosage || 'See details for more information'}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <DoctorIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Dr. {prescription.doctorName || prescription.prescribedBy || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(prescription.prescribedDate || prescription.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Tooltip title="Print Prescription">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(prescription);
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(prescription);
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Prescription Detail Dialog */}
      <Dialog 
        open={detailDialog} 
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Prescription Details
            </Typography>
            <Chip
              label={selectedPrescription?.status || 'Unknown'}
              color={getStatusColor(selectedPrescription?.status)}
              icon={getStatusIcon(selectedPrescription?.status)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Prescribed By
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Dr. {selectedPrescription.doctorName || selectedPrescription.prescribedBy || 'Unknown'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Prescribed Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedPrescription.prescribedDate || selectedPrescription.createdAt)}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Diagnosis
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPrescription.diagnosis || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPrescription.duration || 'As prescribed'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPrescription.status || 'Unknown'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Medications
              </Typography>
              {selectedPrescription.medications && selectedPrescription.medications.length > 0 ? (
                <List>
                  {selectedPrescription.medications.map((med, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <MedicationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={med.name}
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              <strong>Dosage:</strong> {med.dosage}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Frequency:</strong> {med.frequency}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Duration:</strong> {med.duration}
                            </Typography>
                            {med.instructions && (
                              <Typography variant="body2">
                                <strong>Instructions:</strong> {med.instructions}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No detailed medication information available.
                </Typography>
              )}

              {selectedPrescription.generalInstructions && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    General Instructions
                  </Typography>
                  <Typography variant="body1">
                    {selectedPrescription.generalInstructions}
                  </Typography>
                </>
              )}

              {selectedPrescription.notes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedPrescription.notes}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePrint(selectedPrescription)} startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button onClick={() => handleDownload(selectedPrescription)} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={closeDetailDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
