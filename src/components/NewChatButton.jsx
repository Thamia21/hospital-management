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
import { collection, query, where, getDocs, addDoc, setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

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
      console.log('Current user:', user);
      
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const userRole = user.role?.toUpperCase();
      console.log('User role:', userRole);

      if (!userRole) {
        console.error('User has no role');
        return;
      }

      let targetRole = userRole === 'PATIENT' ? 'DOCTOR' : 'PATIENT';
      console.log('Target role:', targetRole);

      const usersRef = collection(db, 'users');
      
      // Get all users with the target role (case-insensitive)
      const q = query(
        usersRef,
        where('role', 'in', [targetRole, targetRole.toLowerCase(), targetRole.toUpperCase()])
      );

      console.log('Executing query for role:', targetRole);
      let querySnapshot = await getDocs(q);
      console.log('Query results:', querySnapshot.docs.length, 'users found');
      
      // If no doctors found, try to create the default doctor account
      if (querySnapshot.docs.length === 0 && targetRole === 'DOCTOR') {
        await createDefaultDoctor();
        // Retry the query
        const retrySnapshot = await getDocs(q);
        console.log('Retry query results:', retrySnapshot.docs.length, 'users found');
        querySnapshot = retrySnapshot;
      }
      
      const matchedUsers = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Only include doctors if current user is patient, and vice versa
        if (
          (user?.role?.toUpperCase() === 'PATIENT' && userData?.role?.toUpperCase() === 'DOCTOR') ||
          (user?.role?.toUpperCase() === 'DOCTOR' && userData?.role?.toUpperCase() === 'PATIENT')
        ) {
          matchedUsers.push({ id: doc.id, ...userData });
        }
      });

      // Filter out current user
      const validUsers = matchedUsers.filter(u => u.id !== user.uid);

      console.log('Found users:', validUsers);
      setUsers(validUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new chat room
  const createChatRoom = async (selectedUser) => {
    console.log('Creating chat room with user:', selectedUser);
    try {
      const chatRoomsRef = collection(db, 'chatRooms');

      // Check if chat room already exists
      const q = query(
        chatRoomsRef,
        where(`participants.${user.uid}`, '==', true),
        where(`participants.${selectedUser.id}`, '==', true)
      );

      const querySnapshot = await getDocs(q);
      let chatRoomId;
      let doctorId, patientId;

      // Determine doctor and patient IDs
      const currentUserRole = user.role?.toUpperCase();
      const selectedUserRole = selectedUser.role?.toUpperCase();
      console.log('User roles:', { currentUserRole, selectedUserRole });

      if (currentUserRole === 'DOCTOR' && selectedUserRole === 'PATIENT') {
        doctorId = user.uid;
        patientId = selectedUser.id;
      } else if (currentUserRole === 'PATIENT' && selectedUserRole === 'DOCTOR') {
        doctorId = selectedUser.id;
        patientId = user.uid;
      } else {
        console.error('Invalid user roles:', { currentUserRole, selectedUserRole });
        return;
      }

      console.log('Assigned IDs:', { doctorId, patientId });

      if (!querySnapshot.empty) {
        // Chat room exists, use the first one
        chatRoomId = querySnapshot.docs[0].id;
        console.log('Using existing chat room:', chatRoomId);

        // Update existing chat room with IDs if needed
        const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
        await updateDoc(chatRoomRef, {
          doctorId,
          patientId,
          lastUpdated: new Date()
        });
      } else {
        // Create new chat room
        const participants = {};
        participants[user.uid] = true;
        participants[selectedUser.id] = true;

        const chatRoomRef = await addDoc(chatRoomsRef, {
          participants,
          doctorId,
          patientId,
          createdAt: new Date(),
          lastMessage: null,
          lastMessageTime: null
        });

        chatRoomId = chatRoomRef.id;
        console.log('Created new chat room:', chatRoomId);
      }

      console.log('Chat room created/updated:', { chatRoomId, doctorId, patientId });
      if (onChatSelected) {
        onChatSelected(chatRoomId);
      }
      setOpen(false);
      setSearchTerm('');
      setUsers([]);
      setSearchDialogOpen(false);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
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
