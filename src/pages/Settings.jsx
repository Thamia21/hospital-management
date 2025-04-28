import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Accessibility as AccessibilityIcon,
  ColorLens as ColorLensIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  ExpandLess,
  ExpandMore,
  DarkMode as DarkModeIcon,
  VolumeUp as VolumeUpIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  // Notification Settings
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
      appointmentReminders: true,
      medicationReminders: true,
      testResults: true,
      newsletters: false
    },
    privacy: {
      showProfile: true,
      showAppointments: true,
      showMedicalHistory: false,
      allowDataSharing: false,
      allowResearch: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timeFormat: '24h',
      dateFormat: 'MM/DD/YYYY'
    },
    communication: {
      preferredMethod: 'email',
      emailAddress: user?.email || '',
      phoneNumber: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    medical: {
      shareAllergies: true,
      shareMedications: true,
      shareConditions: true,
      allowEmergencyAccess: true
    }
  });

  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [user?.uid]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      if (settingsDoc.exists()) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsDoc.data()
        }));
      } else {
        // Create default settings document if it doesn't exist
        await setDoc(doc(db, 'userSettings', user.uid), settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (category, setting, value) => {
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      
      // First check if document exists
      const docSnap = await getDoc(settingsRef);
      
      if (!docSnap.exists()) {
        // If document doesn't exist, create it with all settings
        await setDoc(settingsRef, {
          ...settings,
          [category]: {
            ...settings[category],
            [setting]: value
          }
        });
      } else {
        // If document exists, update it
        await updateDoc(settingsRef, {
          [`${category}.${setting}`]: value
        });
      }

      // Update local state
      setSettings(prevSettings => ({
        ...prevSettings,
        [category]: {
          ...prevSettings[category],
          [setting]: value
        }
      }));

      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating setting:', err);
      setError('Failed to update setting');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Implement password change logic here
    setOpenPasswordDialog(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <List>
          {/* Notification Settings */}
          <ListItem button onClick={() => toggleSection('notifications')}>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText primary="Notification Settings" />
            {openSection === 'notifications' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSection === 'notifications'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Email Notifications" />
                <Switch
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="SMS Notifications" />
                <Switch
                  checked={settings.notifications.sms}
                  onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Push Notifications" />
                <Switch
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Appointment Reminders" />
                <Switch
                  checked={settings.notifications.appointmentReminders}
                  onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Medication Reminders" />
                <Switch
                  checked={settings.notifications.medicationReminders}
                  onChange={(e) => handleSettingChange('notifications', 'medicationReminders', e.target.checked)}
                />
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          {/* Privacy Settings */}
          <ListItem button onClick={() => toggleSection('privacy')}>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText primary="Privacy Settings" />
            {openSection === 'privacy' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSection === 'privacy'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Show Profile to Other Doctors" />
                <Switch
                  checked={settings.privacy.showProfile}
                  onChange={(e) => handleSettingChange('privacy', 'showProfile', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Share Medical History" />
                <Switch
                  checked={settings.privacy.showMedicalHistory}
                  onChange={(e) => handleSettingChange('privacy', 'showMedicalHistory', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Allow Data Sharing for Research" />
                <Switch
                  checked={settings.privacy.allowResearch}
                  onChange={(e) => handleSettingChange('privacy', 'allowResearch', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          {/* Accessibility Settings */}
          <ListItem button onClick={() => toggleSection('accessibility')}>
            <ListItemIcon>
              <AccessibilityIcon />
            </ListItemIcon>
            <ListItemText primary="Accessibility Settings" />
            {openSection === 'accessibility' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSection === 'accessibility'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="High Contrast Mode" />
                <Switch
                  checked={settings.accessibility.highContrast}
                  onChange={(e) => handleSettingChange('accessibility', 'highContrast', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Large Text" />
                <Switch
                  checked={settings.accessibility.largeText}
                  onChange={(e) => handleSettingChange('accessibility', 'largeText', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Screen Reader Support" />
                <Switch
                  checked={settings.accessibility.screenReader}
                  onChange={(e) => handleSettingChange('accessibility', 'screenReader', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Reduced Motion" />
                <Switch
                  checked={settings.accessibility.reducedMotion}
                  onChange={(e) => handleSettingChange('accessibility', 'reducedMotion', e.target.checked)}
                />
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          {/* Appearance Settings */}
          <ListItem button onClick={() => toggleSection('appearance')}>
            <ListItemIcon>
              <ColorLensIcon />
            </ListItemIcon>
            <ListItemText primary="Appearance Settings" />
            {openSection === 'appearance' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSection === 'appearance'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    label="Theme"
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.appearance.language}
                    label="Language"
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={settings.appearance.timeFormat}
                    label="Time Format"
                    onChange={(e) => handleSettingChange('appearance', 'timeFormat', e.target.value)}
                  >
                    <MenuItem value="12h">12-hour</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          {/* Communication Settings */}
          <ListItem button onClick={() => toggleSection('communication')}>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText primary="Communication Settings" />
            {openSection === 'communication' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSection === 'communication'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Contact Method</InputLabel>
                  <Select
                    value={settings.communication.preferredMethod}
                    label="Preferred Contact Method"
                    onChange={(e) => handleSettingChange('communication', 'preferredMethod', e.target.value)}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={settings.communication.emailAddress}
                  onChange={(e) => handleSettingChange('communication', 'emailAddress', e.target.value)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={settings.communication.phoneNumber}
                  onChange={(e) => handleSettingChange('communication', 'phoneNumber', e.target.value)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={settings.communication.emergencyContact}
                  onChange={(e) => handleSettingChange('communication', 'emergencyContact', e.target.value)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={settings.communication.emergencyPhone}
                  onChange={(e) => handleSettingChange('communication', 'emergencyPhone', e.target.value)}
                />
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          {/* Medical Information Sharing */}
          <ListItem button onClick={() => toggleSection('medical')}>
            <ListItemIcon>
              <MedicalServicesIcon />
            </ListItemIcon>
            <ListItemText primary="Medical Information Sharing" />
            {openSection === 'medical' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSection === 'medical'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Share Allergies Information" />
                <Switch
                  checked={settings.medical.shareAllergies}
                  onChange={(e) => handleSettingChange('medical', 'shareAllergies', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Share Medications List" />
                <Switch
                  checked={settings.medical.shareMedications}
                  onChange={(e) => handleSettingChange('medical', 'shareMedications', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText primary="Share Medical Conditions" />
                <Switch
                  checked={settings.medical.shareConditions}
                  onChange={(e) => handleSettingChange('medical', 'shareConditions', e.target.checked)}
                />
              </ListItem>
              <ListItem sx={{ pl: 4 }}>
                <ListItemText 
                  primary="Allow Emergency Access"
                  secondary="Allow medical staff to access your records in emergencies"
                />
                <Switch
                  checked={settings.medical.allowEmergencyAccess}
                  onChange={(e) => handleSettingChange('medical', 'allowEmergencyAccess', e.target.checked)}
                />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
