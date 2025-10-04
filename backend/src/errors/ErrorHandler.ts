import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { getAppConfig } from '../config/app';

/**
 * Centralized error handling middleware
 */
export class ErrorHandler {
  /**
   * Handle operational errors (AppError instances)
   */
  private static handleOperationalError(error: AppError, req: Request, res: Response): void {
    const { statusCode, message, context } = error;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        timestamp: error.timestamp,
        path: req.path,
        method: req.method,
        ...(context && { context }),
      },
    });
  }

  /**
   * Handle programming errors (unexpected errors)
   */
  private static handleProgrammingError(error: Error, req: Request, res: Response): void {
    const config = getAppConfig();
    
    res.status(500).json({
      success: false,
      error: {
        message: config.nodeEnv === 'production' 
          ? 'Something went wrong' 
          : error.message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        ...(config.nodeEnv !== 'production' && { stack: error.stack }),
      },
    });
  }

  /**
   * Handle validation errors
   */
  private static handleValidationError(error: any, req: Request, res: Response): void {
    const errors = error.errors?.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    })) || [];

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        validationErrors: errors,
      },
    });
  }

  /**
   * Handle database errors
   */
  private static handleDatabaseError(error: any, req: Request, res: Response): void {
    const config = getAppConfig();
    
    let message = 'Database operation failed';
    let statusCode = 500;

    // Handle specific database errors
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      message = 'Resource already exists';
      statusCode = 409;
    } else if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      message = 'Referenced resource does not exist';
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        ...(config.nodeEnv !== 'production' && { 
          originalError: error.message,
          code: error.code 
        }),
      },
    });
  }

  /**
   * Main error handling middleware
   */
  static handle(error: any, req: Request, res: Response, next: NextFunction): void {
    // Log the error
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    // Handle different types of errors
    if (error instanceof AppError) {
      return ErrorHandler.handleOperationalError(error, req, res);
    }

    // Handle validation errors (e.g., from class-validator)
    if (error.name === 'ValidationError' || error.errors) {
      return ErrorHandler.handleValidationError(error, req, res);
    }

    // Handle database errors
    if (error.code && error.code.startsWith('SQLITE_')) {
      return ErrorHandler.handleDatabaseError(error, req, res);
    }

    // Handle unexpected errors
    return ErrorHandler.handleProgrammingError(error, req, res);
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(): void {
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(): void {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}
