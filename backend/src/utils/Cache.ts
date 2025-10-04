import { Logger } from './Logger';

/**
 * Simple in-memory cache implementation
 */
export class Cache {
  private static instance: Cache;
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  /**
   * Set cache value with TTL
   */
  public set(key: string, value: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
    Logger.debug(`Cache set: ${key}`, { ttl: ttl || this.defaultTTL });
  }

  /**
   * Get cache value
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      Logger.debug(`Cache miss: ${key}`);
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      Logger.debug(`Cache expired: ${key}`);
      return null;
    }

    Logger.debug(`Cache hit: ${key}`);
    return item.value as T;
  }

  /**
   * Delete cache value
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      Logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  public clear(): void {
    this.cache.clear();
    Logger.debug('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean expired entries
   */
  public cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }

    return cleaned;
  }

  /**
   * Set default TTL
   */
  public setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
    Logger.debug(`Default TTL set to ${ttl}ms`);
  }
}

/**
 * Cache decorator for methods
 */
export function Cacheable(ttl?: number, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = Cache.getInstance();

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(key, result, ttl);
      
      return result;
    };
  };
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  portfolio: (id: number) => `portfolio:${id}`,
  portfolioAssets: (id: number) => `portfolio:${id}:assets`,
  asset: (id: number) => `asset:${id}`,
  assetPrice: (ticker: string) => `price:${ticker}`,
  performance: (portfolioId: number) => `performance:${portfolioId}`,
  statistics: () => 'statistics',
  search: (query: string, filters: any) => `search:${query}:${JSON.stringify(filters)}`,
};

/**
 * Cache middleware for Express
 */
export const CacheMiddleware = (ttl?: number) => {
  return (req: any, res: any, next: any) => {
    const cache = Cache.getInstance();
    const key = `http:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Try to get from cache
    const cached = cache.get(key);
    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function (data: any) {
      cache.set(key, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
};
