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
      setLoading(true);
      const res = await fetch(`/api/chats?userId=${user.uid}`);
      const data = await res.json();
      const chat = data.chats.find(c => c._id === chatId);
      if (chat) {
        // Find the other participant
        const otherParticipantId = chat.participants.find(id => id !== user.uid);
        let otherParticipant = null;
        if (otherParticipantId) {
          const userRes = await fetch(`/api/users/${otherParticipantId}`);
          if (userRes.ok) {
            otherParticipant = await userRes.json();
          }
        }
        const selectedChatData = {
          id: chat._id,
          doctorId: chat.doctorId,
          patientId: chat.patientId,
          otherParticipant: {
            id: otherParticipantId,
            name: otherParticipant?.displayName || otherParticipant?.firstName || 'Anonymous',
            role: otherParticipant?.role
          },
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime
        };
        setSelectedChat(selectedChatData);
      } else {
        console.error('Chat room not found:', chatId);
      }
    } catch (error) {
      console.error('Error getting chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ChatList] user:', user);
    console.log('[ChatList] user?.uid:', user?.uid);
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/chats?userId=${user.uid}`)
      .then(async res => {
        console.log('[ChatList] /api/chats response status:', res.status);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${res.statusText}. Response: ${text}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Expected JSON, got: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('[ChatList] /api/chats data:', data);
        if (!data.chats || !Array.isArray(data.chats)) {
          throw new Error('Malformed response: missing chats array');
        }
        setChats(data.chats.map(chat => ({
          id: chat._id,
          doctorId: chat.doctorId,
          patientId: chat.patientId,
          otherParticipantId: chat.participants.find(id => id !== user.uid),
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime
        })));
      })
      .catch(err => {
        console.error('[ChatList] Error loading chats:', err);
      })
      .finally(() => setLoading(false));
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
