/**
 * Custom application error class with enhanced error handling
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a validation error
   */
  static validation(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, 400, true, context);
  }

  /**
   * Create a not found error
   */
  static notFound(resource: string, id?: string | number): AppError {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    return new AppError(message, 404, true);
  }

  /**
   * Create a conflict error
   */
  static conflict(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, 409, true, context);
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, true);
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, true);
  }

  /**
   * Create a bad request error
   */
  static badRequest(message: string, context?: Record<string, any>): AppError {
    return new AppError(message, 400, true, context);
  }

  /**
   * Create an internal server error
   */
  static internal(message: string = 'Internal server error', context?: Record<string, any>): AppError {
    return new AppError(message, 500, false, context);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}
