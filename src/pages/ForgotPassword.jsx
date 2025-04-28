import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, TextField, CircularProgress, Alert } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'If an account with that email exists, a password reset link has been sent.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      setEmail('');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to send reset email. Please try again.'
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
            Forgot Password?
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              fullWidth
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? <CircularProgress size={22} /> : 'Send Reset Link'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
