import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Work as WorkIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  MedicalServices as MedicalServicesIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

// Validation schema for professional information
const professionalSchema = yup.object().shape({
  specialty: yup.string().required('Specialty is required'),
  licenseNumber: yup.string().required('License number is required'),
  licenseExpiry: yup.date().required('License expiry date is required'),
  yearsOfExperience: yup
    .number()
    .typeError('Must be a number')
    .positive('Must be a positive number')
    .required('Years of experience is required'),
  biography: yup.string().max(1000, 'Biography must not exceed 1000 characters'),
  consultationFee: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Fee cannot be negative')
    .required('Consultation fee is required'),
  isAvailableForAppointments: yup.boolean().default(true),
  isAcceptingNewPatients: yup.boolean().default(true),
});

const ProfessionalInfo = ({ user, onUpdate, loading: parentLoading }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const isLoading = parentLoading;

  const defaultValues = {
    specialty: user?.professionalInfo?.specialty || '',
    licenseNumber: user?.professionalInfo?.licenseNumber || '',
    licenseExpiry: user?.professionalInfo?.licenseExpiry || '',
    yearsOfExperience: user?.professionalInfo?.yearsOfExperience || '',
    biography: user?.professionalInfo?.biography || '',
    consultationFee: user?.professionalInfo?.consultationFee || '',
    isAvailableForAppointments: user?.professionalInfo?.isAvailableForAppointments ?? true,
    isAcceptingNewPatients: user?.professionalInfo?.isAcceptingNewPatients ?? true,
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(professionalSchema),
    defaultValues,
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await onUpdate({ professionalInfo: data });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating professional info:', error);
    }
  };

  // Handle edit/cancel
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    reset(defaultValues);
    setIsEditing(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalServicesIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Professional Information</Typography>
        </Box>
        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={isLoading}
          >
            Edit
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Specialty"
            {...register('specialty')}
            error={!!errors.specialty}
            helperText={errors.specialty?.message}
            disabled={!isEditing || isLoading}
            margin="normal"
            InputProps={{
              startAdornment: (
                <MedicalServicesIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
          />

          <TextField
            fullWidth
            label="License Number"
            {...register('licenseNumber')}
            error={!!errors.licenseNumber}
            helperText={errors.licenseNumber?.message}
            disabled={!isEditing || isLoading}
            margin="normal"
            InputProps={{
              startAdornment: (
                <BadgeIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
          />

          <TextField
            fullWidth
            label="License Expiry Date"
            type="date"
            {...register('licenseExpiry')}
            error={!!errors.licenseExpiry}
            helperText={errors.licenseExpiry?.message}
            disabled={!isEditing || isLoading}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <CalendarIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Years of Experience"
            type="number"
            {...register('yearsOfExperience')}
            error={!!errors.yearsOfExperience}
            helperText={errors.yearsOfExperience?.message}
            disabled={!isEditing || isLoading}
            margin="normal"
            InputProps={{
              startAdornment: (
                <WorkIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
          />

          <TextField
            fullWidth
            label="Consultation Fee"
            type="number"
            {...register('consultationFee')}
            error={!!errors.consultationFee}
            helperText={errors.consultationFee?.message}
            disabled={!isEditing || isLoading}
            margin="normal"
            InputProps={{
              startAdornment: (
                <span style={{ marginRight: 8 }}>$</span>
              ),
            }}
          />

          <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  {...register('isAvailableForAppointments')}
                  disabled={!isEditing || isLoading}
                />
              }
              label="Available for Appointments"
              labelPlacement="start"
              sx={{ ml: 0 }}
            />

            <FormControlLabel
              control={
                <Switch
                  {...register('isAcceptingNewPatients')}
                  disabled={!isEditing || isLoading}
                />
              }
              label="Accepting New Patients"
              labelPlacement="start"
              sx={{ ml: 0 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Professional Biography"
            {...register('biography')}
            error={!!errors.biography}
            helperText={`${errors.biography?.message || ''} ${
              defaultValues.biography?.length || 0
            }/1000`}
            disabled={!isEditing || isLoading}
            margin="normal"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfessionalInfo;
