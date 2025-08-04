import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Sms as SmsIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const NotificationSettings = ({ onUpdate, loading: parentLoading }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    // Email Notifications
    emailAppointmentReminders: true,
    emailPrescriptionRefills: true,
    emailLabResults: true,
    emailBilling: true,
    emailNewsletter: true,
    
    // Push Notifications
    pushAppointmentReminders: true,
    pushMedicationReminders: true,
    pushGeneralUpdates: false,
    
    // SMS Notifications
    smsAppointmentReminders: true,
    smsPrescriptionReady: true,
    smsBilling: false,
    
    // Notification Preferences
    notificationFrequency: 'immediate', // 'immediate', 'daily', 'weekly'
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    
    // Communication Preferences
    preferredContactMethod: 'email', // 'email', 'sms', 'push'
    language: 'en',
  });
  
  const [saved, setSaved] = useState(false);
  const isLoading = parentLoading;

  const handleToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleQuietHoursToggle = () => {
    setNotificationSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled
      }
    }));
  };

  const handleQuietHoursChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  const handleSelectChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate({ notificationSettings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EmailIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Email Notifications</Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailAppointmentReminders}
                  onChange={() => handleToggle('emailAppointmentReminders')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Appointment reminders"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Receive email reminders for upcoming appointments
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailPrescriptionRefills}
                  onChange={() => handleToggle('emailPrescriptionRefills')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Prescription refill alerts"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Get notified when your prescriptions are ready for refill
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailLabResults}
                  onChange={() => handleToggle('emailLabResults')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Lab results"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Receive notifications when new lab results are available
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailBilling}
                  onChange={() => handleToggle('emailBilling')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Billing statements"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Receive monthly billing statements and payment reminders
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNewsletter}
                  onChange={() => handleToggle('emailNewsletter')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Newsletter and health tips"
            />
            <FormHelperText sx={{ ml: 4, mt: -1 }}>
              Receive our monthly newsletter with health tips and updates
            </FormHelperText>
          </FormGroup>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <NotificationsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Push Notifications</Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushAppointmentReminders}
                  onChange={() => handleToggle('pushAppointmentReminders')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Appointment reminders"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Get push notifications for upcoming appointments
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushMedicationReminders}
                  onChange={() => handleToggle('pushMedicationReminders')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Medication reminders"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Reminders to take your medications
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushGeneralUpdates}
                  onChange={() => handleToggle('pushGeneralUpdates')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="General updates"
            />
            <FormHelperText sx={{ ml: 4, mt: -1 }}>
              General updates and announcements from our practice
            </FormHelperText>
          </FormGroup>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SmsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">SMS Notifications</Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.smsAppointmentReminders}
                  onChange={() => handleToggle('smsAppointmentReminders')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Appointment reminders"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Receive SMS reminders for upcoming appointments
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.smsPrescriptionReady}
                  onChange={() => handleToggle('smsPrescriptionReady')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Prescription ready alerts"
            />
            <FormHelperText sx={{ ml: 4, mt: -1, mb: 1 }}>
              Get notified when your prescriptions are ready for pickup
            </FormHelperText>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.smsBilling}
                  onChange={() => handleToggle('smsBilling')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Billing alerts"
            />
            <FormHelperText sx={{ ml: 4, mt: -1 }}>
              Receive SMS alerts for billing statements and payment reminders
            </FormHelperText>
          </FormGroup>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Notification Frequency</InputLabel>
                <Select
                  value={notificationSettings.notificationFrequency}
                  onChange={(e) => handleSelectChange('notificationFrequency', e.target.value)}
                  label="Notification Frequency"
                  disabled={isLoading}
                >
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="daily">Daily Digest</MenuItem>
                  <MenuItem value="weekly">Weekly Digest</MenuItem>
                </Select>
                <FormHelperText>
                  How often you'd like to receive non-urgent notifications
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.quietHours.enabled}
                    onChange={handleQuietHoursToggle}
                    color="primary"
                    disabled={isLoading}
                  />
                }
                label="Enable Quiet Hours"
              />
              <FormHelperText sx={{ ml: 0, mt: 1, mb: 2 }}>
                Pause notifications during specific hours
              </FormHelperText>
              
              {notificationSettings.quietHours.enabled && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 4 }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={notificationSettings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                  />
                  <Typography>to</Typography>
                  <TextField
                    label="End Time"
                    type="time"
                    value={notificationSettings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    disabled={isLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                  />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={notificationSettings.preferredContactMethod}
                  onChange={(e) => handleSelectChange('preferredContactMethod', e.target.value)}
                  label="Preferred Contact Method"
                  disabled={isLoading}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="push">Push Notification</MenuItem>
                </Select>
                <FormHelperText>
                  Your preferred method for receiving notifications
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Language</InputLabel>
                <Select
                  value={notificationSettings.language}
                  onChange={(e) => handleSelectChange('language', e.target.value)}
                  label="Language"
                  disabled={isLoading}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                </Select>
                <FormHelperText>
                  Language for notifications and communications
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isLoading}
            sx={{ minWidth: 150 }}
          >
            {saved ? 'Saved!' : 'Save Preferences'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default NotificationSettings;
