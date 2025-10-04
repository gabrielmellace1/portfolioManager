import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { AppError } from '../errors/AppError';

/**
 * Validation middleware factory
 */
export class ValidationMiddleware {
  /**
   * Create validation middleware for request body
   */
  static validateBody<T extends object>(dtoClass: ClassConstructor<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = plainToClass(dtoClass, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
          const validationErrors = this.formatValidationErrors(errors);
          throw AppError.validation('Validation failed', { errors: validationErrors });
        }

        req.body = dto;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Create validation middleware for query parameters
   */
  static validateQuery<T extends object>(dtoClass: ClassConstructor<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = plainToClass(dtoClass, req.query);
        const errors = await validate(dto);

        if (errors.length > 0) {
          const validationErrors = this.formatValidationErrors(errors);
          throw AppError.validation('Query validation failed', { errors: validationErrors });
        }

        req.query = dto as any;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Create validation middleware for path parameters
   */
  static validateParams<T extends object>(dtoClass: ClassConstructor<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = plainToClass(dtoClass, req.params);
        const errors = await validate(dto);

        if (errors.length > 0) {
          const validationErrors = this.formatValidationErrors(errors);
          throw AppError.validation('Path parameter validation failed', { errors: validationErrors });
        }

        req.params = dto as any;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Format validation errors for API response
   */
  private static formatValidationErrors(errors: ValidationError[]): any[] {
    return errors.map(error => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children && error.children.length > 0 ? this.formatValidationErrors(error.children) : undefined,
    }));
  }

  /**
   * Validate ID parameter
   */
  static validateId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      throw AppError.badRequest('Invalid ID parameter');
    }
    
    next();
  };

  /**
   * Validate pagination parameters
   */
  static validatePagination = (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;
    
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      throw AppError.badRequest('Page must be a positive integer');
    }
    
    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
      throw AppError.badRequest('Limit must be between 1 and 100');
    }
    
    next();
  };
}
