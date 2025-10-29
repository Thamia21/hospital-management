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
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Create as CreateIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DoctorMessages = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCompose, setOpenCompose] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Mock messages data
  const [messages, setMessages] = useState([
    {
      id: '1',
      from: 'Nurse Mary Johnson',
      fromEmail: 'mary.johnson@hospital.com',
      subject: 'Patient Update - Room 205',
      preview: 'Patient in room 205 showing improvement after treatment...',
      body: 'Patient in room 205 showing improvement after treatment. Vital signs are stable. Blood pressure: 120/80, Heart rate: 72 BPM. Patient is responding well to medication. Please review when you have a moment.',
      timestamp: '2025-10-29T14:30:00Z',
      read: false,
      starred: false,
      type: 'inbox'
    },
    {
      id: '2',
      from: 'Admin Department',
      fromEmail: 'admin@hospital.com',
      subject: 'Schedule Change Notification',
      preview: 'Your schedule for next week has been updated...',
      body: 'Your schedule for next week has been updated. Please review the changes in the schedule management system. You have been assigned to the cardiology department from Monday to Wednesday, 8 AM - 4 PM.',
      timestamp: '2025-10-29T10:15:00Z',
      read: true,
      starred: true,
      type: 'inbox'
    },
    {
      id: '3',
      from: 'Patient John Doe',
      fromEmail: 'john.doe@example.com',
      subject: 'Follow-up Appointment Request',
      preview: 'I would like to schedule a follow-up appointment...',
      body: 'I would like to schedule a follow-up appointment to discuss my recent test results. I am available next week on Tuesday or Thursday afternoon. Please let me know what works best for your schedule.',
      timestamp: '2025-10-28T16:45:00Z',
      read: true,
      starred: false,
      type: 'inbox'
    },
    {
      id: '4',
      from: 'Lab Department',
      fromEmail: 'lab@hospital.com',
      subject: 'Lab Results Ready - Patient #12345',
      preview: 'Lab results for patient #12345 are now available...',
      body: 'Lab results for patient #12345 are now available for review in the system. All tests completed successfully. Please review at your earliest convenience.',
      timestamp: '2025-10-28T09:20:00Z',
      read: false,
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
    setOpenViewDialog(true);
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
    if (!composeData.to || !composeData.subject || !composeData.message) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
      return;
    }

    // In production, this would send via API
    console.log('Sending message:', composeData);
    setSnackbar({ open: true, message: 'Message sent successfully!', severity: 'success' });
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
            Communicate with staff and patients
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
      </Grid>

      {/* Compose Dialog */}
      <Dialog open={openCompose} onClose={() => setOpenCompose(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">New Message</Typography>
            <IconButton onClick={() => setOpenCompose(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
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
                <MenuItem value="nurse.mary@hospital.com">Nurse Mary Johnson</MenuItem>
                <MenuItem value="admin@hospital.com">Admin Department</MenuItem>
                <MenuItem value="lab@hospital.com">Lab Department</MenuItem>
                <MenuItem value="patient.john@example.com">Patient John Doe</MenuItem>
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

      {/* View Message Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Message Details</Typography>
            <IconButton onClick={() => setOpenViewDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMessage && (
            <Box>
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorMessages;
