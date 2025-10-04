import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/Logger';

/**
 * Security middleware collection
 */
export class SecurityMiddleware {
  /**
   * Validate request size
   */
  static validateRequestSize(maxSize: number = 10 * 1024 * 1024) { // 10MB default
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = parseInt(req.get('Content-Length') || '0');
      
      if (contentLength > maxSize) {
        logger.warn('Request too large', {
          contentLength,
          maxSize,
          url: req.url,
          method: req.method,
        });
        
        throw AppError.badRequest(`Request too large. Maximum size: ${maxSize} bytes`);
      }
      
      next();
    };
  }

  /**
   * Validate content type for specific endpoints
   */
  static validateContentType(allowedTypes: string[] = ['application/json']) {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Skip validation for GET requests
      if (req.method === 'GET') {
        return next();
      }

      // Skip validation for endpoints that don't require request bodies
      const noBodyEndpoints = [
        '/update-price',
        '/update-all-prices'
      ];
      
      const hasNoBodyEndpoint = noBodyEndpoints.some(endpoint => 
        req.url.includes(endpoint)
      );
      
      if (hasNoBodyEndpoint) {
        return next();
      }

      const contentType = req.get('Content-Type');
      
      if (!contentType) {
        throw AppError.badRequest('Content-Type header is required');
      }

      const isValidType = allowedTypes.some(type => 
        contentType.toLowerCase().includes(type.toLowerCase())
      );

      if (!isValidType) {
        logger.warn('Invalid content type', {
          contentType,
          allowedTypes,
          url: req.url,
          method: req.method,
        });
        
        throw AppError.badRequest(`Invalid content type. Allowed: ${allowedTypes.join(', ')}`);
      }

      next();
    };
  }

  /**
   * Sanitize request body
   */
  static sanitizeBody(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
    next();
  }

  /**
   * Recursively sanitize object properties
   */
  private static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = key.trim();
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate required headers
   */
  static validateHeaders(requiredHeaders: string[] = []) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const missingHeaders = requiredHeaders.filter(header => 
        !req.get(header)
      );

      if (missingHeaders.length > 0) {
        logger.warn('Missing required headers', {
          missingHeaders,
          url: req.url,
          method: req.method,
        });
        
        throw AppError.badRequest(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      next();
    };
  }

  /**
   * Block suspicious requests
   */
  static blockSuspiciousRequests(req: Request, res: Response, next: NextFunction): void {
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /<script/i, // XSS attempts
      /union\s+select/i, // SQL injection
      /drop\s+table/i, // SQL injection
      /javascript:/i, // XSS attempts
      /on\w+\s*=/i, // Event handler injection
    ];

    const userAgent = req.get('User-Agent') || '';
    const url = req.url;
    const body = JSON.stringify(req.body || {});

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
        logger.warn('Suspicious request blocked', {
          pattern: pattern.toString(),
          url,
          userAgent,
          ip: req.ip,
          method: req.method,
        });
        
        throw AppError.badRequest('Suspicious request detected');
      }
    }

    next();
  }

  /**
   * Add security headers
   */
  static addSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Prevent clickjacking
    res.set('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.set('X-XSS-Protection', '1; mode=block');
    
    // Strict Transport Security (HTTPS only)
    if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy
    res.set('Content-Security-Policy', "default-src 'self'");
    
    // Referrer Policy
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  }

  /**
   * Validate API version
   */
  static validateApiVersion(requiredVersion: string = 'v1') {
    return (req: Request, res: Response, next: NextFunction): void => {
      const apiVersion = req.get('API-Version') || req.get('X-API-Version');
      
      if (apiVersion && apiVersion !== requiredVersion) {
        logger.warn('Invalid API version', {
          provided: apiVersion,
          required: requiredVersion,
          url: req.url,
        });
        
        throw AppError.badRequest(`Invalid API version. Required: ${requiredVersion}`);
      }

      next();
    };
  }

  /**
   * Request timeout middleware
   */
  static requestTimeout(timeoutMs: number = 30000) { // 30 seconds default
    return (req: Request, res: Response, next: NextFunction): void => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          logger.warn('Request timeout', {
            url: req.url,
            method: req.method,
            timeout: timeoutMs,
          });
          
          res.status(408).json({
            success: false,
            error: {
              message: 'Request timeout',
              statusCode: 408,
            },
          });
        }
      }, timeoutMs);

      // Clear timeout when response is sent
      res.on('finish', () => clearTimeout(timeout));
      res.on('close', () => clearTimeout(timeout));

      next();
    };
  }
}
