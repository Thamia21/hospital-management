// backend/websocket-server.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  if (!token) {
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
    ws.user = decoded;
    ws.send(JSON.stringify({ type: 'WELCOME', message: `Hello, ${decoded.email}` }));
  } catch (err) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid token' }));
    ws.close();
    return;
  }

  ws.on('message', (message) => {
    // Echo message back for demo
    ws.send(JSON.stringify({ type: 'ECHO', message }));
  });

  ws.on('close', () => {
    // Handle disconnect if needed
  });
});

console.log('WebSocket server running on ws://localhost:3001');
