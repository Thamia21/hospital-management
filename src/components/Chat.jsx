import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

import { toast } from 'react-toastify';

const Chat = ({ doctorId, patientId, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    if (!chatId || !doctorId || !patientId) {
      setLoading(false);
      return;
    }

    let polling = true;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`);
        const data = await res.json();
        setMessages(data.messages || []);
        setLoading(false);
        scrollToBottom();
      } catch (err) {
        setLoading(false);
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(() => {
      if (polling) fetchMessages();
    }, 2000); // Poll every 2 seconds

    return () => {
      polling = false;
      clearInterval(interval);
    };
  }, [chatId, doctorId, patientId, user]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) {
      return;
    }
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.uid, text: newMessage.trim() })
      });
      if (res.ok) {
        setNewMessage('');
        toast.success('Message sent!');
      } else {
        toast.error('Failed to send message');
      // Determine recipient based on sender's role
      let recipientId;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: message.senderId === user?.uid ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexDirection: message.senderId === user?.uid ? 'row-reverse' : 'row' }}>
                    <Avatar sx={{ width: 32, height: 32, mx: 1 }}>
                      {message.senderName?.[0]}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {message.senderName}
                    </Typography>
                  </Box>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: message.senderId === user?.uid ? 'primary.light' : 'grey.200',
                      color: message.senderId === user?.uid ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      maxWidth: '70%',
                      wordBreak: 'break-word',
                    }}
                  >
                    <Typography variant="body1">
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
