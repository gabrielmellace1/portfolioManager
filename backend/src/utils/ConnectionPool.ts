import { DataSource, DataSourceOptions } from 'typeorm';
import { Logger } from './Logger';

/**
 * Database connection pool manager
 */
export class ConnectionPool {
  private static instance: ConnectionPool;
  private dataSource: DataSource | null = null;
  private isInitialized: boolean = false;
  private connectionOptions: DataSourceOptions;

  private constructor(options: DataSourceOptions) {
    this.connectionOptions = {
      ...options,
      // Connection pool settings
      extra: {
        ...options.extra,
        // Maximum number of connections
        max: 20,
        // Minimum number of connections
        min: 5,
        // Connection timeout
        acquireTimeoutMillis: 30000,
        // Idle timeout
        idleTimeoutMillis: 30000,
        // Connection validation
        validate: true,
        // Connection retry
        retryAttempts: 3,
        retryDelay: 1000,
      },
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options: DataSourceOptions): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(options);
    }
    return ConnectionPool.instance;
  }

  /**
   * Initialize connection pool
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      Logger.debug('Connection pool already initialized');
      return;
    }

    try {
      this.dataSource = new DataSource(this.connectionOptions);
      await this.dataSource.initialize();
      this.isInitialized = true;
      
      Logger.info('Database connection pool initialized', {
        type: this.connectionOptions.type,
        database: this.connectionOptions.database,
        maxConnections: this.connectionOptions.extra?.max,
        minConnections: this.connectionOptions.extra?.min,
      });
    } catch (error) {
      Logger.error('Failed to initialize connection pool', error);
      throw error;
    }
  }

  /**
   * Get data source
   */
  public getDataSource(): DataSource {
    if (!this.dataSource || !this.isInitialized) {
      throw new Error('Connection pool not initialized');
    }
    return this.dataSource;
  }

  /**
   * Get connection pool statistics
   */
  public async getPoolStats(): Promise<{
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingClients: number;
  }> {
    if (!this.dataSource) {
      throw new Error('Connection pool not initialized');
    }

    // This would need to be implemented based on the specific database driver
    // For now, return mock data
    return {
      totalConnections: 10,
      activeConnections: 3,
      idleConnections: 7,
      waitingClients: 0,
    };
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.dataSource) {
      return false;
    }

    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      Logger.error('Connection test failed', error);
      return false;
    }
  }

  /**
   * Close connection pool
   */
  public async close(): Promise<void> {
    if (this.dataSource && this.isInitialized) {
      try {
        await this.dataSource.destroy();
        this.isInitialized = false;
        Logger.info('Connection pool closed');
      } catch (error) {
        Logger.error('Error closing connection pool', error);
        throw error;
      }
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connected: boolean;
      poolStats: any;
      lastCheck: Date;
    };
  }> {
    const connected = await this.testConnection();
    const poolStats = await this.getPoolStats();
    
    return {
      status: connected ? 'healthy' : 'unhealthy',
      details: {
        connected,
        poolStats,
        lastCheck: new Date(),
      },
    };
  }
}

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeoutMillis: number;
  idleTimeoutMillis: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Connection pool factory
 */
export class ConnectionPoolFactory {
  /**
   * Create connection pool with optimized settings
   */
  public static createOptimizedPool(
    baseOptions: DataSourceOptions,
    config: ConnectionPoolConfig
  ): ConnectionPool {
    const optimizedOptions: DataSourceOptions = {
      ...baseOptions,
      extra: {
        ...baseOptions.extra,
        max: config.maxConnections,
        min: config.minConnections,
        acquireTimeoutMillis: config.acquireTimeoutMillis,
        idleTimeoutMillis: config.idleTimeoutMillis,
        retryAttempts: config.retryAttempts,
        retryDelay: config.retryDelay,
        // Additional optimizations
        connectionTimeoutMillis: 30000,
        requestTimeout: 30000,
        // Connection validation
        validate: true,
        // Connection recycling
        evict: true,
        evictionRunIntervalMillis: 60000,
        numTestsPerEvictionRun: 3,
        minEvictableIdleTimeMillis: 300000,
      },
    };

    return ConnectionPool.getInstance(optimizedOptions);
  }

  /**
   * Create connection pool for different environments
   */
  public static createPoolForEnvironment(
    baseOptions: DataSourceOptions,
    environment: 'development' | 'production' | 'test'
  ): ConnectionPool {
    const configs: Record<string, ConnectionPoolConfig> = {
      development: {
        maxConnections: 10,
        minConnections: 2,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      },
      production: {
        maxConnections: 50,
        minConnections: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        retryAttempts: 5,
        retryDelay: 2000,
      },
      test: {
        maxConnections: 5,
        minConnections: 1,
        acquireTimeoutMillis: 10000,
        idleTimeoutMillis: 10000,
        retryAttempts: 1,
        retryDelay: 500,
      },
    };

    const config = configs[environment];
    return ConnectionPoolFactory.createOptimizedPool(baseOptions, config);
  }
}
