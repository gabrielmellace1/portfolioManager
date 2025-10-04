import { PerformanceMonitor } from '../../utils/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('measure', () => {
    it('should measure synchronous function execution time', () => {
      const mockFn = jest.fn(() => 'result');
      const result = PerformanceMonitor.measure('test-operation', mockFn);
      
      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function with error', () => {
      const mockFn = jest.fn(() => {
        throw new Error('Test error');
      });
      
      expect(() => PerformanceMonitor.measure('test-operation', mockFn)).toThrow('Test error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('measureAsync', () => {
    it('should measure asynchronous function execution time', async () => {
      const mockFn = jest.fn().mockResolvedValue('async result');
      const result = await PerformanceMonitor.measureAsync('test-async-operation', mockFn);
      
      expect(result).toBe('async result');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should measure asynchronous function with error', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Async test error'));
      
      await expect(PerformanceMonitor.measureAsync('test-async-operation', mockFn))
        .rejects.toThrow('Async test error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('startTimer', () => {
    it('should start and end timer correctly', () => {
      const timer = PerformanceMonitor.startTimer('manual-timer');
      
      expect(timer).toBeDefined();
      expect(timer.end).toBeDefined();
      expect(typeof timer.end).toBe('function');
    });

    it('should measure time with manual timer', () => {
      const timer = PerformanceMonitor.startTimer('manual-timer');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait
      }
      
      const result = timer.end();
      
      expect(result.duration).toBeGreaterThan(0);
      expect(result.operation).toBe('manual-timer');
    });
  });

  describe('getMetrics', () => {
    it('should return performance metrics', () => {
      const metrics = PerformanceMonitor.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all performance metrics', () => {
      PerformanceMonitor.clearMetrics();
      const metrics = PerformanceMonitor.getMetrics();
      
      expect(metrics).toHaveLength(0);
    });
  });
});
