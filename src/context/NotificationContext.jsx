import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${user.uid}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } else {
        console.log('Notification API not available, using empty state');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user?.uid) return;

    try {
      // Try to mark as read via API
      await fetch(`http://localhost:5000/api/patients/${user.uid}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // If API doesn't exist, just update locally
      console.log('Notification API not implemented, updating locally');
    }

    // Update local state
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId || notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    updateUnreadCount();
  }, [user?.uid]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await fetch(`http://localhost:5000/api/patients/${user.uid}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log('Notification API not implemented, updating locally');
    }

    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, [user?.uid]);

  // Update unread count
  const updateUnreadCount = useCallback(() => {
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Connect to SSE for real-time notifications
  const connectToSSE = useCallback(() => {
    if (!user?.uid || eventSource) return;

    // Check if backend is accessible first
    fetch('http://localhost:5000', { method: 'HEAD' })
      .then(() => {
        // Backend is running, proceed with SSE connection
        const es = new EventSource(`http://localhost:5000/api/notifications/stream/${user.uid}`);

        es.onopen = () => {
          console.log('Connected to notification stream');
          setIsConnected(true);
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'connection') {
              console.log('SSE connection established:', data.data.message);
            } else if (data.type === 'notification') {
              console.log('New notification received:', data.data);
              setNotifications(prev => [data.data, ...prev]);

              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification(data.data.title, {
                  body: data.data.message,
                  icon: '/favicon.ico'
                });
              }
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        es.onerror = (error) => {
          console.error('SSE connection error:', error);
          console.error('SSE readyState:', es.readyState);
          console.error('SSE url:', es.url);
          setIsConnected(false);

          // Try to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSource) {
              eventSource.close();
              setEventSource(null);
              connectToSSE();
            }
          }, 5000);
        };

        setEventSource(es);
      })
      .catch((error) => {
        console.error('Backend server not accessible:', error);
        console.log('SSE connection will retry when backend is available');
        // Don't set eventSource, will retry in 5 seconds
        setTimeout(() => {
          connectToSSE();
        }, 5000);
      });
  }, [user?.uid, eventSource]);

  // Disconnect from SSE
  const disconnectFromSSE = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
    }
  }, [eventSource]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Initialize notifications and SSE connection
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      connectToSSE();
      requestNotificationPermission();
    } else {
      disconnectFromSSE();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      disconnectFromSSE();
    };
  }, [user?.uid, fetchNotifications, connectToSSE, disconnectFromSSE, requestNotificationPermission]);

  // Update unread count when notifications change
  useEffect(() => {
    updateUnreadCount();
  }, [notifications, updateUnreadCount]);

  const contextValue = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    refetchNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
