import { getAppConfig } from '../config/app';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Structured logger with different output formats
 */
export class Logger {
  private static instance: Logger;
  private config: any;

  private constructor() {
    try {
      this.config = getAppConfig();
    } catch (error) {
      // Fallback configuration if app config fails
      this.config = {
        logging: {
          level: process.env.LOG_LEVEL || 'info',
          format: process.env.LOG_FORMAT || 'json'
        }
      };
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
  }

  /**
   * Format log entry based on configuration
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.logging.format === 'json') {
      return JSON.stringify(entry);
    }

    // Simple format
    const { level, message, timestamp, context, error } = entry;
    let logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      logLine += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      logLine += ` | Error: ${error.name}: ${error.message}`;
    }
    
    return logLine;
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.config.logging.level as LogLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, error);
    const formattedLog = this.formatLogEntry(entry);
    
    // Use appropriate console method
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
    }
  }

  /**
   * Log error level message
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log info level message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: any, res: any, responseTime?: number): void {
    const context = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    const level = res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `${req.method} ${req.url}`, context);
  }

  /**
   * Log performance metrics
   */
  logPerformance(metrics: any): void {
    this.info('Performance metrics', metrics);
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table: string, duration?: number, error?: Error): void {
    const context = {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
    };

    if (error) {
      this.error(`Database operation failed: ${operation} on ${table}`, context, error);
    } else {
      this.info(`Database operation: ${operation} on ${table}`, context);
    }
  }

  /**
   * Static debug method
   */
  static debug(message: string, context?: any): void {
    Logger.getInstance().debug(message, context);
  }

  /**
   * Static info method
   */
  static info(message: string, context?: any): void {
    Logger.getInstance().info(message, context);
  }

  /**
   * Static error method
   */
  static error(message: string, context?: any, error?: Error): void {
    Logger.getInstance().error(message, context, error);
  }

  /**
   * Static logPerformance method
   */
  static logPerformance(metrics: any): void {
    Logger.getInstance().logPerformance(metrics);
  }

  /**
   * Log service operation
   */
  logService(service: string, method: string, duration?: number, error?: Error): void {
    const context = {
      service,
      method,
      duration: duration ? `${duration}ms` : undefined,
    };

    if (error) {
      this.error(`Service operation failed: ${service}.${method}`, context, error);
    } else {
      this.info(`Service operation: ${service}.${method}`, context);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
