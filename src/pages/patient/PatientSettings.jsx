import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
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
  IconButton,
  Collapse,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Accessibility as AccessibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandLess,
  ExpandMore,
  DarkMode as DarkModeIcon,
  VolumeUp as VolumeUpIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  ContactEmergency as EmergencyIcon,
  Favorite as HealthIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function PatientSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    notifications: false,
    privacy: false,
    accessibility: false,
    emergency: false,
  });

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    testResultAlerts: true,
    medicationReminders: true,
    billingNotifications: true,
    marketingEmails: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareDataWithProviders: true,
    allowResearchParticipation: false,
    profileVisibility: 'private',
  });

  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 'medium',
    highContrast: false,
    screenReader: false,
    language: 'en',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordDialog, setPasswordDialog] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, [user.uid]);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/patients/${user.uid}/settings`,
        { headers: getAuthHeader() }
      );
      
      const settings = response.data || {};
      
      // Set profile data
      setProfileData({
        name: user.name || settings.name || '',
        email: user.email || settings.email || '',
        phone: settings.phone || '',
        dateOfBirth: settings.dateOfBirth || '',
        address: settings.address || '',
        emergencyContact: settings.emergencyContact || {
          name: '',
          phone: '',
          relationship: '',
        },
      });

      // Set notification settings
      setNotificationSettings({
        ...notificationSettings,
        ...settings.notifications,
      });

      // Set privacy settings
      setPrivacySettings({
        ...privacySettings,
        ...settings.privacy,
      });

      // Set accessibility settings
      setAccessibilitySettings({
        ...accessibilitySettings,
        ...settings.accessibility,
      });

    } catch (error) {
      console.error('Error fetching user settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: typeof value === 'boolean' ? !prev[setting] : value
    }));
  };

  const handleAccessibilityChange = (setting, value) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: typeof value === 'boolean' ? !prev[setting] : value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      const settingsData = {
        name: profileData.name,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        emergencyContact: profileData.emergencyContact,
        notifications: notificationSettings,
        privacy: privacySettings,
        accessibility: accessibilitySettings,
      };

      await axios.put(
        `${API_URL}/patients/${user.uid}/settings`,
        settingsData,
        { headers: getAuthHeader() }
      );

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setSaving(true);
      setError('');

      await axios.put(
        `${API_URL}/patients/${user.uid}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: getAuthHeader() }
      );

      setSuccess('Password changed successfully!');
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please check your current password.');
    } finally {
      setSaving(false);
    }
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
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account preferences, notifications, and privacy settings.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon /></Avatar>}
              title="Profile Information"
              action={
                <IconButton onClick={() => handleSectionToggle('profile')}>
                  {expandedSections.profile ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections.profile}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled
                      helperText="Contact support to change your email"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={2}
                      value={profileData.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Name"
                      value={profileData.emergencyContact.name}
                      onChange={(e) => handleProfileChange('emergencyContact.name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Phone"
                      value={profileData.emergencyContact.phone}
                      onChange={(e) => handleProfileChange('emergencyContact.phone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Relationship</InputLabel>
                      <Select
                        value={profileData.emergencyContact.relationship}
                        onChange={(e) => handleProfileChange('emergencyContact.relationship', e.target.value)}
                      >
                        <MenuItem value="spouse">Spouse</MenuItem>
                        <MenuItem value="parent">Parent</MenuItem>
                        <MenuItem value="child">Child</MenuItem>
                        <MenuItem value="sibling">Sibling</MenuItem>
                        <MenuItem value="friend">Friend</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'info.main' }}><NotificationsIcon /></Avatar>}
              title="Notification Preferences"
              action={
                <IconButton onClick={() => handleSectionToggle('notifications')}>
                  {expandedSections.notifications ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections.notifications}>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText primary="Email Notifications" secondary="Receive general notifications via email" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText primary="SMS Notifications" secondary="Receive urgent notifications via SMS" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onChange={() => handleNotificationChange('smsNotifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><ScheduleIcon /></ListItemIcon>
                    <ListItemText primary="Appointment Reminders" secondary="Get reminded about upcoming appointments" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.appointmentReminders}
                        onChange={() => handleNotificationChange('appointmentReminders')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><MedicalServicesIcon /></ListItemIcon>
                    <ListItemText primary="Test Result Alerts" secondary="Be notified when test results are available" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.testResultAlerts}
                        onChange={() => handleNotificationChange('testResultAlerts')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HealthIcon /></ListItemIcon>
                    <ListItemText primary="Medication Reminders" secondary="Reminders to take your medications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.medicationReminders}
                        onChange={() => handleNotificationChange('medicationReminders')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><SecurityIcon /></Avatar>}
              title="Privacy & Security"
              action={
                <IconButton onClick={() => handleSectionToggle('privacy')}>
                  {expandedSections.privacy ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections.privacy}>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon><MedicalServicesIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Share Data with Healthcare Providers" 
                      secondary="Allow your healthcare team to access your medical data" 
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacySettings.shareDataWithProviders}
                        onChange={() => handlePrivacyChange('shareDataWithProviders')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SecurityIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Research Participation" 
                      secondary="Allow anonymized data to be used for medical research" 
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacySettings.allowResearchParticipation}
                        onChange={() => handlePrivacyChange('allowResearchParticipation')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Accessibility Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'success.main' }}><AccessibilityIcon /></Avatar>}
              title="Accessibility"
              action={
                <IconButton onClick={() => handleSectionToggle('accessibility')}>
                  {expandedSections.accessibility ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections.accessibility}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Font Size</InputLabel>
                      <Select
                        value={accessibilitySettings.fontSize}
                        onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
                      >
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                        <MenuItem value="extra-large">Extra Large</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={accessibilitySettings.language}
                        onChange={(e) => handleAccessibilityChange('language', e.target.value)}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="af">Afrikaans</MenuItem>
                        <MenuItem value="zu">Zulu</MenuItem>
                        <MenuItem value="xh">Xhosa</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <List>
                  <ListItem>
                    <ListItemIcon><VisibilityIcon /></ListItemIcon>
                    <ListItemText primary="High Contrast Mode" secondary="Increase contrast for better visibility" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={accessibilitySettings.highContrast}
                        onChange={() => handleAccessibilityChange('highContrast')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VolumeUpIcon /></ListItemIcon>
                    <ListItemText primary="Screen Reader Support" secondary="Enable screen reader compatibility" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={accessibilitySettings.screenReader}
                        onChange={() => handleAccessibilityChange('screenReader')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
