import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/set-password', { token, password });
      setSuccess(res.data.message || 'Password set successfully!');
      if (res.data.userId) setUserId(res.data.userId);
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.clear();
        navigate('/login');
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Alert severity="error">Invalid or missing token.</Alert>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>Set Your Password</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}{userId && (
            <><br /><strong>Your User ID:</strong> {userId}</>
          )}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Set Password'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default SetPassword;
