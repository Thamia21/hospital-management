class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000; // Start with 1 second
  }

  connect(token) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    // Use secure WebSocket in production
    const protocol = import.meta.env.MODE === 'production' ? 'wss' : 'ws';
    const baseUrl = import.meta.env.VITE_WS_URL || 'localhost:3001';
    
    this.ws = new WebSocket(`${protocol}://${baseUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
      this.broadcast({ type: 'WEBSOCKET_CONNECTED' });
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.broadcast({ type: 'WEBSOCKET_DISCONNECTED' });
      this.attemptReconnect(token);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.broadcast({ type: 'WEBSOCKET_ERROR', payload: error });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.broadcast(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectAttempts++;
      this.reconnectTimeout *= 2; // Exponential backoff
      this.connect(token);
    }, this.reconnectTimeout);
  }

  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);

    // Return unsubscribe function
    return () => {
      const channelSubscribers = this.subscribers.get(channel);
      if (channelSubscribers) {
        channelSubscribers.delete(callback);
        if (channelSubscribers.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  broadcast(message) {
    const { type, payload } = message;
    
    // Broadcast to specific channel subscribers
    if (this.subscribers.has(type)) {
      this.subscribers.get(type).forEach(callback => callback(payload));
    }

    // Broadcast to global subscribers
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(callback => callback(message));
    }
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();
