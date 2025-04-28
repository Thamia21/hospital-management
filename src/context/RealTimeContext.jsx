import React, { createContext, useContext, useEffect, useState } from 'react';
import { websocketService } from '../services/websocket';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';

const RealTimeContext = createContext(null);

const REALTIME_EVENTS = {
  PATIENT_UPDATED: 'PATIENT_UPDATED',
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED: 'APPOINTMENT_UPDATED',
  MEDICATION_PRESCRIBED: 'MEDICATION_PRESCRIBED',
  INVOICE_CREATED: 'INVOICE_CREATED',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
};

export function RealTimeProvider({ children }) {
  const { token } = useAuth();
  const { showError } = useError();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (token) {
      websocketService.connect(token);

      // Subscribe to connection status
      const unsubscribeConnection = websocketService.subscribe('WEBSOCKET_CONNECTED', () => {
        setIsConnected(true);
      });

      const unsubscribeDisconnection = websocketService.subscribe('WEBSOCKET_DISCONNECTED', () => {
        setIsConnected(false);
      });

      const unsubscribeError = websocketService.subscribe('WEBSOCKET_ERROR', (error) => {
        showError('Lost connection to server. Attempting to reconnect...');
      });

      // Cleanup on unmount
      return () => {
        unsubscribeConnection();
        unsubscribeDisconnection();
        unsubscribeError();
        websocketService.disconnect();
      };
    }
  }, [token, showError]);

  // Subscribe to all real-time events
  const subscribe = (event, callback) => {
    if (!REALTIME_EVENTS[event]) {
      console.warn(`Unknown event type: ${event}`);
      return () => {};
    }
    return websocketService.subscribe(event, (payload) => {
      setLastUpdate({ event, payload, timestamp: new Date() });
      callback(payload);
    });
  };

  // Send real-time update
  const sendUpdate = (event, payload) => {
    if (!REALTIME_EVENTS[event]) {
      console.warn(`Unknown event type: ${event}`);
      return;
    }
    websocketService.send({ type: event, payload });
  };

  const value = {
    isConnected,
    lastUpdate,
    subscribe,
    sendUpdate,
    EVENTS: REALTIME_EVENTS,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
}

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};
