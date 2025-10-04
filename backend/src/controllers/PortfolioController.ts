import { Controller, Get, Post, Put, Delete, Route, Path, Body, Query, Example, Tags } from 'tsoa';
import { Portfolio } from '../entities/Portfolio';
import { PortfolioService } from '../services/PortfolioService';
import { CreatePortfolioDto, UpdatePortfolioDto, QueryParamsDto } from '../validation/validators';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Portfolio management controller
 * Handles all portfolio-related operations including CRUD, performance tracking, and asset management
 */
@Route('portfolios')
@Tags('Portfolios')
export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor() {
    // This would be injected in a real application
    this.portfolioService = (global as any).portfolioService;
  }

  /**
   * Get all portfolios with optional filtering and pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort order (ASC or DESC)
   * @param searchTerm Search term for name or description
   */
  @Get('/')
  @Example({
    data: [
      {
        id: 1,
        name: 'My Portfolio',
        description: 'Main investment portfolio',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  })
  async getAllPortfolios(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'ASC' | 'DESC',
    @Query() searchTerm?: string
  ): Promise<any> {
    return PerformanceMonitor.measureAsync('PortfolioController.getAllPortfolios', async () => {
      try {
        const options = {
          page,
          limit,
          sortBy,
          sortOrder,
          searchTerm,
        };

        if (page && limit) {
          return await this.portfolioService.getPortfoliosWithPagination(options);
        } else {
          const portfolios = await this.portfolioService.getAllPortfolios(options);
          return { data: portfolios, total: portfolios.length };
        }
      } catch (error) {
        logger.error('Failed to get portfolios', { error });
        throw error;
      }
    });
  }

  /**
   * Get portfolio by ID
   * @param id Portfolio ID
   */
  @Get('/{id}')
  @Example({
    id: 1,
    name: 'My Portfolio',
    description: 'Main investment portfolio',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  })
  async getPortfolioById(@Path() id: number): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioController.getPortfolioById', async () => {
      try {
        return await this.portfolioService.getPortfolioById(id);
      } catch (error) {
        logger.error('Failed to get portfolio by ID', { portfolioId: id, error });
        throw error;
      }
    });
  }

  /**
   * Create new portfolio
   * @param portfolioData Portfolio creation data
   */
  @Post('/')
  @Example({
    name: 'My Portfolio',
    description: 'Main investment portfolio'
  })
  async createPortfolio(@Body() portfolioData: CreatePortfolioDto): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioController.createPortfolio', async () => {
      try {
        return await this.portfolioService.createPortfolio(portfolioData);
      } catch (error) {
        logger.error('Failed to create portfolio', { portfolioData, error });
        throw error;
      }
    });
  }

  /**
   * Update portfolio
   * @param id Portfolio ID
   * @param portfolioData Portfolio update data
   */
  @Put('/{id}')
  async updatePortfolio(
    @Path() id: number,
    @Body() portfolioData: UpdatePortfolioDto
  ): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioController.updatePortfolio', async () => {
      try {
        return await this.portfolioService.updatePortfolio(id, portfolioData);
      } catch (error) {
        logger.error('Failed to update portfolio', { portfolioId: id, portfolioData, error });
        throw error;
      }
    });
  }

  /**
   * Delete portfolio
   * @param id Portfolio ID
   */
  @Delete('/{id}')
  async deletePortfolio(@Path() id: number): Promise<{ success: boolean }> {
    return PerformanceMonitor.measureAsync('PortfolioController.deletePortfolio', async () => {
      try {
        const success = await this.portfolioService.deletePortfolio(id);
        return { success };
      } catch (error) {
        logger.error('Failed to delete portfolio', { portfolioId: id, error });
        throw error;
      }
    });
  }

  /**
   * Get portfolio performance metrics
   * @param id Portfolio ID
   */
  @Get('/{id}/performance')
  async getPortfolioPerformance(@Path() id: number): Promise<any> {
    return PerformanceMonitor.measureAsync('PortfolioController.getPortfolioPerformance', async () => {
      try {
        return await this.portfolioService.getPortfolioPerformance(id);
      } catch (error) {
        logger.error('Failed to get portfolio performance', { portfolioId: id, error });
        throw error;
      }
    });
  }

  /**
   * Add asset to portfolio
   * @param id Portfolio ID
   * @param assetData Asset data
   */
  @Post('/{id}/assets')
  async addAssetToPortfolio(
    @Path() id: number,
    @Body() assetData: any
  ): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioController.addAssetToPortfolio', async () => {
      try {
        return await this.portfolioService.addAssetToPortfolio(id, assetData);
      } catch (error) {
        logger.error('Failed to add asset to portfolio', { portfolioId: id, assetData, error });
        throw error;
      }
    });
  }

  /**
   * Remove asset from portfolio
   * @param portfolioId Portfolio ID
   * @param assetId Asset ID
   */
  @Delete('/{portfolioId}/assets/{assetId}')
  async removeAssetFromPortfolio(
    @Path() portfolioId: number,
    @Path() assetId: number
  ): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioController.removeAssetFromPortfolio', async () => {
      try {
        return await this.portfolioService.removeAssetFromPortfolio(portfolioId, assetId);
      } catch (error) {
        logger.error('Failed to remove asset from portfolio', { portfolioId, assetId, error });
        throw error;
      }
    });
  }

  /**
   * Get comprehensive portfolio summary
   * @param id Portfolio ID
   */
  @Get('/{id}/summary')
  async getPortfolioSummary(@Path() id: number): Promise<any> {
    return PerformanceMonitor.measureAsync('PortfolioController.getPortfolioSummary', async () => {
      try {
        return await this.portfolioService.getPortfolioSummary(id);
      } catch (error) {
        logger.error('Failed to get portfolio summary', { portfolioId: id, error });
        throw error;
      }
    });
  }

  /**
   * Get portfolio assets
   * @param id Portfolio ID
   */
  @Get('/{id}/assets')
  async getPortfolioAssets(@Path() id: number): Promise<any[]> {
    return PerformanceMonitor.measureAsync('PortfolioController.getPortfolioAssets', async () => {
      try {
        return await this.portfolioService.getPortfolioAssets(id);
      } catch (error) {
        logger.error('Failed to get portfolio assets', { portfolioId: id, error });
        throw error;
      }
    });
  }

  /**
   * Get portfolio statistics
   */
  @Get('/statistics')
  async getPortfolioStatistics(): Promise<{
    totalPortfolios: number;
    totalAssets: number;
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    averagePnLPercentage: number;
  }> {
    return PerformanceMonitor.measureAsync('PortfolioController.getPortfolioStatistics', async () => {
      try {
        return await this.portfolioService.getPortfolioStatistics();
      } catch (error) {
        logger.error('Failed to get portfolio statistics', { error });
        throw error;
      }
    });
  }
}
