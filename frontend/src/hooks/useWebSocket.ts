import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface PriceUpdateData {
  assetId: number;
  ticker: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  timestamp: string;
}

export interface PriceUpdateBroadcast {
  type: 'price_update';
  data: PriceUpdateData[];
  timestamp: string;
}

export interface SystemMessage {
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface WebSocketStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export const useWebSocket = (url: string = 'http://localhost:3002') => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    connecting: false,
    error: null
  });
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdateData[]>([]);
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);

  const connect = useCallback(() => {
    if (socket?.connected) return;

    setStatus(prev => ({ ...prev, connecting: true, error: null }));

    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setStatus({
        connected: true,
        connecting: false,
        error: null
      });
      
      // Subscribe to price updates
      newSocket.emit('subscribe_prices');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setStatus({
        connected: false,
        connecting: false,
        error: reason
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setStatus({
        connected: false,
        connecting: false,
        error: error.message
      });
    });

    newSocket.on('price_updates', (broadcast: PriceUpdateBroadcast) => {
      console.log('🎉 Received price updates:', broadcast.data.length, 'assets');
      console.log('📊 Price update data:', broadcast.data);
      setPriceUpdates(broadcast.data);
    });

    newSocket.on('system_message', (message: SystemMessage) => {
      console.log('System message:', message);
      setSystemMessages(prev => [...prev.slice(-9), message]); // Keep last 10 messages
    });

    newSocket.on('pong', () => {
      console.log('Pong received');
    });

    setSocket(newSocket);
  }, [url, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.emit('unsubscribe_prices');
      socket.disconnect();
      setSocket(null);
      setStatus({
        connected: false,
        connecting: false,
        error: null
      });
    }
  }, [socket]);

  const ping = useCallback(() => {
    if (socket?.connected) {
      socket.emit('ping');
    }
  }, [socket]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    socket,
    status,
    priceUpdates,
    systemMessages,
    connect,
    disconnect,
    ping
  };
};
