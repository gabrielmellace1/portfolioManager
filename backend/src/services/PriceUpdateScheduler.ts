import { AssetService } from './AssetService';
import { WebSocketService, PriceUpdateData } from './WebSocketService';
import { Asset } from '../entities/Asset';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export class PriceUpdateScheduler {
  private assetService: AssetService;
  private webSocketService: WebSocketService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private updateInterval: number = 5000; // 5 seconds

  constructor(assetService: AssetService, webSocketService: WebSocketService) {
    this.assetService = assetService;
    this.webSocketService = webSocketService;
  }

  /**
   * Start the price update scheduler
   */
  public start(): void {
    if (this.isRunning) {
      logger.warn('⚠️ Price update scheduler is already running');
      return;
    }

    logger.info(`🚀 Starting price update scheduler with ${this.updateInterval}ms interval`);
    this.isRunning = true;

    // Run immediately on start
    logger.info('🔄 Running initial price update...');
    this.updatePrices();

    // Set up interval for subsequent updates
    this.intervalId = setInterval(() => {
      logger.info('⏰ Interval triggered - running price update...');
      this.updatePrices();
    }, this.updateInterval);
    
    logger.info(`✅ Scheduler started with interval ID: ${this.intervalId}`);

    // Broadcast system message
    this.webSocketService.broadcastSystemMessage(
      'Price update scheduler started - prices will be updated every 5 seconds',
      'info'
    );
  }

  /**
   * Stop the price update scheduler
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.warn('Price update scheduler is not running');
      return;
    }

    logger.info('Stopping price update scheduler');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Broadcast system message
    this.webSocketService.broadcastSystemMessage(
      'Price update scheduler stopped',
      'info'
    );
  }

  /**
   * Update prices for all assets and broadcast changes
   */
  private async updatePrices(): Promise<void> {
    return PerformanceMonitor.measureAsync('PriceUpdateScheduler.updatePrices', async () => {
      try {
        logger.info('🔄 Starting scheduled price update');
        
        // Get all assets for price updates
        const assets = await this.assetService.getAllAssets();
        
        if (assets.length === 0) {
          logger.info('❌ No assets found for price update');
          return;
        }

        logger.info(`📊 Updating prices for ${assets.length} assets`);
        
        // Update all asset prices
        const updateResult = await this.assetService.updateAllAssetPrices();
        
        if (updateResult.updated > 0) {
          // Get updated assets with their new prices
          const updatedAssets = await this.assetService.getAllAssets();
          
          // Create price update data for WebSocket broadcast
          const priceUpdates: PriceUpdateData[] = updatedAssets
            .filter(asset => asset.currentPrice !== undefined)
            .map(asset => ({
              assetId: asset.id,
              ticker: asset.ticker,
              currentPrice: asset.currentPrice!,
              previousPrice: asset.purchasePrice, // Using purchase price as previous for now
              priceChange: asset.currentPrice! - asset.purchasePrice,
              priceChangePercent: ((asset.currentPrice! - asset.purchasePrice) / asset.purchasePrice) * 100,
              timestamp: new Date().toISOString()
            }));

          // Broadcast price updates via WebSocket
          this.webSocketService.broadcastPriceUpdates(priceUpdates);
          
          logger.info(`✅ Successfully updated ${updateResult.updated} asset prices and broadcasted to clients`);
        } else {
          logger.info('⚠️ No asset prices were updated');
        }

        // Log any errors that occurred during batch update
        if (updateResult.errors && updateResult.errors.length > 0) {
          logger.warn(`Price update completed with ${updateResult.errors.length} errors:`, updateResult.errors);
        }

      } catch (error) {
        logger.error('❌ Error during scheduled price update:', { error });
        
        // Broadcast error to clients
        this.webSocketService.broadcastSystemMessage(
          'Error occurred during price update. Please check the logs.',
          'error'
        );
      }
    });
  }

  /**
   * Get the current status of the scheduler
   */
  public getStatus(): {
    isRunning: boolean;
    updateInterval: number;
    connectedClients: number;
  } {
    return {
      isRunning: this.isRunning,
      updateInterval: this.updateInterval,
      connectedClients: this.webSocketService.getConnectedClientsCount()
    };
  }

  /**
   * Update the scheduler interval
   */
  public setUpdateInterval(intervalMs: number): void {
    if (intervalMs < 10000) { // Minimum 10 seconds
      throw new Error('Update interval must be at least 10 seconds');
    }

    this.updateInterval = intervalMs;
    
    if (this.isRunning) {
      // Restart with new interval
      this.stop();
      this.start();
    }
    
    logger.info(`Price update interval changed to ${intervalMs}ms`);
  }

  /**
   * Force an immediate price update
   */
  public async forceUpdate(): Promise<void> {
    logger.info('Force updating prices...');
    await this.updatePrices();
  }
}
