import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon, 
  Person as PersonIcon, 
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  ContactEmergency as ContactEmergencyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength } from '../utils/passwordStrength';



// Define role-specific additional fields
const ROLE_FIELDS = {
  patient: [
    'idNumber', 'dateOfBirth', 'gender', 'address', 
    'emergencyContact', 'emergencyPhone'
  ],
  doctor: [
    'specialization', 'medicalLicenseNumber', 
    'department', 'qualifications'
  ],
  nurse: [
    'specialization', 'nursingLicenseNumber', 
    'department', 'yearsOfExperience'
  ],
  admin: [
    'department', 'employeeId', 'adminLevel'
  ]
};

export default function Registration() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [success, setSuccess] = useState('');

  const formStyles = {
    textField: {
      mb: 3,
      '& .MuiInputLabel-root': {
        color: 'text.secondary',
      },
      '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
      },
    },
    paper: {
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      borderRadius: 2,
      boxShadow: 3,
      bgcolor: 'background.paper',
    },
    title: {
      mb: 4,
      color: 'primary.main',
      fontWeight: 600,
    },
    form: {
      width: '100%',
      mt: 2,
    },
    submit: {
      mt: 3,
      mb: 2,
      height: 48,
    },
    roleSelect: {
      mb: 3,
    },
    inputField: {
      mb: 2,
    },
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Simple math CAPTCHA state
  const [captcha, setCaptcha] = useState({
    num1: Math.floor(Math.random() * 10) + 1,
    num2: Math.floor(Math.random() * 10) + 1,
    answer: ''
  });
  const [captchaError, setCaptchaError] = useState('');
  // Registration role is always 'patient' for self-registration
  const role = 'patient';
  const [registrationType, setRegistrationType] = useState('email'); // 'email', 'phone', or 'id'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    // Dynamic fields will be added based on role
  });
  const passwordStrength = getPasswordStrength(formData.password);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // handleRoleChange removed because role is always 'patient'


  const validateForm = () => {
    const newErrors = {};

    // Validate ID Number (South African ID format: 13 digits)
    if (!formData.idNumber) {
      newErrors.idNumber = 'ID Number is required';
    } else if (!/^\d{13}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'Please enter a valid 13-digit ID number';
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');
    setLoading(true);

    // Check CAPTCHA
    if (parseInt(captcha.answer, 10) !== captcha.num1 + captcha.num2) {
      setCaptchaError('Incorrect CAPTCHA answer. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Validation checks
      const {
        firstName, lastName, email, phoneNumber, idNumber, password, 
        confirmPassword, role
      } = formData;

      if (!firstName || !lastName) {
        throw new Error('First and last name are required');
      }

      // Validate based on registration type
      if (registrationType === 'email') {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          throw new Error('Please enter a valid email address');
        }
      } else if (registrationType === 'phone') {
        if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
          throw new Error('Please enter a valid 10-digit phone number');
        }
      } else if (registrationType === 'id') {
        if (!idNumber || !/^\d{13}$/.test(idNumber)) {
          throw new Error('Please enter a valid 13-digit ID number');
        }
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!agreedToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }

      // Generate a unique username based on registration type
      const username = registrationType === 'email' ? email :
                      registrationType === 'phone' ? phoneNumber :
                      idNumber;

      // Register user with backend
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        registrationType,
        role: 'PATIENT',
      };

      delete payload.firstName;
      delete payload.lastName;
      
      const data = await register(payload);
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        html: `
          <p>Please check your email to verify your account.</p>
          <p><strong>Your User ID:</strong> ${data.userId}</p>
          <p>You can use this ID or your email to log in after verification.</p>
        `,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Go to Login'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => (
    <>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          InputLabelProps={{ shrink: true }}
          value={formData.dateOfBirth || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Gender"
          name="gender"
          value={formData.gender || ''}
          onChange={handleChange}
        >
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ].map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          multiline
          rows={2}
          value={formData.address || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          name="emergencyContact"
          value={formData.emergencyContact || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          name="emergencyPhone"
          value={formData.emergencyPhone || ''}
          onChange={handleChange}
        />
      </Grid>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Grid container spacing={2}>


            {/* Basic Information Fields */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="ID Number"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  error={!!errors.idNumber}
                  helperText={errors.idNumber}
                  sx={{ ...formStyles.textField, ...formStyles.inputField }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ContactEmergencyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  sx={formStyles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={formStyles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={formStyles.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                sx={formStyles.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Password Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                sx={formStyles.textField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Password Strength Meter */}
              {formData.password && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: (theme) => theme.palette[passwordStrength.color].main, fontWeight: 600 }}>
                    Password strength: {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                sx={formStyles.textField}
              />
            </Grid>

            {/* Role-Specific Fields */}
            {renderRoleSpecificFields()}

            {/* CAPTCHA */}
            <Grid item xs={12}>
              <TextField
                label={`What is ${captcha.num1} + ${captcha.num2}?`}
                value={captcha.answer}
                onChange={e => setCaptcha({ ...captcha, answer: e.target.value })}
                required
                fullWidth
                error={!!captchaError}
                helperText={captchaError}
                sx={{ mb: 2 }}
              />
            </Grid>
            {/* Terms and Conditions */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label="I agree to the Terms and Conditions"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading || !agreedToTerms}
                sx={formStyles.submit}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                component={Link}
                to="/login"
                color="secondary"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Have an account? <b>&nbsp;Login</b>
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  </Box>
  );
}
