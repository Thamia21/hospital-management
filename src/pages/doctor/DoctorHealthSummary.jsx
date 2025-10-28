import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, CircularProgress, Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function DoctorHealthSummary({ patientId }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (patientId) fetchSummary();
    // eslint-disable-next-line
  }, [patientId]);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/patients/${patientId}/health-summary`, { headers: getAuthHeader() });
      setSummary(res.data?.summary || '');
    } catch (err) {
      setError('Failed to load health summary');
    } finally {
      setLoading(false);
    }
  };

  const saveSummary = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await axios.put(`${API_URL}/patients/${patientId}/health-summary`, { summary }, { headers: getAuthHeader() });
      setSuccess(true);
    } catch (err) {
      setError('Failed to save health summary');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Health Summary</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Summary saved!</Alert>}
      <TextField
        label="Patient Health Summary"
        value={summary}
        onChange={e => setSummary(e.target.value)}
        multiline
        minRows={4}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={saveSummary} disabled={saving}>
        {saving ? 'Saving...' : 'Save Summary'}
      </Button>
    </Paper>
  );
}
