import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
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
  useMediaQuery
} from '@mui/material';
import { 
  Inbox as InboxIcon, 
  Send as SendIcon, 
  Star as StarIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const Messages = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, count: 3 },
    { id: 'sent', label: 'Sent', icon: <SendIcon /> },
    { id: 'starred', label: 'Starred', icon: <StarIcon /> },
    { id: 'trash', label: 'Trash', icon: <DeleteIcon /> },
  ];

  const messages = [
    { 
      id: 1, 
      from: 'Dr. Smith', 
      subject: 'Appointment Confirmation', 
      preview: 'Your appointment has been confirmed for tomorrow at 2:00 PM...',
      time: '10:30 AM',
      read: false,
      avatar: '/static/images/avatar/3.jpg'
    },
    { 
      id: 2, 
      from: 'Nursing Staff', 
      subject: 'Lab Results', 
      preview: 'Your recent lab results are now available in your portal...',
      time: 'Yesterday',
      read: true,
      avatar: '/static/images/avatar/4.jpg'
    },
    { 
      id: 3, 
      from: 'Billing Department', 
      subject: 'Payment Receipt', 
      preview: 'Thank you for your recent payment. Here is your receipt...',
      time: 'Jun 9',
      read: true,
      avatar: '/static/images/avatar/5.jpg'
    },
  ];

  const filteredMessages = messages.filter(message => 
    message.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          placeholder="Search messages..."
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
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {folders.find(f => f.id === selectedFolder)?.label || 'Messages'}
          </Typography>
        </Box>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {user?.name?.split(' ')[0] || 'Patient'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You have {messages.filter(m => !m.read).length} unread messages
          </Typography>
        </Paper>

        <Paper>
          <List>
            {filteredMessages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem 
                  button 
                  sx={{
                    bgcolor: message.read ? 'background.paper' : 'action.hover',
                    borderLeft: message.read ? 'none' : `3px solid ${theme.palette.primary.main}`
                  }}
                >
                  <ListItemIcon>
                    <Avatar src={message.avatar} />
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography 
                        variant="subtitle1" 
                        noWrap 
                        sx={{ fontWeight: message.read ? 'normal' : 'bold' }}
                      >
                        {message.from}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.time}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="subtitle2" 
                      noWrap 
                      sx={{ fontWeight: message.read ? 'normal' : 'bold' }}
                    >
                      {message.subject}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      noWrap
                    >
                      {message.preview}
                    </Typography>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default Messages;
