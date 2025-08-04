import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
});

const SecuritySettings = ({ onUpdate, loading: parentLoading }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await onUpdate({
        security: {
          updatePassword: true,
          ...data
        }
      });
      setPasswordUpdated(true);
      reset();
      setTimeout(() => setPasswordUpdated(false), 5000);
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorAuthToggle = async () => {
    if (!twoFactorAuth && !twoFactorSetup) {
      // Simulate 2FA setup
      setLoading(true);
      try {
        // In a real app, you would call your backend to set up 2FA
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockRecoveryCodes = Array(10).fill().map(() => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setRecoveryCodes(mockRecoveryCodes);
        setTwoFactorSetup(true);
      } catch (error) {
        console.error('Error setting up 2FA:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setTwoFactorAuth(!twoFactorAuth);
      if (!twoFactorAuth) {
        setTwoFactorSetup(false);
      }
    }
  };

  const handleDownloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isLoading = loading || parentLoading;

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LockIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Change Password</Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {passwordUpdated && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your password has been updated successfully.
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Two-Factor Authentication</Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1">
              {twoFactorAuth ? 'Two-Factor Authentication is enabled' : 'Two-Factor Authentication is disabled'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {twoFactorAuth 
                ? 'Add an extra layer of security to your account.'
                : 'Add an extra layer of security to your account.'}
            </Typography>
            
            {twoFactorAuth && twoFactorSetup && (
              <Box sx={{ mt: 2 }}>
                <Alert 
                  severity="success" 
                  icon={<CheckCircle fontSize="inherit" />}
                  sx={{ mb: 2 }}
                >
                  Two-factor authentication has been set up successfully.
                </Alert>
                
                {!showRecoveryCodes ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => setShowRecoveryCodes(true)}
                    sx={{ mt: 1 }}
                  >
                    Show Recovery Codes
                  </Button>
                ) : (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Save these recovery codes in a secure location. Each code can only be used once.
                    </Typography>
                    <Box component="ul" sx={{ 
                      columnCount: { xs: 1, sm: 2 },
                      p: 0,
                      listStyle: 'none',
                      '& li': {
                        fontFamily: 'monospace',
                        p: 0.5,
                      }
                    }}>
                      {recoveryCodes.map((code, index) => (
                        <li key={index}>{code}</li>
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleDownloadRecoveryCodes}
                      sx={{ mt: 2, mr: 1 }}
                    >
                      Download Codes
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowRecoveryCodes(false)}
                      sx={{ mt: 2 }}
                    >
                      Hide Codes
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorAuth}
                onChange={handleTwoFactorAuthToggle}
                color="primary"
                disabled={isLoading}
              />
            }
            label={twoFactorAuth ? 'On' : 'Off'}
            labelPlacement="top"
          />
        </Box>
        
        {!twoFactorAuth && twoFactorSetup && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Two-factor authentication has been disabled. Your recovery codes are now invalid.
          </Alert>
        )}
        
        {twoFactorAuth && !twoFactorSetup && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Set up two-factor authentication using an authenticator app
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Scan the QR code below with your authenticator app and enter the verification code to complete setup.
            </Typography>
            
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Box sx={{
                display: 'inline-block',
                p: 2,
                bgcolor: 'white',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}>
                {/* This would be a real QR code in production */}
                <Box sx={{
                  width: 200,
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  mb: 2
                }}>
                  QR Code
                </Box>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="Verification Code"
              placeholder="Enter 6-digit code"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setTwoFactorAuth(false);
                  setTwoFactorSetup(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTwoFactorAuthToggle}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? 'Verifying...' : 'Verify and Enable'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
          Danger Zone
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1">Delete Account</Typography>
            <Typography variant="body2" color="textSecondary">
              Permanently delete your account and all associated data.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            disabled={isLoading}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SecuritySettings;
