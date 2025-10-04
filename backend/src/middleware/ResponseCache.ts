import { Request, Response, NextFunction } from 'express';
import { Cache, CacheKeys } from '../utils/Cache';
import { Logger } from '../utils/Logger';

/**
 * Response caching middleware
 */
export class ResponseCache {
  private static cache = Cache.getInstance();

  /**
   * Cache middleware for GET requests
   */
  public static cacheGet(ttl: number = 5 * 60 * 1000) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `http:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      // Try to get from cache
      const cached = ResponseCache.cache.get(cacheKey);
      if (cached) {
        Logger.debug('Cache hit for GET request', { 
          path: req.originalUrl,
          key: cacheKey 
        });
        return res.json(cached);
      }

      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function (data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ResponseCache.cache.set(cacheKey, data, ttl);
          Logger.debug('Cached GET response', { 
            path: req.originalUrl,
            key: cacheKey,
            ttl 
          });
        }
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Cache middleware for specific endpoints
   */
  public static cacheEndpoint(endpoint: string, ttl: number = 5 * 60 * 1000) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.originalUrl.includes(endpoint)) {
        return next();
      }

      const cacheKey = `endpoint:${endpoint}:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      const cached = ResponseCache.cache.get(cacheKey);
      if (cached) {
        Logger.debug('Cache hit for endpoint', { 
          endpoint,
          path: req.originalUrl 
        });
        return res.json(cached);
      }

      const originalJson = res.json;
      res.json = function (data: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ResponseCache.cache.set(cacheKey, data, ttl);
          Logger.debug('Cached endpoint response', { 
            endpoint,
            path: req.originalUrl 
          });
        }
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Cache invalidation middleware
   */
  public static invalidateCache(patterns: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Override res.json to invalidate cache
      const originalJson = res.json;
      res.json = function (data: any) {
        // Invalidate cache after successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ResponseCache.invalidatePatterns(patterns);
          Logger.debug('Cache invalidated', { 
            patterns,
            method: req.method,
            path: req.originalUrl 
          });
        }
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Invalidate cache patterns
   */
  private static invalidatePatterns(patterns: string[]): void {
    const stats = ResponseCache.cache.getStats();
    
    patterns.forEach(pattern => {
      const keysToDelete = stats.keys.filter(key => key.includes(pattern));
      keysToDelete.forEach(key => {
        ResponseCache.cache.delete(key);
      });
      
      if (keysToDelete.length > 0) {
        Logger.debug('Invalidated cache keys', { 
          pattern,
          count: keysToDelete.length,
          keys: keysToDelete 
        });
      }
    });
  }

  /**
   * Cache statistics middleware
   */
  public static cacheStats(req: Request, res: Response, next: NextFunction) {
    const stats = ResponseCache.cache.getStats();
    
    res.set('X-Cache-Size', stats.size.toString());
    res.set('X-Cache-Keys', stats.keys.join(','));
    
    next();
  }
}

/**
 * Specific cache configurations for different endpoints
 */
export const CacheConfigs = {
  // Portfolio endpoints
  portfolios: ResponseCache.cacheEndpoint('/portfolios', 2 * 60 * 1000), // 2 minutes
  portfolioById: ResponseCache.cacheEndpoint('/portfolios/', 5 * 60 * 1000), // 5 minutes
  portfolioPerformance: ResponseCache.cacheEndpoint('/performance', 1 * 60 * 1000), // 1 minute
  
  // Asset endpoints
  assets: ResponseCache.cacheEndpoint('/assets', 2 * 60 * 1000), // 2 minutes
  assetById: ResponseCache.cacheEndpoint('/assets/', 5 * 60 * 1000), // 5 minutes
  assetSearch: ResponseCache.cacheEndpoint('/search', 1 * 60 * 1000), // 1 minute
  
  // Statistics endpoints
  statistics: ResponseCache.cacheEndpoint('/statistics', 10 * 60 * 1000), // 10 minutes
  
  // Health check (no caching)
  health: (req: Request, res: Response, next: NextFunction) => next(),
};

/**
 * Cache invalidation patterns
 */
export const CacheInvalidation = {
  // Invalidate portfolio-related cache when portfolio is modified
  portfolioModified: ResponseCache.invalidateCache([
    'portfolios',
    'performance',
    'statistics'
  ]),
  
  // Invalidate asset-related cache when asset is modified
  assetModified: ResponseCache.invalidateCache([
    'assets',
    'search',
    'performance',
    'statistics'
  ]),
  
  // Invalidate all cache when prices are updated
  pricesUpdated: ResponseCache.invalidateCache([
    'performance',
    'statistics'
  ]),
};
