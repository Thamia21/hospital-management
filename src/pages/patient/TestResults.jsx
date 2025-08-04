import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  Remove as NormalIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function TestResults() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTestResults();
  }, [user.uid]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/patients/${user.uid}/test-results`,
        { headers: getAuthHeader() }
      );
      setTestResults(response.data || []);
    } catch (error) {
      console.error('Error fetching test results:', error);
      setError('Failed to load test results');
      setTestResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      default: return 'default';
    }
  };

  const getResultIcon = (status, isAbnormal) => {
    if (status !== 'completed') {
      return <ScheduleIcon color="warning" />;
    }
    if (isAbnormal) {
      return <WarningIcon color="error" />;
    }
    return <CheckCircleIcon color="success" />;
  };

  const openDetailDialog = (result) => {
    setSelectedResult(result);
    setDetailDialog(true);
  };

  const filteredResults = testResults.filter(result => {
    const matchesSearch = result.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.testType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const recentResults = testResults.slice(0, 3);
  const pendingResults = testResults.filter(result => result.status === 'pending');
  const abnormalResults = testResults.filter(result => result.isAbnormal && result.status === 'completed');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Test Results
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScienceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {testResults.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {pendingResults.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pending Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {abnormalResults.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Abnormal Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search test results..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Results</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Results Alert */}
      {abnormalResults.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {abnormalResults.length} test result(s) that require attention. Please consult with your healthcare provider.
        </Alert>
      )}

      {/* Test Results Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">All Test Results</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getResultIcon(result.status, result.isAbnormal)}
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {result.testName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.testType}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {result.testDate?.toDate?.()?.toLocaleDateString() || 
                     result.createdAt?.toDate?.()?.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={result.status} 
                      color={getStatusColor(result.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {result.doctorName || 'Dr. Smith'}
                  </TableCell>
                  <TableCell>
                    {result.isAbnormal && result.status === 'completed' && (
                      <Chip label="Attention Required" color="error" size="small" />
                    )}
                    {result.priority && (
                      <Chip 
                        label={result.priority} 
                        color={result.priority === 'urgent' ? 'error' : 'default'} 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => openDetailDialog(result)}
                          disabled={result.status !== 'completed'}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Report">
                        <IconButton 
                          size="small"
                          disabled={result.status !== 'completed'}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No test results match your search criteria'
                        : 'No test results available'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Test Result Detail Dialog */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Test Result Details
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Test Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedResult.testName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Test Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedResult.testDate?.toDate?.()?.toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1">
                    {selectedResult.doctorName || 'Dr. Smith'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={selectedResult.status} 
                    color={getStatusColor(selectedResult.status)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {selectedResult.results && selectedResult.results.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Test Parameters
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Parameter</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell>Reference Range</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedResult.results.map((param, index) => (
                          <TableRow key={index}>
                            <TableCell>{param.parameter}</TableCell>
                            <TableCell>
                              {param.value} {param.unit}
                            </TableCell>
                            <TableCell>{param.referenceRange}</TableCell>
                            <TableCell>
                              {param.isAbnormal ? (
                                <Chip label="Abnormal" color="error" size="small" />
                              ) : (
                                <Chip label="Normal" color="success" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {selectedResult.interpretation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Interpretation
                  </Typography>
                  <Typography variant="body2">
                    {selectedResult.interpretation}
                  </Typography>
                </Box>
              )}

              {selectedResult.recommendations && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <Typography variant="body2">
                    {selectedResult.recommendations}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
