import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Toolbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../pages/NurseDashboard.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsRef = collection(db, 'medicalRecords');
        const q = query(recordsRef, where('nurseId', '==', user.uid));
        const snapshot = await getDocs(q);
        const recordsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecords(recordsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching medical records:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchRecords();
    }
  }, [user]);

  const filteredRecords = records.filter(record =>
    record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordId?.includes(searchTerm)
  );

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
              <Typography variant="h4">Medical Records</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {/* Handle new record */}}
              >
                New Record
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search records by patient name, diagnosis, or record ID..."
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredRecords.map((record) => (
                  <Grid item xs={12} md={6} lg={4} key={record.id}>
                    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">{record.patientName}</Typography>
                        </Box>
                        <Typography color="textSecondary" gutterBottom>
                          Record ID: {record.recordId}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Diagnosis: {record.diagnosis}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Date: {record.date?.toDate().toLocaleDateString()}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {/* Handle view details */}}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<DescriptionIcon />}
                            onClick={() => {/* Handle view documents */}}
                          >
                            Documents
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {filteredRecords.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography>No medical records found</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MedicalRecords;
