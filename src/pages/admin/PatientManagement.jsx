import React, { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, TablePagination, InputAdornment, Chip
} from '@mui/material';
import { Edit, Delete, Search as SearchIcon, PersonAdd, Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'chart.js/auto';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterFacility, setFilterFacility] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [facilities, setFacilities] = useState([]);

  // Only allow admin
  if (!user || user.role !== 'ADMIN') {
    return <Alert severity="error">Unauthorized: Only admins can manage patients.</Alert>;
  }

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching patients with token:', token ? 'Present' : 'Missing');
      const res = await axios.get('http://localhost:5000/api/users?role=PATIENT', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Patients fetched:', res.data.length);
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError(err.response?.data?.error || 'Failed to fetch patients. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/facilities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacilities(res.data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchFacilities();
  }, []);

  const handleDelete = async (patientId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the patient record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPatients();
      Swal.fire('Deleted!', 'Patient record deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete patient:', err);
      Swal.fire('Error', 'Failed to delete patient.', 'error');
    }
  };

  // Filtered patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(search.toLowerCase()) ||
      patient.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
      patient.idNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesFacility = filterFacility ? patient.facilityIds?.includes(filterFacility) : true;
    const matchesGender = filterGender ? patient.gender === filterGender : true;

    return matchesSearch && matchesFacility && matchesGender;
  });

  const paginatedPatients = filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Statistics
  const totalPatients = patients.length;
  const malePatients = patients.filter(p => p.gender === 'male').length;
  const femalePatients = patients.filter(p => p.gender === 'female').length;
  const activePatients = patients.filter(p => {
    // Patients with recent appointments or recent activity
    return p.lastActivity || p.createdAt;
  }).length;

  // Patient registration trends
  const patientTrends = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const months = [];
    const counts = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(currentMonth - i);
      months.push(monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

      // Generate trend data based on patient creation dates
      const monthPatients = patients.filter(p => {
        const patientDate = new Date(p.createdAt);
        return patientDate.getMonth() === monthDate.getMonth() &&
               patientDate.getFullYear() === monthDate.getFullYear();
      }).length;

      counts.push(monthPatients);
    }

    return { months, counts };
  }, [patients]);

  const trendData = {
    labels: patientTrends.months,
    datasets: [
      {
        label: 'New Patient Registrations',
        data: patientTrends.counts,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name','Email','Phone','ID Number','Gender','Date of Birth','Facility','Registration Date'];
    const rows = filteredPatients.map(p => [
      p.name,
      p.email,
      p.phoneNumber || p.phone || 'N/A',
      p.idNumber || 'N/A',
      p.gender || 'N/A',
      p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A',
      p.facilityNames?.join(', ') || 'N/A',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
    ]);
    let csvContent = [headers, ...rows].map(e => e.map(x => '"'+(x||'')+'"').join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="lg">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Patient Management</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/admin/add-patient')}
              sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' }}
            >
              Add New Patient
            </Button>
          </Box>

          {/* Statistics */}
          <Box sx={{ mb: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#e3f2fd' }}>
              <Typography variant="subtitle2">Total Patients</Typography>
              <Typography variant="h6">{totalPatients}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#e8f5e9' }}>
              <Typography variant="subtitle2">Male</Typography>
              <Typography variant="h6">{malePatients}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#fce4ec' }}>
              <Typography variant="subtitle2">Female</Typography>
              <Typography variant="h6">{femalePatients}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#fff3e0' }}>
              <Typography variant="subtitle2">Active</Typography>
              <Typography variant="h6">{activePatients}</Typography>
            </Paper>
          </Box>

          {/* Registration Trends */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Patient Registration Trends</Typography>
            <Line data={trendData} height={200} />
          </Paper>

          {/* Filters and search */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select
              label="Facility"
              value={filterFacility}
              onChange={e => setFilterFacility(e.target.value)}
              sx={{ width: 200 }}
              size="small"
            >
              <MenuItem value="">All Facilities</MenuItem>
              {facilities.map(facility => (
                <MenuItem key={facility._id} value={facility._id}>{facility.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Gender"
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              sx={{ width: 150 }}
              size="small"
            >
              <MenuItem value="">All Genders</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              placeholder="Search patients by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
              size="small"
            />
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>ID Number</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Facility</TableCell>
                      <TableCell>Registration Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPatients.map((patient) => (
                      <TableRow key={patient._id}>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phoneNumber || patient.phone || 'N/A'}</TableCell>
                        <TableCell>{patient.idNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={patient.gender || 'N/A'}
                            size="small"
                            color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {patient.facilityNames?.join(', ') || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => handleDelete(patient._id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredPatients.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default PatientManagement;
