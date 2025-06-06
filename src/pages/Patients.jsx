import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Container,
  Toolbar,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// TODO: Migrate data fetching to use REST API endpoints.

import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../pages/NurseDashboard.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.uid) {
        setError('User not authenticated');
        return;
      }

      console.log('Fetching appointments for doctor:', user.uid);

      // Get all appointments for this doctor
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', user.uid)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      
      // Get unique patient IDs from appointments
      const patientIds = [...new Set(
        appointmentsSnapshot.docs
          .map(doc => doc.data()?.patientId)
          .filter(id => id)
      )];

      console.log('Unique patient IDs:', patientIds);

      // Fetch patient details for each patient ID
      const patientsData = [];
      for (const patientId of patientIds) {
        try {
          console.log('Fetching details for patient:', patientId);
          
          // Try getting from users collection first
          const userDoc = await getDoc(doc(db, 'users', patientId));
          let patientData;
          let patientName;
          
          if (userDoc.exists()) {
            patientData = userDoc.data();
            patientName = patientData.firstName && patientData.lastName 
              ? `${patientData.firstName} ${patientData.lastName}`
              : patientData.email;
            console.log('Found patient in users collection:', patientData);
          }

          // Get patient's appointments
          const patientAppointments = appointmentsSnapshot.docs
            .filter(doc => doc.data().patientId === patientId)
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .sort((a, b) => b.date.toMillis() - a.date.toMillis());

          const latestAppointment = patientAppointments[0];
          const nextAppointment = patientAppointments.find(apt => 
            apt.date.toDate() > new Date() && apt.status !== 'CANCELLED'
          );

          // Determine patient status
          let status = 'Active';
          if (!nextAppointment && latestAppointment) {
            if (latestAppointment.status === 'CANCELLED') {
              status = 'Inactive';
            } else if (latestAppointment.status === 'COMPLETED') {
              status = 'Completed';
            }
          }

          if (patientData) {
            patientsData.push({
              id: patientId,
              name: patientName,
              email: patientData.email || 'No email',
              phone: patientData.phone || patientData.phoneNumber || 'No phone',
              lastVisit: latestAppointment?.date?.toDate?.() || 'No previous visits',
              nextAppointment: nextAppointment?.date?.toDate?.() || null,
              status: status
            });
          }
        } catch (err) {
          console.error(`Error fetching patient ${patientId}:`, err);
        }
      }

      console.log('Final patients data:', patientsData);
      setPatients(patientsData);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewPatient = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const handleViewHistory = (patientId) => {
    navigate(`/patient-history/${patientId}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <Box className="nurse-dashboard">
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          notifications={[]}
        />
        <Box className="nurse-dashboard__main">
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="nurse-dashboard">
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        notifications={[]}
      />

      <Box className="nurse-dashboard__main">
        <Toolbar />
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">My Patients</Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/add-patient')}
              >
                Add New Patient
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Last Visit</TableCell>
                        <TableCell>Next Appointment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPatients
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>{patient.name}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>{formatDate(patient.lastVisit)}</TableCell>
                            <TableCell>{formatDate(patient.nextAppointment)}</TableCell>
                            <TableCell>{patient.status}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/patient/${patient.id}`)}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View History">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/patient/${patient.id}/history`)}
                                >
                                  <HistoryIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredPatients.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(parseInt(event.target.value, 10));
                      setPage(0);
                    }}
                  />
                </>
              )}
            </TableContainer>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Patients;
