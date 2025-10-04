import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

/**
 * Compression middleware configuration
 */
export class CompressionMiddleware {
  /**
   * Create compression middleware with optimized settings
   */
  public static create(): any {
    return compression({
      // Compression level (1-9, 6 is default)
      level: 6,
      
      // Threshold for compression (bytes)
      threshold: 1024,
      
      // Filter function to determine if response should be compressed
      filter: (req: Request, res: Response) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
          return false;
        }
        
        // Use compression filter
        return compression.filter(req, res);
      },
      
      // Compression options
      chunkSize: 16 * 1024, // 16KB chunks
      
      // Memory level (1-9, 8 is default)
      memLevel: 8,
      
      // Strategy for compression
      strategy: 0, // Z_DEFAULT_STRATEGY
      
      // Window bits
      windowBits: 15,
      
      // Custom headers
      setHeaders: (res: Response, path: string, stat: any) => {
        // Add cache headers for compressed content
        if (path.endsWith('.js') || path.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
      },
    });
  }

  /**
   * Create compression middleware with custom settings
   */
  public static createCustom(options: {
    level?: number;
    threshold?: number;
    chunkSize?: number;
    memLevel?: number;
    strategy?: number;
    windowBits?: number;
  } = {}): any {
    const defaultOptions = {
      level: 6,
      threshold: 1024,
      chunkSize: 16 * 1024,
      memLevel: 8,
      strategy: 0, // Z_DEFAULT_STRATEGY
      windowBits: 15,
    };

    const finalOptions = { ...defaultOptions, ...options };

    return compression({
      ...finalOptions,
      filter: (req: Request, res: Response) => {
        // Log compression ratio
        const originalSize = res.get('Content-Length');
        if (originalSize) {
          Logger.debug('Compression applied', {
            originalSize: parseInt(originalSize),
            path: req.path,
            method: req.method,
          });
        }
        
        return compression.filter(req, res);
      },
    });
  }

  /**
   * Create compression middleware for API responses
   */
  public static createForAPI(): any {
    return compression({
      level: 6,
      threshold: 512, // Lower threshold for API responses
      filter: (req: Request, res: Response) => {
        // Only compress JSON responses
        const contentType = res.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          return compression.filter(req, res);
        }
        return false;
      },
    });
  }

  /**
   * Create compression middleware for static assets
   */
  public static createForStatic(): any {
    return compression({
      level: 9, // Maximum compression for static assets
      threshold: 1024,
      filter: (req: Request, res: Response) => {
        // Compress static assets
        const path = req.path;
        if (path.match(/\.(js|css|html|svg|xml|txt)$/)) {
          return compression.filter(req, res);
        }
        return false;
      },
      setHeaders: (res: Response, path: string, stat: any) => {
        // Set appropriate cache headers
        if (path.match(/\.(js|css)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        } else if (path.match(/\.(html)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
      },
    });
  }
}

/**
 * Compression statistics middleware
 */
export const CompressionStats = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalWrite = res.write;
  const originalEnd = res.end;
  
  let bytesWritten = 0;
  
  res.write = function(chunk: any, encoding?: any) {
    if (chunk) {
      bytesWritten += chunk.length;
    }
    return originalWrite.call(this, chunk, encoding);
  };
  
  res.end = function(chunk?: any, encoding?: any) {
    if (chunk) {
      bytesWritten += chunk.length;
    }
    
    const duration = Date.now() - startTime;
    const compressionRatio = res.get('Content-Length') 
      ? (1 - bytesWritten / parseInt(res.get('Content-Length')!)) * 100 
      : 0;
    
    Logger.logPerformance({
      operation: 'compression',
      duration,
      bytesWritten,
      compressionRatio: Math.round(compressionRatio),
      path: req.path,
      method: req.method,
    });
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};
