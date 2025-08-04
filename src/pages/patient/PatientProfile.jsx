import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  ContactEmergency as EmergencyIcon,
  MedicalServices as MedicalIcon,
  Bloodtype as BloodIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function PatientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoDialog, setPhotoDialog] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    medicalInfo: {
      bloodType: '',
      height: '',
      weight: '',
      allergies: [],
      chronicConditions: [],
    },
    profilePicture: '',
  });

  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, [user.uid]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Initialize with user data as fallback
      const defaultProfileInfo = {
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        postalCode: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
        medicalInfo: {
          bloodType: '',
          height: '',
          weight: '',
          allergies: [],
          chronicConditions: [],
        },
        profilePicture: '',
      };

      try {
        // Try to fetch from API
        const response = await axios.get(
          `${API_URL}/patients/${user.uid}/profile`,
          { headers: getAuthHeader() }
        );
        
        const profile = response.data || {};
        
        const profileInfo = {
          firstName: user.name?.split(' ')[0] || profile.firstName || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || profile.lastName || '',
          email: user.email || profile.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || '',
          address: profile.address || '',
          city: profile.city || '',
          postalCode: profile.postalCode || '',
          emergencyContact: profile.emergencyContact || defaultProfileInfo.emergencyContact,
          medicalInfo: profile.medicalInfo || defaultProfileInfo.medicalInfo,
          profilePicture: profile.profilePicture || '',
        };

        setProfileData(profileInfo);
        setEditData(profileInfo);
        
      } catch (apiError) {
        // If API endpoint doesn't exist (404), use default data
        if (apiError.response?.status === 404) {
          console.log('Profile API endpoint not implemented, using default data');
          setProfileData(defaultProfileInfo);
          setEditData(defaultProfileInfo);
        } else {
          throw apiError; // Re-throw other errors
        }
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show error for 404, as we handle it gracefully above
      if (error.response?.status !== 404) {
        setError('Failed to load profile information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...profileData });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...profileData });
    setError('');
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      try {
        // Try to save to API
        await axios.put(
          `${API_URL}/patients/${user.uid}/profile`,
          editData,
          { headers: getAuthHeader() }
        );
        setSuccess('Profile updated successfully!');
      } catch (apiError) {
        // If API endpoint doesn't exist, just update locally
        if (apiError.response?.status === 404) {
          console.log('Profile API endpoint not implemented, updating locally only');
          setSuccess('Profile updated locally (API endpoint not available)');
        } else {
          throw apiError; // Re-throw other errors
        }
      }

      // Update local state regardless of API success
      setProfileData({ ...editData });
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status !== 404) {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        {!editing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        )}
      </Box>

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
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                    mb: 2 
                  }}
                  src={profileData.profilePicture}
                >
                  {getInitials(profileData.firstName, profileData.lastName)}
                </Avatar>
                {editing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: -10,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                    onClick={() => setPhotoDialog(true)}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h5" gutterBottom>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Patient ID: {user.uid?.slice(-8).toUpperCase()}
              </Typography>
              <Chip 
                label="Active Patient" 
                color="success" 
                size="small" 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              avatar={<PersonIcon />}
              title="Personal Information"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editing ? editData.firstName : profileData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editing ? editData.lastName : profileData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    helperText="Contact support to change your email"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editing ? editData.phone : profileData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={editing ? editData.dateOfBirth : profileData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    disabled={!editing}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    select
                    value={editing ? editData.gender : profileData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    disabled={!editing}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={editing ? editData.address : profileData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editing ? editData.city : profileData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={editing ? editData.postalCode : profileData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<EmergencyIcon />}
              title="Emergency Contact"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={editing ? editData.emergencyContact.name : profileData.emergencyContact.name}
                    onChange={(e) => handleChange('emergencyContact.name', e.target.value)}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    value={editing ? editData.emergencyContact.phone : profileData.emergencyContact.phone}
                    onChange={(e) => handleChange('emergencyContact.phone', e.target.value)}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    select
                    value={editing ? editData.emergencyContact.relationship : profileData.emergencyContact.relationship}
                    onChange={(e) => handleChange('emergencyContact.relationship', e.target.value)}
                    disabled={!editing}
                  >
                    <MenuItem value="spouse">Spouse</MenuItem>
                    <MenuItem value="parent">Parent</MenuItem>
                    <MenuItem value="child">Child</MenuItem>
                    <MenuItem value="sibling">Sibling</MenuItem>
                    <MenuItem value="friend">Friend</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<MedicalIcon />}
              title="Medical Information"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Blood Type"
                    value={editing ? editData.medicalInfo.bloodType : profileData.medicalInfo.bloodType}
                    onChange={(e) => handleChange('medicalInfo.bloodType', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <BloodIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Height (cm)"
                    value={editing ? editData.medicalInfo.height : profileData.medicalInfo.height}
                    onChange={(e) => handleChange('medicalInfo.height', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    value={editing ? editData.medicalInfo.weight : profileData.medicalInfo.weight}
                    onChange={(e) => handleChange('medicalInfo.weight', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <WeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Profile picture upload functionality will be implemented in a future update.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
