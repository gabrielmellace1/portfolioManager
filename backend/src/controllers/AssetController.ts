import { Controller, Get, Post, Put, Delete, Route, Path, Body, Query, Header, Example, Tags, Security } from 'tsoa';
import { Asset, AssetType } from '../entities/Asset';
import { AssetService } from '../services/AssetService';
import { ResponseHelper } from '../utils/ResponseHelper';
import { ValidationMiddleware } from '../validation/ValidationMiddleware';
import { CreateAssetDto, UpdateAssetDto, QueryParamsDto } from '../validation/validators';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Asset management controller
 * Handles all asset-related operations including CRUD, performance tracking, and price updates
 */
@Route('assets')
@Tags('Assets')
export class AssetController {
  private assetService: AssetService;

  constructor() {
    // This would be injected in a real application
    // For now, we'll initialize it in the main app file
    this.assetService = (global as any).assetService;
  }

  /**
   * Get all assets with optional filtering and pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort order (ASC or DESC)
   * @param type Filter by asset type
   * @param portfolioId Filter by portfolio ID
   * @param ticker Filter by ticker symbol
   */
  @Get('/')
  @Example({
    data: [
      {
        id: 1,
        type: 'stock',
        ticker: 'AAPL',
        quantity: 10,
        purchasePrice: 150.00,
        currentPrice: 155.00,
        name: 'Apple Inc.',
        portfolioId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  })
  async getAllAssets(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'ASC' | 'DESC',
    @Query() type?: AssetType,
    @Query() portfolioId?: number,
    @Query() ticker?: string
  ): Promise<any> {
    return PerformanceMonitor.measureAsync('AssetController.getAllAssets', async () => {
      try {
        const options = {
          page,
          limit,
          sortBy,
          sortOrder,
          type,
          portfolioId,
          ticker,
        };

        if (page && limit) {
          return await this.assetService.getAssetsWithPagination(options);
        } else {
          const assets = await this.assetService.getAllAssets(options);
          return { data: assets, total: assets.length };
        }
      } catch (error) {
        logger.error('Failed to get assets', { error });
        throw error;
      }
    });
  }

  /**
   * Get asset by ID
   * @param id Asset ID
   */
  @Get('/{id}')
  @Example({
    id: 1,
    type: 'stock',
    ticker: 'AAPL',
    quantity: 10,
    purchasePrice: 150.00,
    currentPrice: 155.00,
    name: 'Apple Inc.',
    portfolioId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  })
  async getAssetById(@Path() id: number): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetController.getAssetById', async () => {
      try {
        return await this.assetService.getAssetById(id);
      } catch (error) {
        logger.error('Failed to get asset by ID', { assetId: id, error });
        throw error;
      }
    });
  }

  /**
   * Get assets by portfolio ID
   * @param portfolioId Portfolio ID
   */
  @Get('/portfolio/{portfolioId}')
  async getAssetsByPortfolioId(@Path() portfolioId: number): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetController.getAssetsByPortfolioId', async () => {
      try {
        return await this.assetService.getAssetsByPortfolioId(portfolioId);
      } catch (error) {
        logger.error('Failed to get assets by portfolio ID', { portfolioId, error });
        throw error;
      }
    });
  }

  /**
   * Get assets by type
   * @param type Asset type
   */
  @Get('/type/{type}')
  async getAssetsByType(@Path() type: AssetType): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetController.getAssetsByType', async () => {
      try {
        return await this.assetService.getAssetsByType(type);
      } catch (error) {
        logger.error('Failed to get assets by type', { type, error });
        throw error;
      }
    });
  }

  /**
   * Search assets with advanced filtering
   * @param searchTerm Search term for ticker or name
   * @param minValue Minimum asset value
   * @param maxValue Maximum asset value
   * @param minPnL Minimum profit/loss
   * @param maxPnL Maximum profit/loss
   * @param profitableOnly Only return profitable assets
   */
  @Get('/search')
  async searchAssets(
    @Query() searchTerm?: string,
    @Query() minValue?: number,
    @Query() maxValue?: number,
    @Query() minPnL?: number,
    @Query() maxPnL?: number,
    @Query() profitableOnly?: boolean
  ): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetController.searchAssets', async () => {
      try {
        const searchOptions = {
          searchTerm,
          minValue,
          maxValue,
          minPnL,
          maxPnL,
          profitableOnly,
        };

        return await this.assetService.searchAssets(searchOptions);
      } catch (error) {
        logger.error('Failed to search assets', { searchOptions: { searchTerm, minValue, maxValue, minPnL, maxPnL, profitableOnly }, error });
        throw error;
      }
    });
  }

  /**
   * Create new asset
   * @param assetData Asset creation data
   */
  @Post('/')
  @Example({
    type: 'stock',
    ticker: 'AAPL',
    quantity: 10,
    purchasePrice: 150.00,
    portfolioId: 1,
    name: 'Apple Inc.'
  })
  async createAsset(@Body() assetData: CreateAssetDto): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetController.createAsset', async () => {
      try {
        // Convert date strings to Date objects
        const processedData = {
          ...assetData,
          expirationDate: assetData.expirationDate ? new Date(assetData.expirationDate) : undefined,
          maturityDate: assetData.maturityDate ? new Date(assetData.maturityDate) : undefined,
        };

        return await this.assetService.createAsset(processedData);
      } catch (error) {
        logger.error('Failed to create asset', { assetData, error });
        throw error;
      }
    });
  }

  /**
   * Update asset
   * @param id Asset ID
   * @param assetData Asset update data
   */
  @Put('/{id}')
  async updateAsset(
    @Path() id: number,
    @Body() assetData: UpdateAssetDto
  ): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetController.updateAsset', async () => {
      try {
        // Convert date strings to Date objects
        const processedData = {
          ...assetData,
          expirationDate: assetData.expirationDate ? new Date(assetData.expirationDate) : undefined,
          maturityDate: assetData.maturityDate ? new Date(assetData.maturityDate) : undefined,
        };

        return await this.assetService.updateAsset(id, processedData);
      } catch (error) {
        logger.error('Failed to update asset', { assetId: id, assetData, error });
        throw error;
      }
    });
  }

  /**
   * Delete asset
   * @param id Asset ID
   */
  @Delete('/{id}')
  async deleteAsset(@Path() id: number): Promise<{ success: boolean }> {
    return PerformanceMonitor.measureAsync('AssetController.deleteAsset', async () => {
      try {
        const success = await this.assetService.deleteAsset(id);
        return { success };
      } catch (error) {
        logger.error('Failed to delete asset', { assetId: id, error });
        throw error;
      }
    });
  }

  /**
   * Update asset price
   * @param id Asset ID
   */
  @Post('/{id}/update-price')
  async updateAssetPrice(@Path() id: number): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetController.updateAssetPrice', async () => {
      try {
        return await this.assetService.updateAssetPrice(id);
      } catch (error) {
        logger.error('Failed to update asset price', { assetId: id, error });
        throw error;
      }
    });
  }

  /**
   * Update all asset prices
   */
  @Post('/update-all-prices')
  async updateAllAssetPrices(): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    return PerformanceMonitor.measureAsync('AssetController.updateAllAssetPrices', async () => {
      try {
        return await this.assetService.updateAllAssetPrices();
      } catch (error) {
        logger.error('Failed to update all asset prices', { error });
        throw error;
      }
    });
  }

  /**
   * Get asset performance metrics
   * @param id Asset ID
   */
  @Get('/{id}/performance')
  async getAssetPerformance(@Path() id: number): Promise<{
    currentValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercentage: number;
    totalCost: number;
    isProfitable: boolean;
  }> {
    return PerformanceMonitor.measureAsync('AssetController.getAssetPerformance', async () => {
      try {
        return await this.assetService.getAssetPerformance(id);
      } catch (error) {
        logger.error('Failed to get asset performance', { assetId: id, error });
        throw error;
      }
    });
  }

  /**
   * Get performance metrics for all assets
   * @param portfolioId Optional portfolio ID filter
   */
  @Get('/performance/metrics')
  async getPerformanceMetrics(@Query() portfolioId?: number): Promise<any> {
    return PerformanceMonitor.measureAsync('AssetController.getPerformanceMetrics', async () => {
      try {
        return await this.assetService.getPerformanceMetrics(portfolioId);
      } catch (error) {
        logger.error('Failed to get performance metrics', { portfolioId, error });
        throw error;
      }
    });
  }

  /**
   * Get asset statistics
   * @param portfolioId Optional portfolio ID filter
   */
  @Get('/statistics')
  async getAssetStatistics(@Query() portfolioId?: number): Promise<{
    totalAssets: number;
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    averagePnLPercentage: number;
    assetsByType: Record<string, number>;
  }> {
    return PerformanceMonitor.measureAsync('AssetController.getAssetStatistics', async () => {
      try {
        return await this.assetService.getAssetStatistics(portfolioId);
      } catch (error) {
        logger.error('Failed to get asset statistics', { portfolioId, error });
        throw error;
      }
    });
  }
}
