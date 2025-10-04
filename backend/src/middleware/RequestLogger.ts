import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/Logger';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Request logging middleware
 */
export class RequestLogger {
  /**
   * Log HTTP requests with response time
   */
  static logRequest(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add request ID to request object for tracking
    (req as any).requestId = requestId;
    
    // Log request start
    logger.info('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(this: any, chunk?: any, encoding?: any): any {
      const responseTime = Date.now() - startTime;
      
      // Log request completion
      logger.logRequest(req, res, responseTime);
      
      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    } as any;

    next();
  }

  /**
   * Log slow requests (over 1 second)
   */
  static logSlowRequests(thresholdMs: number = 1000) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        if (duration > thresholdMs) {
          logger.warn('Slow request detected', {
            method: req.method,
            url: req.url,
            duration: `${duration}ms`,
            statusCode: res.statusCode,
            threshold: `${thresholdMs}ms`,
          });
        }
      });

      next();
    };
  }
}
