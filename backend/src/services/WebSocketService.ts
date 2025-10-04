import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/Logger';

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

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Set<Socket> = new Set();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    logger.info('WebSocket service initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.connectedClients.add(socket);

      // Handle client disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket);
      });

      // Handle client requesting price updates
      socket.on('subscribe_prices', () => {
        logger.info(`Client ${socket.id} subscribed to price updates`);
        socket.join('price_updates');
      });

      // Handle client unsubscribing from price updates
      socket.on('unsubscribe_prices', () => {
        logger.info(`Client ${socket.id} unsubscribed from price updates`);
        socket.leave('price_updates');
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  /**
   * Broadcast price updates to all connected clients
   */
  public broadcastPriceUpdates(priceUpdates: PriceUpdateData[]): void {
    if (priceUpdates.length === 0) {
      return;
    }

    const broadcast: PriceUpdateBroadcast = {
      type: 'price_update',
      data: priceUpdates,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all clients in the price_updates room
    this.io.to('price_updates').emit('price_updates', broadcast);
    
    logger.info(`Broadcasted ${priceUpdates.length} price updates to ${this.connectedClients.size} clients`);
  }

  /**
   * Get the number of connected clients
   */
  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Broadcast a system message to all clients
   */
  public broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    this.io.emit('system_message', {
      type,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get the Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
