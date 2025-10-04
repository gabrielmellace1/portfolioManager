import { Request, Response, NextFunction } from 'express';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { Cache } from '../utils/Cache';
import { logger } from '../utils/Logger';

/**
 * Performance dashboard middleware
 */
export class PerformanceDashboard {
  /**
   * Get performance metrics endpoint
   */
  public static getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceMetrics = PerformanceMonitor.getMetrics();
      const cacheStats = Cache.getInstance().getStats();
      
      const metrics = {
        timestamp: new Date().toISOString(),
        performance: {
          totalOperations: performanceMetrics.length,
          averageDuration: performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0) / performanceMetrics.length || 0,
          slowestOperation: performanceMetrics.reduce((max, metric) => 
            metric.duration > max.duration ? metric : max, 
            { duration: 0, operation: 'none' }
          ),
          operationsByType: performanceMetrics.reduce((acc, metric) => {
            acc[metric.operation] = (acc[metric.operation] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        cache: {
          size: cacheStats.size,
          hitRate: this.calculateCacheHitRate(),
          keys: cacheStats.keys.slice(0, 10), // Show first 10 keys
        },
        system: {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
        },
      };

      res.json({
        success: true,
        data: metrics,
        message: 'Performance metrics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error getting performance metrics', error as any);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve performance metrics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get detailed performance report
   */
  public static getDetailedReport(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceMetrics = PerformanceMonitor.getMetrics();
      const cacheStats = Cache.getInstance().getStats();
      
      // Group metrics by operation
      const operationGroups = performanceMetrics.reduce((groups, metric) => {
        if (!groups[metric.operation]) {
          groups[metric.operation] = [];
        }
        groups[metric.operation].push(metric);
        return groups;
      }, {} as Record<string, any[]>);

      // Calculate statistics for each operation
      const operationStats = Object.entries(operationGroups).map(([operation, metrics]) => {
        const durations = (metrics as any[]).map((m: any) => m.duration);
        return {
          operation,
          count: (metrics as any[]).length,
          averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations),
          totalDuration: durations.reduce((sum, d) => sum + d, 0),
          recentExecutions: (metrics as any[]).slice(-5).map((m: any) => ({
            timestamp: m.timestamp,
            duration: m.duration,
            memoryUsage: m.memoryUsage,
          })),
        };
      });

      // Sort by average duration (slowest first)
      operationStats.sort((a, b) => b.averageDuration - a.averageDuration);

      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalOperations: performanceMetrics.length,
          uniqueOperations: Object.keys(operationGroups).length,
          averageDuration: performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0) / performanceMetrics.length || 0,
        },
        operations: operationStats,
        cache: {
          size: cacheStats.size,
          keys: cacheStats.keys,
          hitRate: this.calculateCacheHitRate(),
        },
        recommendations: this.generateRecommendations(operationStats),
      };

      res.json({
        success: true,
        data: report,
        message: 'Detailed performance report generated',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error generating detailed report', error as any);
      res.status(500).json({
        success: false,
        error: 'Failed to generate detailed report',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear performance metrics
   */
  public static clearMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      PerformanceMonitor.clearMetrics();
      Cache.getInstance().clear();
      
      logger.info('Performance metrics and cache cleared');
      
      res.json({
        success: true,
        message: 'Performance metrics and cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error clearing metrics', error as any);
      res.status(500).json({
        success: false,
        error: 'Failed to clear metrics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get system health with performance data
   */
  public static getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceMetrics = PerformanceMonitor.getMetrics();
      const cacheStats = Cache.getInstance().getStats();
      const memoryUsage = process.memoryUsage();
      
      // Calculate health score (0-100)
      const healthScore = this.calculateHealthScore(performanceMetrics, memoryUsage);
      
      const health = {
        status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
        score: healthScore,
        timestamp: new Date().toISOString(),
        metrics: {
          performance: {
            totalOperations: performanceMetrics.length,
            averageDuration: performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0) / performanceMetrics.length || 0,
            slowOperations: performanceMetrics.filter(m => m.duration > 1000).length,
          },
          cache: {
            size: cacheStats.size,
            hitRate: this.calculateCacheHitRate(),
          },
          system: {
            memoryUsage: {
              rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
              heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
              heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
              external: Math.round(memoryUsage.external / 1024 / 1024), // MB
            },
            uptime: process.uptime(),
          },
        },
        recommendations: this.generateHealthRecommendations(healthScore, performanceMetrics, memoryUsage),
      };

      res.json({
        success: true,
        data: health,
        message: 'System health retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error getting system health', error as any);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system health',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Calculate cache hit rate (mock implementation)
   */
  private static calculateCacheHitRate(): number {
    // This would need to be implemented with actual cache hit/miss tracking
    return Math.random() * 100; // Mock value
  }

  /**
   * Calculate health score
   */
  private static calculateHealthScore(metrics: any[], memoryUsage: NodeJS.MemoryUsage): number {
    let score = 100;
    
    // Deduct points for slow operations
    const slowOperations = metrics.filter(m => m.duration > 1000).length;
    score -= slowOperations * 5;
    
    // Deduct points for high memory usage
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) {
      score -= 20;
    } else if (memoryUsageMB > 200) {
      score -= 10;
    }
    
    // Deduct points for many operations (potential performance issues)
    if (metrics.length > 1000) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate performance recommendations
   */
  private static generateRecommendations(operationStats: any[]): string[] {
    const recommendations: string[] = [];
    
    // Check for slow operations
    const slowOperations = operationStats.filter(op => op.averageDuration > 1000);
    if (slowOperations.length > 0) {
      recommendations.push(`Consider optimizing ${slowOperations.length} slow operations`);
    }
    
    // Check for operations with high variance
    const highVarianceOps = operationStats.filter(op => 
      (op.maxDuration - op.minDuration) > op.averageDuration * 2
    );
    if (highVarianceOps.length > 0) {
      recommendations.push('Some operations show high performance variance - investigate for consistency issues');
    }
    
    // Check for memory-intensive operations
    const memoryIntensiveOps = operationStats.filter(op => 
      op.recentExecutions.some((exec: any) => exec.memoryUsage > 100)
    );
    if (memoryIntensiveOps.length > 0) {
      recommendations.push('Consider memory optimization for high-memory operations');
    }
    
    return recommendations;
  }

  /**
   * Generate health recommendations
   */
  private static generateHealthRecommendations(score: number, metrics: any[], memoryUsage: NodeJS.MemoryUsage): string[] {
    const recommendations: string[] = [];
    
    if (score < 60) {
      recommendations.push('System health is critical - immediate attention required');
    } else if (score < 80) {
      recommendations.push('System health is degraded - monitoring recommended');
    }
    
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) {
      recommendations.push('High memory usage detected - consider garbage collection or memory optimization');
    }
    
    const slowOperations = metrics.filter(m => m.duration > 1000).length;
    if (slowOperations > 10) {
      recommendations.push('Multiple slow operations detected - performance optimization needed');
    }
    
    return recommendations;
  }
}
