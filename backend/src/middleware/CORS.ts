import { Request, Response, NextFunction } from 'express';
import { getAppConfig } from '../config/app';
import { logger } from '../utils/Logger';

/**
 * Enhanced CORS middleware with security features
 */
export class CORSConfig {
  /**
   * Create CORS middleware with configuration
   */
  static create() {
    const config = getAppConfig();
    
    return (req: Request, res: Response, next: NextFunction): void => {
      const origin = req.get('Origin');
      
      // Check if origin is allowed
      if (origin && config.cors.origin.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
      } else if (config.cors.origin.includes('*')) {
        res.set('Access-Control-Allow-Origin', '*');
      } else {
        // For development, allow localhost
        if (process.env.NODE_ENV === 'development' && origin && 
            (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
          res.set('Access-Control-Allow-Origin', origin);
        }
      }

      // Set credentials header if origin is allowed
      if (res.get('Access-Control-Allow-Origin')) {
        res.set('Access-Control-Allow-Credentials', config.cors.credentials.toString());
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.set('Access-Control-Allow-Headers', [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'API-Version',
          'X-API-Version',
          'X-Request-ID',
        ].join(', '));
        
        res.set('Access-Control-Max-Age', '86400'); // 24 hours
        res.set('Access-Control-Expose-Headers', [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
          'X-Request-ID',
        ].join(', '));

        res.status(204).end();
        return;
      }

      // Log CORS requests in development
      if (process.env.NODE_ENV === 'development' && origin) {
        logger.debug('CORS request', {
          origin,
          method: req.method,
          url: req.url,
          allowed: !!res.get('Access-Control-Allow-Origin'),
        });
      }

      next();
    };
  }

  /**
   * Create restrictive CORS for production
   */
  static createRestrictive() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const origin = req.get('Origin');
      const allowedOrigins = [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
      ];

      if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Credentials', 'true');
      }

      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600'); // 1 hour
        res.status(204).end();
        return;
      }

      next();
    };
  }

  /**
   * Create permissive CORS for development
   */
  static createPermissive() {
    return (req: Request, res: Response, next: NextFunction): void => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.set('Access-Control-Allow-Headers', '*');
      res.set('Access-Control-Max-Age', '86400');

      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }

      next();
    };
  }
}
