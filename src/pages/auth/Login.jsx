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
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip,
  CardActions,
  Badge
} from '@mui/material';
import { 
  LockOutlined as LockOutlinedIcon, 
  LocalHospital as LocalHospitalIcon,
  PersonOutline as PersonOutlineIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  MedicalServices as MedicalServicesIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

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
      const res = await import("@/services/api").then((m) => m.authService.resendVerification(email));
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Demo accounts for different roles
  const demoAccounts = {
    patient: { userId: 'PAT001', password: 'patient123', name: 'John Doe' },
    nurse: { userId: 'NUR001', password: 'nurse123', name: 'Sister Mary' },
    doctor: { userId: 'DOC001', password: 'doctor123', name: 'Dr. Smith' },
    admin: { userId: 'ADM001', password: 'admin123', name: 'Admin User' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
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
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const account = demoAccounts[role];
    setUserId(account.userId);
    setPassword(account.password);
    setSelectedRole(role);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigation is handled in the handleSubmit function

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 80, height: 80, mr: 2 }}>
                  <LocalHospitalIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('healthcare.mediconnect', 'MediConnect')}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {t('healthcare.system', 'Healthcare Management System')}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                {t('healthcare.tagline', 'Your trusted healthcare partner in South Africa')}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                {t('healthcare.professional', 'Professional healthcare management for South African providers')}
              </Typography>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={12} sx={{ 
              borderRadius: 4, 
              p: 4, 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}>
              {/* Language Selector */}
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <LanguageSelector variant="menu" size="small" />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <SecurityIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography component="h1" variant="h4" sx={{ 
                  mb: 1, 
                  color: 'primary.main', 
                  fontWeight: 700, 
                  textAlign: 'center' 
                }}>
                  {t('login.title', 'Welcome Back')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  {t('login.subtitle', 'Sign in to access your healthcare dashboard')}
                </Typography>

                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="userId"
                    label={t('login.userId', 'User ID')}
                    name="userId"
                    autoComplete="username"
                    autoFocus
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    error={!!error}
                    helperText="Enter your User ID (e.g., PAT001, NUR001, DOC001)"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={t('login.password', 'Password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                      {(error.toLowerCase().includes('verify your email') || error.toLowerCase().includes('not verified')) && (
                        <ResendVerification email={userId} />
                      )}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      mt: 2, 
                      mb: 3, 
                      py: 1.5, 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      ':hover': { 
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      },
                      ':disabled': {
                        background: 'rgba(0, 0, 0, 0.12)'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('login.signIn', 'Sign In')
                    )}
                  </Button>

                  <Grid container spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
                    <Grid item>
                      <Link
                        component={RouterLink}
                        to="/forgot-password"
                        variant="body2"
                        sx={{ 
                          textDecoration: 'none', 
                          fontWeight: 'medium',
                          color: 'primary.main',
                          ':hover': { textDecoration: 'underline' } 
                        }}
                      >
                        {t('login.forgotPassword', 'Forgot password?')}
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link
                        component={RouterLink}
                        to="/register"
                        variant="body2"
                        sx={{ 
                          textDecoration: 'none', 
                          fontWeight: 'medium',
                          color: 'secondary.main',
                          ':hover': { textDecoration: 'underline' } 
                        }}
                      >
                        {t('login.createAccount', 'Create Account')} →
                      </Link>
                    </Grid>
                  </Grid>

                  <Divider sx={{ mb: 3 }}>
                    <Chip label={t('login.demoAccounts', 'Demo Accounts')} size="small" />
                  </Divider>

                  {/* Demo Account Cards */}
                  <Grid container spacing={2}>
                    {Object.entries(demoAccounts).map(([role, account]) => (
                      <Grid item xs={6} key={role}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: selectedRole === role ? '2px solid' : '1px solid',
                            borderColor: selectedRole === role ? 'primary.main' : 'divider',
                            ':hover': { 
                              boxShadow: 3,
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => handleDemoLogin(role)}
                        >
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Avatar sx={{ 
                              bgcolor: selectedRole === role ? 'primary.main' : 'grey.100',
                              color: selectedRole === role ? 'white' : 'grey.600',
                              width: 40, 
                              height: 40, 
                              mx: 'auto', 
                              mb: 1 
                            }}>
                              {role === 'patient' && <PersonOutlineIcon />}
                              {role === 'nurse' && <MedicalServicesIcon />}
                              {role === 'doctor' && <LocalHospitalIcon />}
                              {role === 'admin' && <AdminPanelSettingsIcon />}
                            </Avatar>
                            <Typography variant="caption" display="block" sx={{ 
                              fontWeight: 600,
                              color: selectedRole === role ? 'primary.main' : 'text.primary'
                            }}>
                              {t(`demo.${role}`, role.charAt(0).toUpperCase() + role.slice(1))}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {account.name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InfoIcon color="info" fontSize="small" />
                      <Typography variant="caption" color="info.dark">
                        {t('demo.clickToFill', 'Click any demo account above to auto-fill credentials for testing')}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
