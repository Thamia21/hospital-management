import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, TextField, CircularProgress, Alert } from '@mui/material';
import Swal from 'sweetalert2';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getPasswordStrength } from '../utils/passwordStrength';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { token, password });
      Swal.fire({
        icon: 'success',
        title: 'Password Reset!',
        text: 'Your password has been updated. You can now log in.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center', color: 'primary.main' }}>
            Reset Password
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              fullWidth
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            {/* Password Strength Meter */}
            {password && (
              <Box sx={{ mt: -1, mb: 2 }}>
                <Typography variant="caption" sx={{ color: (theme) => theme.palette[passwordStrength.color].main, fontWeight: 600 }}>
                  Password strength: {passwordStrength.label}
                </Typography>
              </Box>
            )}

            <TextField
              label="Confirm New Password"
              fullWidth
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ fontWeight: 'bold', py: 1.2 }}
            >
              {loading ? <CircularProgress size={22} /> : 'Reset Password'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
