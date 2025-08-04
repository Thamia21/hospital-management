import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { PhotoCamera, Save, Edit } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
// Using CDN for Cropper CSS to avoid build issues
import { useEffect } from 'react';

// Function to load CSS from CDN
const useCropperCSS = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
};

// Initialize the CSS hook
const CropperCSS = () => {
  useCropperCSS();
  return null;
};

const profileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[0-9+\s-]+$/, 'Invalid phone number'),
  dateOfBirth: yup.date().nullable(),
  gender: yup.string().oneOf(['male', 'female', 'other', 'prefer-not-to-say']),
  address: yup.string(),
  city: yup.string(),
  country: yup.string(),
  postalCode: yup.string(),
  emergencyContact: yup.object({
    name: yup.string(),
    relationship: yup.string(),
    phone: yup.string().matches(/^[0-9+\s-]+$/, 'Invalid phone number'),
  }),
});

const ProfileOverview = ({ user, onUpdate, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [croppedAvatar, setCroppedAvatar] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');
  const cropperRef = React.useRef(null);

  const defaultValues = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    postalCode: user?.postalCode || '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      relationship: user?.emergencyContact?.relationship || '',
      phone: user?.emergencyContact?.phone || '',
    },
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues,
  });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: false,
  });

  const handleCrop = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      const croppedImage = cropperRef.current.cropper
        .getCroppedCanvas()
        .toDataURL('image/jpeg', 0.8);
      setCroppedAvatar(croppedImage);
      setAvatar(croppedImage);
      setShowCropper(false);
    }
  };

  const onSubmit = async (data) => {
    const updatedData = {
      ...data,
      avatar: croppedAvatar || avatar,
    };
    await onUpdate(updatedData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset(defaultValues);
    setIsEditing(false);
  };

  return (
    <Box>
      <CropperCSS />
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Profile Photo
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box {...getRootProps()} sx={{ position: 'relative', cursor: 'pointer' }}>
            <input {...getInputProps()} />
            <Avatar
              src={croppedAvatar || avatar}
              sx={{ width: 120, height: 120, fontSize: '3rem' }}
            >
              {!avatar && user?.firstName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhotoCamera fontSize="small" />
            </Box>
          </Box>
          <Box sx={{ ml: 3 }}>
            <Typography variant="subtitle1">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.roles?.join(', ')}
            </Typography>
          </Box>
        </Box>

      </Paper>

      {showCropper && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Crop Profile Photo
          </Typography>
          <Cropper
            ref={cropperRef}
            src={imageToCrop}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            guides={true}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowCropper(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCrop}
            >
              Save Crop
            </Button>
          </Box>
        </Paper>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Personal Information</Typography>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                {...register('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  {...register('gender')}
                  disabled={!isEditing || loading}
                  defaultValue=""
                >
                  <MenuItem value="">Prefer not to say</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Address Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                {...register('address')}
                error={!!errors.address}
                helperText={errors.address?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country"
                {...register('country')}
                error={!!errors.country}
                helperText={errors.country?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                {...register('postalCode')}
                error={!!errors.postalCode}
                helperText={errors.postalCode?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Emergency Contact
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Name"
                {...register('emergencyContact.name')}
                error={!!errors.emergencyContact?.name}
                helperText={errors.emergencyContact?.name?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                {...register('emergencyContact.relationship')}
                error={!!errors.emergencyContact?.relationship}
                helperText={errors.emergencyContact?.relationship?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('emergencyContact.phone')}
                error={!!errors.emergencyContact?.phone}
                helperText={errors.emergencyContact?.phone?.message}
                disabled={!isEditing || loading}
                margin="normal"
              />
            </Grid>
          </Grid>
        </Paper>
      </form>
    </Box>
  );
};

export default ProfileOverview;
