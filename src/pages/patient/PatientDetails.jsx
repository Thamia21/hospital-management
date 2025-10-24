import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { DateTimePicker } from '@mui/x-date-pickers';
import { userService, appointmentService } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
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

import { facilityApi } from '../../services/facilityApi';

export default function PatientDetails() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [editFacilities, setEditFacilities] = useState(false);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [itemToReview, setItemToReview] = useState(null);
  const [reviewType, setReviewType] = useState(null);
  const [success, setSuccess] = useState('');

  // Form states
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });

  const [newRecord, setNewRecord] = useState({
    type: '', // Keep 'type' for form, but map to 'recordType' when saving
    diagnosis: '',
    treatment: '',
    notes: ''
  });

  const [newAppointment, setNewAppointment] = useState({
    date: null,
    reason: '',
    type: 'Follow-up',
    notes: ''
  });

  const [newTest, setNewTest] = useState({
    testType: '',
    testName: '',
    result: '',
    resultValue: '',
    units: '',
    referenceRange: '',
    notes: '',
    date: null,
    status: 'Completed'
  });

  // Add testTypes constant
  const testTypes = {
    'Pregnancy Tests': [
      'Pregnancy Test (urine)',
      'Pregnancy Test (blood)',
      'Beta HCG Level',
      'Ultrasound (Dating)',
      'Ultrasound (Anatomy)',
      'Gestational Diabetes',
      'Group B Strep',
      'Genetic Screening',
      'AFP Test',
      'Amniocentesis',
      'NIPT (Non-Invasive Prenatal Testing)',
      'Nuchal Translucency'
    ],
    'Blood Tests': [
      'Complete Blood Count (CBC)',
      'Blood Sugar/Glucose',
      'HIV Test',
      'Diabetes (HbA1c)',
      'Cholesterol Panel',
      'Thyroid Function (TSH, T3, T4)',
      'Liver Function',
      'Kidney Function',
      'Iron Studies',
      'Vitamin D Level',
      'Vitamin B12 Level',
      'Folate Level',
      'Coagulation Profile',
      'Rheumatoid Factor',
      'ESR (Sedimentation Rate)',
      'CRP (C-Reactive Protein)'
    ],
    'Cancer Screening': [
      'PSA Test',
      'Mammogram',
      'Pap Smear',
      'Colonoscopy',
      'Skin Cancer Screening',
      'Lung Cancer Screening',
      'Breast Biopsy',
      'Tumor Markers',
      'CA-125 (Ovarian)',
      'CEA (Carcinoembryonic Antigen)',
      'AFP (Liver Cancer)',
      'Bone Marrow Biopsy'
    ],
    'STD Tests': [
      'HIV',
      'Syphilis',
      'Gonorrhea',
      'Chlamydia',
      'Hepatitis B',
      'Hepatitis C',
      'HPV Test',
      'Herpes Simplex',
      'Trichomoniasis',
      'Mycoplasma',
      'VDRL Test'
    ],
    'Urinalysis': [
      'Basic Metabolic Panel',
      'Protein Test',
      'Glucose Test',
      'Ketones',
      'Bilirubin',
      'Microalbumin',
      'Creatinine',
      'Urine Culture',
      'Drug Screening',
      '24-Hour Urine Collection'
    ],
    'Cardiac Tests': [
      'ECG/EKG',
      'Stress Test',
      'Echocardiogram',
      'Holter Monitor',
      'Cardiac CT',
      'Coronary Angiogram',
      'Cardiac MRI',
      'Blood Pressure Monitor'
    ],
    'Respiratory Tests': [
      'Chest X-Ray',
      'Pulmonary Function Test',
      'Spirometry',
      'Sleep Study',
      'TB Test',
      'Bronchoscopy',
      'Sputum Culture',
      'Peak Flow Test'
    ],
    'Neurological Tests': [
      'EEG',
      'EMG',
      'CT Scan (Brain)',
      'MRI (Brain)',
      'Nerve Conduction Study',
      'Spinal Tap',
      'Memory Assessment',
      'Balance Testing'
    ],
    'Gastrointestinal Tests': [
      'Endoscopy',
      'Colonoscopy',
      'H. Pylori Test',
      'Stool Analysis',
      'Liver Biopsy',
      'HIDA Scan',
      'Gastric Emptying Study',
      'Celiac Disease Test'
    ],
    'Bone & Joint Tests': [
      'Bone Density Scan',
      'Arthroscopy',
      'Joint X-Ray',
      'MRI (Joint)',
      'Synovial Fluid Analysis',
      'Bone Biopsy',
      'Bone Marrow Test',
      'Rheumatoid Factor Test'
    ],
    'Allergy Tests': [
      'Skin Prick Test',
      'Blood Allergy Test',
      'Patch Test',
      'Food Allergy Panel',
      'Environmental Allergens',
      'Drug Allergy Test',
      'Immunoglobulin E (IgE)',
      'Challenge Test'
    ],
    'Genetic Tests': [
      'Chromosomal Analysis',
      'DNA Sequencing',
      'Carrier Screening',
      'Hereditary Cancer Testing',
      'Pharmacogenetic Testing',
      'Newborn Screening',
      'Genetic Counseling'
    ],
    'Other Tests': [
      'X-Ray',
      'CT Scan',
      'MRI',
      'Ultrasound',
      'PET Scan',
      'Bone Scan',
      'Biopsy',
      'Thermography',
      'Fluoroscopy',
      'Nuclear Medicine Scan'
    ]
  };

  useEffect(() => {
    facilityApi.getAll().then(setFacilities);
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patient details
      console.log('Fetching patient data for ID:', patientId);
      const patient = await userService.getUserById(patientId);
      console.log('Patient data received:', patient);
      
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      setPatientData(patient);
      setSelectedFacilityIds(patient.facilityIds || []);
      
      // Log facility information for debugging
      if (patient.facilityNames) {
        console.log('Facility names from API:', patient.facilityNames);
      } else if (patient.facilityIds) {
        console.log('Facility IDs from API (will try to fetch names):', patient.facilityIds);
      } else {
        console.log('No facility information found in patient data');
      }
      
      console.log('Phone number from API:', patient.phoneNumber || patient.phone || 'Not provided');

      // Fetch facilities if not already in state
      if (facilities.length === 0) {
        console.log('Fetching facilities...');
        const facilitiesData = await facilityApi.getAll();
        console.log('Facilities loaded:', facilitiesData.length);
        setFacilities(facilitiesData);
      }

      // Fetch medical records
      try {
        const medicalRecordsResponse = await fetch(`http://localhost:5000/api/appointments/medical-records?patientId=${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (medicalRecordsResponse.ok) {
          const medicalRecordsData = await medicalRecordsResponse.json();
          setMedicalRecords(medicalRecordsData);
          console.log('Medical records loaded:', medicalRecordsData.length);
        } else {
          console.error('Failed to fetch medical records:', medicalRecordsResponse.status);
          setMedicalRecords([]);
        }
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setMedicalRecords([]);
      }

      // Fetch test results
      try {
        const testResultsResponse = await fetch(`http://localhost:5000/api/appointments/test-results?patientId=${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (testResultsResponse.ok) {
          const testResultsData = await testResultsResponse.json();
          setTestResults(testResultsData);
          console.log('Test results loaded:', testResultsData.length);
        } else {
          console.error('Failed to fetch test results:', testResultsResponse.status);
          setTestResults([]);
        }
      } catch (err) {
        console.error('Error fetching test results:', err);
        setTestResults([]);
      }

      // Fetch prescriptions
      try {
        const prescriptionsResponse = await fetch(`http://localhost:5000/api/appointments/prescriptions?patientId=${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (prescriptionsResponse.ok) {
          const prescriptionsData = await prescriptionsResponse.json();
          setPrescriptions(prescriptionsData);
          console.log('Prescriptions loaded:', prescriptionsData.length);
        } else {
          console.error('Failed to fetch prescriptions:', prescriptionsResponse.status);
          setPrescriptions([]);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setPrescriptions([]);
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();
    const prescriptionData = {
      ...newPrescription,
      patientId,
      doctorId: user.uid,
      doctorName: user.displayName || user.email,
      prescribedDate: new Date(), // Use prescribedDate instead of createdAt
      status: 'active', // Use 'active' instead of 'PENDING_REVIEW' to match model enum
      instructions: newPrescription.notes // Map notes to instructions
    };
    // Remove the 'notes' field as it's mapped to 'instructions'
    delete prescriptionData.notes;
    setItemToReview(prescriptionData);
    setReviewType('prescription');
    setReviewModalOpen(true);
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    const recordData = {
      ...newRecord,
      patientId,
      doctorId: user.uid,
      doctorName: user.displayName || user.email,
      recordDate: new Date(), // Use recordDate instead of createdAt to avoid conflict
      status: 'PENDING_REVIEW',
      // Map frontend 'type' field to backend 'recordType' field with correct enum values
      recordType: newRecord.type.toLowerCase().replace(' ', '_') // Convert "Consultation" to "consultation", "Lab Result" to "lab_result"
    };
    // Remove the 'type' field as it's mapped to 'recordType'
    delete recordData.type;
    setItemToReview(recordData);
    setReviewType('medical-record');
    setReviewModalOpen(true);
  };

  const handleAddTest = (e) => {
    e.preventDefault();
    const testData = {
      ...newTest,
      patientId,
      doctorId: user.uid,
      doctorName: user.displayName || user.email,
      testDate: new Date(), // Use testDate instead of createdAt
      status: 'PENDING_REVIEW',
      // Map frontend fields to match backend model structure
      results: [
        {
          parameter: newTest.testName,
          value: newTest.resultValue || newTest.result,
          unit: newTest.units,
          referenceRange: newTest.referenceRange
        }
      ],
      interpretation: newTest.notes // Map notes to interpretation
    };
    // Remove individual fields that are now in the results array
    delete testData.testName;
    delete testData.result;
    delete testData.resultValue;
    delete testData.units;
    delete testData.referenceRange;
    delete testData.notes;

    setItemToReview(testData);
    setReviewType('test-result');
    setReviewModalOpen(true);
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const appointmentData = {
      ...newAppointment,
      patientId,
      doctorId: user.uid,
      doctorName: user.displayName || user.email,
      createdAt: new Date(),
      status: 'PENDING_REVIEW'
    };
    setItemToReview(appointmentData);
    setReviewType('appointment');
    setReviewModalOpen(true);
  };

  const handleReviewConfirm = async (data) => {
    try {
      setLoading(true);
      let collectionName = '';
      let successMessage = '';
      let resetForm = null;
      let closeDialog = null;

      switch (reviewType) {
        case 'prescription':
          collectionName = 'prescriptions';
          successMessage = 'Prescription shared with patient';
          resetForm = () => setNewPrescription({
            medication: '',
            dosage: '',
            frequency: '',
            duration: '',
            notes: ''
          });
          closeDialog = () => setOpenPrescriptionDialog(false);
          break;
        case 'medical-record':
          collectionName = 'medicalRecords';
          successMessage = 'Medical record shared with patient';
          resetForm = () => setNewRecord({
            type: '',
            diagnosis: '',
            treatment: '',
            notes: ''
          });
          closeDialog = () => setOpenRecordDialog(false);
          break;
        case 'test-result':
          collectionName = 'testResults';
          successMessage = 'Test results shared with patient';
          resetForm = () => setNewTest({
            testType: '',
            testName: '',
            result: '',
            resultValue: '',
            units: '',
            referenceRange: '',
            notes: ''
          });
          closeDialog = () => setOpenTestDialog(false);
          break;
        case 'appointment':
          collectionName = 'appointments';
          successMessage = 'Appointment shared with patient';
          resetForm = () => setNewAppointment({
            date: null,
            reason: '',
            notes: ''
          });
          closeDialog = () => setOpenAppointmentDialog(false);
          break;
      }

      // Save to MongoDB
      try {
        // Use the correct API endpoint with proper base URL
        const requestData = {
          ...data,
          status: 'SHARED',
          isShared: true,
          sharedAt: new Date()
        };

        console.log(`Sending ${reviewType} data to backend:`, requestData);

        const response = await fetch(`http://localhost:5000/api/appointments/${reviewType === 'medical-record' ? 'medical-records' : reviewType === 'test-result' ? 'test-results' : 'prescriptions'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(requestData)
        });

        console.log(`Backend response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Backend error response:`, errorData);
          throw new Error(errorData.error || errorData.message || `Failed to save ${reviewType}`);
        }

        const savedRecord = await response.json();
        console.log(`${reviewType} saved successfully:`, savedRecord);
      } catch (saveError) {
        console.error(`Error saving ${reviewType}:`, saveError);
        // Don't fail the whole process if saving fails
      }

      // Reset states
      resetForm();
      closeDialog();
      setReviewModalOpen(false);
      setItemToReview(null);
      setReviewType(null);
      
      // Show success message
      setSuccess(successMessage);
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh data
      await fetchPatientData();
    } catch (err) {
      console.error('Error sharing data:', err);
      setError(`Failed to share ${reviewType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCancel = () => {
    setReviewModalOpen(false);
    setItemToReview(null);
    setReviewType(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Patient Details
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {patientData?.name || patientData?.displayName || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {patientData?.email || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {patientData?.phoneNumber || patientData?.phone || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Assigned Facilities:</strong>
            </Typography>
            {editFacilities ? (
              <FormControl sx={{ minWidth: 220, mt: 1 }} size="small">
                <InputLabel id="facility-ids-label">Hospitals/Clinics</InputLabel>
                <Select
                  labelId="facility-ids-label"
                  multiple
                  value={selectedFacilityIds}
                  onChange={e => setSelectedFacilityIds(e.target.value)}
                  renderValue={selected => selected.map(id => {
                    const facility = facilities.find(f => f._id === id);
                    return facility ? facility.name : id;
                  }).join(', ')}
                >
                  {facilities.map(facility => (
                    <MenuItem key={facility._id} value={facility._id}>
                      {facility.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ ml: 2 }}>
                {patientData?.facilityNames?.length > 0 
                  ? patientData.facilityNames.join(', ')
                  : (patientData?.facilityIds || []).map(id => {
                      const facility = facilities.find(f => f._id === id);
                      return facility ? facility.name : id;
                    }).join(', ') || 'N/A'}
              </Typography>
            )}
            {user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE' ? (
              editFacilities ? (
                <Button sx={{ ml: 2 }} size="small" variant="contained" color="success" onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    // Update patient in backend (replace with your update logic)
                    await fetch(`/api/users/${patientId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({ facilityIds: selectedFacilityIds })
                    });
                    setPatientData(prev => ({ ...prev, facilityIds: selectedFacilityIds }));
                    setEditFacilities(false);
                  } catch (err) {
                    setError('Failed to update facilities');
                  } finally {
                    setLoading(false);
                  }
                }}>
                  Save
                </Button>
              ) : (
                <Button sx={{ ml: 2 }} size="small" variant="outlined" onClick={() => setEditFacilities(true)}>
                  Edit
                </Button>
              )
            ) : null}
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAppointmentDialog(true)}
              sx={{ mr: 1 }}
            >
              Schedule Appointment
            </Button>
            <Button
              variant="outlined"
              startIcon={<MedicalServicesIcon />}
              onClick={() => navigate(`/patient/${patientId}/medical-records`)}
            >
              View Medical Records
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Medical Records" />
          <Tab label="Test Results" />
          <Tab label="Prescriptions" />
          <Tab label="Appointments" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenRecordDialog(true)}
            >
              Add Medical Record
            </Button>
          </Box>
          <List>
            {medicalRecords.map((record, index) => (
              <React.Fragment key={record.id || `medical-record-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        <strong>{record.recordType}</strong> - {new Date(record.recordDate).toLocaleDateString()}
                      </Typography>
                    }
                    secondary={
                      <>
                        {record.diagnosis && (
                          <Box component="span">
                            <strong>Diagnosis:</strong> {record.diagnosis}
                          </Box>
                        )}
                        {record.description && (
                          <>
                            <br />
                            <Box component="span">
                              <strong>Description:</strong> {record.description}
                            </Box>
                          </>
                        )}
                        {record.treatment && (
                          <>
                            <br />
                            <Box component="span">
                              <strong>Treatment:</strong> {record.treatment}
                            </Box>
                          </>
                        )}
                        {record.notes && (
                          <>
                            <br />
                            <Box component="span">
                              <strong>Notes:</strong> {record.notes}
                            </Box>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < medicalRecords.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {medicalRecords.length === 0 && (
              <ListItem>
                <ListItemText primary="No medical records found" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTestDialog(true)}
            >
              Add Test Result
            </Button>
          </Box>
          <List>
            {testResults.map((test, index) => (
              <React.Fragment key={test.id || `test-result-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={`${test.testName} - ${new Date(test.testDate).toLocaleDateString()}`}
                    secondary={
                      <>
                        {test.results && test.results.length > 0 && test.results.map((result, idx) => (
                          <Box key={idx} component="span">
                            <strong>{result.parameter}:</strong> {result.value}
                            {result.unit && ` ${result.unit}`}
                            {result.referenceRange && ` (Ref: ${result.referenceRange})`}
                            {idx < test.results.length - 1 && <br />}
                          </Box>
                        ))}
                        {test.interpretation && (
                          <>
                            <br />
                            <Box component="span">
                              <strong>Interpretation:</strong> {test.interpretation}
                            </Box>
                          </>
                        )}
                        <br />
                        <Box component="span">
                          <strong>Status:</strong> {test.status}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {index < testResults.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {testResults.length === 0 && (
              <ListItem>
                <ListItemText primary="No test results found" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenPrescriptionDialog(true)}
            >
              Add Prescription
            </Button>
          </Box>
          <List>
            {prescriptions.map((prescription, index) => (
              <React.Fragment key={prescription.id || `prescription-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={`${prescription.medication} - ${new Date(prescription.prescribedDate).toLocaleDateString()}`}
                    secondary={
                      <>
                        <Box component="span">
                          <strong>Dosage:</strong> {prescription.dosage}
                        </Box>
                        <br />
                        <Box component="span">
                          <strong>Frequency:</strong> {prescription.frequency}
                        </Box>
                        <br />
                        <Box component="span">
                          <strong>Duration:</strong> {prescription.duration}
                        </Box>
                        {prescription.instructions && (
                          <>
                            <br />
                            <Box component="span">
                              <strong>Instructions:</strong> {prescription.instructions}
                            </Box>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < prescriptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {prescriptions.length === 0 && (
              <ListItem>
                <ListItemText primary="No prescriptions found" />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <List>
            {appointments.map((appointment, index) => (
              <React.Fragment key={appointment.id || `appointment-${index}`}>
                <ListItem>
                  <ListItemText
                    primary={new Date(appointment.date).toLocaleString()}
                    secondary={
                      <>
                        <Box component="span">
                          <strong>Type:</strong> {appointment.type}
                        </Box>
                        <br />
                        <Box component="span">
                          <strong>Reason:</strong> {appointment.reason}
                        </Box>
                        <br />
                        <Box component="span">
                          <strong>Status:</strong> {appointment.status}
                        </Box>
                        {appointment.notes && (
                          <>
                            <br />
                            <Box component="span">
                              <strong>Notes:</strong> {appointment.notes}
                            </Box>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {appointments.length === 0 && (
              <ListItem>
                <ListItemText primary="No appointments found" />
              </ListItem>
            )}
          </List>
        </TabPanel>
      </Paper>

      {/* Add Prescription Dialog */}
      <Dialog 
        open={openPrescriptionDialog} 
        onClose={() => setOpenPrescriptionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Prescription</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medication"
                value={newPrescription.medication}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  medication: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dosage"
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  dosage: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Frequency"
                value={newPrescription.frequency}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  frequency: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration"
                value={newPrescription.duration}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  duration: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription({
                  ...newPrescription,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrescriptionDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPrescription} variant="contained">Add Prescription</Button>
        </DialogActions>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog 
        open={openRecordDialog} 
        onClose={() => setOpenRecordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Medical Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Record Type</InputLabel>
                <Select
                  value={newRecord.type}
                  label="Record Type"
                  onChange={(e) => setNewRecord({
                    ...newRecord,
                    type: e.target.value
                  })}
                >
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Lab Result">Lab Result</MenuItem>
                  <MenuItem value="Surgery">Surgery</MenuItem>
                  <MenuItem value="Vaccination">Vaccination</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                multiline
                rows={2}
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({
                  ...newRecord,
                  diagnosis: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment"
                multiline
                rows={2}
                value={newRecord.treatment}
                onChange={(e) => setNewRecord({
                  ...newRecord,
                  treatment: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={newRecord.notes}
                onChange={(e) => setNewRecord({
                  ...newRecord,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecordDialog(false)}>Cancel</Button>
          <Button onClick={handleAddRecord} variant="contained">Add Record</Button>
        </DialogActions>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog 
        open={openAppointmentDialog} 
        onClose={() => setOpenAppointmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={newAppointment.date}
                onChange={(newValue) => setNewAppointment({
                  ...newAppointment,
                  date: newValue
                })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={newAppointment.type}
                  label="Appointment Type"
                  onChange={(e) => setNewAppointment({
                    ...newAppointment,
                    type: e.target.value
                  })}
                >
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Check-up">Check-up</MenuItem>
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Treatment">Treatment</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={2}
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  reason: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppointmentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAppointment} variant="contained">Schedule Appointment</Button>
        </DialogActions>
      </Dialog>

      {/* Add Test Result Dialog */}
      <Dialog 
        open={openTestDialog} 
        onClose={() => setOpenTestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Test Result</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={newTest.testType}
                  label="Test Type"
                  onChange={(e) => setNewTest({
                    ...newTest,
                    testType: e.target.value,
                    testName: '' // Reset test name when type changes
                  })}
                >
                  {Object.keys(testTypes).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!newTest.testType}>
                <InputLabel>Test Name</InputLabel>
                <Select
                  value={newTest.testName}
                  label="Test Name"
                  onChange={(e) => setNewTest({
                    ...newTest,
                    testName: e.target.value
                  })}
                >
                  {newTest.testType && testTypes[newTest.testType].map((test) => (
                    <MenuItem key={test} value={test}>{test}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Result"
                value={newTest.result}
                onChange={(e) => setNewTest({
                  ...newTest,
                  result: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Result Value (Optional)"
                value={newTest.resultValue}
                onChange={(e) => setNewTest({
                  ...newTest,
                  resultValue: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Units (Optional)"
                value={newTest.units}
                onChange={(e) => setNewTest({
                  ...newTest,
                  units: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Range (Optional)"
                value={newTest.referenceRange}
                onChange={(e) => setNewTest({
                  ...newTest,
                  referenceRange: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={newTest.notes}
                onChange={(e) => setNewTest({
                  ...newTest,
                  notes: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTest.status}
                  label="Status"
                  onChange={(e) => setNewTest({
                    ...newTest,
                    status: e.target.value
                  })}
                >
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTest} variant="contained">Add Test Result</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog 
        open={reviewModalOpen} 
        onClose={handleReviewCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Review {reviewType}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {reviewType === 'prescription' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Medication:</strong> {itemToReview.medication}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Dosage:</strong> {itemToReview.dosage}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Frequency:</strong> {itemToReview.frequency}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Duration:</strong> {itemToReview.duration}
                  </Typography>
                </Grid>
                {itemToReview.instructions && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Instructions:</strong> {itemToReview.instructions}
                    </Typography>
                  </Grid>
                )}
              </React.Fragment>
            )}
            {reviewType === 'medical-record' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Type:</strong> {itemToReview.recordType}
                  </Typography>
                </Grid>
                {itemToReview.diagnosis && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Diagnosis:</strong> {itemToReview.diagnosis}
                    </Typography>
                  </Grid>
                )}
                {itemToReview.description && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Description:</strong> {itemToReview.description}
                    </Typography>
                  </Grid>
                )}
                {itemToReview.treatment && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Treatment:</strong> {itemToReview.treatment}
                    </Typography>
                  </Grid>
                )}
                {itemToReview.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Notes:</strong> {itemToReview.notes}
                    </Typography>
                  </Grid>
                )}
              </React.Fragment>
            )}
            {reviewType === 'test-result' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Test Name:</strong> {itemToReview.testName}
                  </Typography>
                </Grid>
                {itemToReview.results && itemToReview.results.length > 0 && itemToReview.results.map((result, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        <strong>{result.parameter}:</strong> {result.value}
                        {result.unit && ` ${result.unit}`}
                        {result.referenceRange && ` (Ref: ${result.referenceRange})`}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                ))}
                {itemToReview.interpretation && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Interpretation:</strong> {itemToReview.interpretation}
                    </Typography>
                  </Grid>
                )}
              </React.Fragment>
            )}
            {reviewType === 'appointment' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Date:</strong> {new Date(itemToReview.date).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Reason:</strong> {itemToReview.reason}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Notes:</strong> {itemToReview.notes}
                  </Typography>
                </Grid>
              </React.Fragment>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewCancel}>Cancel</Button>
          <Button onClick={() => handleReviewConfirm(itemToReview)} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
}
