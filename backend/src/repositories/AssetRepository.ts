import { Repository, DataSource, SelectQueryBuilder, FindManyOptions, FindOptionsWhere, Not } from 'typeorm';
import { Asset, AssetType } from '../entities/Asset';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface AssetQueryOptions {
  portfolioId?: number;
  type?: AssetType;
  ticker?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includePortfolio?: boolean;
}

export interface AssetSearchOptions {
  searchTerm?: string;
  minValue?: number;
  maxValue?: number;
  minPnL?: number;
  maxPnL?: number;
  profitableOnly?: boolean;
}

export class AssetRepository {
  private repository: Repository<Asset>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Asset);
  }

  /**
   * Find all assets with optional filtering and pagination
   */
  async findAll(options: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetRepository.findAll', async () => {
      try {
        const queryBuilder = this.createQueryBuilder(options);
        const assets = await queryBuilder.getMany();
        
        logger.logDatabase('SELECT', 'assets', undefined, undefined);
        return assets;
      } catch (error) {
        logger.logDatabase('SELECT', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch assets', { originalError: error });
      }
    });
  }

  /**
   * Find assets with pagination
   */
  async findWithPagination(options: AssetQueryOptions = {}): Promise<{
    data: Asset[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return PerformanceMonitor.measureAsync('AssetRepository.findWithPagination', async () => {
      try {
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, 100);
        const skip = (page - 1) * limit;

        const queryBuilder = this.createQueryBuilder(options);
        
        const [data, total] = await queryBuilder
          .skip(skip)
          .take(limit)
          .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        logger.logDatabase('SELECT_PAGINATED', 'assets', undefined, undefined);
        
        return {
          data,
          total,
          page,
          limit,
          totalPages,
        };
      } catch (error) {
        logger.logDatabase('SELECT_PAGINATED', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch paginated assets', { originalError: error });
      }
    });
  }

  /**
   * Find asset by ID
   */
  async findById(id: number, includePortfolio: boolean = true): Promise<Asset | null> {
    return PerformanceMonitor.measureAsync('AssetRepository.findById', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        const asset = await this.repository.findOne({
          where: { id },
          relations: includePortfolio ? ['portfolio'] : [],
        });

        if (!asset) {
          throw AppError.notFound('Asset', id.toString());
        }

        logger.logDatabase('SELECT_BY_ID', 'assets', undefined, undefined);
        return asset;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('SELECT_BY_ID', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch asset', { originalError: error });
      }
    });
  }

  /**
   * Find assets by portfolio ID
   */
  async findByPortfolioId(portfolioId: number, options: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetRepository.findByPortfolioId', async () => {
      try {
        if (!portfolioId || portfolioId <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        const queryBuilder = this.createQueryBuilder({
          ...options,
          portfolioId,
        });

        const assets = await queryBuilder.getMany();
        
        logger.logDatabase('SELECT_BY_PORTFOLIO', 'assets', undefined, undefined);
        return assets;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('SELECT_BY_PORTFOLIO', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch portfolio assets', { originalError: error });
      }
    });
  }

  /**
   * Find assets by type
   */
  async findByType(type: AssetType, options: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetRepository.findByType', async () => {
      try {
        const queryBuilder = this.createQueryBuilder({
          ...options,
          type,
        });

        const assets = await queryBuilder.getMany();
        
        logger.logDatabase('SELECT_BY_TYPE', 'assets', undefined, undefined);
        return assets;
      } catch (error) {
        logger.logDatabase('SELECT_BY_TYPE', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch assets by type', { originalError: error });
      }
    });
  }

  /**
   * Search assets with advanced filtering
   */
  async search(searchOptions: AssetSearchOptions, queryOptions: AssetQueryOptions = {}): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetRepository.search', async () => {
      try {
        const queryBuilder = this.createQueryBuilder(queryOptions);

        // Apply search filters
        if (searchOptions.searchTerm) {
          queryBuilder.andWhere(
            '(asset.ticker ILIKE :searchTerm OR asset.name ILIKE :searchTerm)',
            { searchTerm: `%${searchOptions.searchTerm}%` }
          );
        }

        if (searchOptions.minValue !== undefined) {
          queryBuilder.andWhere('asset.quantity * COALESCE(asset.currentPrice, asset.purchasePrice) >= :minValue', {
            minValue: searchOptions.minValue
          });
        }

        if (searchOptions.maxValue !== undefined) {
          queryBuilder.andWhere('asset.quantity * COALESCE(asset.currentPrice, asset.purchasePrice) <= :maxValue', {
            maxValue: searchOptions.maxValue
          });
        }

        if (searchOptions.profitableOnly) {
          queryBuilder.andWhere('asset.currentPrice > asset.purchasePrice');
        }

        const assets = await queryBuilder.getMany();
        
        logger.logDatabase('SEARCH', 'assets', undefined, undefined);
        return assets;
      } catch (error) {
        logger.logDatabase('SEARCH', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to search assets', { originalError: error });
      }
    });
  }

  /**
   * Create new asset
   */
  async create(assetData: Partial<Asset>): Promise<Asset> {
    return PerformanceMonitor.measureAsync('AssetRepository.create', async () => {
      try {
        // Validate required fields
        if (!assetData.type || !assetData.ticker || !assetData.quantity || !assetData.purchasePrice || !assetData.portfolioId) {
          throw AppError.validation('Missing required fields for asset creation');
        }

        // Check for duplicate ticker in portfolio
        const existingAsset = await this.repository.findOne({
          where: {
            ticker: assetData.ticker,
            portfolioId: assetData.portfolioId,
          },
        });

        if (existingAsset) {
          throw AppError.conflict('Asset with this ticker already exists in portfolio');
        }

        const newAsset = this.repository.create(assetData);
        const savedAsset = await this.repository.save(newAsset);
        
        logger.logDatabase('INSERT', 'assets', undefined, undefined);
        return savedAsset;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('INSERT', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to create asset', { originalError: error });
      }
    });
  }

  /**
   * Update asset
   */
  async update(id: number, assetData: Partial<Asset>): Promise<Asset | null> {
    return PerformanceMonitor.measureAsync('AssetRepository.update', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID for update');
        }

        // Check if asset exists
        const existingAsset = await this.findById(id, false);
        if (!existingAsset) {
          throw AppError.notFound('Asset', id.toString());
        }

        // Check for duplicate ticker if ticker is being updated
        if (assetData.ticker && assetData.ticker !== existingAsset.ticker) {
          const duplicateAsset = await this.repository.findOne({
            where: {
              ticker: assetData.ticker,
              portfolioId: existingAsset.portfolioId,
              id: Not(id),
            },
          });

          if (duplicateAsset) {
            throw AppError.conflict('Asset with this ticker already exists in portfolio');
          }
        }

        await this.repository.update(id, assetData);
        const updatedAsset = await this.findById(id);
        
        logger.logDatabase('UPDATE', 'assets', undefined, undefined);
        return updatedAsset;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('UPDATE', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to update asset', { originalError: error });
      }
    });
  }

  /**
   * Delete asset
   */
  async delete(id: number): Promise<boolean> {
    return PerformanceMonitor.measureAsync('AssetRepository.delete', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID for deletion');
        }

        const result = await this.repository.delete(id);
        const deleted = result.affected !== 0;
        
        if (!deleted) {
          throw AppError.notFound('Asset', id.toString());
        }

        logger.logDatabase('DELETE', 'assets', undefined, undefined);
        return deleted;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('DELETE', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to delete asset', { originalError: error });
      }
    });
  }

  /**
   * Update current price for asset
   */
  async updateCurrentPrice(id: number, currentPrice: number): Promise<Asset | null> {
    return PerformanceMonitor.measureAsync('AssetRepository.updateCurrentPrice', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        if (currentPrice <= 0) {
          throw AppError.validation('Current price must be positive');
        }

        await this.repository.update(id, { 
          currentPrice,
          updatedAt: new Date(),
        });
        
        const updatedAsset = await this.findById(id);
        
        logger.logDatabase('UPDATE_PRICE', 'assets', undefined, undefined);
        return updatedAsset;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('UPDATE_PRICE', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to update asset price', { originalError: error });
      }
    });
  }

  /**
   * Find assets needing price updates
   */
  async findAssetsNeedingPriceUpdate(thresholdMinutes: number = 5): Promise<Asset[]> {
    return PerformanceMonitor.measureAsync('AssetRepository.findAssetsNeedingPriceUpdate', async () => {
      try {
        const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
        
        const assets = await this.repository
          .createQueryBuilder('asset')
          .where('asset.currentPrice IS NULL OR asset.updatedAt < :threshold', { threshold })
          .getMany();

        logger.logDatabase('SELECT_NEEDING_UPDATE', 'assets', undefined, undefined);
        return assets;
      } catch (error) {
        logger.logDatabase('SELECT_NEEDING_UPDATE', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch assets needing price update', { originalError: error });
      }
    });
  }

  /**
   * Get asset statistics
   */
  async getStatistics(portfolioId?: number): Promise<{
    totalAssets: number;
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    averagePnLPercentage: number;
    assetsByType: Record<string, number>;
  }> {
    return PerformanceMonitor.measureAsync('AssetRepository.getStatistics', async () => {
      try {
        const queryBuilder = this.repository.createQueryBuilder('asset');
        
        if (portfolioId) {
          queryBuilder.where('asset.portfolioId = :portfolioId', { portfolioId });
        }

        const assets = await queryBuilder.getMany();
        
        const statistics = {
          totalAssets: assets.length,
          totalValue: assets.reduce((sum, asset) => sum + asset.totalValue, 0),
          totalCost: assets.reduce((sum, asset) => sum + asset.totalCost, 0),
          totalPnL: assets.reduce((sum, asset) => sum + asset.unrealizedPnL, 0),
          averagePnLPercentage: 0,
          assetsByType: {} as Record<string, number>,
        };

        // Calculate average PnL percentage
        if (statistics.totalCost > 0) {
          statistics.averagePnLPercentage = (statistics.totalPnL / statistics.totalCost) * 100;
        }

        // Count assets by type
        assets.forEach(asset => {
          statistics.assetsByType[asset.type] = (statistics.assetsByType[asset.type] || 0) + 1;
        });

        logger.logDatabase('STATISTICS', 'assets', undefined, undefined);
        return statistics;
      } catch (error) {
        logger.logDatabase('STATISTICS', 'assets', undefined, error as Error);
        throw AppError.internal('Failed to fetch asset statistics', { originalError: error });
      }
    });
  }

  /**
   * Create query builder with common options
   */
  private createQueryBuilder(options: AssetQueryOptions): SelectQueryBuilder<Asset> {
    const queryBuilder = this.repository.createQueryBuilder('asset');

    // Add relations
    if (options.includePortfolio !== false) {
      queryBuilder.leftJoinAndSelect('asset.portfolio', 'portfolio');
    }

    // Add filters
    if (options.portfolioId) {
      queryBuilder.andWhere('asset.portfolioId = :portfolioId', { portfolioId: options.portfolioId });
    }

    if (options.type) {
      queryBuilder.andWhere('asset.type = :type', { type: options.type });
    }

    if (options.ticker) {
      queryBuilder.andWhere('asset.ticker = :ticker', { ticker: options.ticker });
    }

    // Add sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder || 'ASC';
      queryBuilder.orderBy(`asset.${options.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('asset.createdAt', 'DESC');
    }

    return queryBuilder;
  }
}
