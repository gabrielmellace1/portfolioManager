import { Controller, Get, Post, Route, Tags, Body } from 'tsoa';
import { PriceUpdateScheduler } from '../services/PriceUpdateScheduler';
import { WebSocketService } from '../services/WebSocketService';
import { logger } from '../utils/Logger';

export interface SchedulerStatus {
  isRunning: boolean;
  updateInterval: number;
  connectedClients: number;
}

export interface SchedulerConfig {
  updateInterval: number;
}

@Route('websocket')
@Tags('WebSocket')
export class WebSocketController {
  private getScheduler(): PriceUpdateScheduler {
    const scheduler = (global as any).priceUpdateScheduler;
    if (!scheduler) {
      throw new Error('Price update scheduler not initialized');
    }
    return scheduler;
  }

  private getWebSocketService(): WebSocketService {
    const webSocketService = (global as any).webSocketService;
    if (!webSocketService) {
      throw new Error('WebSocket service not initialized');
    }
    return webSocketService;
  }

  /**
   * Get WebSocket and scheduler status
   */
  @Get('/status')
  async getStatus(): Promise<SchedulerStatus> {
    try {
      const scheduler = this.getScheduler();
      const webSocketService = this.getWebSocketService();
      
      const status = scheduler.getStatus();
      
      logger.info('WebSocket status requested', status);
      return status;
    } catch (error) {
      logger.error('Error getting WebSocket status', { error });
      throw error;
    }
  }

  /**
   * Start the price update scheduler
   */
  @Post('/scheduler/start')
  async startScheduler(): Promise<{ success: boolean; message: string }> {
    try {
      const scheduler = this.getScheduler();
      scheduler.start();
      
      logger.info('Price update scheduler started via API');
      return {
        success: true,
        message: 'Price update scheduler started successfully'
      };
    } catch (error) {
      logger.error('Error starting scheduler', { error });
      throw error;
    }
  }

  /**
   * Stop the price update scheduler
   */
  @Post('/scheduler/stop')
  async stopScheduler(): Promise<{ success: boolean; message: string }> {
    try {
      const scheduler = this.getScheduler();
      scheduler.stop();
      
      logger.info('Price update scheduler stopped via API');
      return {
        success: true,
        message: 'Price update scheduler stopped successfully'
      };
    } catch (error) {
      logger.error('Error stopping scheduler', { error });
      throw error;
    }
  }

  /**
   * Force an immediate price update
   */
  @Post('/scheduler/force-update')
  async forceUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      const scheduler = this.getScheduler();
      await scheduler.forceUpdate();
      
      logger.info('Force price update triggered via API');
      return {
        success: true,
        message: 'Price update triggered successfully'
      };
    } catch (error) {
      logger.error('Error forcing price update', { error });
      throw error;
    }
  }

  /**
   * Update scheduler configuration
   */
  @Post('/scheduler/config')
  async updateConfig(@Body() config: SchedulerConfig): Promise<{ success: boolean; message: string }> {
    try {
      const scheduler = this.getScheduler();
      scheduler.setUpdateInterval(config.updateInterval);
      
      logger.info('Scheduler configuration updated', { updateInterval: config.updateInterval });
      return {
        success: true,
        message: `Scheduler interval updated to ${config.updateInterval}ms`
      };
    } catch (error) {
      logger.error('Error updating scheduler config', { error });
      throw error;
    }
  }

  /**
   * Broadcast a system message to all connected clients
   */
  @Post('/broadcast')
  async broadcastMessage(@Body() body: { message: string; type?: 'info' | 'warning' | 'error' }): Promise<{ success: boolean; message: string }> {
    try {
      const webSocketService = this.getWebSocketService();
      webSocketService.broadcastSystemMessage(body.message, body.type || 'info');
      
      logger.info('System message broadcasted', { message: body.message, type: body.type });
      return {
        success: true,
        message: 'System message broadcasted successfully'
      };
    } catch (error) {
      logger.error('Error broadcasting message', { error });
      throw error;
    }
  }
}
