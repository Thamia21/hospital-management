import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';

export default function TestPatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('TestPatientDashboard - User object:', user);
    
    if (!user) {
      console.log('TestPatientDashboard - No user, setting loading to false');
      setLoading(false);
      return;
    }

    const userId = user.uid || user._id || user.id;
    console.log('TestPatientDashboard - User ID:', userId);

    if (!userId) {
      console.log('TestPatientDashboard - No user ID found');
      setError('No user ID found');
      setLoading(false);
      return;
    }

    // Test API calls
    const testAPIs = async () => {
      try {
        console.log('TestPatientDashboard - Testing API calls...');
        
        // Test appointments
        try {
          const appointments = await patientService.getAppointments(userId);
          console.log('TestPatientDashboard - Appointments:', appointments);
        } catch (err) {
          console.error('TestPatientDashboard - Appointments error:', err);
        }

        // Test prescriptions
        try {
          const prescriptions = await patientService.getPrescriptions(userId);
          console.log('TestPatientDashboard - Prescriptions:', prescriptions);
        } catch (err) {
          console.error('TestPatientDashboard - Prescriptions error:', err);
        }

        // Test bills
        try {
          const bills = await patientService.getBills(userId);
          console.log('TestPatientDashboard - Bills:', bills);
        } catch (err) {
          console.error('TestPatientDashboard - Bills error:', err);
        }

        setData({ message: 'API tests completed - check console for results' });
      } catch (error) {
        console.error('TestPatientDashboard - General error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    testAPIs();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Please log in to view your dashboard
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
        <Typography variant="body1">
          User object: {JSON.stringify(user, null, 2)}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Reload Page
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Patient Dashboard
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome, {user.name || user.email || 'Patient'}!
        </Typography>
        
        <Alert severity="success" sx={{ mt: 2 }}>
          Dashboard loaded successfully! Check the browser console for API test results.
        </Alert>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>User Information:</Typography>
          <Typography variant="body2" component="pre" sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {JSON.stringify(user, null, 2)}
          </Typography>
        </Box>

        {data && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>API Test Results:</Typography>
            <Typography variant="body1">{data.message}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/patient-dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Real Dashboard
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Reload Test
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
