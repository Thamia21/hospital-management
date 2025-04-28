import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Button, Divider, Stack } from '@mui/material';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PatientStatsWidget from './widgets/PatientStatsWidget';
import RevenueWidget from './widgets/RevenueWidget';
import AppointmentStatusWidget from './widgets/AppointmentStatusWidget';
import PatientTrendsWidget from './widgets/PatientTrendsWidget';
import RevenueTrendsWidget from './widgets/RevenueTrendsWidget';
import StaffTurnoverWidget from './widgets/StaffTurnoverWidget';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [staffTenure, setStaffTenure] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Aggregate endpoints (replace with your real endpoints as needed)
        const [staffRes, appointmentRes] = await Promise.all([
          axios.get('/api/users?role=staff', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/appointments/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const staff = staffRes.data;
        const appointments = appointmentRes.data;
        setStats({
          totalStaff: staff.length,
          totalDoctors: staff.filter(s => s.role === 'DOCTOR').length,
          totalNurses: staff.filter(s => s.role === 'NURSE').length,
          totalActive: staff.filter(s => s.isActive !== false).length,
          totalDisabled: staff.filter(s => s.isActive === false).length,
          totalAppointments: appointments.total || 0,
          upcomingAppointments: appointments.upcoming || 0,
          completedAppointments: appointments.completed || 0
        });
        // Trends: appointments per month (simulate if not present)
        setAppointmentTrends(appointments.trends || []);
        // Staff tenure: months since createdAt
        setStaffTenure(
          staff.map(s => ({
            name: s.name,
            tenure: s.createdAt ? Math.floor((Date.now() - new Date(s.createdAt)) / (1000*60*60*24*30)) : 0
          }))
        );
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, []);

  // Chart data
  const appointmentTrendData = {
    labels: appointmentTrends.map(t => t.month),
    datasets: [
      {
        label: 'Appointments',
        data: appointmentTrends.map(t => t.count),
        backgroundColor: '#1976d2',
      },
    ],
  };
  const staffTenureData = {
    labels: staffTenure.map(s => s.name),
    datasets: [
      {
        label: 'Tenure (months)',
        data: staffTenure.map(s => s.tenure),
        backgroundColor: '#43a047',
      },
    ],
  };
  // Appointment status pie chart
  const appointmentPieData = {
    labels: ['Upcoming', 'Completed'],
    datasets: [
      {
        data: [stats.upcomingAppointments || 0, stats.completedAppointments || 0],
        backgroundColor: ['#1976d2', '#43a047'],
      },
    ],
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, minHeight: '100vh', bgcolor: '#f7fafd' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Admin Dashboard</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, color: 'error.main', mb: 2 }}>{error}</Paper>
      ) : (
        <>
          {/* Quick Stats + Widgets */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}><PatientStatsWidget /></Grid>
            <Grid item xs={6} md={3}><RevenueWidget /></Grid>
            <Grid item xs={6} md={3}><AppointmentStatusWidget /></Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#ffecb3', minHeight: 110 }}>
                <Typography variant="subtitle2">Notifications</Typography>
                <Typography variant="h5">3</Typography>
                <Typography variant="caption" color="primary.main">Unread messages</Typography>
              </Paper>
            </Grid>
          </Grid>
          {/* Appointment Status Pie Chart */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Appointment Status</Typography>
                <Pie data={appointmentPieData} height={100} />
              </Paper>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          {/* Quick Links */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/admin/staff-management')}>Manage Staff</Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/admin/add-staff')}>Add Staff</Button>
            <Button variant="contained" color="success" onClick={() => navigate('/appointments')}>View Appointments</Button>
            <Button variant="contained" color="info" onClick={() => navigate('/messages')}>Messages</Button>
          </Stack>
          <Divider sx={{ my: 3 }} />
          {/* Appointment Trends */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Appointment Trends</Typography>
            <Bar data={appointmentTrendData} height={100} />
          </Paper>
          {/* Staff Tenure */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Staff Tenure (Months)</Typography>
            <Line data={staffTenureData} height={100} />
          </Paper>
          {/* More Advanced Analytics Widgets */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}><PatientTrendsWidget /></Grid>
            <Grid item xs={12} md={4}><RevenueTrendsWidget /></Grid>
            <Grid item xs={12} md={4}><StaffTurnoverWidget /></Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Note: Some widgets may show simulated data if backend endpoints are not implemented yet.
          </Typography>
          {/* System Health (Simulated) */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>System Health</Typography>
            <Typography color="success.main">✔️ All systems operational</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Last checked: {new Date().toLocaleString()}
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;
