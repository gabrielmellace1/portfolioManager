const io = require('socket.io-client');

console.log('Testing WebSocket connection...');

const socket = io('http://localhost:3002', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected:', socket.id);
  
  // Subscribe to price updates
  socket.emit('subscribe_prices');
  console.log('📡 Subscribed to price updates');
});

socket.on('disconnect', (reason) => {
  console.log('❌ WebSocket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error);
});

socket.on('price_updates', (broadcast) => {
  console.log('🎉 Received price updates:', broadcast.data.length, 'assets');
  console.log('Sample update:', broadcast.data[0]);
});

socket.on('system_message', (message) => {
  console.log('📢 System message:', message);
});

socket.on('pong', () => {
  console.log('🏓 Pong received');
});

// Test ping
setTimeout(() => {
  console.log('🏓 Sending ping...');
  socket.emit('ping');
}, 2000);

// Keep connection alive for 30 seconds
setTimeout(() => {
  console.log('🔌 Closing connection...');
  socket.disconnect();
  process.exit(0);
}, 30000);
