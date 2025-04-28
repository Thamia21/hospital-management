import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ChatList from '../components/ChatList';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Box sx={{ mt: 2 }}>
        <ChatList />
      </Box>
    </Container>
  );
};

export default Messages;
