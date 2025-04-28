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
import { collection, query, where, orderBy, addDoc, onSnapshot, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';

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

    console.log('Chat component props:', { doctorId, patientId, chatId, user });
    if (!chatId || !doctorId || !patientId) {
      console.error('Missing required IDs:', { chatId, doctorId, patientId });
      setLoading(false);
      return;
    }

    // Query messages for this chat room
    const q = query(
      collection(db, 'chats'),
      where('roomId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Check for new messages from other users
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.senderId !== user?.uid) {
        // Play notification sound
        // Notification sound is not available in this version.

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('New Message', {
            body: lastMessage.text,
            // Use a data URL for a simple medical cross icon
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM0Q0FGNTAiIHJ4PSIxMiIvPjxwYXRoIGQ9Ik0zMiAxNnYzMk0xNiAzMmgzMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4='
          });

          // Close notification after 5 seconds
          setTimeout(() => notification.close(), 5000);
        }

        // Show toast notification
        toast.info('New message received!');
      }

      setMessages(newMessages);
      setLoading(false);
      scrollToBottom();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Get the correct IDs based on user role
  const getCurrentUserAndOtherIds = () => {
    if (!user || !doctorId || !patientId) {
      console.log('Missing required IDs:', { user, doctorId, patientId });
      return { doctorId: null, patientId: null };
    }
    
    // Simply return the IDs from the chat room
    return { doctorId, patientId };
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) {
      console.log('Missing required data:', { message: newMessage.trim(), chatId, user });
      return;
    }

    try {
      console.log('Sending message:', { chatId, text: newMessage });
      const { doctorId: msgDoctorId, patientId: msgPatientId } = getCurrentUserAndOtherIds();
      
      if (!msgDoctorId || !msgPatientId) {
        console.error('Missing doctor or patient ID:', { doctorId, patientId, user });
        return;
      }
      
      console.log('Sending message with IDs:', { msgDoctorId, msgPatientId });

      const messageData = {
        roomId: chatId,
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        patientId: msgPatientId,
        doctorId: msgDoctorId
      };

      // Add the message to the chats collection
      await addDoc(collection(db, 'chats'), messageData);

      // Update the chat room with the last message
      const chatRoomRef = doc(db, 'chatRooms', chatId);
      await updateDoc(chatRoomRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp()
      });

      // Get sender's details
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userRole = userDoc.data()?.role?.toUpperCase();
      const senderName = userDoc.data()?.firstName || userDoc.data()?.displayName || 'User';

      // Determine recipient based on sender's role
      let recipientId;
      let recipientDoc;

      if (userRole === 'PATIENT') {
        recipientId = doctorId;
        recipientDoc = await getDoc(doc(db, 'users', doctorId));
      } else if (userRole === 'DOCTOR') {
        recipientId = patientId;
        recipientDoc = await getDoc(doc(db, 'users', patientId));
      }

      if (recipientId && recipientDoc.exists()) {
        const recipientName = recipientDoc.data()?.firstName || recipientDoc.data()?.displayName || 'User';

        // Notifications are not available in this version.
toast.info('Notifications are not available in this version.');
        await sendNotification(recipientId, {
          title: `New message from ${senderName}`,
          body: newMessage.length > 100 ? newMessage.substring(0, 97) + '...' : newMessage,
          data: {
            type: 'chat_message',
            chatId,
            senderId: user.uid,
            senderName: senderName,
            senderRole: userRole
          }
        });

        // Show toast notification in the browser
        toast.success(`Message sent to ${recipientName}`);
      }

      console.log('Message sent and notifications handled successfully');
      setNewMessage('');
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
