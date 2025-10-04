import { Repository, DataSource, SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { Portfolio } from '../entities/Portfolio';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export interface PortfolioQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeAssets?: boolean;
  searchTerm?: string;
}

export class PortfolioRepository {
  private repository: Repository<Portfolio>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Portfolio);
  }

  /**
   * Find all portfolios with optional filtering and pagination
   */
  async findAll(options: PortfolioQueryOptions = {}): Promise<Portfolio[]> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.findAll', async () => {
      try {
        const queryBuilder = this.createQueryBuilder(options);
        const portfolios = await queryBuilder.getMany();
        
        logger.logDatabase('SELECT', 'portfolios', undefined, undefined);
        return portfolios;
      } catch (error) {
        logger.logDatabase('SELECT', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to fetch portfolios', { originalError: error });
      }
    });
  }

  /**
   * Find portfolios with pagination
   */
  async findWithPagination(options: PortfolioQueryOptions = {}): Promise<{
    data: Portfolio[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.findWithPagination', async () => {
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

        logger.logDatabase('SELECT_PAGINATED', 'portfolios', undefined, undefined);
        
        return {
          data,
          total,
          page,
          limit,
          totalPages,
        };
      } catch (error) {
        logger.logDatabase('SELECT_PAGINATED', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to fetch paginated portfolios', { originalError: error });
      }
    });
  }

  /**
   * Find portfolio by ID
   */
  async findById(id: number, includeAssets: boolean = true): Promise<Portfolio | null> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.findById', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID');
        }

        const portfolio = await this.repository.findOne({
          where: { id },
          relations: includeAssets ? ['assets'] : [],
        });

        if (!portfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        logger.logDatabase('SELECT_BY_ID', 'portfolios', undefined, undefined);
        return portfolio;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('SELECT_BY_ID', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to fetch portfolio', { originalError: error });
      }
    });
  }

  /**
   * Find portfolio by name
   */
  async findByName(name: string, includeAssets: boolean = true): Promise<Portfolio | null> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.findByName', async () => {
      try {
        if (!name || name.trim().length === 0) {
          throw AppError.badRequest('Portfolio name is required');
        }

        const portfolio = await this.repository.findOne({
          where: { name: name.trim() },
          relations: includeAssets ? ['assets'] : [],
        });

        logger.logDatabase('SELECT_BY_NAME', 'portfolios', undefined, undefined);
        return portfolio;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('SELECT_BY_NAME', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to fetch portfolio by name', { originalError: error });
      }
    });
  }

  /**
   * Create new portfolio
   */
  async create(portfolioData: Partial<Portfolio>): Promise<Portfolio> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.create', async () => {
      try {
        // Validate required fields
        if (!portfolioData.name || portfolioData.name.trim().length === 0) {
          throw AppError.validation('Portfolio name is required');
        }

        // Check for duplicate name
        const existingPortfolio = await this.findByName(portfolioData.name, false);
        if (existingPortfolio) {
          throw AppError.conflict('Portfolio with this name already exists');
        }

        const newPortfolio = this.repository.create({
          ...portfolioData,
          name: portfolioData.name.trim(),
        });
        
        const savedPortfolio = await this.repository.save(newPortfolio);
        
        logger.logDatabase('INSERT', 'portfolios', undefined, undefined);
        return savedPortfolio;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('INSERT', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to create portfolio', { originalError: error });
      }
    });
  }

  /**
   * Update portfolio
   */
  async update(id: number, portfolioData: Partial<Portfolio>): Promise<Portfolio | null> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.update', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID for update');
        }

        // Check if portfolio exists
        const existingPortfolio = await this.findById(id, false);
        if (!existingPortfolio) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        // Check for duplicate name if name is being updated
        if (portfolioData.name && portfolioData.name !== existingPortfolio.name) {
          const duplicatePortfolio = await this.findByName(portfolioData.name, false);
          if (duplicatePortfolio) {
            throw AppError.conflict('Portfolio with this name already exists');
          }
        }

        await this.repository.update(id, {
          ...portfolioData,
          ...(portfolioData.name && { name: portfolioData.name.trim() }),
        });
        
        const updatedPortfolio = await this.findById(id);
        
        logger.logDatabase('UPDATE', 'portfolios', undefined, undefined);
        return updatedPortfolio;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('UPDATE', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to update portfolio', { originalError: error });
      }
    });
  }

  /**
   * Delete portfolio
   */
  async delete(id: number): Promise<boolean> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.delete', async () => {
      try {
        if (!id || id <= 0) {
          throw AppError.badRequest('Invalid portfolio ID for deletion');
        }

        const result = await this.repository.delete(id);
        const deleted = result.affected !== 0;
        
        if (!deleted) {
          throw AppError.notFound('Portfolio', id.toString());
        }

        logger.logDatabase('DELETE', 'portfolios', undefined, undefined);
        return deleted;
      } catch (error) {
        if (error instanceof AppError) throw error;
        logger.logDatabase('DELETE', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to delete portfolio', { originalError: error });
      }
    });
  }

  /**
   * Get portfolio statistics
   */
  async getStatistics(): Promise<{
    totalPortfolios: number;
    totalAssets: number;
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    averagePnLPercentage: number;
  }> {
    return PerformanceMonitor.measureAsync('PortfolioRepository.getStatistics', async () => {
      try {
        const portfolios = await this.repository.find({
          relations: ['assets'],
        });

        const statistics = {
          totalPortfolios: portfolios.length,
          totalAssets: 0,
          totalValue: 0,
          totalCost: 0,
          totalPnL: 0,
          averagePnLPercentage: 0,
        };

        portfolios.forEach(portfolio => {
          if (portfolio.assets) {
            statistics.totalAssets += portfolio.assets.length;
            statistics.totalValue += portfolio.totalValue;
            statistics.totalCost += portfolio.totalCost;
            statistics.totalPnL += portfolio.totalUnrealizedPnL;
          }
        });

        // Calculate average PnL percentage
        if (statistics.totalCost > 0) {
          statistics.averagePnLPercentage = (statistics.totalPnL / statistics.totalCost) * 100;
        }

        logger.logDatabase('STATISTICS', 'portfolios', undefined, undefined);
        return statistics;
      } catch (error) {
        logger.logDatabase('STATISTICS', 'portfolios', undefined, error as Error);
        throw AppError.internal('Failed to fetch portfolio statistics', { originalError: error });
      }
    });
  }

  /**
   * Create query builder with common options
   */
  private createQueryBuilder(options: PortfolioQueryOptions): SelectQueryBuilder<Portfolio> {
    const queryBuilder = this.repository.createQueryBuilder('portfolio');

    // Add relations
    if (options.includeAssets !== false) {
      queryBuilder.leftJoinAndSelect('portfolio.assets', 'assets');
    }

    // Add search filter
    if (options.searchTerm) {
      queryBuilder.andWhere(
        '(portfolio.name ILIKE :searchTerm OR portfolio.description ILIKE :searchTerm)',
        { searchTerm: `%${options.searchTerm}%` }
      );
    }

    // Add sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder || 'ASC';
      queryBuilder.orderBy(`portfolio.${options.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('portfolio.createdAt', 'DESC');
    }

    return queryBuilder;
  }
}
