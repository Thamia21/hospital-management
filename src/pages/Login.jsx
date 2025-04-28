import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Avatar, 
  Button, 
  CssBaseline, 
  TextField, 
  Paper, 
  Box, 
  Grid, 
  Typography, 
  Divider,
  Stack,
  Chip,
  Container,
  Card,
  CardContent,
  Link,
  Alert
} from '@mui/material';
import { 
  LockOutlined as LockOutlinedIcon, 
  LocalHospital as LocalHospitalIcon,
  PersonOutline as PersonOutlineIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  MedicalServices as MedicalServicesIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- ResendVerification component ---
function ResendVerification({ email }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await import('../services/api').then(m => m.authService.resendVerification(email));
      setSuccess(res.message || 'Verification email sent.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to resend email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleResend}
        disabled={!email || loading}
        sx={{ fontWeight: 'bold', textTransform: 'none' }}
      >
        {loading ? 'Sending...' : 'Resend verification email'}
      </Button>
      {success && (
        <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>{success}</Typography>
      )}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
      )}
    </Box>
  );
}
// --- End ResendVerification component ---

// Default accounts are stored in memory and can be accessed when needed

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await login(userId, password);
      const user = data.user || data;
      const role = user?.role?.toUpperCase();
      // Route based on user role
      switch (role) {
        case 'PATIENT':
          navigate('/patient-portal');
          break;
        case 'NURSE':
          navigate('/nurse-dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor-dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/profile');
      }
    } catch (error) {
      if (
        error.message &&
        (error.message.toLowerCase().includes('verify your email') || error.message.toLowerCase().includes('not verified'))
      ) {
        setError('Please verify your email before logging in. Check your inbox for a verification link.');
      } else {
        setError(error.message);
      }
    }
  };

  // Navigation is handled in the handleSubmit function

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 60, height: 60 }}>
              <LocalHospitalIcon sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 700, textAlign: 'center' }}>
              Welcome Back
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="userId"
                label="User ID"
                name="userId"
                autoComplete="username"
                autoFocus
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                error={!!error}
                helperText="Enter your User ID (e.g., AD12345, DO67890)"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error}
              />
              {error && (
                <>
                  <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                  {(error.toLowerCase().includes('verify your email') || error.toLowerCase().includes('not verified')) && (
                    <ResendVerification email={email} />
                  )}
                </>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, mb: 2, py: 1.5, fontWeight: 'bold', ':hover': { bgcolor: 'primary.dark' } }}
              >
                Sign In
              </Button>
              <Grid container spacing={2} justifyContent="space-between">
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ textDecoration: 'none', fontWeight: 'medium', ':hover': { textDecoration: 'underline' } }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    color="secondary"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ fontWeight: 'bold', ':hover': { bgcolor: 'secondary.light' } }}
                  >
                    Create New Account
                  </Button>
                </Grid>
              </Grid>
            </Box>
            {/* Quick login section removed as requested */}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
