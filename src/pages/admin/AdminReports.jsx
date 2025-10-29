import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  EventNote as EventIcon,
  AttachMoney as MoneyIcon,
  GetApp as DownloadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { format, subDays, subMonths } from 'date-fns';
import 'chart.js/auto';

const AdminReports = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setReportData({
        summary: {
          totalPatients: 1247,
          totalStaff: 89,
          totalAppointments: 456,
          revenue: 125000,
          patientGrowth: 12.5,
          staffGrowth: 5.2,
          appointmentGrowth: 8.7,
          revenueGrowth: 15.3
        },
        patientsByAge: {
          labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
          data: [120, 340, 380, 280, 127]
        },
        appointmentsByMonth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [65, 78, 90, 81, 95, 102]
        },
        revenueByMonth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [18000, 22000, 25000, 21000, 28000, 31000]
        },
        departmentDistribution: {
          labels: ['Cardiology', 'Pediatrics', 'Orthopedics', 'General', 'Emergency'],
          data: [25, 20, 18, 22, 15]
        },
        staffByRole: {
          labels: ['Doctors', 'Nurses', 'Admin', 'Support'],
          data: [35, 40, 8, 6]
        }
      });
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report...');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!reportData) {
    return null;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive hospital performance metrics and insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              }
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Patients
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {reportData.summary.totalPatients.toLocaleString()}
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                    label={`+${reportData.summary.patientGrowth}%`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#4caf50', 0.1),
                      color: '#4caf50',
                      fontWeight: 600
                    }}
                  />
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: '#667eea', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Staff
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {reportData.summary.totalStaff}
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                    label={`+${reportData.summary.staffGrowth}%`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#4caf50', 0.1),
                      color: '#4caf50',
                      fontWeight: 600
                    }}
                  />
                </Box>
                <HospitalIcon sx={{ fontSize: 40, color: '#2196f3', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Appointments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {reportData.summary.totalAppointments}
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                    label={`+${reportData.summary.appointmentGrowth}%`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#4caf50', 0.1),
                      color: '#4caf50',
                      fontWeight: 600
                    }}
                  />
                </Box>
                <EventIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    R{(reportData.summary.revenue / 1000).toFixed(0)}K
                  </Typography>
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                    label={`+${reportData.summary.revenueGrowth}%`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#4caf50', 0.1),
                      color: '#4caf50',
                      fontWeight: 600
                    }}
                  />
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: '#4caf50', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Appointments Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Appointments Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: reportData.appointmentsByMonth.labels,
                  datasets: [{
                    label: 'Appointments',
                    data: reportData.appointmentsByMonth.data,
                    borderColor: '#667eea',
                    backgroundColor: alpha('#667eea', 0.1),
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Revenue Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Revenue Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: reportData.revenueByMonth.labels,
                  datasets: [{
                    label: 'Revenue (ZAR)',
                    data: reportData.revenueByMonth.data,
                    backgroundColor: '#4caf50',
                  }]
                }}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Patients by Age */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Patients by Age Group
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={{
                  labels: reportData.patientsByAge.labels,
                  datasets: [{
                    data: reportData.patientsByAge.data,
                    backgroundColor: [
                      '#667eea',
                      '#764ba2',
                      '#f093fb',
                      '#4facfe',
                      '#43e97b'
                    ]
                  }]
                }}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Department Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie
                data={{
                  labels: reportData.departmentDistribution.labels,
                  datasets: [{
                    data: reportData.departmentDistribution.data,
                    backgroundColor: [
                      '#667eea',
                      '#2196f3',
                      '#4caf50',
                      '#ff9800',
                      '#f44336'
                    ]
                  }]
                }}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminReports;
