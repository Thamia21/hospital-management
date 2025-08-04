// Mock database for messages
let messages = {
  // Format: userId: [message1, message2, ...]
  'p1': [
    {
      id: 'm1',
      sender: 'p1',
      receiver: 'd1',
      text: 'Hello Doctor, I wanted to follow up on our last appointment.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false
    },
    {
      id: 'm2',
      sender: 'p1',
      receiver: 'd1',
      text: 'I\'ve been experiencing some headaches since our last visit.',
      timestamp: new Date(Date.now() - 1000 * 60 * 14),
      read: false
    },
    {
      id: 'm3',
      sender: 'd1',
      receiver: 'p1',
      text: 'Hello John, I see. Have you been taking your medication as prescribed?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      read: true
    },
  ],
  'p2': [
    {
      id: 'm4',
      sender: 'p2',
      receiver: 'd1',
      text: 'Dr., I received my lab results via email. Can we discuss them?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      read: false
    }
  ]
};

// Get all messages for a user (both sent and received)
export const getUserMessages = async (userId) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(messages[userId] || []);
    }, 500);
  });
};

// Get conversation between two users
export const getConversation = async (senderId, receiverId) => {
  // In a real app, this would filter messages where:
  // (sender=senderId AND receiver=receiverId) OR (sender=receiverId AND receiver=senderId)
  // For now, we'll just return all messages for the sender
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(messages[senderId] || []);
    }, 500);
  });
};

// Send a new message
export const sendMessage = async (senderId, receiverId, text) => {
  const newMessage = {
    id: `m${Date.now()}`,
    sender: senderId,
    receiver: receiverId,
    text,
    timestamp: new Date(),
    read: false
  };

  // Add to sender's messages
  if (!messages[senderId]) {
    messages[senderId] = [];
  }
  messages[senderId].push(newMessage);

  // Add to receiver's messages if different from sender
  if (senderId !== receiverId) {
    if (!messages[receiverId]) {
      messages[receiverId] = [];
    }
    messages[receiverId].push({...newMessage, read: false});
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(newMessage);
    }, 300);
  });
};

// Mark messages as read
export const markAsRead = async (messageIds, userId) => {
  if (!messages[userId]) return;
  
  messages[userId] = messages[userId].map(msg => 
    messageIds.includes(msg.id) ? { ...msg, read: true } : msg
  );

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 200);
  });
};

// Get unread message count
export const getUnreadCount = async (userId) => {
  if (!messages[userId]) return 0;
  return messages[userId].filter(msg => !msg.read && msg.sender !== userId).length;
};

// Get recent conversations for a user
export const getRecentConversations = async (userId) => {
  // In a real app, this would group messages by the other participant
  // and return the most recent message from each conversation
  const userMessages = messages[userId] || [];
  
  // Get unique conversation partners
  const partners = new Set();
  userMessages.forEach(msg => {
    const partnerId = msg.sender === userId ? msg.receiver : msg.sender;
    partners.add(partnerId);
  });
  
  // Get most recent message with each partner
  const conversations = [];
  for (const partnerId of partners) {
    const partnerMessages = userMessages.filter(
      msg => (msg.sender === partnerId && msg.receiver === userId) || 
             (msg.sender === userId && msg.receiver === partnerId)
    );
    
    if (partnerMessages.length > 0) {
      const lastMessage = partnerMessages.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      );
      
      conversations.push({
        partnerId,
        lastMessage,
        unreadCount: partnerMessages.filter(m => !m.read && m.sender === partnerId).length
      });
    }
  }
  
  // Sort by most recent
  conversations.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  
  return conversations;
};
