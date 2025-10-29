import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const NurseMessages = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCompose, setOpenCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Mock messages data
  const [messages, setMessages] = useState([
    {
      id: '1',
      from: 'Dr. Sarah Smith',
      fromEmail: 'sarah.smith@hospital.com',
      subject: 'Patient John Doe - Medication Update',
      preview: 'Please administer the new medication as prescribed...',
      body: 'Please administer the new medication as prescribed. The patient should receive 500mg of Amoxicillin twice daily for the next 7 days. Monitor for any adverse reactions.',
      timestamp: '2025-10-29T10:30:00Z',
      read: false,
      starred: false,
      type: 'inbox'
    },
    {
      id: '2',
      from: 'Admin Department',
      fromEmail: 'admin@hospital.com',
      subject: 'Shift Schedule Update',
      preview: 'Your shift schedule for next week has been updated...',
      body: 'Your shift schedule for next week has been updated. Please check the schedule board for details. You are assigned to ICU ward from Monday to Friday, 7 AM - 3 PM.',
      timestamp: '2025-10-29T08:15:00Z',
      read: true,
      starred: true,
      type: 'inbox'
    },
    {
      id: '3',
      from: 'Dr. Michael Johnson',
      fromEmail: 'michael.johnson@hospital.com',
      subject: 'Ward Round Notes',
      preview: 'Please review the ward round notes for today...',
      body: 'Please review the ward round notes for today and update patient records accordingly. Special attention needed for patients in rooms 101 and 205.',
      timestamp: '2025-10-28T16:45:00Z',
      read: true,
      starred: false,
      type: 'inbox'
    }
  ]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSelectedMessage(null);
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    // Mark as read
    setMessages(messages.map(m => 
      m.id === message.id ? { ...m, read: true } : m
    ));
  };

  const handleStarToggle = (messageId) => {
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, starred: !m.starred } : m
    ));
  };

  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = () => {
    // In production, this would send via API
    console.log('Sending message:', composeData);
    setOpenCompose(false);
    setComposeData({ to: '', subject: '', message: '' });
  };

  const filterMessages = () => {
    let filtered = messages;

    // Filter by tab
    if (selectedTab === 1) {
      filtered = filtered.filter(m => m.starred);
    } else if (selectedTab === 2) {
      filtered = filtered.filter(m => m.type === 'sent');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredMessages = filterMessages();
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Communicate with doctors and staff
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={() => setOpenCompose(true)}
          sx={{ textTransform: 'none' }}
        >
          Compose
        </Button>
      </Box>

      {/* Search and Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderTop: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="error">
                Inbox
              </Badge>
            } 
          />
          <Tab label="Starred" />
          <Tab label="Sent" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {/* Message List */}
        <Grid item xs={12} md={selectedMessage ? 5 : 12}>
          <Paper>
            <List sx={{ p: 0 }}>
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message, index) => (
                  <React.Fragment key={message.id}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStarToggle(message.id);
                          }}
                        >
                          {message.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      }
                    >
                      <ListItemButton
                        onClick={() => handleMessageClick(message)}
                        selected={selectedMessage?.id === message.id}
                        sx={{
                          bgcolor: !message.read ? 'action.hover' : 'transparent'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {message.from.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box 
                                component="span"
                                sx={{ fontWeight: !message.read ? 700 : 400, fontSize: '0.875rem' }}
                              >
                                {message.from}
                              </Box>
                              <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {new Date(message.timestamp).toLocaleDateString()}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box component="span">
                              <Box
                                component="span"
                                sx={{ 
                                  display: 'block',
                                  fontWeight: !message.read ? 600 : 400,
                                  mb: 0.5,
                                  fontSize: '0.875rem'
                                }}
                              >
                                {message.subject}
                              </Box>
                              <Box
                                component="span"
                                sx={{
                                  display: 'block',
                                  color: 'text.secondary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {message.preview}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < filteredMessages.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No messages"
                    secondary={searchQuery ? "No messages match your search" : "Your inbox is empty"}
                    sx={{ textAlign: 'center', py: 4 }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Message Detail */}
        {selectedMessage && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {selectedMessage.from.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedMessage.from}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedMessage.fromEmail}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small">
                      <ReplyIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  {selectedMessage.subject}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedMessage.timestamp).toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {selectedMessage.body}
              </Typography>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button variant="contained" startIcon={<ReplyIcon />}>
                  Reply
                </Button>
                <Button variant="outlined">
                  Forward
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Compose Dialog */}
      <Dialog open={openCompose} onClose={() => setOpenCompose(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>To</InputLabel>
              <Select
                name="to"
                value={composeData.to}
                onChange={handleComposeChange}
                label="To"
              >
                <MenuItem value="dr.smith@hospital.com">Dr. Sarah Smith</MenuItem>
                <MenuItem value="dr.johnson@hospital.com">Dr. Michael Johnson</MenuItem>
                <MenuItem value="admin@hospital.com">Admin Department</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={composeData.subject}
              onChange={handleComposeChange}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Message"
              name="message"
              value={composeData.message}
              onChange={handleComposeChange}
              multiline
              rows={8}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenCompose(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NurseMessages;
