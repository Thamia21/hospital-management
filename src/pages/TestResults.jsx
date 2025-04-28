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
  Divider,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import { useAuth } from '../contexts/AuthContext';
import ReviewAndShareModal from '../components/ReviewAndShareModal';

export default function TestResults() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [resultToReview, setResultToReview] = useState(null);

  const [formData, setFormData] = useState({
    testType: '',
    testDate: new Date().toISOString().split('T')[0],
    results: [
      {
        parameter: '',
        value: '',
        unit: '',
        referenceRange: ''
      }
    ],
    interpretation: '',
    recommendations: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResultChange = (index, field, value) => {
    setFormData(prev => {
      const newResults = [...prev.results];
      newResults[index] = {
        ...newResults[index],
        [field]: value
      };
      return {
        ...prev,
        results: newResults
      };
    });
  };

  const addResultParameter = () => {
    setFormData(prev => ({
      ...prev,
      results: [
        ...prev.results,
        {
          parameter: '',
          value: '',
          unit: '',
          referenceRange: ''
        }
      ]
    }));
  };

  const removeResultParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    try {
      const newTestResult = {
        ...formData,
        patientId: selectedPatient.id,
        doctorId: currentUser.uid,
        createdAt: Timestamp.now(),
        status: 'PENDING_REVIEW',
        isShared: false
      };

      setResultToReview(newTestResult);
      setReviewModalOpen(true);
    } catch (err) {
      console.error('Error creating test result:', err);
      setError('Failed to create test result. Please try again.');
    }
  };

  const handleReviewSuccess = () => {
    setFormData({
      testType: '',
      testDate: new Date().toISOString().split('T')[0],
      results: [
        {
          parameter: '',
          value: '',
          unit: '',
          referenceRange: ''
        }
      ],
      interpretation: '',
      recommendations: ''
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test Results
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Test results created and shared successfully!
          </Alert>
        )}

        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Test Type"
                  name="testType"
                  value={formData.testType}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Test Date"
                  name="testDate"
                  value={formData.testDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Test Parameters
                </Typography>
                {formData.results.map((result, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Parameter"
                          value={result.parameter}
                          onChange={(e) => handleResultChange(index, 'parameter', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Value"
                          value={result.value}
                          onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Unit"
                          value={result.unit}
                          onChange={(e) => handleResultChange(index, 'unit', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Reference Range"
                          value={result.referenceRange}
                          onChange={(e) => handleResultChange(index, 'referenceRange', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeResultParameter(index)}
                          disabled={formData.results.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  onClick={addResultParameter}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Parameter
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interpretation"
                  name="interpretation"
                  value={formData.interpretation}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recommendations"
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
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
                  {loading ? <CircularProgress size={24} /> : 'Create Test Result'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {resultToReview && (
          <ReviewAndShareModal
            open={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setResultToReview(null);
            }}
            data={resultToReview}
            type="test-results"
            patientId={selectedPatient?.id}
            patientName={selectedPatient?.name}
            onSuccess={handleReviewSuccess}
          />
        )}
      </Box>
    </Container>
  );
}
