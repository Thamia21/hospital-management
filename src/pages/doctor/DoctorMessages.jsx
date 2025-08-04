import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon,
  ListItemText, 
  Divider,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Drawer,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  Menu as MenuIcon,
  AttachFile as AttachFileIcon, 
  InsertEmoticon as InsertEmoticonIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const drawerWidth = 280;

// Mock data for patients (in a real app, this would come from an API)
const mockPatients = [
  { 
    id: 'p1', 
    name: 'John Doe', 
    avatar: '/path/to/avatar1.jpg', 
    status: 'online', 
    lastSeen: '2m ago',
    unread: 3 
  },
  { 
    id: 'p2', 
    name: 'Jane Smith', 
    avatar: '/path/to/avatar2.jpg', 
    status: 'offline', 
    lastSeen: '1h ago',
    unread: 0 
  },
  { 
    id: 'p3', 
    name: 'Robert Johnson', 
    avatar: '/path/to/avatar3.jpg', 
    status: 'online', 
    lastSeen: '5m ago',
    unread: 1 
  },
];

const DoctorMessages = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);
  
  // Custom ListItemAvatar component since we're not importing it from MUI
  const ListItemAvatar = ({ children }) => (
    <Box sx={{ minWidth: 56, display: 'flex', alignItems: 'center' }}>
      {children}
    </Box>
  );
  
  // Custom Menu component for the mobile drawer toggle
  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </svg>
  );

  // Get current patient data
  const currentPatient = mockPatients.find(p => p.id === selectedPatient);
  
  // Filter patients based on search query
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock conversations for each patient
  const conversations = mockPatients.map(patient => ({
    partnerId: patient.id,
    unreadCount: patient.unread,
    lastMessage: {
      text: 'Last message preview...',
      time: '2:30 PM',
      sender: 'patient'
    }
  }));

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient) return;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      sender: 'd1', // Doctor's ID
      timestamp: new Date().toISOString(),
      read: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // In a real app, you would send the message to the server here
    // await messageService.sendMessage(selectedPatient, newMessage);
    
    // Scroll to bottom after sending a message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Load messages when a patient is selected
  React.useEffect(() => {
    if (!selectedPatient) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch messages from the server
        // const messages = await messageService.getMessages(selectedPatient);
        // setMessages(messages);
        
        // Mock messages for demo
        setTimeout(() => {
          setMessages([
            {
              id: '1',
              text: 'Hello Doctor, I have been experiencing headaches for the past few days.',
              sender: selectedPatient,
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              read: true
            },
            {
              id: '2',
              text: 'I see. Can you describe the pain on a scale of 1-10?',
              sender: 'd1',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              read: true
            },
            {
              id: '3',
              text: 'I would say it\'s about a 6. It\'s a constant dull ache.',
              sender: selectedPatient,
              timestamp: new Date(Date.now() - 600000).toISOString(),
              read: false
            }
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading messages:', error);
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [selectedPatient]);
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, count: 3 },
    { id: 'sent', label: 'Sent', icon: <SendIcon /> },
    { id: 'starred', label: 'Starred', icon: <StarIcon /> },
    { id: 'trash', label: 'Trash', icon: <DeleteIcon /> },
  ];

  const [selectedFolder, setSelectedFolder] = useState('inbox');

  const drawer = (
    <div>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="div">
          Messages
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <List>
        {folders.map((folder) => (
          <ListItem 
            button 
            key={folder.id}
            selected={selectedFolder === folder.id}
            onClick={() => setSelectedFolder(folder.id)}
          >
            <ListItemIcon>
              {folder.icon}
            </ListItemIcon>
            <ListItemText primary={folder.label} />
            {folder.count > 0 && (
              <Badge badgeContent={folder.count} color="primary" />
            )}
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Quick Actions
        </Typography>
        <List>
          <ListItem button>
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText primary="New Message" />
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Patients
        </Typography>
        <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
          {filteredPatients.map((patient) => {
            const unreadCount = conversations.find(c => c.partnerId === patient.id)?.unreadCount || 0;
            const lastMessage = conversations.find(c => c.partnerId === patient.id)?.lastMessage;
            
            return (
              <ListItem 
                button 
                key={patient.id}
                selected={selectedPatient === patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                sx={{
                  bgcolor: selectedPatient === patient.id ? 'action.hover' : 'inherit',
                  borderLeft: unreadCount > 0 ? `3px solid ${theme.palette.primary.main}` : 'none',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={patient.status === 'online' ? 'success' : 'default'}
                  >
                    <Avatar src={patient.avatar} alt={patient.name} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle2" 
                      noWrap 
                      sx={{ 
                        fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                        maxWidth: '150px'
                      }}
                    >
                      {patient.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{
                        maxWidth: '200px',
                        fontWeight: unreadCount > 0 ? 'bold' : 'normal'
                      }}
                    >
                      {lastMessage?.text || 'No messages yet'}
                    </Typography>
                  }
                />
                {unreadCount > 0 && (
                  <Badge 
                    badgeContent={unreadCount} 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
    </div>
  );

  const renderMessageContent = () => {
    if (!selectedPatient) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          p: 3,
          textAlign: 'center'
        }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            bgcolor: 'action.hover', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Select a patient to start messaging
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Or search for a patient in the sidebar
          </Typography>
        </Box>
      );
    }


    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Message Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <IconButton 
            onClick={() => setSelectedPatient(null)} 
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar 
            src={currentPatient?.avatar} 
            alt={currentPatient?.name}
            sx={{ mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" noWrap>
              {currentPatient?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentPatient?.status === 'online' ? 'Online' : `Last seen ${currentPatient?.lastSeen}`}
            </Typography>
          </Box>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          bgcolor: 'background.default',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          }
        }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography>No messages yet</Typography>
              <Typography variant="body2">Send a message to start the conversation</Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'd1' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.sender === 'd1' 
                      ? 'primary.main' 
                      : 'background.paper',
                    color: message.sender === 'd1' ? 'primary.contrastText' : 'text.primary',
                    boxShadow: 1,
                    position: 'relative',
                  }}
                >
                  <Typography variant="body2">
                    {message.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5,
                      color: message.sender === 'd1' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : 'text.secondary',
                      fontSize: '0.7rem'
                    }}
                  >
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            bottom: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                },
                mr: 1
              }}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <InsertEmoticonIcon />
                  </IconButton>
                ),
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!newMessage.trim()}
              sx={{ 
                borderRadius: 4,
                minWidth: 'auto',
                p: '8px 16px',
                ml: 1
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  // App bar for mobile view
  const appBar = (
    <Box 
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        bgcolor: 'background.paper',
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div">
        {currentPatient ? currentPatient.name : 'Messages'}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {appBar}
      <Box sx={{ display: 'flex', flex: 1, pt: { xs: '56px', md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              position: 'relative',
              height: 'calc(100vh - 64px)',
              borderRight: 'none',
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              boxShadow: 2,
              overflow: 'hidden',
              mr: 2
            },
          }}
          open
        >
          {drawer}
        </Drawer>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 0,
            width: { md: `calc(100% - ${drawerWidth + 24}px)` },
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 2,
            mr: 2
          }}
        >
          {renderMessageContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorMessages;
