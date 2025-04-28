import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider
} from '@mui/material';

export default function ReviewDialog({
  open,
  onClose,
  onConfirm,
  data,
  type
}) {
  if (!data) return null;

  const renderContent = () => {
    switch (type) {
      case 'prescription':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Medication:</strong> {data.medication}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Dosage:</strong> {data.dosage}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Frequency:</strong> {data.frequency}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Duration:</strong> {data.duration}</Typography>
            </Grid>
            {data.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Notes:</strong> {data.notes}</Typography>
              </Grid>
            )}
          </Grid>
        );

      case 'medical-record':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Type:</strong> {data.type}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Diagnosis:</strong> {data.diagnosis}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Treatment:</strong> {data.treatment}</Typography>
            </Grid>
            {data.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Notes:</strong> {data.notes}</Typography>
              </Grid>
            )}
          </Grid>
        );

      case 'test-result':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Test Type:</strong> {data.testType}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Test Name:</strong> {data.testName}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Result:</strong> {data.result}
                {data.resultValue && data.units && ` (${data.resultValue} ${data.units})`}
              </Typography>
            </Grid>
            {data.referenceRange && (
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Reference Range:</strong> {data.referenceRange}</Typography>
              </Grid>
            )}
            {data.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Notes:</strong> {data.notes}</Typography>
              </Grid>
            )}
          </Grid>
        );

      case 'appointment':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Date:</strong> {data.date?.toDate().toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1"><strong>Reason:</strong> {data.reason}</Typography>
            </Grid>
            {data.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Notes:</strong> {data.notes}</Typography>
              </Grid>
            )}
          </Grid>
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
    >
      <DialogTitle>
        Review {type ? type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ') : ''}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please review the following information before sharing with the patient:
          </Typography>
          <Divider sx={{ my: 2 }} />
          {renderContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Back to Edit
        </Button>
        <Button onClick={() => onConfirm(data)} variant="contained" color="primary">
          Confirm & Share
        </Button>
      </DialogActions>
    </Dialog>
  );
}
