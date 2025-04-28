import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
  Box,
  Divider,
  CircularProgress,
} from '@mui/material';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import Chat from './Chat';
import NewChatButton from './NewChatButton';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const handleChatSelect = async (chatId) => {
    try {
      console.log('Setting selected chat:', chatId);
      const chatDoc = await getDoc(doc(db, 'chatRooms', chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        console.log('Chat room data:', chatData);
        
        if (!chatData.doctorId || !chatData.patientId) {
          console.error('Chat room missing required IDs:', chatData);
          return;
        }

        // Get the other participant's ID
        const otherParticipantId = Object.keys(chatData.participants)
          .find(id => id !== user.uid);
        
        // Get the other participant's details
        const userDocRef = doc(db, 'users', otherParticipantId);
        const userDocSnap = await getDoc(userDocRef);
        const otherParticipant = userDocSnap.data();

        const selectedChatData = {
          id: chatId,
          doctorId: chatData.doctorId,
          patientId: chatData.patientId,
          otherParticipant: {
            id: otherParticipantId,
            name: otherParticipant?.displayName || 'Anonymous',
            role: otherParticipant?.role
          },
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime
        };

        console.log('Setting selected chat data:', selectedChatData);
        setSelectedChat(selectedChatData);
      } else {
        console.error('Chat room not found:', chatId);
      }
    } catch (error) {
      console.error('Error getting chat data:', error);
    }
  };

  useEffect(() => {
    console.log('Loading chats for user:', user);
    if (!user) return;

    // Query chat rooms where the current user is a participant
    const q = query(
      collection(db, 'chatRooms'),
      where(`participants.${user.uid}`, '==', true)
    );

    console.log('Querying chat rooms with:', {
      collection: 'chatRooms',
      participantField: `participants.${user.uid}`,
      value: true
    });

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('Chat rooms snapshot received:', {
        empty: snapshot.empty,
        size: snapshot.size,
        docs: snapshot.docs.map(doc => doc.id)
      });

      const chatsData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        console.log('Chat room found:', {
          id: doc.id,
          participants: data.participants,
          doctorId: data.doctorId,
          patientId: data.patientId
        });
        return {
          id: doc.id,
          ...data,
          lastMessage: data.lastMessage || null,
          lastMessageTime: data.lastMessageTime || null
        };
      }));

      const processChatRoom = async (chatRoom) => {
        console.log('Processing chat room:', {
          id: chatRoom.id,
          participants: chatRoom.participants,
          currentUserId: user.uid
        });

        // Get the other participant's ID
        const otherParticipantId = Object.keys(chatRoom.participants || {})
          .find(id => id !== user.uid);

        console.log('Found other participant:', { otherParticipantId });
        
        if (!otherParticipantId) {
          console.error('No other participant found in chat room:', chatRoom.id);
          return null;
        }

        // Get the other participant's details
        const userDocRef = doc(db, 'users', otherParticipantId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          console.error('Other participant document not found:', otherParticipantId);
          return null;
        }

        const otherParticipant = userDocSnap.data();
        
        // Get the user's full name and role
        let displayName;
        if (otherParticipant?.firstName && otherParticipant?.lastName) {
          displayName = `${otherParticipant.firstName} ${otherParticipant.lastName}`;
        } else if (otherParticipant?.firstName) {
          displayName = otherParticipant.firstName;
        } else if (otherParticipant?.displayName) {
          displayName = otherParticipant.displayName;
        } else {
          displayName = 'Anonymous';
        }

        const role = otherParticipant?.role?.toUpperCase();
        if (role) {
          displayName = `${displayName} (${role})`;
        }
        
        return {
          id: chatRoom.id,
          doctorId: chatRoom.doctorId,
          patientId: chatRoom.patientId,
          otherParticipant: {
            id: otherParticipantId,
            name: displayName,
            role: role
          },
          lastMessage: chatRoom.lastMessage || null,
          lastMessageTime: chatRoom.lastMessageTime || null
        };
      };

      const promises = chatsData.map(processChatRoom);
      const processedChatsData = await Promise.all(promises);
      
      // Filter out null values (failed to process)
      const validChats = processedChatsData.filter(chat => chat !== null);
      console.log('Final processed chats:', {
        total: processedChatsData.length,
        valid: validChats.length,
        chats: validChats.map(chat => ({
          id: chat.id,
          otherParticipant: chat.otherParticipant
        }))
      });
      
      setChats(validChats);

      // If we have a selectedChat, update it with the latest data
      if (selectedChat) {
        const updatedChat = processedChatsData.find(chat => 
          chat.id === (typeof selectedChat === 'string' ? selectedChat : selectedChat.id)
        );
        if (updatedChat) {
          console.log('Updating selected chat with:', updatedChat);
          setSelectedChat(updatedChat);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '600px' }}>
      {/* Chat List */}
      <Paper elevation={3} sx={{ width: 300, overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Conversations
          </Typography>
          <NewChatButton 
            onChatCreated={() => setSelectedChat(null)}
            onChatSelected={handleChatSelect}
          />
        </Box>
        <List>
          {chats.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No conversations yet.
              Click "New Chat" to start one!
            </Typography>
          ) : (
            chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem
                button
                selected={selectedChat?.id === chat.id}
                onClick={() => handleChatSelect(chat.id)}
              >
                <ListItemAvatar>
                  <Avatar>{chat.otherParticipant.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.otherParticipant.name}
                  primaryTypographyProps={{
                    variant: 'subtitle1',
                    sx: { fontWeight: 500 }
                  }}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        display="block"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.2,
                          mb: 0.5
                        }}
                      >
                        {chat.lastMessage || (chat.lastMessageTime ? '' : 'No messages yet')}
                      </Typography>
                      {chat.lastMessageTime && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof chat.lastMessageTime.toDate === 'function' 
                            ? new Date(chat.lastMessageTime.toDate()).toLocaleString()
                            : new Date(chat.lastMessageTime).toLocaleString()}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          )))
          }
        </List>
      </Paper>

      {/* Chat Window */}
      <Box sx={{ flex: 1 }}>
        {selectedChat ? (
          <Chat
            chatId={selectedChat.id}
            doctorId={selectedChat.doctorId}
            patientId={selectedChat.patientId}
            user={user}
          />
        ) : (
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a conversation to start chatting
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ChatList;
