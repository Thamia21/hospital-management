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
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { DateTimePicker } from '@mui/x-date-pickers';

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

const SecondaryText = ({ children }) => (
  <Stack spacing={1}>
    {children}
  </Stack>
);

export default function PatientDetails() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
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
    type: '',
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
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patient details
      const patientDoc = await getDoc(doc(db, 'users', patientId));
      if (!patientDoc.exists()) {
        throw new Error('Patient not found');
      }
      setPatientData(patientDoc.data());

      // Fetch prescriptions
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId)
      );
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? 
          (doc.data().createdAt.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)) : 
          new Date()
      }));
      // Sort in memory
      setPrescriptions(prescriptionsData.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      }));

      // Fetch medical records
      const recordsQuery = query(
        collection(db, 'medicalRecords'),
        where('patientId', '==', patientId)
      );
      const recordsSnapshot = await getDocs(recordsQuery);
      const recordsData = recordsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? 
          (doc.data().createdAt.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)) : 
          new Date()
      }));
      // Sort in memory
      setMedicalRecords(recordsData.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      }));

      // Fetch appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date ? 
          (doc.data().date.toDate ? doc.data().date.toDate() : new Date(doc.data().date)) : 
          new Date()
      }));
      // Sort in memory
      setAppointments(appointmentsData.sort((a, b) => {
        const dateA = a.date || new Date(0);
        const dateB = b.date || new Date(0);
        return dateB - dateA;
      }));

      // Fetch test results
      const testResultsQuery = query(
        collection(db, 'testResults'),
        where('patientId', '==', patientId)
      );
      const testResultsSnapshot = await getDocs(testResultsQuery);
      const testResultsData = testResultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date ? 
          (doc.data().date.toDate ? doc.data().date.toDate() : new Date(doc.data().date)) : 
          new Date()
      }));
      // Sort in memory
      setTestResults(testResultsData.sort((a, b) => {
        const dateA = a.date || new Date(0);
        const dateB = b.date || new Date(0);
        return dateB - dateA;
      }));

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
      createdAt: serverTimestamp(),
      status: 'PENDING_REVIEW'
    };
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
      createdAt: serverTimestamp(),
      status: 'PENDING_REVIEW'
    };
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
      createdAt: serverTimestamp(),
      status: 'PENDING_REVIEW'
    };
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
      createdAt: serverTimestamp(),
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
      // let notificationMethod = sendNotification; (notifications not available)

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
          notificationMethod = sendPrescriptionNotification;
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
          notificationMethod = sendTestResultsNotification;
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

      // Add to Firestore
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        status: 'SHARED',
        isShared: true,
        sharedAt: serverTimestamp()
      });

      // Send push notification to patient
      try {
        // Send generic notification
        await sendNotification(patientId, {
          title: `New ${reviewType.replace('-', ' ')} Available`,
          body: `Your doctor has shared a new ${reviewType.replace('-', ' ')} with you.`,
          data: {
            type: reviewType,
            docId: docRef.id
          }
        });

        // Send specific type of notification if method exists
        if (notificationMethod !== sendNotification) {
          await notificationMethod({
            patientId,
            ...data,
            docId: docRef.id
          });
        }
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Non-critical error, so we'll continue with the rest of the process
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
              <strong>Name:</strong> {patientData?.firstName && patientData?.lastName 
                ? `${patientData.firstName.charAt(0).toUpperCase()}${patientData.firstName.slice(1)} ${patientData.lastName.charAt(0).toUpperCase()}${patientData.lastName.slice(1)}`
                : patientData?.displayName || patientData?.name || patientData?.email || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {patientData?.email || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {patientData?.phone || patientData?.phoneNumber || 'N/A'}
            </Typography>
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
              <React.Fragment key={record.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        <strong>{record.type}</strong> - {new Date(record.createdAt).toLocaleDateString()}
                      </Typography>
                    }
                    secondary={
                      <SecondaryText>
                        <Box component="span">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </Box>
                        <Box component="span">
                          <strong>Treatment:</strong> {record.treatment}
                        </Box>
                        {record.notes && (
                          <Box component="span">
                            <strong>Notes:</strong> {record.notes}
                          </Box>
                        )}
                      </SecondaryText>
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
              <React.Fragment key={test.id}>
                <ListItem>
                  <ListItemText
                    primary={`${test.testType}: ${test.testName} - ${new Date(test.date).toLocaleDateString()}`}
                    secondary={
                      <SecondaryText>
                        <Box component="span">
                          <strong>Result:</strong> {test.result}
                          {test.resultValue && test.units && ` (${test.resultValue} ${test.units})`}
                        </Box>
                        {test.referenceRange && (
                          <Box component="span">
                            <strong>Reference Range:</strong> {test.referenceRange}
                          </Box>
                        )}
                        {test.notes && (
                          <Box component="span">
                            <strong>Notes:</strong> {test.notes}
                          </Box>
                        )}
                        <Box component="span">
                          <strong>Status:</strong> {test.status}
                        </Box>
                      </SecondaryText>
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
              <React.Fragment key={prescription.id}>
                <ListItem>
                  <ListItemText
                    primary={`${prescription.medication} - ${new Date(prescription.createdAt).toLocaleDateString()}`}
                    secondary={
                      <SecondaryText>
                        <Box component="span">
                          <strong>Dosage:</strong> {prescription.dosage}
                        </Box>
                        <Box component="span">
                          <strong>Frequency:</strong> {prescription.frequency}
                        </Box>
                        <Box component="span">
                          <strong>Duration:</strong> {prescription.duration}
                        </Box>
                        {prescription.notes && (
                          <Box component="span">
                            <strong>Notes:</strong> {prescription.notes}
                          </Box>
                        )}
                      </SecondaryText>
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
              <React.Fragment key={appointment.id}>
                <ListItem>
                  <ListItemText
                    primary={new Date(appointment.date).toLocaleString()}
                    secondary={
                      <SecondaryText>
                        <Box component="span">
                          <strong>Type:</strong> {appointment.type}
                        </Box>
                        <Box component="span">
                          <strong>Reason:</strong> {appointment.reason}
                        </Box>
                        <Box component="span">
                          <strong>Status:</strong> {appointment.status}
                        </Box>
                        {appointment.notes && (
                          <Box component="span">
                            <strong>Notes:</strong> {appointment.notes}
                          </Box>
                        )}
                      </SecondaryText>
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
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Notes:</strong> {itemToReview.notes}
                  </Typography>
                </Grid>
              </React.Fragment>
            )}
            {reviewType === 'medical-record' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Type:</strong> {itemToReview.type}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Diagnosis:</strong> {itemToReview.diagnosis}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Treatment:</strong> {itemToReview.treatment}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Notes:</strong> {itemToReview.notes}
                  </Typography>
                </Grid>
              </React.Fragment>
            )}
            {reviewType === 'test-result' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Test Type:</strong> {itemToReview.testType}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Test Name:</strong> {itemToReview.testName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Result:</strong> {itemToReview.result}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Result Value:</strong> {itemToReview.resultValue}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Units:</strong> {itemToReview.units}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Reference Range:</strong> {itemToReview.referenceRange}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Notes:</strong> {itemToReview.notes}
                  </Typography>
                </Grid>
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
