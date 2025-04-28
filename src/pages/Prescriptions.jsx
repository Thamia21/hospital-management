import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import { useAuth } from '../contexts/AuthContext';
import ReviewAndShareModal from '../components/ReviewAndShareModal';

export default function Prescriptions() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [prescriptionToReview, setPrescriptionToReview] = useState(null);

  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ],
    generalInstructions: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value
      };
      return {
        ...prev,
        medications: newMedications
      };
    });
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    try {
      const newPrescription = {
        ...formData,
        patientId: selectedPatient.id,
        doctorId: currentUser.uid,
        createdAt: Timestamp.now(),
        status: 'PENDING_REVIEW',
        isShared: false
      };

      setPrescriptionToReview(newPrescription);
      setReviewModalOpen(true);
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError('Failed to create prescription. Please try again.');
    }
  };

  const handleReviewSuccess = () => {
    setFormData({
      diagnosis: '',
      medications: [
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ],
      generalInstructions: '',
      notes: ''
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Prescriptions
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Prescription created and shared successfully!
          </Alert>
        )}

        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Medications
                </Typography>
                {formData.medications.map((medication, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Medication Name"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Dosage"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Frequency"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Duration"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          <IconButton
                            color="error"
                            onClick={() => removeMedication(index)}
                            disabled={formData.medications.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Special Instructions"
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  onClick={addMedication}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Medication
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="General Instructions"
                  name="generalInstructions"
                  value={formData.generalInstructions}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Prescription'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {prescriptionToReview && (
          <ReviewAndShareModal
            open={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setPrescriptionToReview(null);
            }}
            data={prescriptionToReview}
            type="prescription"
            patientId={selectedPatient?.id}
            patientName={selectedPatient?.name}
            onSuccess={handleReviewSuccess}
          />
        )}
      </Box>
    </Container>
  );
}
