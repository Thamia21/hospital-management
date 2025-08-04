import React, { useState, useEffect } from 'react';
import { createDefaultDoctor } from '../utils/createDefaultUsers';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const NewChatButton = ({ onChatCreated, onChatSelected }) => {
  const [open, setOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const { user } = useAuth();

  // Function to search for users
  const searchUsers = async () => {
    if (!searchTerm) return;
    try {
      setLoading(true);
      if (!user) return;
      const userRole = user.role?.toUpperCase();
      if (!userRole) return;
      let targetRole = userRole === 'PATIENT' ? 'DOCTOR' : 'PATIENT';
      const res = await fetch(`/api/users?role=${targetRole}&search=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new chat room
  const createChatRoom = async (selectedUser) => {
    try {
      let doctorId, patientId;
      const currentUserRole = user.role?.toUpperCase();
      if (currentUserRole === 'PATIENT') {
        doctorId = selectedUser.id;
        patientId = user.uid;
      } else {
        doctorId = user.uid;
        patientId = selectedUser.id;
      }
      if (!doctorId || !patientId) return;
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, patientId })
      });
      if (res.ok) {
        const data = await res.json();
        if (onChatSelected) onChatSelected(data.chat._id);
        setOpen(false);
        setSearchTerm('');
        setUsers([]);
        setSearchDialogOpen(false);
      }
    } catch (error) {}
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleListItemClick = async (selectedUser) => {
    console.log('Selected user:', selectedUser);
    try {
      // Get the full user data to ensure we have the role
      const userDoc = await getDoc(doc(db, 'users', selectedUser.id));
      console.log('User doc exists:', userDoc.exists());
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Selected user data:', { id: selectedUser.id, ...userData });
        await createChatRoom({ ...selectedUser, ...userData });
      } else {
        console.error('Selected user not found');
      }
    } catch (error) {
      console.error('Error in handleListItemClick:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    setUsers([]);
    setSearchDialogOpen(false);
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Searching...' : 'NEW CHAT'}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search by name or email"
            type="text"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List>
            {loading ? (
              <ListItem>
                <ListItemText primary="Searching..." />
              </ListItem>
            ) : users.length > 0 ? (
              users.map((user) => (
                <ListItem
                  button
                  key={user.id}
                  onClick={() => handleListItemClick(user)}
                >
                  <ListItemAvatar>
                    <Avatar>{user.displayName?.[0] || user.email[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName || user.email}
                    secondary={user.role}
                  />
                </ListItem>
              ))
            ) : searchTerm ? (
              <ListItem>
                <ListItemText primary="No users found" />
              </ListItem>
            ) : null}
            {searchTerm && users.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No users found
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewChatButton;
