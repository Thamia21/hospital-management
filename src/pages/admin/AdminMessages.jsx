import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Chip,
  Divider,
  Badge,
  InputAdornment,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const AdminMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock conversations - replace with API call
    const mockConversations = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        role: 'Doctor',
        lastMessage: 'Thank you for the update',
        timestamp: new Date(),
        unread: 2,
        online: true,
        avatar: 'SJ'
      },
      {
        id: 2,
        name: 'Nurse Mary Williams',
        role: 'Nurse',
        lastMessage: 'Patient records updated',
        timestamp: new Date(Date.now() - 3600000),
        unread: 0,
        online: true,
        avatar: 'MW'
      },
      {
        id: 3,
        name: 'Dr. Michael Brown',
        role: 'Doctor',
        lastMessage: 'Leave request submitted',
        timestamp: new Date(Date.now() - 7200000),
        unread: 1,
        online: false,
        avatar: 'MB'
      },
      {
        id: 4,
        name: 'Admin Support',
        role: 'Support',
        lastMessage: 'System maintenance scheduled',
        timestamp: new Date(Date.now() - 86400000),
        unread: 0,
        online: true,
        avatar: 'AS'
      }
    ];

    setConversations(mockConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages - replace with API call
      const mockMessages = [
        {
          id: 1,
          senderId: selectedConversation.id,
          senderName: selectedConversation.name,
          content: 'Hello, I need to discuss the new policy changes',
          timestamp: new Date(Date.now() - 3600000),
          isOwn: false
        },
        {
          id: 2,
          senderId: user?.id,
          senderName: user?.name,
          content: 'Sure, what would you like to know?',
          timestamp: new Date(Date.now() - 3000000),
          isOwn: true
        },
        {
          id: 3,
          senderId: selectedConversation.id,
          senderName: selectedConversation.name,
          content: 'When will the new leave policy take effect?',
          timestamp: new Date(Date.now() - 2400000),
          isOwn: false
        },
        {
          id: 4,
          senderId: user?.id,
          senderName: user?.name,
          content: 'The new policy will be effective from next month. I\'ll send you the detailed document.',
          timestamp: new Date(Date.now() - 1800000),
          isOwn: true
        }
      ];

      setMessages(mockMessages);
    }
  }, [selectedConversation, user]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message = {
        id: messages.length + 1,
        senderId: user?.id,
        senderName: user?.name,
        content: newMessage,
        timestamp: new Date(),
        isOwn: true
      };

      setMessages([...messages, message]);
      setNewMessage('');

      // Update conversation last message
      setConversations(conversations.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage, timestamp: new Date() }
          : conv
      ));
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Messages
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>

            {/* Conversations */}
            <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              {filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    '&.Mui-selected': {
                      bgcolor: alpha('#667eea', 0.1),
                      '&:hover': {
                        bgcolor: alpha('#667eea', 0.15),
                      }
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: conversation.online ? '#4caf50' : '#bdbdbd',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          border: '2px solid white'
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#667eea' }}>
                        {conversation.avatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {conversation.name}
                        </Typography>
                        {conversation.unread > 0 && (
                          <Chip
                            label={conversation.unread}
                            size="small"
                            sx={{
                              bgcolor: '#667eea',
                              color: 'white',
                              height: 20,
                              minWidth: 20,
                              '& .MuiChip-label': { px: 0.5, fontSize: '0.75rem' }
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {conversation.lastMessage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(conversation.timestamp, 'HH:mm')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{
                  p: 2,
                  borderBottom: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: selectedConversation.online ? '#4caf50' : '#bdbdbd',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          border: '2px solid white'
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#667eea' }}>
                        {selectedConversation.avatar}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedConversation.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedConversation.online ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f7fa' }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: message.isOwn ? '#667eea' : 'white',
                          color: message.isOwn ? 'white' : 'text.primary',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.8,
                            textAlign: 'right'
                          }}
                        >
                          {format(message.timestamp, 'HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <AttachFileIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      size="small"
                      multiline
                      maxRows={3}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        bgcolor: '#667eea',
                        color: 'white',
                        '&:hover': { bgcolor: '#764ba2' },
                        '&:disabled': { bgcolor: 'rgba(0,0,0,0.1)' }
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}>
                <Typography variant="h6">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminMessages;
