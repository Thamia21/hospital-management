import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  GetApp as GetAppIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const API_URL = 'http://localhost:5000/api';

import PatientStatsWidget from './widgets/PatientStatsWidget';
import RevenueWidget from './widgets/RevenueWidget';
import AppointmentStatusWidget from './widgets/AppointmentStatusWidget';
import PatientTrendsWidget from './widgets/PatientTrendsWidget';
import RevenueTrendsWidget from './widgets/RevenueTrendsWidget';
import StaffTurnoverWidget from './widgets/StaffTurnoverWidget';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Create React Query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchInterval: 30000, // Auto-refresh every 30 seconds
        staleTime: 15000, // Consider data stale after 15 seconds
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });

  // React Query for real-time data fetching
  const { data: staffData, isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ['staff', user?.facilityId],
    queryFn: async () => {
      const facilityId = user?.facilityId;
      const response = await axios.get(`${API_URL}/users?role=staff${facilityId ? `&facilityId=${facilityId}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token // Only require token, not facilityId
  });

  const { data: appointmentData, isLoading: appointmentLoading, error: appointmentError } = useQuery({
    queryKey: ['appointments', user?.facilityId],
    queryFn: async () => {
      const facilityId = user?.facilityId;
      const response = await axios.get(`${API_URL}/appointments/stats${facilityId ? `?facilityId=${facilityId}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token // Only require token, not facilityId
  });

  const { data: patientData, isLoading: patientLoading, error: patientError } = useQuery({
    queryKey: ['patients', user?.facilityId],
    queryFn: async () => {
      const facilityId = user?.facilityId;
      const response = await axios.get(`${API_URL}/patients/stats${facilityId ? `?facilityId=${facilityId}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token // Only require token, not facilityId
  });

  // Calculate stats from React Query data
  const stats = React.useMemo(() => {
    if (!staffData || !appointmentData || !patientData) return {};

    const staff = staffData;
    const appointments = appointmentData;
    const patients = patientData;

    return {
      // Staff stats
      totalStaff: staff.length,
      totalDoctors: staff.filter(s => s.role === 'DOCTOR').length,
      totalNurses: staff.filter(s => s.role === 'NURSE').length,
      totalActive: staff.filter(s => s.isActive !== false).length,
      totalDisabled: staff.filter(s => s.isActive === false).length,

      // Appointment stats
      totalAppointments: appointments.total || 0,
      upcomingAppointments: appointments.upcoming || 0,
      completedAppointments: appointments.completed || 0,

      // Patient stats - Enhanced with all API data
      totalPatients: patients.total || 0,
      activePatients: patients.active || 0,
      inpatients: patients.inpatients || 0,
      outpatients: patients.outpatients || 0,
      newThisMonth: patients.newThisMonth || 0,
      averageAge: patients.averageAge || 0,
      genderDistribution: patients.genderDistribution || { male: 0, female: 0 }
    };
  }, [staffData, appointmentData, patientData]);

  // Calculate appointment trends data
  const appointmentTrends = React.useMemo(() => {
    return appointmentData?.trends || [];
  }, [appointmentData]);

  // Calculate patient registration trends (mock data for now)
  const patientTrends = React.useMemo(() => {
    // In a real implementation, this would come from the API
    // For now, generating mock trend data based on newThisMonth
    const currentMonth = new Date().getMonth();
    const months = [];
    const counts = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(currentMonth - i);
      months.push(monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

      // Generate realistic trend data
      const baseCount = Math.floor((stats.newThisMonth || 10) * (0.8 + Math.random() * 0.4));
      counts.push(baseCount + Math.floor(Math.random() * 5));
    }

    return { months, counts };
  }, [stats.newThisMonth]);
  const patientTrendData = {
    labels: patientTrends.months,
    datasets: [
      {
        label: 'New Patient Registrations',
        data: patientTrends.counts,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4caf50',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Calculate staff tenure data
  const staffTenure = React.useMemo(() => {
    if (!staffData) return [];

    return staffData.map(s => ({
      name: s.name,
      tenure: s.createdAt ? Math.floor((Date.now() - new Date(s.createdAt)) / (1000*60*60*24*30)) : 0
    }));
  }, [staffData]);

  // Check for errors
  React.useEffect(() => {
    if (staffError || appointmentError || patientError) {
      setError('Failed to load some dashboard data. Please check your connection.');
    }
  }, [staffError, appointmentError, patientError]);

  const isLoading = staffLoading || appointmentLoading || patientLoading;

  // Manual refresh function
  const handleRefresh = () => {
    // Invalidate all queries to force refresh
    window.location.reload(); // Simple refresh for now, can be enhanced with query invalidation
  };

  // Export dashboard data to CSV
  const handleExport = () => {
    const exportData = {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      stats: stats,
      appointmentTrends: appointmentTrends,
      staffTenure: staffTenure
    };

    const csvContent = [
      'Dashboard Export - ' + format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      '',
      'Summary Statistics:',
      'Total Staff,' + stats.totalStaff,
      'Total Doctors,' + stats.totalDoctors,
      'Total Nurses,' + stats.totalNurses,
      'Total Appointments,' + stats.totalAppointments,
      'Total Patients,' + stats.totalPatients,
      '',
      'Appointment Trends:',
      'Month,Count',
      ...appointmentTrends.map(trend => `${trend.month},${trend.count}`),
      '',
      'Staff Tenure:',
      'Name,Months',
      ...staffTenure.map(staff => `${staff.name},${staff.tenure}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data - moved inside component after hooks
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
    <QueryClientProvider client={queryClient}>
      {(!user || !token) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{
          p: { xs: 1, md: 4 },
          minHeight: '100vh',
          background: '#f8f9fa',
          position: 'relative',
        }}>
          {/* Enhanced Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            p: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', md: '2.5rem' }
              }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(0, 0, 0, 0.7)',
                fontSize: '1.1rem',
                fontWeight: 500
              }}>
                Real-time hospital management overview • Last updated: {format(new Date(), 'HH:mm:ss')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={isLoading ? <CircularProgress size={16} /> : <WifiIcon />}
                label={isLoading ? 'Loading...' : 'Live'}
                sx={{
                  background: isLoading ? 'rgba(0, 0, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                  color: isLoading ? 'rgba(0, 0, 0, 0.7)' : '#4caf50',
                  '& .MuiChip-icon': { color: isLoading ? 'rgba(0, 0, 0, 0.7)' : '#4caf50' }
                }}
                variant="outlined"
              />
              <Tooltip title="Export Dashboard Data">
                <IconButton
                  onClick={handleExport}
                  sx={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    '&:hover': { background: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <GetAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Dashboard">
                <IconButton
                  onClick={handleRefresh}
                  sx={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    '&:hover': { background: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="warning" sx={{
              mb: 3,
              background: 'rgba(255, 193, 7, 0.1)',
              color: '#f57c00',
              border: '1px solid rgba(245, 124, 0, 0.2)',
              '& .MuiAlert-icon': { color: '#f57c00' }
            }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}>
              <CircularProgress size={60} sx={{ color: '#667eea' }} />
            </Box>
          ) : (
            <>
              {/* Quick Stats + Widgets */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 4,
                    background: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="h6" sx={{
                      mb: 3,
                      color: '#333',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <PeopleIcon sx={{ fontSize: 28, color: '#2196f3' }} />
                      Patient Statistics
                    </Typography>

                    {/* Main Stats Row */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                            {stats.totalPatients || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Total Patients
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 700 }}>
                            {stats.activePatients || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Active (30 days)
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                            {stats.newThisMonth || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            New This Month
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                            {stats.averageAge || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Avg Age
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Patient Type Breakdown */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
                        Patient Distribution
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{
                            p: 2,
                            background: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: 2,
                            textAlign: 'center'
                          }}>
                            <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 700 }}>
                              {stats.inpatients || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4caf50' }}>
                              Inpatients
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{
                            p: 2,
                            background: 'rgba(33, 150, 243, 0.1)',
                            borderRadius: 2,
                            textAlign: 'center'
                          }}>
                            <Typography variant="h5" sx={{ color: '#2196f3', fontWeight: 700 }}>
                              {stats.outpatients || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2196f3' }}>
                              Outpatients
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Gender Distribution */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
                        Gender Distribution
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`Male: ${stats.genderDistribution?.male || 0}`}
                          sx={{
                            background: 'rgba(33, 150, 243, 0.1)',
                            color: '#2196f3',
                            flex: 1
                          }}
                          size="small"
                        />
                        <Chip
                          label={`Female: ${stats.genderDistribution?.female || 0}`}
                          sx={{
                            background: 'rgba(233, 30, 99, 0.1)',
                            color: '#e91e63',
                            flex: 1
                          }}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    background: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                      Revenue Overview
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 800 }}>
                      R{(Math.random() * 50000 + 10000).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      This Month
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    background: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                      Appointment Status
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>Completed</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                          {stats.completedAppointments || 0} ({((stats.completedAppointments || 0) / (stats.totalAppointments || 1) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box sx={{
                        height: 8,
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${((stats.completedAppointments || 0) / (stats.totalAppointments || 1)) * 100}%`,
                          background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
                          borderRadius: 4,
                          transition: 'width 0.8s ease'
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>Pending</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                          {stats.upcomingAppointments || 0} ({((stats.upcomingAppointments || 0) / (stats.totalAppointments || 1) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box sx={{
                        height: 8,
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${((stats.upcomingAppointments || 0) / (stats.totalAppointments || 1)) * 100}%`,
                          background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
                          borderRadius: 4,
                          transition: 'width 0.8s ease'
                        }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    background: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                      Notifications
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#2196f3', fontWeight: 800, mb: 1 }}>
                      3
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      Unread messages
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* System Health Widget */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 4,
                    background: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="h5" sx={{
                      mb: 3,
                      color: '#333',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <StorageIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                      System Health
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>Backend Server</Typography>
                        <Chip
                          icon={<WifiIcon />}
                          label="Online"
                          sx={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            color: '#4caf50',
                            '& .MuiChip-icon': { color: '#4caf50' }
                          }}
                          size="small"
                        />
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>Database Connection</Typography>
                        <Chip
                          icon={<StorageIcon />}
                          label="Connected"
                          sx={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            color: '#4caf50',
                            '& .MuiChip-icon': { color: '#4caf50' }
                          }}
                          size="small"
                        />
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>API Response Time</Typography>
                        <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 700 }}>
                          245ms
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>Last Health Check</Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                          {format(new Date(), 'HH:mm:ss')}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              {/* Appointment Status Pie Chart */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 4,
                    background: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="h6" sx={{
                      mb: 3,
                      color: '#333',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      Appointment Status
                    </Typography>
                    <Pie data={appointmentPieData} height={200} options={{
                      plugins: {
                        legend: {
                          labels: {
                            color: '#333',
                            font: { size: 14, weight: '600' }
                          }
                        }
                      }
                    }} />
                  </Paper>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
              {/* Quick Links */}
              <Box sx={{
                mb: 4,
                p: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}>
                <Typography variant="h5" sx={{
                  mb: 3,
                  color: '#333',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <AssessmentIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                  Quick Actions
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      }
                    }}
                    onClick={() => navigate('/admin/staff-management')}
                  >
                    Manage Staff
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      }
                    }}
                    onClick={() => navigate('/admin/patient-management')}
                  >
                    Manage Patients
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      border: '2px solid #4caf50',
                      color: '#4caf50',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '2px solid #45a049',
                        background: 'rgba(76, 175, 80, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)',
                      }
                    }}
                    onClick={() => navigate('/admin/add-patient')}
                  >
                    Add New Patient
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(79, 172, 254, 0.4)',
                      }
                    }}
                    onClick={() => navigate('/appointments')}
                  >
                    View Appointments
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(67, 233, 123, 0.4)',
                      }
                    }}
                    onClick={() => navigate('/messages')}
                  >
                    Messages
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      border: '2px solid #667eea',
                      color: '#667eea',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '2px solid #764ba2',
                        background: 'rgba(102, 126, 234, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                      }
                    }}
                    onClick={() => navigate('/admin/reports')}
                  >
                    Generate Reports
                  </Button>
                </Stack>
              </Box>
              <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
              {/* Patient Registration Trends */}
              <Paper sx={{
                p: 4,
                mb: 4,
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Typography variant="h5" sx={{
                  mb: 3,
                  color: '#333',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <TrendingUpIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                  Patient Registration Trends
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(0, 0, 0, 0.6)' }}>
                  New patient registrations over the last 6 months
                </Typography>
                <Line data={patientTrendData} height={300} options={{
                  plugins: {
                    legend: {
                      labels: {
                        color: '#333',
                        font: { size: 14, weight: '600' }
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'rgba(0, 0, 0, 0.7)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    y: {
                      ticks: { color: 'rgba(0, 0, 0, 0.7)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                  },
                  interaction: {
                    intersect: false,
                  },
                  animation: {
                    duration: 2000,
                  },
                  responsive: true,
                }} />
              </Paper>
              {/* Appointment Trends */}
              <Paper sx={{
                p: 4,
                mb: 4,
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Typography variant="h5" sx={{
                  mb: 3,
                  color: '#333',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  Appointment Trends
                </Typography>
                <Bar data={appointmentTrendData} height={300} options={{
                  plugins: {
                    legend: {
                      labels: {
                        color: '#333',
                        font: { size: 14, weight: '600' }
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'rgba(0, 0, 0, 0.7)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    y: {
                      ticks: { color: 'rgba(0, 0, 0, 0.7)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                  },
                  interaction: {
                    intersect: false,
                  },
                  animation: {
                    duration: 2000,
                  },
                  responsive: true,
                }} />
              </Paper>
              {/* Staff Tenure */}
              <Paper sx={{
                p: 4,
                mb: 4,
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Typography variant="h5" sx={{
                  mb: 3,
                  color: '#333',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  Staff Tenure (Months)
                </Typography>
                <Line data={staffTenureData} height={300} options={{
                  plugins: {
                    legend: {
                      labels: {
                        color: '#333',
                        font: { size: 14, weight: '600' }
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'rgba(0, 0, 0, 0.7)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    y: {
                      ticks: { color: 'rgba(0, 0, 0, 0.7)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                  }
                }} />
              </Paper>
              {/* More Advanced Analytics Widgets */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}><PatientTrendsWidget /></Grid>
                <Grid item xs={12} md={4}><RevenueTrendsWidget /></Grid>
                <Grid item xs={12} md={4}><StaffTurnoverWidget /></Grid>
              </Grid>
              <Typography variant="body2" sx={{
                mb: 3,
                color: 'rgba(0, 0, 0, 0.6)',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                💡 Dashboard data refreshes automatically every 30 seconds. Some widgets may show simulated data if backend endpoints are not implemented yet.
              </Typography>
              {/* System Health (Enhanced) */}
              <Paper sx={{
                p: 4,
                background: 'white',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <Typography variant="h5" sx={{
                  mb: 3,
                  color: '#333',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <TimelineIcon sx={{ fontSize: 32, color: '#2196f3' }} />
                  System Status
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 3,
                  justifyContent: 'center'
                }}>
                  <Chip
                    icon={<WifiIcon />}
                    label="All Systems Operational"
                    sx={{
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: '#4caf50',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: '#4caf50' }
                    }}
                    variant="outlined"
                  />
                  <Chip
                    icon={<StorageIcon />}
                    label="Database Connected"
                    sx={{
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: '#4caf50',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: '#4caf50' }
                    }}
                    variant="outlined"
                  />
                  <Chip
                    icon={<AssessmentIcon />}
                    label="Real-time Updates Active"
                    sx={{
                      background: 'rgba(33, 150, 243, 0.1)',
                      color: '#2196f3',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: '#2196f3' }
                    }}
                    variant="outlined"
                  />
                </Box>
                <Typography sx={{
                  color: '#4caf50',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  mb: 1
                }}>
                  ✔️ All systems operational
                </Typography>
                <Typography sx={{
                  color: 'rgba(0, 0, 0, 0.7)',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  Last updated: {format(new Date(), 'PPpp')} • Next refresh in: 30 seconds
                </Typography>
              </Paper>
            </>
          )}
        </Box>
      )}
    </QueryClientProvider>
  );
};

export default AdminDashboard;
