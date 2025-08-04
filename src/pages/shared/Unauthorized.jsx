import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper 
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLoginAgain = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 10, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <BlockIcon 
          color="error" 
          sx={{ fontSize: 100, mb: 2 }} 
        />
        <Typography 
          variant="h4" 
          color="error" 
          gutterBottom
        >
          Unauthorized Access
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          paragraph
        >
          You do not have permission to access this page. 
          Please contact the system administrator if you believe this is an error.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(-1)}
          >
            GO TO PREVIOUS PAGE
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleLoginAgain}
          >
            LOGIN AGAIN
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
