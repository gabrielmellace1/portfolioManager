import { logger } from './Logger';

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static metrics: Map<string, any> = new Map();

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  /**
   * End timing an operation and log the duration
   */
  static endTimer(operation: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`Timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    logger.info(`Operation completed: ${operation}`, {
      ...context,
      duration: `${duration}ms`,
    });

    return duration;
  }

  /**
   * Measure async operation execution time
   */
  static async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    this.startTimer(operation);
    
    try {
      const result = await fn();
      this.endTimer(operation, context);
      return result;
    } catch (error) {
      this.endTimer(operation, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Measure sync operation execution time
   */
  static measureSync<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    this.startTimer(operation);
    
    try {
      const result = fn();
      this.endTimer(operation, context);
      return result;
    } catch (error) {
      this.endTimer(operation, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Get current timer value without ending it
   */
  static getTimerValue(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      return 0;
    }
    return Date.now() - startTime;
  }

  /**
   * Clear all timers
   */
  static clearAllTimers(): void {
    this.timers.clear();
  }

  /**
   * Get all performance metrics
   */
  static getMetrics(): any[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all performance metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
  }
}
