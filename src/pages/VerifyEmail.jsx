import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material';
import axios from 'axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
  const query = useQuery();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = query.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    
    // Show verifying status
    setStatus('verifying');
    setMessage('Verifying your email...');
    
    // Use the full backend URL instead of relying on proxy
    const backendUrl = 'http://localhost:5000/api/auth/verify-email';
    console.log('Verifying with token:', token, 'at URL:', backendUrl);
    
    axios
      .get(`${backendUrl}?token=${token}`)
      .then((res) => {
        setStatus('success');
        // Use the message from the backend response
        setMessage(res.data.message || 'Your email has been verified! You can now log in.');
        console.log('Verification successful:', res.data);
      })
      .catch((err) => {
        setStatus('error');
        // Extract error message from response
        const errorMessage = err.response?.data?.error || 'Verification failed. The link may be invalid or expired.';
        setMessage(errorMessage);
        console.error('Verification error:', err.response?.data || err.message);
      });
  }, [query]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Email Verification
        </Typography>
        {status === 'verifying' && <CircularProgress sx={{ my: 2 }} />}
        {status === 'success' && <Alert severity="success">{message}</Alert>}
        {status === 'error' && <Alert severity="error">{message}</Alert>}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            disabled={status === 'verifying'}
          >
            Go to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
