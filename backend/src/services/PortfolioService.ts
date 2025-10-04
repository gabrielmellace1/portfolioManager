import { Portfolio } from '../entities/Portfolio';
import { PortfolioRepository, PortfolioQueryOptions } from '../repositories/PortfolioRepository';
import { AssetService } from './AssetService';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { CreatePortfolioDto, UpdatePortfolioDto } from '../validation/validators';

export interface PortfolioPerformanceMetrics {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercentage: number;
  assetCount: number;
  profitableAssetsCount: number;
  losingAssetsCount: number;
  neutralAssetsCount: number;
  assetsByType: Record<string, number>;
  performance: {
    profitable: any[];
    losing: any[];
    neutral: any[];
  };
}

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;
  private assetService: AssetService;

  constructor(portfolioRepository: PortfolioRepository, assetService: AssetService) {
    this.portfolioRepository = portfolioRepository;
    this.assetService = assetService;
  }

  /**
   * Get all portfolios with optional filtering
   */
  async getAllPortfolios(options: PortfolioQueryOptions = {}): Promise<Portfolio[]> {
    return PerformanceMonitor.measureAsync('PortfolioService.getAllPortfolios', async () => {
      try {
        logger.logService('PortfolioService', 'getAllPortfolios');
        return await this.portfolioRepository.findAll(options);
      } catch (error) {
        logger.logService('PortfolioService', 'getAllPortfolios', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get portfolios with pagination
   */
  async getPortfoliosWithPagination(options: PortfolioQueryOptions = {}): Promise<{
    data: Portfolio[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return PerformanceMonitor.measureAsync('PortfolioService.getPortfoliosWithPagination', async () => {
      try {
        logger.logService('PortfolioService', 'getPortfoliosWithPagination');
        return await this.portfolioRepository.findWithPagination(options);
      } catch (error) {
        logger.logService('PortfolioService', 'getPortfoliosWithPagination', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get portfolio by ID
   */
  async getPortfolioById(id: number): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioService.getPortfolioById', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        logger.logService('PortfolioService', 'getPortfolioById');
        const portfolio = await this.portfolioRepository.findById(id);
        
        if (!portfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        return portfolio;
      } catch (error) {
        logger.logService('PortfolioService', 'getPortfolioById', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Create new portfolio
   */
  async createPortfolio(portfolioData: CreatePortfolioDto): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioService.createPortfolio', async () => {
      try {
        // Validate portfolio-specific business rules
        await this.validatePortfolioCreation(portfolioData);

        logger.logService('PortfolioService', 'createPortfolio');
        return await this.portfolioRepository.create(portfolioData);
      } catch (error) {
        logger.logService('PortfolioService', 'createPortfolio', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Update portfolio
   */
  async updatePortfolio(id: number, portfolioData: UpdatePortfolioDto): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioService.updatePortfolio', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        // Validate update-specific business rules
        await this.validatePortfolioUpdate(id, portfolioData);

        logger.logService('PortfolioService', 'updatePortfolio');
        const updatedPortfolio = await this.portfolioRepository.update(id, portfolioData);
        
        if (!updatedPortfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        return updatedPortfolio;
      } catch (error) {
        logger.logService('PortfolioService', 'updatePortfolio', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(id: number): Promise<boolean> {
    return PerformanceMonitor.measureAsync('PortfolioService.deletePortfolio', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        logger.logService('PortfolioService', 'deletePortfolio');
        return await this.portfolioRepository.delete(id);
      } catch (error) {
        logger.logService('PortfolioService', 'deletePortfolio', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get portfolio performance metrics
   */
  async getPortfolioPerformance(id: number): Promise<PortfolioPerformanceMetrics> {
    return PerformanceMonitor.measureAsync('PortfolioService.getPortfolioPerformance', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        const portfolio = await this.portfolioRepository.findById(id);
        if (!portfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        // Update all asset prices before calculating performance
        try {
          await this.assetService.updateAllAssetPrices();
        } catch (priceError) {
          logger.warn('Failed to update asset prices for portfolio performance', { portfolioId: id, error: priceError });
          // Continue with existing prices if update fails
        }
        
        // Reload portfolio with updated assets
        const updatedPortfolio = await this.portfolioRepository.findById(id);
        if (!updatedPortfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        const performance = updatedPortfolio.getPerformanceSummary();
        
        logger.logService('PortfolioService', 'getPortfolioPerformance');
        return performance;
      } catch (error) {
        logger.logService('PortfolioService', 'getPortfolioPerformance', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Add asset to portfolio
   */
  async addAssetToPortfolio(portfolioId: number, assetData: any): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioService.addAssetToPortfolio', async () => {
      try {
        if (!portfolioId || portfolioId <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        // Verify portfolio exists
        const portfolio = await this.portfolioRepository.findById(portfolioId, false);
        if (!portfolio) {
          throw AppError.notFound('Portfolio', portfolioId.toString());
        }

        // Create asset with portfolio ID
        await this.assetService.createAsset({
          ...assetData,
          portfolioId
        });

        // Return updated portfolio
        const updatedPortfolio = await this.portfolioRepository.findById(portfolioId);
        if (!updatedPortfolio) {
          throw AppError.internal('Failed to retrieve updated portfolio');
        }

        logger.logService('PortfolioService', 'addAssetToPortfolio');
        return updatedPortfolio;
      } catch (error) {
        logger.logService('PortfolioService', 'addAssetToPortfolio', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Remove asset from portfolio
   */
  async removeAssetFromPortfolio(portfolioId: number, assetId: number): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioService.removeAssetFromPortfolio', async () => {
      try {
        if (!portfolioId || portfolioId <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        if (!assetId || assetId <= 0) {
          throw AppError.badRequest('Invalid asset ID');
        }

        // Verify portfolio exists
        const portfolio = await this.portfolioRepository.findById(portfolioId, false);
        if (!portfolio) {
          throw AppError.notFound('Portfolio', portfolioId.toString());
        }

        // Delete asset
        await this.assetService.deleteAsset(assetId);

        // Return updated portfolio
        const updatedPortfolio = await this.portfolioRepository.findById(portfolioId);
        if (!updatedPortfolio) {
          throw AppError.internal('Failed to retrieve updated portfolio');
        }

        logger.logService('PortfolioService', 'removeAssetFromPortfolio');
        return updatedPortfolio;
      } catch (error) {
        logger.logService('PortfolioService', 'removeAssetFromPortfolio', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get comprehensive portfolio summary
   */
  async getPortfolioSummary(id: number): Promise<{
    portfolio: Portfolio;
    performance: PortfolioPerformanceMetrics;
    assetCount: number;
    totalCost: number;
    recentActivity?: any[];
  }> {
    return PerformanceMonitor.measureAsync('PortfolioService.getPortfolioSummary', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        const portfolio = await this.portfolioRepository.findById(id);
        if (!portfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        const performance = await this.getPortfolioPerformance(id);
        const totalCost = portfolio.totalCost;

        logger.logService('PortfolioService', 'getPortfolioSummary');
        return {
          portfolio,
          performance,
          assetCount: portfolio.assetCount,
          totalCost,
        };
      } catch (error) {
        logger.logService('PortfolioService', 'getPortfolioSummary', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get portfolio assets
   */
  async getPortfolioAssets(id: number): Promise<any[]> {
    return PerformanceMonitor.measureAsync('PortfolioService.getPortfolioAssets', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        const portfolio = await this.portfolioRepository.findById(id);
        if (!portfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        logger.logService('PortfolioService', 'getPortfolioAssets');
        return portfolio.assets || [];
      } catch (error) {
        logger.logService('PortfolioService', 'getPortfolioAssets', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStatistics(): Promise<{
    totalPortfolios: number;
    totalAssets: number;
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    averagePnLPercentage: number;
  }> {
    return PerformanceMonitor.measureAsync('PortfolioService.getPortfolioStatistics', async () => {
      try {
        logger.logService('PortfolioService', 'getPortfolioStatistics');
        return await this.portfolioRepository.getStatistics();
      } catch (error) {
        logger.logService('PortfolioService', 'getPortfolioStatistics', undefined, error as Error);
        throw error;
      }
    });
  }

  /**
   * Validate portfolio creation business rules
   */
  private async validatePortfolioCreation(portfolioData: CreatePortfolioDto): Promise<void> {
    if (!portfolioData.name || portfolioData.name.trim().length === 0) {
      throw AppError.validation('Portfolio name is required');
    }

    if (portfolioData.name.trim().length < 2) {
      throw AppError.validation('Portfolio name must be at least 2 characters long');
    }

    if (portfolioData.name.trim().length > 255) {
      throw AppError.validation('Portfolio name must be less than 255 characters');
    }

    if (portfolioData.description && portfolioData.description.length > 1000) {
      throw AppError.validation('Portfolio description must be less than 1000 characters');
    }
  }

  /**
   * Validate portfolio update business rules
   */
  private async validatePortfolioUpdate(id: number, portfolioData: UpdatePortfolioDto): Promise<void> {
    const existingPortfolio = await this.portfolioRepository.findById(id, false);
    if (!existingPortfolio) {
      throw AppError.notFound('Portfolio', id.toString());
    }

    if (portfolioData.name !== undefined) {
      if (!portfolioData.name || portfolioData.name.trim().length === 0) {
        throw AppError.validation('Portfolio name is required');
      }

      if (portfolioData.name.trim().length < 2) {
        throw AppError.validation('Portfolio name must be at least 2 characters long');
      }

      if (portfolioData.name.trim().length > 255) {
        throw AppError.validation('Portfolio name must be less than 255 characters');
      }
    }

    if (portfolioData.description !== undefined && portfolioData.description && portfolioData.description.length > 1000) {
      throw AppError.validation('Portfolio description must be less than 1000 characters');
    }
  }
}
