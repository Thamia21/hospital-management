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
  Button,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  MedicalServices as MedicalServicesIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  PersonPin as PersonPinIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userService, patientService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const DoctorPatients = () => {
  const [allPatients, setAllPatients] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0); // 0 = All Patients, 1 = My Patients
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 DoctorPatients: Fetching patients...');
      console.log('User facilityId:', user?.facilityId);
      
      // Fetch all patients using the new API endpoint
      const allPatientsData = await patientService.getPatientsList();
      console.log('✅ All patients fetched:', allPatientsData.length);
      
      // Fetch appointments for each patient
      const allPatientsWithAppointments = await Promise.all(
        allPatientsData.map(async (patient) => {
          try {
            const appointments = await patientService.getAppointments(patient.id || patient._id);
            // Find next upcoming appointment
            const upcomingAppointments = appointments
              .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'CANCELLED')
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const nextAppointment = upcomingAppointments[0];
            
            return {
              id: patient.id || patient._id,
              name: patient.name || patient.email,
              email: patient.email || 'No email',
              phone: patient.phone || patient.phoneNumber || 'No phone',
              facilityId: patient.facilityId?._id || patient.facilityId,
              facilityName: patient.facilityName || 'No facility',
              lastVisit: patient.lastVisit || 'No previous visits',
              nextAppointment: nextAppointment ? 
                `${new Date(nextAppointment.date).toLocaleDateString()} at ${nextAppointment.time || 'TBD'}` : 
                'None scheduled',
              status: patient.status || 'Active',
            };
          } catch (err) {
            console.error(`Error fetching appointments for patient ${patient.id}:`, err);
            return {
              id: patient.id || patient._id,
              name: patient.name || patient.email,
              email: patient.email || 'No email',
              phone: patient.phone || patient.phoneNumber || 'No phone',
              facilityId: patient.facilityId?._id || patient.facilityId,
              facilityName: patient.facilityName || 'No facility',
              lastVisit: patient.lastVisit || 'No previous visits',
              nextAppointment: 'None scheduled',
              status: patient.status || 'Active',
            };
          }
        })
      );
      
      // Set all patients
      setAllPatients(allPatientsWithAppointments);
      
      // Fetch facility-specific patients for "My Patients" tab
      // Always call the API - backend will filter based on user's facilityId from database
      console.log('🏥 Fetching facility patients (backend will filter by facilityId)');
      const myPatientsData = await patientService.getPatientsList({ myPatientsOnly: true });
      console.log('✅ My patients fetched:', myPatientsData.length);
      
      // Fetch appointments for facility patients
      const myPatientsWithAppointments = await Promise.all(
        myPatientsData.map(async (patient) => {
          try {
            const appointments = await patientService.getAppointments(patient.id || patient._id);
            // Find next upcoming appointment
            const upcomingAppointments = appointments
              .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'CANCELLED')
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const nextAppointment = upcomingAppointments[0];
            
            return {
              id: patient.id || patient._id,
              name: patient.name || patient.email,
              email: patient.email || 'No email',
              phone: patient.phone || patient.phoneNumber || 'No phone',
              facilityId: patient.facilityId?._id || patient.facilityId,
              facilityName: patient.facilityName || 'No facility',
              lastVisit: patient.lastVisit || 'No previous visits',
              nextAppointment: nextAppointment ? 
                `${new Date(nextAppointment.date).toLocaleDateString()} at ${nextAppointment.time || 'TBD'}` : 
                'None scheduled',
              status: patient.status || 'Active',
            };
          } catch (err) {
            console.error(`Error fetching appointments for patient ${patient.id}:`, err);
            return {
              id: patient.id || patient._id,
              name: patient.name || patient.email,
              email: patient.email || 'No email',
              phone: patient.phone || patient.phoneNumber || 'No phone',
              facilityId: patient.facilityId?._id || patient.facilityId,
              facilityName: patient.facilityName || 'No facility',
              lastVisit: patient.lastVisit || 'No previous visits',
              nextAppointment: 'None scheduled',
              status: patient.status || 'Active',
            };
          }
        })
      );
      
      setMyPatients(myPatientsWithAppointments);
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

  const handleAddNewPatient = () => {
    navigate('/register-patient');
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0); // Reset to first page when switching tabs
    setSearchTerm(''); // Clear search when switching tabs
  };

  // Get the current patient list based on selected tab
  const currentPatientList = currentTab === 0 ? allPatients : myPatients;

  const filteredPatients = currentPatientList.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredPatients.length) : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Container maxWidth="xl">
      <Toolbar disableGutters sx={{ mb: 2, justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Patients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddNewPatient}
        >
          Add New Patient
        </Button>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs for All Patients vs My Patients */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                All Patients
                <Chip 
                  label={allPatients.length} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            }
          />
          <Tab 
            icon={<PersonPinIcon />} 
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                My Patients
                <Chip 
                  label={myPatients.length} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
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
                  <TableRow key={patient.id} hover>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>
                      {patient.nextAppointment || 'None scheduled'}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          p: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: patient.status === 'Active' ? 'success.light' : 'grey.300',
                          color: patient.status === 'Active' ? 'success.dark' : 'grey.800',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {patient.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Patient Details">
                        <IconButton onClick={() => handleViewPatient(patient.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Medical Records">
                        <IconButton onClick={() => navigate(`/patient/${patient.id}/medical-records`)}>
                          <MedicalServicesIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default DoctorPatients;
