import React, { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem, Grid, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, InputAdornment, Stack
} from '@mui/material';
import { Edit, Delete, CloudDownload as SeedIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
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
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(emptyFacility);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchTerm]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await facilityApi.getAll();
      setFacilities(data);
      setFilteredFacilities(data);
    } catch (err) {
      setError('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const filterFacilities = () => {
    if (!searchTerm.trim()) {
      setFilteredFacilities(facilities);
      return;
    }

    const filtered = facilities.filter(facility =>
      facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFacilities(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
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

  const handleSeedSAFacilities = async () => {
    if (!window.confirm('This will add comprehensive South African hospitals and clinics to the database. Continue?')) return;

    setLoading(true);
    try {
      // Call the seeding endpoint
      await fetch('http://localhost:5000/api/facilities/seed-sa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      Swal.fire('Success!', 'South African facilities have been seeded successfully.', 'success');
      fetchFacilities();
    } catch (err) {
      setError('Failed to seed South African facilities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>Facility Management</Typography>

          {/* Seed South African Facilities Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<SeedIcon />}
              onClick={handleSeedSAFacilities}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Seed South African Facilities
            </Button>
            <Typography variant="body2" color="text.secondary">
              Add comprehensive list of hospitals and clinics from all South African provinces
            </Typography>
          </Box>

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

          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search facilities by name, type, province, district, address, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {filteredFacilities.length} of {facilities.length} facilities
              </Typography>
            </Stack>
          </Box>
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
                  {filteredFacilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {searchTerm ? 'No facilities found matching your search.' : 'No facilities found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFacilities.map((facility) => (
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
                    ))
                  )}
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
