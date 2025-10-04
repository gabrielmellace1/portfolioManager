import { Asset, AssetType } from '../entities/Asset';
import { AssetRepository, AssetQueryOptions, AssetSearchOptions } from '../repositories/AssetRepository';
import { PriceHistoryRepository } from '../repositories/PriceHistoryRepository';
import { PriceService } from './PriceService';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { CreateAssetDto, UpdateAssetDto } from '../validation/validators';

export interface AssetPerformanceMetrics {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercentage: number;
  profitableAssets: number;
  losingAssets: number;
  neutralAssets: number;
  bestPerformer?: Asset;
  worstPerformer?: Asset;
}

export class AssetService {
  private assetRepository: AssetRepository;
  private priceService: PriceService;
  private priceHistoryRepository: PriceHistoryRepository;

  constructor(assetRepository: AssetRepository, priceService: PriceService) {
    this.assetRepository = assetRepository;
    this.priceService = priceService;
    this.priceHistoryRepository = new PriceHistoryRepository();
  }

  /**
   * Get all assets with optional filtering
   */
  async getAllAssets(options: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetService.getAllAssets', async () => {
      try {
        logger.logService('AssetService', 'getAllAssets');
        return await this.assetRepository.findAll(options);
      } catch (error) {
        logger.logService('AssetService', 'getAllAssets', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get assets with pagination
   */
  async getAssetsWithPagination(options: AssetQueryOptions = {}): Promise<{
    data: Asset[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return PerformanceMonitor.measureAsync('AssetService.getAssetsWithPagination', async () => {
      try {
        logger.logService('AssetService', 'getAssetsWithPagination');
        return await this.assetRepository.findWithPagination(options);
      } catch (error) {
        logger.logService('AssetService', 'getAssetsWithPagination', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id: number): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetService.getAssetById', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        logger.logService('AssetService', 'getAssetById');
        const asset = await this.assetRepository.findById(id);
        
        if (!asset) {
          throw AppError.notFound('Asset', id.toString());
        }

        return asset;
      } catch (error) {
        logger.logService('AssetService', 'getAssetById', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get assets by portfolio ID
   */
  async getAssetsByPortfolioId(portfolioId: number, options: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetService.getAssetsByPortfolioId', async () => {
      try {
        if (!portfolioId || portfolioId <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        logger.logService('AssetService', 'getAssetsByPortfolioId');
        return await this.assetRepository.findByPortfolioId(portfolioId, options);
      } catch (error) {
        logger.logService('AssetService', 'getAssetsByPortfolioId', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get assets by type
   */
  async getAssetsByType(type: AssetType, options: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetService.getAssetsByType', async () => {
      try {
        logger.logService('AssetService', 'getAssetsByType');
        return await this.assetRepository.findByType(type, options);
      } catch (error) {
        logger.logService('AssetService', 'getAssetsByType', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Search assets with advanced filtering
   */
  async searchAssets(searchOptions: AssetSearchOptions, queryOptions: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetService.searchAssets', async () => {
      try {
        logger.logService('AssetService', 'searchAssets');
        return await this.assetRepository.search(searchOptions, queryOptions);
      } catch (error) {
        logger.logService('AssetService', 'searchAssets', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Create new asset
   */
  async createAsset(assetData: CreateAssetDto): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetService.createAsset', async () => {
      try {
        // Validate asset-specific business rules
        await this.validateAssetCreation(assetData);

        logger.logService('AssetService', 'createAsset');
        
        // Convert date strings to Date objects
        const processedData = this.processAssetData(assetData);
        const asset = await this.assetRepository.create(processedData);
        
        // Fetch current price for the new asset
        try {
          await this.updateAssetPrice(asset.id);
        } catch (priceError) {
          logger.warn('Failed to fetch initial price for new asset', { assetId: asset.id, error: priceError });
          // Don't fail the creation if price fetch fails
        }
        
        return asset;
      } catch (error) {
        logger.logService('AssetService', 'createAsset', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Update asset
   */
  async updateAsset(id: number, assetData: UpdateAssetDto): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetService.updateAsset', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        // Validate update-specific business rules
        await this.validateAssetUpdate(id, assetData);

        logger.logService('AssetService', 'updateAsset');
        // Convert date strings to Date objects
        const processedData = this.processAssetData(assetData);
        const updatedAsset = await this.assetRepository.update(id, processedData);
        
        if (!updatedAsset) {
          throw AppError.notFound('Asset', id.toString());
        }

        return updatedAsset;
      } catch (error) {
        logger.logService('AssetService', 'updateAsset', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: number): Promise<boolean> {
    return PerformanceMonitor.measureAsync('AssetService.deleteAsset', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        logger.logService('AssetService', 'deleteAsset');
        return await this.assetRepository.delete(id);
      } catch (error) {
        logger.logService('AssetService', 'deleteAsset', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Update asset price
   */
  async updateAssetPrice(id: number): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetService.updateAssetPrice', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        const asset = await this.assetRepository.findById(id, false);
        if (!asset) {
          throw AppError.notFound('Asset', id.toString());
        }

        let currentPrice: number;
        
        try {
          switch (asset.type) {
            case AssetType.STOCK:
              currentPrice = await this.priceService.getStockPrice(asset.ticker);
              break;
            case AssetType.CRYPTO:
              currentPrice = await this.priceService.getCryptoPrice(asset.ticker);
              if (currentPrice === null) {
                throw new Error(`Failed to fetch crypto price for ${asset.ticker}`);
              }
              break;
            case AssetType.OPTION:
              if (!asset.strikePrice || !asset.expirationDate || !asset.optionType) {
                throw AppError.validation('Option asset missing required fields (strikePrice, expirationDate, optionType)');
              }
              currentPrice = await this.priceService.getOptionPrice(
                asset.ticker,
                asset.strikePrice,
                asset.expirationDate,
                asset.optionType
              );
              break;
            case AssetType.BOND:
              currentPrice = await this.priceService.getBondPrice(asset.ticker);
              break;
            case AssetType.CASH:
              currentPrice = asset.purchasePrice; // Cash doesn't change price
              break;
            default:
              throw AppError.badRequest(`Unsupported asset type: ${asset.type}`);
          }

          const updatedAsset = await this.assetRepository.updateCurrentPrice(id, currentPrice);
          if (!updatedAsset) {
            throw AppError.internal('Failed to update asset price');
          }

          // Store price in history for daily change tracking
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          await this.priceHistoryRepository.storePrice(
            id, 
            currentPrice, 
            today,
            { source: 'price_update', timestamp: new Date().toISOString() }
          );

          logger.logService('AssetService', 'updateAssetPrice');
          return updatedAsset;
        } catch (priceError) {
          logger.error('Failed to fetch price for asset', { assetId: id, ticker: asset.ticker, type: asset.type, error: priceError });
          throw AppError.internal('Failed to fetch current price', { originalError: priceError });
        }
      } catch (error) {
        logger.logService('AssetService', 'updateAssetPrice', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Update all asset prices
   */
  async updateAllAssetPrices(): Promise<{ updated: number; failed: number; errors: string[] }> {
    return PerformanceMonitor.measureAsync('AssetService.updateAllAssetPrices', async () => {
      try {
        const assets = await this.assetRepository.findAll();
        let updated = 0;
        let failed = 0;
        const errors: string[] = [];
        
        logger.info(`Starting bulk price update for ${assets.length} assets`);
        
        // Group assets by type for efficient batch processing
        const cryptoAssets = assets.filter(asset => asset.type === AssetType.CRYPTO);
        const otherAssets = assets.filter(asset => asset.type !== AssetType.CRYPTO);
        
        // Batch update crypto prices
        if (cryptoAssets.length > 0) {
          try {
            const cryptoSymbols = cryptoAssets.map(asset => asset.ticker);
            const cryptoPrices = await this.priceService.getMultipleCryptoPrices(cryptoSymbols);
            
            for (const asset of cryptoAssets) {
              const newPrice = cryptoPrices[asset.ticker.toUpperCase()];
              if (newPrice && newPrice > 0) {
                await this.assetRepository.update(asset.id, { currentPrice: newPrice });
                updated++;
                logger.info(`Updated crypto price for ${asset.ticker}: $${newPrice}`);
              } else {
                failed++;
                const errorMessage = `No price data found for ${asset.ticker}`;
                errors.push(errorMessage);
                logger.warn('Crypto price update failed', { assetId: asset.id, ticker: asset.ticker });
              }
            }
          } catch (cryptoError) {
            logger.error('Batch crypto price update failed, falling back to individual updates', { error: cryptoError });
            // Fallback to individual updates for crypto assets
            for (const asset of cryptoAssets) {
              try {
                await this.updateAssetPrice(asset.id);
                updated++;
              } catch (error) {
                failed++;
                const errorMessage = `Failed to update ${asset.ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                errors.push(errorMessage);
                logger.warn('Crypto price update failed', { assetId: asset.id, ticker: asset.ticker, error });
              }
            }
          }
        }
        
        // Update other asset types individually
        for (const asset of otherAssets) {
          try {
            await this.updateAssetPrice(asset.id);
            updated++;
          } catch (error) {
            failed++;
            const errorMessage = `Failed to update ${asset.ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMessage);
            logger.warn('Asset price update failed', { assetId: asset.id, ticker: asset.ticker, error });
          }
        }

        logger.logService('AssetService', 'updateAllAssetPrices');
        return { updated, failed, errors };
      } catch (error) {
        logger.logService('AssetService', 'updateAllAssetPrices', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get asset performance metrics
   */
  async getAssetPerformance(id: number): Promise<{
    currentValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercentage: number;
    totalCost: number;
    isProfitable: boolean;
  }> {
    return PerformanceMonitor.measureAsync('AssetService.getAssetPerformance', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        const asset = await this.assetRepository.findById(id);
        if (!asset) {
          throw AppError.notFound('Asset', id.toString());
        }

        logger.logService('AssetService', 'getAssetPerformance');
        return {
          currentValue: asset.totalValue,
          unrealizedPnL: asset.unrealizedPnL,
          unrealizedPnLPercentage: asset.unrealizedPnLPercentage,
          totalCost: asset.totalCost,
          isProfitable: asset.isProfitable,
        };
      } catch (error) {
        logger.logService('AssetService', 'getAssetPerformance', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get performance metrics for multiple assets
   */
  async getPerformanceMetrics(portfolioId?: number): Promise<AssetPerformanceMetrics> {
    return PerformanceMonitor.measureAsync('AssetService.getPerformanceMetrics', async () => {
      try {
        const options: AssetQueryOptions = portfolioId ? { portfolioId } : {};
        const assets = await this.assetRepository.findAll(options);
        
        const metrics: AssetPerformanceMetrics = {
          totalValue: 0,
          totalCost: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          profitableAssets: 0,
          losingAssets: 0,
          neutralAssets: 0,
        };

        let bestPerformer: Asset | undefined;
        let worstPerformer: Asset | undefined;
        let bestPnLPercentage = -Infinity;
        let worstPnLPercentage = Infinity;

        assets.forEach(asset => {
          metrics.totalValue += asset.totalValue;
          metrics.totalCost += asset.totalCost;
          metrics.totalPnL += asset.unrealizedPnL;

          if (asset.unrealizedPnL > 0) {
            metrics.profitableAssets++;
          } else if (asset.unrealizedPnL < 0) {
            metrics.losingAssets++;
          } else {
            metrics.neutralAssets++;
          }

          // Track best and worst performers
          if (asset.unrealizedPnLPercentage > bestPnLPercentage) {
            bestPnLPercentage = asset.unrealizedPnLPercentage;
            bestPerformer = asset;
          }
          if (asset.unrealizedPnLPercentage < worstPnLPercentage) {
            worstPnLPercentage = asset.unrealizedPnLPercentage;
            worstPerformer = asset;
          }
        });

        if (metrics.totalCost > 0) {
          metrics.totalPnLPercentage = (metrics.totalPnL / metrics.totalCost) * 100;
        }

        metrics.bestPerformer = bestPerformer;
        metrics.worstPerformer = worstPerformer;

        logger.logService('AssetService', 'getPerformanceMetrics');
        return metrics;
      } catch (error) {
        logger.logService('AssetService', 'getPerformanceMetrics', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(portfolioId?: number): Promise<{
    totalAssets: number;
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    averagePnLPercentage: number;
    assetsByType: Record<string, number>;
  }> {
    return PerformanceMonitor.measureAsync('AssetService.getAssetStatistics', async () => {
      try {
        logger.logService('AssetService', 'getAssetStatistics');
        return await this.assetRepository.getStatistics(portfolioId);
      } catch (error) {
        logger.logService('AssetService', 'getAssetStatistics', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Validate asset creation business rules
   */
  private async validateAssetCreation(assetData: CreateAssetDto): Promise<void> {
    // Validate option-specific fields
    if (assetData.type === AssetType.OPTION) {
      if (!assetData.strikePrice || !assetData.expirationDate || !assetData.optionType) {
        throw AppError.validation('Option assets require strikePrice, expirationDate, and optionType');
      }
      
      if (assetData.strikePrice <= 0) {
        throw AppError.validation('Strike price must be positive');
      }
      
      if (new Date(assetData.expirationDate) <= new Date()) {
        throw AppError.validation('Expiration date must be in the future');
      }
    }

    // Validate bond-specific fields
    if (assetData.type === AssetType.BOND) {
      if (assetData.couponRate !== undefined && (assetData.couponRate < 0 || assetData.couponRate > 1)) {
        throw AppError.validation('Coupon rate must be between 0 and 1 (0% to 100%)');
      }
      
      if (assetData.maturityDate && new Date(assetData.maturityDate) <= new Date()) {
        throw AppError.validation('Maturity date must be in the future');
      }
    }

    // Validate quantity and price
    if (assetData.quantity <= 0) {
      throw AppError.validation('Quantity must be positive');
    }
    
    if (assetData.purchasePrice <= 0) {
      throw AppError.validation('Purchase price must be positive');
    }
  }

  /**
   * Process asset data to convert date strings to Date objects
   */
  private processAssetData(assetData: CreateAssetDto | UpdateAssetDto): any {
    const processed: any = { ...assetData };
    
    // Convert date strings to Date objects
    if (processed.expirationDate && typeof processed.expirationDate === 'string') {
      processed.expirationDate = new Date(processed.expirationDate);
    }
    
    if (processed.maturityDate && typeof processed.maturityDate === 'string') {
      processed.maturityDate = new Date(processed.maturityDate);
    }
    
    if (processed.purchaseDate && typeof processed.purchaseDate === 'string') {
      processed.purchaseDate = new Date(processed.purchaseDate);
    }
    
    return processed;
  }

  /**
   * Validate asset update business rules
   */
  private async validateAssetUpdate(id: number, assetData: UpdateAssetDto): Promise<void> {
    const existingAsset = await this.assetRepository.findById(id, false);
    if (!existingAsset) {
      throw AppError.notFound('Asset', id.toString());
    }

    // Validate option-specific fields
    if (assetData.type === AssetType.OPTION || existingAsset.type === AssetType.OPTION) {
      if (assetData.strikePrice !== undefined && assetData.strikePrice <= 0) {
        throw AppError.validation('Strike price must be positive');
      }
      
      if (assetData.expirationDate && new Date(assetData.expirationDate) <= new Date()) {
        throw AppError.validation('Expiration date must be in the future');
      }
    }

    // Validate bond-specific fields
    if (assetData.type === AssetType.BOND || existingAsset.type === AssetType.BOND) {
      if (assetData.couponRate !== undefined && (assetData.couponRate < 0 || assetData.couponRate > 1)) {
        throw AppError.validation('Coupon rate must be between 0 and 1 (0% to 100%)');
      }
      
      if (assetData.maturityDate && new Date(assetData.maturityDate) <= new Date()) {
        throw AppError.validation('Maturity date must be in the future');
      }
    }

    // Validate quantity and price
    if (assetData.quantity !== undefined && assetData.quantity <= 0) {
      throw AppError.validation('Quantity must be positive');
    }
    
    if (assetData.purchasePrice !== undefined && assetData.purchasePrice <= 0) {
      throw AppError.validation('Purchase price must be positive');
    }
    
    if (assetData.currentPrice !== undefined && assetData.currentPrice <= 0) {
      throw AppError.validation('Current price must be positive');
    }
  }
}
