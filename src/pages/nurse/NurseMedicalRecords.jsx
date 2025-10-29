import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  LocalHospital as LocalHospitalIcon,
  Science as ScienceIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  MonitorHeart as MonitorHeartIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const NurseMedicalRecords = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordType, setRecordType] = useState('VITAL_SIGNS');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth();
  
  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    // Vital Signs
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    // Treatment
    treatmentType: 'MEDICATION',
    medication: '',
    dosage: '',
    route: 'Oral',
    // Observation
    observationCategory: 'GENERAL',
    severity: 'NORMAL',
    painLevel: '',
    // Common
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Mock medical records with more comprehensive data
      const mockRecords = [
        {
          id: '1',
          patientName: 'John Doe',
          patientId: 'PAT001',
          recordType: 'VITAL_SIGNS',
          title: 'Morning Vital Signs',
          date: '2025-10-29T08:00:00Z',
          createdBy: user?.name || 'Sister Mary Johnson',
          vitalSigns: {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 72,
            temperature: 37.2,
            respiratoryRate: 16,
            oxygenSaturation: 98,
            weight: 70,
            height: 170
          },
          notes: 'Patient resting comfortably. All vitals within normal range.'
        },
        {
          id: '2',
          patientName: 'Jane Smith',
          patientId: 'PAT002',
          recordType: 'TREATMENT',
          title: 'Medication Administration',
          date: '2025-10-29T10:00:00Z',
          createdBy: user?.name || 'Sister Mary Johnson',
          treatment: {
            type: 'MEDICATION',
            medication: 'Amoxicillin',
            dosage: '500mg',
            route: 'Oral',
            administeredAt: '2025-10-29T10:00:00Z'
          },
          notes: 'Patient tolerated medication well. No adverse reactions observed.'
        },
        {
          id: '3',
          patientName: 'Bob Wilson',
          patientId: 'PAT003',
          recordType: 'OBSERVATION',
          title: 'Post-Surgery Check',
          date: '2025-10-29T14:00:00Z',
          createdBy: user?.name || 'Sister Mary Johnson',
          observation: {
            category: 'WOUND_CARE',
            severity: 'NORMAL',
            painLevel: 3
          },
          notes: 'Surgical wound healing well. Dressing changed. Patient reports mild discomfort (3/10).'
        }
      ];
      setRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsData = await userService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async () => {
    try {
      if (!formData.patientId) {
        setSnackbar({ open: true, message: 'Please select a patient', severity: 'error' });
        return;
      }

      const selectedPatient = patients.find(p => (p._id || p.id) === formData.patientId);
      
      // Create record based on type
      const newRecord = {
        id: Date.now().toString(),
        patientName: selectedPatient?.name || 'Unknown Patient',
        patientId: formData.patientId,
        recordType: recordType,
        title: getRecordTitle(recordType),
        date: new Date().toISOString(),
        createdBy: user?.name || 'Nurse',
        notes: formData.notes
      };

      // Add type-specific data
      if (recordType === 'VITAL_SIGNS') {
        newRecord.vitalSigns = {
          bloodPressure: {
            systolic: parseInt(formData.bloodPressureSystolic),
            diastolic: parseInt(formData.bloodPressureDiastolic)
          },
          heartRate: parseInt(formData.heartRate),
          temperature: parseFloat(formData.temperature),
          respiratoryRate: parseInt(formData.respiratoryRate),
          oxygenSaturation: parseInt(formData.oxygenSaturation),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height)
        };
      } else if (recordType === 'TREATMENT') {
        newRecord.treatment = {
          type: formData.treatmentType,
          medication: formData.medication,
          dosage: formData.dosage,
          route: formData.route,
          administeredAt: new Date().toISOString()
        };
      } else if (recordType === 'OBSERVATION') {
        newRecord.observation = {
          category: formData.observationCategory,
          severity: formData.severity,
          painLevel: parseInt(formData.painLevel) || 0
        };
      }

      // Add to records (in real app, this would be an API call)
      setRecords(prev => [newRecord, ...prev]);
      
      setSnackbar({ open: true, message: 'Record added successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding record:', error);
      setSnackbar({ open: true, message: 'Failed to add record', severity: 'error' });
    }
  };

  const getRecordTitle = (type) => {
    switch (type) {
      case 'VITAL_SIGNS':
        return 'Vital Signs Check';
      case 'TREATMENT':
        return formData.medication || 'Treatment';
      case 'OBSERVATION':
        return 'Nursing Observation';
      default:
        return 'Medical Record';
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      patientId: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      treatmentType: 'MEDICATION',
      medication: '',
      dosage: '',
      route: 'Oral',
      observationCategory: 'GENERAL',
      severity: 'NORMAL',
      painLevel: '',
      notes: ''
    });
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'VITAL_SIGNS':
        return <MonitorHeartIcon />;
      case 'TREATMENT':
        return <FavoriteIcon />;
      case 'OBSERVATION':
        return <DescriptionIcon />;
      case 'LAB_RESULT':
        return <ScienceIcon />;
      default:
        return <LocalHospitalIcon />;
    }
  };

  const getRecordColor = (type) => {
    switch (type) {
      case 'VITAL_SIGNS':
        return 'info';
      case 'TREATMENT':
        return 'success';
      case 'OBSERVATION':
        return 'warning';
      case 'LAB_RESULT':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // Filter by tab
    if (selectedTab === 1) filtered = filtered.filter(r => r.recordType === 'VITAL_SIGNS');
    if (selectedTab === 2) filtered = filtered.filter(r => r.recordType === 'TREATMENT');
    if (selectedTab === 3) filtered = filtered.filter(r => r.recordType === 'OBSERVATION');

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredRecords = filterRecords();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Medical Records
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage patient medical records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ textTransform: 'none' }}
        >
          Add Record
        </Button>
      </Box>

      {/* Search and Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by patient name, ID, or record title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderTop: 1, borderColor: 'divider' }}
        >
          <Tab label={`All Records (${records.length})`} />
          <Tab label={`Vital Signs (${records.filter(r => r.recordType === 'VITAL_SIGNS').length})`} />
          <Tab label={`Treatments (${records.filter(r => r.recordType === 'TREATMENT').length})`} />
          <Tab label={`Observations (${records.filter(r => r.recordType === 'OBSERVATION').length})`} />
        </Tabs>
      </Paper>

      {/* Records Grid */}
      {filteredRecords.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRecords.map((record) => (
            <Grid item xs={12} md={6} key={record.id}>
              <Card sx={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRecordIcon(record.recordType)}
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {record.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={record.recordType?.replace('_', ' ')}
                      color={getRecordColor(record.recordType)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Patient:</strong> {record.patientName} ({record.patientId})
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Date:</strong> {new Date(record.date).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Recorded by:</strong> {record.createdBy}
                  </Typography>

                  {/* Quick summary based on record type */}
                  {record.recordType === 'VITAL_SIGNS' && record.vitalSigns && (
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        BP: {record.vitalSigns.bloodPressure?.systolic}/{record.vitalSigns.bloodPressure?.diastolic} | 
                        HR: {record.vitalSigns.heartRate} | 
                        Temp: {record.vitalSigns.temperature}°C | 
                        SpO2: {record.vitalSigns.oxygenSaturation}%
                      </Typography>
                    </Box>
                  )}

                  {record.recordType === 'TREATMENT' && record.treatment && (
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        {record.treatment.medication} {record.treatment.dosage} ({record.treatment.route})
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {record.notes}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewRecord(record)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No medical records found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'No records available in this category'}
          </Typography>
        </Paper>
      )}

      {/* Add Record Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add Medical Record</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            {/* Patient Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Patient *</InputLabel>
              <Select
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                label="Select Patient *"
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id || patient.id} value={patient._id || patient.id}>
                    {patient.name} - {patient.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Record Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Record Type *</InputLabel>
              <Select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                label="Record Type *"
              >
                <MenuItem value="VITAL_SIGNS">Vital Signs</MenuItem>
                <MenuItem value="TREATMENT">Treatment/Medication</MenuItem>
                <MenuItem value="OBSERVATION">Nursing Observation</MenuItem>
              </Select>
            </FormControl>

            {/* Vital Signs Form */}
            {recordType === 'VITAL_SIGNS' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Vital Signs Measurements
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Blood Pressure (Systolic)"
                      name="bloodPressureSystolic"
                      value={formData.bloodPressureSystolic}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="120"
                      InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Blood Pressure (Diastolic)"
                      name="bloodPressureDiastolic"
                      value={formData.bloodPressureDiastolic}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="80"
                      InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Heart Rate"
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="72"
                      InputProps={{ endAdornment: <InputAdornment position="end">BPM</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Temperature"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      type="number"
                      step="0.1"
                      placeholder="37.0"
                      InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Respiratory Rate"
                      name="respiratoryRate"
                      value={formData.respiratoryRate}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="16"
                      InputProps={{ endAdornment: <InputAdornment position="end">/min</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Oxygen Saturation"
                      name="oxygenSaturation"
                      value={formData.oxygenSaturation}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="98"
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      type="number"
                      step="0.1"
                      placeholder="70"
                      InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Height"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="170"
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Treatment Form */}
            {recordType === 'TREATMENT' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Treatment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Treatment Type</InputLabel>
                      <Select
                        name="treatmentType"
                        value={formData.treatmentType}
                        onChange={handleInputChange}
                        label="Treatment Type"
                      >
                        <MenuItem value="MEDICATION">Medication</MenuItem>
                        <MenuItem value="WOUND_CARE">Wound Care</MenuItem>
                        <MenuItem value="IV_THERAPY">IV Therapy</MenuItem>
                        <MenuItem value="PHYSICAL_THERAPY">Physical Therapy</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medication/Treatment Name *"
                      name="medication"
                      value={formData.medication}
                      onChange={handleInputChange}
                      placeholder="e.g., Amoxicillin"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Dosage"
                      name="dosage"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      placeholder="e.g., 500mg"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Route</InputLabel>
                      <Select
                        name="route"
                        value={formData.route}
                        onChange={handleInputChange}
                        label="Route"
                      >
                        <MenuItem value="Oral">Oral</MenuItem>
                        <MenuItem value="IV">Intravenous (IV)</MenuItem>
                        <MenuItem value="IM">Intramuscular (IM)</MenuItem>
                        <MenuItem value="Topical">Topical</MenuItem>
                        <MenuItem value="Subcutaneous">Subcutaneous</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Observation Form */}
            {recordType === 'OBSERVATION' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Observation Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Observation Category</InputLabel>
                      <Select
                        name="observationCategory"
                        value={formData.observationCategory}
                        onChange={handleInputChange}
                        label="Observation Category"
                      >
                        <MenuItem value="GENERAL">General Condition</MenuItem>
                        <MenuItem value="PAIN">Pain Assessment</MenuItem>
                        <MenuItem value="MOBILITY">Mobility Status</MenuItem>
                        <MenuItem value="WOUND_CARE">Wound Care</MenuItem>
                        <MenuItem value="MENTAL_STATE">Mental State</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Severity</InputLabel>
                      <Select
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        label="Severity"
                      >
                        <MenuItem value="NORMAL">Normal</MenuItem>
                        <MenuItem value="MILD">Mild</MenuItem>
                        <MenuItem value="MODERATE">Moderate</MenuItem>
                        <MenuItem value="SEVERE">Severe</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Pain Level (0-10)"
                      name="painLevel"
                      value={formData.painLevel}
                      onChange={handleInputChange}
                      type="number"
                      inputProps={{ min: 0, max: 10 }}
                      placeholder="0"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Notes */}
            <TextField
              fullWidth
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={4}
              placeholder="Enter any additional observations or notes..."
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRecord}>
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Medical Record Details</Typography>
            <IconButton onClick={() => setOpenViewDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRecord && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Patient</Typography>
                  <Typography variant="body1">{selectedRecord.patientName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Patient ID</Typography>
                  <Typography variant="body1">{selectedRecord.patientId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Record Type</Typography>
                  <Chip 
                    label={selectedRecord.recordType?.replace('_', ' ')} 
                    color={getRecordColor(selectedRecord.recordType)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1">{new Date(selectedRecord.date).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Recorded By</Typography>
                  <Typography variant="body1">{selectedRecord.createdBy}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Vital Signs Details */}
              {selectedRecord.recordType === 'VITAL_SIGNS' && selectedRecord.vitalSigns && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Vital Signs</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Blood Pressure</Typography>
                      <Typography variant="body1">
                        {selectedRecord.vitalSigns.bloodPressure?.systolic}/
                        {selectedRecord.vitalSigns.bloodPressure?.diastolic} mmHg
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Heart Rate</Typography>
                      <Typography variant="body1">{selectedRecord.vitalSigns.heartRate} BPM</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Temperature</Typography>
                      <Typography variant="body1">{selectedRecord.vitalSigns.temperature}°C</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Respiratory Rate</Typography>
                      <Typography variant="body1">{selectedRecord.vitalSigns.respiratoryRate}/min</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Oxygen Saturation</Typography>
                      <Typography variant="body1">{selectedRecord.vitalSigns.oxygenSaturation}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Weight</Typography>
                      <Typography variant="body1">{selectedRecord.vitalSigns.weight} kg</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Height</Typography>
                      <Typography variant="body1">{selectedRecord.vitalSigns.height} cm</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Treatment Details */}
              {selectedRecord.recordType === 'TREATMENT' && selectedRecord.treatment && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Treatment Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Treatment Type</Typography>
                      <Typography variant="body1">{selectedRecord.treatment.type}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Medication/Treatment</Typography>
                      <Typography variant="body1">{selectedRecord.treatment.medication}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Dosage</Typography>
                      <Typography variant="body1">{selectedRecord.treatment.dosage}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Route</Typography>
                      <Typography variant="body1">{selectedRecord.treatment.route}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Administered At</Typography>
                      <Typography variant="body1">
                        {new Date(selectedRecord.treatment.administeredAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Observation Details */}
              {selectedRecord.recordType === 'OBSERVATION' && selectedRecord.observation && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Observation Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Category</Typography>
                      <Typography variant="body1">{selectedRecord.observation.category}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Severity</Typography>
                      <Chip label={selectedRecord.observation.severity} size="small" />
                    </Grid>
                    {selectedRecord.observation.painLevel !== undefined && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Pain Level</Typography>
                        <Typography variant="body1">{selectedRecord.observation.painLevel}/10</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">{selectedRecord.notes}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NurseMedicalRecords;
