import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { logger } from '../utils/Logger';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
    disk?: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
  };
}

/**
 * Health check middleware
 */
export class HealthCheck {
  private static dataSource: DataSource | null = null;
  private static startTime: number = Date.now();

  /**
   * Set database connection for health checks
   */
  static setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
  }

  /**
   * Basic health check endpoint
   */
  static basic(req: Request, res: Response, next: NextFunction): void {
    const uptime = Date.now() - this.startTime;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000), // seconds
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  /**
   * Detailed health check endpoint
   */
  static detailed(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const uptime = Date.now() - this.startTime;
    
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'disconnected',
        },
        memory: this.getMemoryUsage(),
      },
    };

    // Check database connection
    this.checkDatabase(healthResult)
      .then(() => {
        const responseTime = Date.now() - startTime;
        
        // Determine overall status
        if (healthResult.services.database.status === 'connected') {
          healthResult.status = 'healthy';
        } else if (healthResult.services.database.status === 'error') {
          healthResult.status = 'unhealthy';
        } else {
          healthResult.status = 'degraded';
        }

        // Add response time to database check
        healthResult.services.database.responseTime = responseTime;

        const statusCode = healthResult.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthResult);
      })
      .catch(error => {
        logger.error('Health check failed', { error });
        
        healthResult.status = 'unhealthy';
        healthResult.services.database.status = 'error';
        healthResult.services.database.error = error.message;
        
        res.status(503).json(healthResult);
      });
  }

  /**
   * Check database connection
   */
  private static async checkDatabase(healthResult: HealthCheckResult): Promise<void> {
    if (!this.dataSource) {
      healthResult.services.database.status = 'disconnected';
      healthResult.services.database.error = 'No database connection configured';
      return;
    }

    try {
      if (this.dataSource.isInitialized) {
        // Test database connection with a simple query
        await this.dataSource.query('SELECT 1');
        healthResult.services.database.status = 'connected';
      } else {
        healthResult.services.database.status = 'disconnected';
        healthResult.services.database.error = 'Database not initialized';
      }
    } catch (error) {
      healthResult.services.database.status = 'error';
      healthResult.services.database.error = error instanceof Error ? error.message : 'Unknown database error';
    }
  }

  /**
   * Get memory usage information
   */
  private static getMemoryUsage() {
    const usage = process.memoryUsage();
    
    return {
      used: Math.round(usage.heapUsed / 1024 / 1024), // MB
      free: Math.round((usage.heapTotal - usage.heapUsed) / 1024 / 1024), // MB
      total: Math.round(usage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
    };
  }

  /**
   * Readiness probe for Kubernetes
   */
  static readiness(req: Request, res: Response, next: NextFunction): void {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      res.status(503).json({
        status: 'not ready',
        message: 'Database not initialized',
      });
      return;
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Liveness probe for Kubernetes
   */
  static liveness(req: Request, res: Response, next: NextFunction): void {
    const uptime = Date.now() - this.startTime;
    const maxUptime = 24 * 60 * 60 * 1000; // 24 hours

    if (uptime > maxUptime) {
      res.status(503).json({
        status: 'unhealthy',
        message: 'Application has been running too long',
        uptime: Math.floor(uptime / 1000),
      });
      return;
    }

    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000),
    });
  }
}
