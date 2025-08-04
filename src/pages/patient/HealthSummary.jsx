import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Favorite as HeartIcon,
  MonitorHeart as VitalsIcon,
  LocalHospital as MedicalIcon,
  TrendingUp,
  TrendingDown,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function HealthSummary() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState({
    vitals: [],
    conditions: [],
    allergies: [],
    medications: [],
    immunizations: [],
    emergencyContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [addVitalDialog, setAddVitalDialog] = useState(false);
  const [newVital, setNewVital] = useState({
    type: '',
    value: '',
    unit: '',
    notes: '',
  });

  useEffect(() => {
    fetchHealthData();
  }, [user.uid]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent vitals
      const vitalsRes = await axios.get(
        `${API_URL}/patients/${user.uid}/vitals?limit=10`,
        { headers: getAuthHeader() }
      );
      const vitals = vitalsRes.data || [];

      // Fetch medical conditions
      const conditionsRes = await axios.get(
        `${API_URL}/patients/${user.uid}/conditions?status=active`,
        { headers: getAuthHeader() }
      );
      const conditions = conditionsRes.data || [];

      // Fetch allergies
      const allergiesRes = await axios.get(
        `${API_URL}/patients/${user.uid}/allergies`,
        { headers: getAuthHeader() }
      );
      const allergies = allergiesRes.data || [];

      // Fetch current medications
      const medicationsRes = await axios.get(
        `${API_URL}/patients/${user.uid}/prescriptions?status=active`,
        { headers: getAuthHeader() }
      );
      const medications = medicationsRes.data || [];

      setHealthData({
        vitals,
        conditions,
        allergies,
        medications,
        immunizations: [], // Mock data for now
        emergencyContacts: [], // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Set empty data on error
      setHealthData({
        vitals: [],
        conditions: [],
        allergies: [],
        medications: [],
        immunizations: [],
        emergencyContacts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVital = async () => {
    try {
      const vitalData = {
        ...newVital,
        patientId: user.uid,
        recordedAt: new Date(),
        recordedBy: user.uid,
        value: parseFloat(newVital.value),
      };

      await axios.post(
        `${API_URL}/patients/${user.uid}/vitals`,
        vitalData,
        { headers: getAuthHeader() }
      );
      
      // Refresh data
      await fetchHealthData();
      
      // Reset form
      setNewVital({
        type: '',
        value: '',
        unit: '',
        notes: '',
      });
      setAddVitalDialog(false);
    } catch (error) {
      console.error('Error adding vital:', error);
    }
  };

  const getVitalStatus = (type, value) => {
    // Simple vital sign ranges (in a real app, these would be more sophisticated)
    const ranges = {
      'blood_pressure_systolic': { normal: [90, 120], warning: [120, 140], critical: [140, 180] },
      'blood_pressure_diastolic': { normal: [60, 80], warning: [80, 90], critical: [90, 120] },
      'heart_rate': { normal: [60, 100], warning: [50, 120], critical: [40, 150] },
      'temperature': { normal: [97, 99], warning: [99, 101], critical: [101, 104] },
      'weight': { normal: [100, 250], warning: [250, 300], critical: [300, 400] },
    };

    const range = ranges[type];
    if (!range) return 'normal';

    if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
    if (value >= range.warning[0] && value <= range.warning[1]) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const VitalCard = ({ vital, trend }) => {
    const status = getVitalStatus(vital.type, vital.value);
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div">
              {vital.type.replace('_', ' ').toUpperCase()}
            </Typography>
            {trend === 'up' ? <TrendingUp color="success" /> : 
             trend === 'down' ? <TrendingDown color="error" /> : null}
          </Box>
          <Typography variant="h4" color={getStatusColor(status) + '.main'}>
            {vital.value} {vital.unit}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {vital.recordedAt?.toDate?.()?.toLocaleDateString()}
          </Typography>
          <Chip 
            label={status.toUpperCase()} 
            color={getStatusColor(status)} 
            size="small" 
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading health summary...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Health Summary
      </Typography>

      {/* Health Alerts */}
      {healthData.conditions.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {healthData.conditions.length} active medical condition(s) being monitored.
        </Alert>
      )}

      {healthData.allergies.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Allergies:</strong> {healthData.allergies.map(a => a.allergen).join(', ')}
        </Alert>
      )}

      {/* Recent Vitals */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <VitalsIcon sx={{ mr: 1 }} />
            Recent Vital Signs
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddVitalDialog(true)}
          >
            Add Vital
          </Button>
        </Box>
        
        {healthData.vitals.length > 0 ? (
          <Grid container spacing={2}>
            {healthData.vitals.slice(0, 4).map((vital, index) => (
              <Grid item xs={12} sm={6} md={3} key={vital.id}>
                <VitalCard vital={vital} trend={index === 0 ? 'stable' : null} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No vital signs recorded yet
          </Typography>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Medical Conditions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicalIcon sx={{ mr: 1 }} />
              Medical Conditions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {healthData.conditions.length > 0 ? (
              <List>
                {healthData.conditions.map((condition) => (
                  <ListItem key={condition.id} divider>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={condition.name}
                      secondary={`Diagnosed: ${condition.diagnosedDate?.toDate?.()?.toLocaleDateString()}`}
                    />
                    <Chip 
                      label={condition.severity || 'Moderate'} 
                      color={condition.severity === 'High' ? 'error' : 'warning'} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No active medical conditions
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Current Medications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HeartIcon sx={{ mr: 1 }} />
              Current Medications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {healthData.medications.length > 0 ? (
              <List>
                {healthData.medications.map((medication) => (
                  <ListItem key={medication.id} divider>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={medication.medicationName}
                      secondary={`${medication.dosage} - ${medication.frequency}`}
                    />
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No current medications
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Allergies */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Allergies & Reactions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {healthData.allergies.length > 0 ? (
              <List>
                {healthData.allergies.map((allergy) => (
                  <ListItem key={allergy.id} divider>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={allergy.allergen}
                      secondary={`Reaction: ${allergy.reaction}`}
                    />
                    <Chip 
                      label={allergy.severity || 'Moderate'} 
                      color="error" 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No known allergies
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Health Goals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Health Goals
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Weight Management"
                  secondary="Target: Maintain current weight"
                />
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ width: 100, mr: 2 }} 
                />
                <Typography variant="body2">75%</Typography>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Blood Pressure Control"
                  secondary="Target: <120/80 mmHg"
                />
                <LinearProgress 
                  variant="determinate" 
                  value={90} 
                  sx={{ width: 100, mr: 2 }} 
                />
                <Typography variant="body2">90%</Typography>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Exercise Routine"
                  secondary="Target: 150 min/week"
                />
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ width: 100, mr: 2 }} 
                />
                <Typography variant="body2">60%</Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Vital Dialog */}
      <Dialog open={addVitalDialog} onClose={() => setAddVitalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Vital Signs</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Vital Type</InputLabel>
                <Select
                  value={newVital.type}
                  onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                >
                  <MenuItem value="blood_pressure_systolic">Blood Pressure (Systolic)</MenuItem>
                  <MenuItem value="blood_pressure_diastolic">Blood Pressure (Diastolic)</MenuItem>
                  <MenuItem value="heart_rate">Heart Rate</MenuItem>
                  <MenuItem value="temperature">Temperature</MenuItem>
                  <MenuItem value="weight">Weight</MenuItem>
                  <MenuItem value="height">Height</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={newVital.value}
                onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Unit"
                value={newVital.unit}
                onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
                placeholder="e.g., mmHg, bpm, °F"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={newVital.notes}
                onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddVitalDialog(false)}>Cancel</Button>
          <Button onClick={handleAddVital} variant="contained">
            Record Vital
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
