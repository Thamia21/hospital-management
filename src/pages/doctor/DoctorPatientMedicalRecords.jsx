import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
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
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Description as RecordIcon,
  LocalHospital as HospitalIcon,
  Person as DoctorIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  MedicalServices as MedicalIcon,
  Healing as TreatmentIcon,
  Science as LabIcon,
  Monitor as VitalIcon,
  Psychology as DiagnosisIcon,
  NavigateNext as NavigateNextIcon,
  Person as PatientIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-records-tabpanel-${index}`}
      aria-labelledby={`medical-records-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DoctorPatientMedicalRecords() {
  const { user } = useAuth();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords();
      fetchPatientInfo();
    }
  }, [patientId]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/patients/doctors/${user._id || user.id || user.uid}/patients/${patientId}/medical-records`,
        { headers: getAuthHeader() }
      );
      setMedicalRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setError('Failed to load medical records');
      setMedicalRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientInfo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/users/${patientId}`,
        { headers: getAuthHeader() }
      );
      setPatientInfo(response.data);
    } catch (error) {
      console.error('Error fetching patient info:', error);
      setPatientInfo(null);
    }
  };

  const getRecordTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'diagnosis':
        return 'error';
      case 'treatment':
        return 'success';
      case 'lab_result':
        return 'info';
      case 'vital_signs':
        return 'warning';
      case 'consultation':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'diagnosis':
        return <DiagnosisIcon />;
      case 'treatment':
        return <TreatmentIcon />;
      case 'lab_result':
        return <LabIcon />;
      case 'vital_signs':
        return <VitalIcon />;
      case 'consultation':
        return <MedicalIcon />;
      default:
        return <RecordIcon />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const openDetailDialog = (record) => {
    setSelectedRecord(record);
    setDetailDialog(true);
  };

  const closeDetailDialog = () => {
    setSelectedRecord(null);
    setDetailDialog(false);
  };

  const handlePrint = (record) => {
    window.print();
  };

  const handleDownload = (record) => {
    if (!record) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('Medical Record', 14, 22);

    // Patient Information
    autoTable(doc, {
      startY: 30,
      head: [['Patient Name', 'Patient ID']],
      body: [[patientInfo?.name || 'N/A', patientId || 'N/A']],
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Record Details
    const recordBody = [
      ['Record ID', record._id || 'N/A'],
      ['Record Type', record.recordType?.replace('_', ' ') || 'Unknown'],
      ['Record Date', formatDate(record.recordDate || record.createdAt)],
      ['Healthcare Provider', record.doctorName || record.provider || 'Unknown'],
      ['Facility', record.facility || 'Not specified'],
      ['Diagnosis/Title', record.diagnosis || record.title || 'No title available'],
      ['Description', { content: record.description || record.notes || 'No description available', styles: { cellWidth: 'wrap' } }],
    ];

    if (record.treatment) {
      recordBody.push(['Treatment', { content: record.treatment, styles: { cellWidth: 'wrap' } }]);
    }

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Field', 'Details']],
      body: recordBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { fontStyle: 'bold' },
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, 287, { align: 'center' });
    }

    doc.save(`medical-record-${record._id || 'details'}.pdf`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredRecords = medicalRecords.filter(record =>
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordsByType = {
    all: filteredRecords,
    diagnosis: filteredRecords.filter(r => r.recordType === 'diagnosis'),
    treatment: filteredRecords.filter(r => r.recordType === 'treatment'),
    lab_result: filteredRecords.filter(r => r.recordType === 'lab_result'),
    vital_signs: filteredRecords.filter(r => r.recordType === 'vital_signs'),
    consultation: filteredRecords.filter(r => r.recordType === 'consultation'),
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <MuiLink component={RouterLink} to="/doctor-dashboard" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={RouterLink} to="/doctor-patients" underline="hover" color="inherit">
          My Patients
        </MuiLink>
        <Typography color="text.primary">
          {patientInfo?.name || 'Patient'} Medical Records
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <PatientIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom>
            {patientInfo?.name || 'Patient'} Medical Records
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View complete medical history, diagnoses, treatments, and test results for this patient.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search medical records..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <RecordIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {medicalRecords.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <DiagnosisIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {recordsByType.diagnosis.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Diagnoses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TreatmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {recordsByType.treatment.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Treatments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <LabIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {recordsByType.lab_result.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lab Results
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <MedicalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {recordsByType.consultation.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consultations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different record types */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All Records" />
          <Tab label="Diagnoses" />
          <Tab label="Treatments" />
          <Tab label="Lab Results" />
          <Tab label="Vital Signs" />
          <Tab label="Consultations" />
        </Tabs>
      </Paper>

      {/* Records List */}
      {Object.keys(recordsByType).map((type, index) => (
        <TabPanel key={type} value={tabValue} index={index}>
          {recordsByType[type].length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <RecordIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No {type === 'all' ? 'medical records' : type.replace('_', ' ')} found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms.' : 'Patient medical records will appear here.'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {recordsByType[type].map((record) => (
                <Grid item xs={12} md={6} key={record._id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      }
                    }}
                    onClick={() => openDetailDialog(record)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="div">
                          {record.diagnosis || record.title || 'Medical Record'}
                        </Typography>
                        <Chip
                          label={record.recordType?.replace('_', ' ') || 'Record'}
                          color={getRecordTypeColor(record.recordType)}
                          size="small"
                          icon={getRecordTypeIcon(record.recordType)}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {record.description || record.notes || 'No description available'}
                      </Typography>

                      <List dense>
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <DoctorIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Healthcare Provider"
                            secondary={record.doctorName || record.provider || 'Unknown'}
                          />
                        </ListItem>
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <CalendarIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Date"
                            secondary={formatDate(record.recordDate || record.createdAt)}
                          />
                        </ListItem>
                        {record.facility && (
                          <ListItem disableGutters>
                            <ListItemIcon>
                              <HospitalIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Facility"
                              secondary={record.facility}
                            />
                          </ListItem>
                        )}
                      </List>

                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailDialog(record);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Record">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(record);
                            }}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(record);
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      ))}

      {/* Medical Record Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Medical Record Details
            </Typography>
            <Chip
              label={selectedRecord?.recordType?.replace('_', ' ') || 'Record'}
              color={getRecordTypeColor(selectedRecord?.recordType)}
              icon={getRecordTypeIcon(selectedRecord?.recordType)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Healthcare Provider
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.doctorName || selectedRecord.provider || 'Unknown'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDateTime(selectedRecord.recordDate || selectedRecord.createdAt)}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Facility
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.facility || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Record Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.recordType?.replace('_', ' ') || 'Unknown'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Record ID
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRecord.id || selectedRecord.recordId || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                {selectedRecord.recordType === 'diagnosis' ? 'Diagnosis' : 'Details'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedRecord.diagnosis || selectedRecord.title || 'No title available'}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedRecord.description || selectedRecord.notes || 'No description available'}
              </Typography>

              {selectedRecord.symptoms && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Symptoms
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedRecord.symptoms}
                  </Typography>
                </>
              )}

              {selectedRecord.treatment && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Treatment
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedRecord.treatment}
                  </Typography>
                </>
              )}

              {selectedRecord.medications && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Medications
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedRecord.medications}
                  </Typography>
                </>
              )}

              {selectedRecord.followUp && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Follow-up Instructions
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedRecord.followUp}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePrint(selectedRecord)} startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button onClick={() => handleDownload(selectedRecord)} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={closeDetailDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
