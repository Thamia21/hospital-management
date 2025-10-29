import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  AttachFile as AttachIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { 
  getUserMessages, 
  sendMessage, 
  getRecentConversations,
  markAsRead 
} from '../../services/messageService';

export default function PatientMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newConversationDialog, setNewConversationDialog] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    recipientType: '',
    recipientId: '',
    subject: '',
    message: '',
  });
  const [healthcareProviders, setHealthcareProviders] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchHealthcareProviders();
  }, [user.uid]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.partnerId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const conversationData = await getRecentConversations(user.uid);
      setConversations(conversationData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const userMessages = await getUserMessages(user.uid);
      // Filter messages for the specific conversation
      const conversationMessages = userMessages.filter(
        msg => (msg.sender === partnerId && msg.receiver === user.uid) ||
               (msg.sender === user.uid && msg.receiver === partnerId)
      );
      
      // Sort by timestamp
      conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(conversationMessages);

      // Mark messages as read
      const unreadMessages = conversationMessages
        .filter(msg => !msg.read && msg.sender === partnerId)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        await markAsRead(unreadMessages, user.uid);
        fetchConversations(); // Refresh to update unread counts
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchHealthcareProviders = async () => {
    // Mock data - in a real app, this would fetch from your API
    const mockProviders = [
      { id: 'd1', name: 'Dr. Smith', type: 'Doctor', specialty: 'Cardiology' },
      { id: 'd2', name: 'Dr. Johnson', type: 'Doctor', specialty: 'Pediatrics' },
      { id: 'n1', name: 'Nurse Williams', type: 'Nurse', department: 'Emergency' },
      { id: 'n2', name: 'Nurse Brown', type: 'Nurse', department: 'ICU' },
    ];
    setHealthcareProviders(mockProviders);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await sendMessage(user.uid, selectedConversation.partnerId, newMessage);
      setNewMessage('');
      
      // Refresh messages and conversations
      await fetchMessages(selectedConversation.partnerId);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!newConversationData.recipientId || !newConversationData.message.trim()) {
      return;
    }

    try {
      setSending(true);
      await sendMessage(user.uid, newConversationData.recipientId, newConversationData.message);
      
      // Reset form and close dialog
      setNewConversationData({
        recipientType: '',
        recipientId: '',
        subject: '',
        message: '',
      });
      setNewConversationDialog(false);
      
      // Refresh conversations
      await fetchConversations();
      
      // Select the new conversation
      const newConversation = { partnerId: newConversationData.recipientId };
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Error starting new conversation:', error);
    } finally {
      setSending(false);
    }
  };

  const getProviderName = (partnerId) => {
    const provider = healthcareProviders.find(p => p.id === partnerId);
    return provider ? provider.name : 'Healthcare Provider';
  };

  const getProviderType = (partnerId) => {
    const provider = healthcareProviders.find(p => p.id === partnerId);
    return provider ? provider.type : 'Staff';
  };

  const filteredConversations = conversations.filter(conv =>
    getProviderName(conv.partnerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>

      <Paper sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversations List */}
        <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* Search and New Message */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewConversationDialog(true)}
            >
              New Message
            </Button>
          </Box>

          {/* Conversations */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.partnerId}
                    button
                    selected={selectedConversation?.partnerId === conversation.partnerId}
                    onClick={() => setSelectedConversation(conversation)}
                    divider
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {getProviderType(conversation.partnerId) === 'Doctor' ? (
                          <HospitalIcon />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {getProviderName(conversation.partnerId)}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip 
                              label={conversation.unreadCount} 
                              color="primary" 
                              size="small" 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {conversation.lastMessage.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatMessageTime(conversation.lastMessage.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {filteredConversations.length === 0 && !loading && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No conversations found
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {getProviderType(selectedConversation.partnerId) === 'Doctor' ? (
                        <HospitalIcon />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {getProviderName(selectedConversation.partnerId)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getProviderType(selectedConversation.partnerId)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === user.uid ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: message.sender === user.uid ? 'primary.main' : 'grey.100',
                        color: message.sender === user.uid ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 1,
                          opacity: 0.7,
                        }}
                      >
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    multiline
                    maxRows={3}
                  />
                  <IconButton color="primary">
                    <AttachIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? <CircularProgress size={20} /> : 'Send'}
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* New Conversation Dialog */}
      <Dialog 
        open={newConversationDialog} 
        onClose={() => setNewConversationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Healthcare Provider</InputLabel>
                <Select
                  value={newConversationData.recipientId}
                  onChange={(e) => setNewConversationData({
                    ...newConversationData,
                    recipientId: e.target.value
                  })}
                >
                  {healthcareProviders.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.name} - {provider.type}
                      {provider.specialty && ` (${provider.specialty})`}
                      {provider.department && ` (${provider.department})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject (Optional)"
                value={newConversationData.subject}
                onChange={(e) => setNewConversationData({
                  ...newConversationData,
                  subject: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={newConversationData.message}
                onChange={(e) => setNewConversationData({
                  ...newConversationData,
                  message: e.target.value
                })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewConversationDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleStartNewConversation}
            variant="contained"
            disabled={!newConversationData.recipientId || !newConversationData.message.trim() || sending}
          >
            {sending ? <CircularProgress size={20} /> : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
