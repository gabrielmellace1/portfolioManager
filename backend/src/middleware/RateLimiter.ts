import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/Logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limiter (for development)
 * In production, use Redis or similar
 */
export class RateLimiter {
  private static store: RateLimitStore = {};
  private static cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Start cleanup interval for expired entries
   */
  private static startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach(key => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, 60000); // Cleanup every minute
  }

  /**
   * Create rate limiting middleware
   */
  static create(config: RateLimitConfig) {
    this.startCleanup();

    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.getClientKey(req);
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Initialize or get existing entry
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 0,
          resetTime: now + config.windowMs,
        };
      }

      // Increment counter
      this.store[key].count++;

      // Check if limit exceeded
      if (this.store[key].count > config.maxRequests) {
        const resetTime = this.store[key].resetTime;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        logger.warn('Rate limit exceeded', {
          clientKey: key,
          count: this.store[key].count,
          maxRequests: config.maxRequests,
          windowMs: config.windowMs,
          retryAfter,
        });

        res.set({
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        });

        throw AppError.badRequest(
          config.message || 'Too many requests, please try again later',
          { retryAfter }
        );
      }

      // Set rate limit headers
      const remaining = Math.max(0, config.maxRequests - this.store[key].count);
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(this.store[key].resetTime).toISOString(),
      });

      next();
    };
  }

  /**
   * Get client identifier for rate limiting
   */
  private static getClientKey(req: Request): string {
    // Use IP address as primary identifier
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // In production, you might want to use user ID if authenticated
    // const userId = (req as any).user?.id;
    // return userId ? `user:${userId}` : `ip:${ip}`;
    
    return `ip:${ip}`;
  }

  /**
   * Create different rate limits for different endpoints
   */
  static createStrict() {
    return this.create({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message: 'Too many requests from this IP, please try again later',
    });
  }

  static createModerate() {
    return this.create({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200,
      message: 'Rate limit exceeded, please slow down',
    });
  }

  static createLenient() {
    return this.create({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 500,
      message: 'Rate limit exceeded, please try again later',
    });
  }

  /**
   * Create rate limiter for specific endpoints
   */
  static createForEndpoint(endpoint: string, config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (req.path.includes(endpoint)) {
        return this.create(config)(req, res, next);
      }
      next();
    };
  }

  /**
   * Cleanup method for graceful shutdown
   */
  static cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store = {};
  }
}
