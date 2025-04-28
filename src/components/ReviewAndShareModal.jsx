import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';


export default function ReviewAndShareModal({
  open,
  onClose,
  data,
  type,
  patientId,
  patientName,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'medical-record':
        return 'Review Medical Record';
      case 'test-results':
        return 'Review Test Results';
      case 'prescription':
        return 'Review Prescription';
      case 'appointment':
        return 'Review Appointment';
      default:
        return 'Review Information';
    }
  };

  const getNotificationMessage = () => {
    switch (type) {
      case 'medical-record':
        return 'New medical record has been added to your profile';
      case 'test-results':
        return 'Your test results are now available';
      case 'prescription':
        return 'A new prescription has been added to your profile';
      case 'appointment':
        return 'Your appointment details have been updated';
      default:
        return 'New information has been added to your profile';
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      setError('');

      // Update the document to mark it as shared
      const docRef = doc(db, type === 'medical-record' ? 'medicalRecords' : 
                           type === 'test-results' ? 'testResults' :
                           type === 'prescription' ? 'prescriptions' : 'appointments', 
                    data.id);

      await updateDoc(docRef, {
        isShared: true,
        sharedAt: Timestamp.now(),
        status: 'SHARED'
      });

      // Notification sending is not available in this version
      toast.info('Notification not sent: push notifications are not available in this version.');

      setSuccess(true);
      onSuccess?.();

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Error sharing information:', err);
      setError('Failed to share information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'medical-record':
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Patient:</strong> {patientName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date:</strong> {data.date?.toDate().toLocaleDateString()}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Diagnosis</Typography>
            <Typography paragraph>{data.diagnosis}</Typography>
            <Typography variant="h6">Treatment Plan</Typography>
            <Typography paragraph>{data.treatmentPlan}</Typography>
            <Typography variant="h6">Notes</Typography>
            <Typography paragraph>{data.notes}</Typography>
          </>
        );

      case 'test-results':
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Patient:</strong> {patientName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Test Date:</strong> {data.testDate?.toDate().toLocaleDateString()}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Test Type</Typography>
            <Typography paragraph>{data.testType}</Typography>
            <Typography variant="h6">Results</Typography>
            {Object.entries(data.results || {}).map(([key, value]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{key}</Typography>
                <Typography>
                  Value: {value.value} {value.unit}
                  {value.referenceRange && (
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      (Reference Range: {value.referenceRange})
                    </Typography>
                  )}
                </Typography>
              </Box>
            ))}
            <Typography variant="h6">Interpretation</Typography>
            <Typography paragraph>{data.interpretation}</Typography>
          </>
        );

      case 'prescription':
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Patient:</strong> {patientName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date:</strong> {data.date?.toDate().toLocaleDateString()}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Medications</Typography>
            <List>
              {data.medications?.map((med, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={med.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Dosage: {med.dosage}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Frequency: {med.frequency}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Duration: {med.duration}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="h6">Instructions</Typography>
            <Typography paragraph>{data.instructions}</Typography>
          </>
        );

      case 'appointment':
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Patient:</strong> {patientName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date:</strong> {data.date?.toDate().toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Time:</strong> {data.time}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Type</Typography>
            <Typography paragraph>{data.type}</Typography>
            <Typography variant="h6">Notes</Typography>
            <Typography paragraph>{data.notes}</Typography>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        {getTitle()}
        {!loading && !success && (
          <Chip
            label="Preview"
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : success ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} my={4}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="success.main">
              Information shared successfully!
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review the information carefully before sharing with the patient.
            </Alert>
            {renderContent()}
          </>
        )}
      </DialogContent>

      {!loading && !success && (
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleShare}
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            Confirm & Share
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
