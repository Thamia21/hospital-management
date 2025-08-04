import React, { useState, useEffect } from 'react';
import { facilityApi } from '../../services/facilityApi';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem, Grid, CircularProgress, Alert
} from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AddStaff = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    specialization: '',
    licenseNumber: '',
    facilityId: '',
  });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    facilityApi.getAll().then(setFacilities);
  }, []);

  // Only allow admin
  if (!user || user.role !== 'ADMIN') {
    return <Alert severity="error">Unauthorized: Only admins can add staff.</Alert>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!formData.facilityId) {
      setError('Please select a hospital or clinic');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post('/api/users/add-staff', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Staff member added! An email has been sent for them to set their own password.',
        confirmButtonColor: '#3085d6',
      });
      setFormData({
        name: '', email: '', role: '', department: '', specialization: '', licenseNumber: '', facilityId: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>Add Staff Member</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Select Hospital or Clinic"
                  name="facilityId"
                  value={formData.facilityId}
                  onChange={handleChange}
                  error={!formData.facilityId && !!error}
                  helperText={!formData.facilityId && error ? error : ''}
                >
                  <MenuItem value="">Select...</MenuItem>
                  {facilities.map(facility => (
                    <MenuItem key={facility._id} value={facility._id}>
                      {facility.name} ({facility.type})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Role" name="role" value={formData.role} onChange={handleChange} select fullWidth required>
                  <MenuItem value="DOCTOR">Doctor</MenuItem>
                  <MenuItem value="NURSE">Nurse</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Department" name="department" value={formData.department} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} fullWidth />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Add Staff'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddStaff;
