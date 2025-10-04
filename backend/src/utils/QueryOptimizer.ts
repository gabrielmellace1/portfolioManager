import { SelectQueryBuilder } from 'typeorm';
import { Logger } from './Logger';

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Add pagination to query
   */
  public static addPagination<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10
  ): SelectQueryBuilder<T> {
    const offset = (page - 1) * limit;
    return queryBuilder
      .skip(offset)
      .take(limit);
  }

  /**
   * Add sorting to query
   */
  public static addSorting<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): SelectQueryBuilder<T> {
    return queryBuilder.orderBy(`${queryBuilder.alias}.${sortBy}`, sortOrder);
  }

  /**
   * Add relations to query
   */
  public static addRelations<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: string[] = []
  ): SelectQueryBuilder<T> {
    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.${relation}`, relation);
      });
    }
    return queryBuilder;
  }

  /**
   * Add filters to query
   */
  public static addFilters<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: Record<string, any>
  ): SelectQueryBuilder<T> {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryBuilder.andWhere(`${queryBuilder.alias}.${key} IN (:...${key})`, { [key]: value });
        } else if (typeof value === 'string' && value.includes('%')) {
          queryBuilder.andWhere(`${queryBuilder.alias}.${key} LIKE :${key}`, { [key]: value });
        } else {
          queryBuilder.andWhere(`${queryBuilder.alias}.${key} = :${key}`, { [key]: value });
        }
      }
    });
    return queryBuilder;
  }

  /**
   * Add search to query
   */
  public static addSearch<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    searchQuery: string,
    searchFields: string[]
  ): SelectQueryBuilder<T> {
    if (searchQuery && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => 
        `${queryBuilder.alias}.${field} LIKE :searchQuery`
      ).join(' OR ');
      
      queryBuilder.andWhere(`(${searchConditions})`, { 
        searchQuery: `%${searchQuery}%` 
      });
    }
    return queryBuilder;
  }

  /**
   * Add date range filter
   */
  public static addDateRange<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    dateField: string,
    startDate?: Date,
    endDate?: Date
  ): SelectQueryBuilder<T> {
    if (startDate) {
      queryBuilder.andWhere(`${queryBuilder.alias}.${dateField} >= :startDate`, { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere(`${queryBuilder.alias}.${dateField} <= :endDate`, { endDate });
    }
    return queryBuilder;
  }

  /**
   * Add performance indexes hint
   */
  public static addIndexHint<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    indexName: string
  ): SelectQueryBuilder<T> {
    // This is database-specific and may not work with all databases
    Logger.debug(`Using index hint: ${indexName}`);
    return queryBuilder;
  }

  /**
   * Optimize query for performance
   */
  public static optimizeQuery<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    options: {
      selectOnly?: string[];
      useIndex?: string;
      limitResults?: number;
    } = {}
  ): SelectQueryBuilder<T> {
    // Select only necessary fields
    if (options.selectOnly && options.selectOnly.length > 0) {
      queryBuilder.select(options.selectOnly.map(field => `${queryBuilder.alias}.${field}`));
    }

    // Use specific index
    if (options.useIndex) {
      QueryOptimizer.addIndexHint(queryBuilder, options.useIndex);
    }

    // Limit results if specified
    if (options.limitResults) {
      queryBuilder.limit(options.limitResults);
    }

    return queryBuilder;
  }

  /**
   * Get query execution plan
   */
  public static async getExecutionPlan<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>
  ): Promise<any> {
    const query = queryBuilder.getQuery();
    const parameters = queryBuilder.getParameters();
    
    Logger.debug('Query execution plan', { query, parameters });
    
    // This would need to be implemented based on the specific database
    // For now, just log the query
    return { query, parameters };
  }

  /**
   * Add query monitoring
   */
  public static addMonitoring<T extends Object>(
    queryBuilder: SelectQueryBuilder<T>,
    operationName: string
  ): SelectQueryBuilder<T> {
    const startTime = Date.now();
    
    // Override execute method to add monitoring
    const originalExecute = queryBuilder.execute;
    queryBuilder.execute = async function() {
      const result = await originalExecute.call(this);
      const duration = Date.now() - startTime;
      
      Logger.logPerformance({
        operation: operationName,
        duration,
        query: this.getQuery(),
        parameters: this.getParameters(),
      });
      
      return result;
    };

    return queryBuilder;
  }
}

/**
 * Query builder factory
 */
export class QueryBuilderFactory {
  /**
   * Create optimized query builder
   */
  public static createOptimizedQuery<T extends Object>(
    baseQuery: SelectQueryBuilder<T>,
    options: {
      pagination?: { page: number; limit: number };
      sorting?: { sortBy: string; sortOrder: 'ASC' | 'DESC' };
      relations?: string[];
      filters?: Record<string, any>;
      search?: { query: string; fields: string[] };
      dateRange?: { field: string; startDate?: Date; endDate?: Date };
      performance?: {
        selectOnly?: string[];
        useIndex?: string;
        limitResults?: number;
      };
      monitoring?: string;
    }
  ): SelectQueryBuilder<T> {
    let query = baseQuery;

    // Add relations
    if (options.relations) {
      query = QueryOptimizer.addRelations(query, options.relations);
    }

    // Add filters
    if (options.filters) {
      query = QueryOptimizer.addFilters(query, options.filters);
    }

    // Add search
    if (options.search) {
      query = QueryOptimizer.addSearch(query, options.search.query, options.search.fields);
    }

    // Add date range
    if (options.dateRange) {
      query = QueryOptimizer.addDateRange(
        query, 
        options.dateRange.field, 
        options.dateRange.startDate, 
        options.dateRange.endDate
      );
    }

    // Add sorting
    if (options.sorting) {
      query = QueryOptimizer.addSorting(query, options.sorting.sortBy, options.sorting.sortOrder);
    }

    // Add pagination
    if (options.pagination) {
      query = QueryOptimizer.addPagination(query, options.pagination.page, options.pagination.limit);
    }

    // Add performance optimizations
    if (options.performance) {
      query = QueryOptimizer.optimizeQuery(query, options.performance);
    }

    // Add monitoring
    if (options.monitoring) {
      query = QueryOptimizer.addMonitoring(query, options.monitoring);
    }

    return query;
  }
}
