import React, { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem, Grid, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { facilityApi } from '../../services/facilityApi';
import { useAuth } from '../../context/AuthContext';

const emptyFacility = {
  name: '',
  type: '',
  address: '',
  province: '',
  district: '',
  code: '',
};

const FacilityManagement = () => {
  const { user, token } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(emptyFacility);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await facilityApi.getAll();
      setFacilities(data);
    } catch (err) {
      setError('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <Alert severity="error">Unauthorized: Only admins can manage facilities.</Alert>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        await facilityApi.update(editingId, form, token);
        Swal.fire('Updated!', 'Facility updated successfully.', 'success');
      } else {
        await facilityApi.create(form, token);
        Swal.fire('Created!', 'Facility created successfully.', 'success');
      }
      setForm(emptyFacility);
      setEditingId(null);
      fetchFacilities();
    } catch (err) {
      setError('Failed to save facility');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facility) => {
    setForm(facility);
    setEditingId(facility._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    setLoading(true);
    try {
      await facilityApi.delete(id, token);
      Swal.fire('Deleted!', 'Facility deleted.', 'success');
      fetchFacilities();
    } catch (err) {
      setError('Failed to delete facility');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(emptyFacility);
    setEditingId(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>Facility Management</Typography>
          <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Facility Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Type" name="type" value={form.type} onChange={handleChange} select fullWidth required>
                  <MenuItem value="HOSPITAL">Hospital</MenuItem>
                  <MenuItem value="CLINIC">Clinic</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Province" name="province" value={form.province} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="District" name="district" value={form.district} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Code" name="code" value={form.code} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mr: 2 }}>
                  {editingId ? 'Update Facility' : 'Add Facility'}
                </Button>
                {editingId && (
                  <Button onClick={handleCancelEdit} color="secondary">Cancel</Button>
                )}
              </Grid>
            </Grid>
          </form>
          {error && <Alert severity="error">{error}</Alert>}
          {loading ? <CircularProgress /> : (
            <TableContainer component={Paper} sx={{ mt: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Province</TableCell>
                    <TableCell>District</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {facilities.map((facility) => (
                    <TableRow key={facility._id}>
                      <TableCell>{facility.name}</TableCell>
                      <TableCell>{facility.type}</TableCell>
                      <TableCell>{facility.province}</TableCell>
                      <TableCell>{facility.district}</TableCell>
                      <TableCell>{facility.code}</TableCell>
                      <TableCell>{facility.address}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEdit(facility)} color="primary"><Edit /></IconButton>
                        <IconButton onClick={() => handleDelete(facility._id)} color="error"><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default FacilityManagement;
