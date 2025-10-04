import { Logger } from '../../utils/Logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('log', () => {
    it('should log info messages', () => {
      Logger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.stringContaining('Test info message')
      );
    });

    it('should log error messages', () => {
      Logger.error('Test error message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining('Test error message')
      );
    });

    it('should log warning messages', () => {
      Logger.warn('Test warning message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.stringContaining('Test warning message')
      );
    });

    it('should log debug messages', () => {
      Logger.debug('Test debug message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        expect.stringContaining('Test debug message')
      );
    });
  });

  describe('logWithContext', () => {
    it('should log with context information', () => {
      const context = { userId: 123, action: 'test' };
      Logger.logWithContext('info', 'Test message', context);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.stringContaining('Test message'),
        expect.objectContaining(context)
      );
    });
  });

  describe('logError', () => {
    it('should log error with stack trace', () => {
      const error = new Error('Test error');
      Logger.logError(error, 'Test context');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining('Test context'),
        expect.stringContaining('Test error'),
        expect.stringContaining('Error: Test error')
      );
    });
  });

  describe('logPerformance', () => {
    it('should log performance metrics', () => {
      const metrics = {
        operation: 'test-operation',
        duration: 150,
        memoryUsage: 1024,
      };
      
      Logger.logPerformance(metrics);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PERFORMANCE]'),
        expect.stringContaining('test-operation'),
        expect.stringContaining('150ms'),
        expect.stringContaining('1024MB')
      );
    });
  });
});
