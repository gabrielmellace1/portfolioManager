import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { RegisterRoutes } from './routes/routes';
import { createDataSource } from './config/database';
import { getAppConfig } from './config/app';
import { Asset } from './entities/Asset';
import { Portfolio } from './entities/Portfolio';
import { AssetRepository } from './repositories/AssetRepository';
import { PortfolioRepository } from './repositories/PortfolioRepository';
import { AssetService } from './services/AssetService';
import { PortfolioService } from './services/PortfolioService';
import { PriceService } from './services/PriceService';
import { WebSocketService } from './services/WebSocketService';
import { PriceUpdateScheduler } from './services/PriceUpdateScheduler';
import { ErrorHandler } from './errors/ErrorHandler';
import { RequestLogger } from './middleware/RequestLogger';
import { RateLimiter } from './middleware/RateLimiter';
import { SecurityMiddleware } from './middleware/Security';
import { CORSConfig } from './middleware/CORS';
import { HealthCheck } from './middleware/HealthCheck';
import { CompressionMiddleware } from './middleware/Compression';
import { ResponseCache, CacheConfigs, CacheInvalidation } from './middleware/ResponseCache';
// import { PerformanceDashboard } from './middleware/PerformanceDashboard';
import { MigrationRunner } from './migrations/MigrationRunner';
import { logger } from './utils/Logger';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { ConnectionPoolFactory } from './utils/ConnectionPool';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get application configuration
const config = getAppConfig();
const app = express();
const server = createServer(app);
const port = config.port;

// Initialize database
const AppDataSource = createDataSource();

// Setup error handlers
ErrorHandler.handleUncaughtException();
ErrorHandler.handleUnhandledRejection();

// Initialize database and start server
AppDataSource.initialize()
  .then(async () => {
    logger.info('Database initialized successfully');
    
    // Database migrations are handled by TypeORM synchronize in development
    logger.info('Database ready for use');
    
    // Initialize repositories
    const assetRepository = new AssetRepository(AppDataSource);
    const portfolioRepository = new PortfolioRepository(AppDataSource);
    
    // Initialize services
    const priceService = new PriceService();
    const assetService = new AssetService(assetRepository, priceService);
    const portfolioService = new PortfolioService(portfolioRepository, assetService);
    
    // Initialize WebSocket service
    const webSocketService = new WebSocketService(server);
    
    // Initialize price update scheduler
    const priceUpdateScheduler = new PriceUpdateScheduler(assetService, webSocketService);
    
    // Make services globally available for controllers
    (global as any).assetService = assetService;
    (global as any).portfolioService = portfolioService;
    (global as any).webSocketService = webSocketService;
    (global as any).priceUpdateScheduler = priceUpdateScheduler;
    
    // Trust proxy if configured
    if (config.security.trustProxy) {
      app.set('trust proxy', true);
    }
    
    // Security middleware
    if (config.security.helmet) {
      app.use(helmet());
    }
    
    // CORS configuration
    app.use(CORSConfig.create());
    
    // Request logging
    app.use(RequestLogger.logRequest);
    app.use(RequestLogger.logSlowRequests(1000)); // Log requests over 1 second
    
    // Security middleware
    app.use(SecurityMiddleware.validateRequestSize(10 * 1024 * 1024)); // 10MB limit
    app.use(SecurityMiddleware.validateContentType(['application/json']));
    app.use(SecurityMiddleware.sanitizeBody);
    app.use(SecurityMiddleware.blockSuspiciousRequests);
    app.use(SecurityMiddleware.addSecurityHeaders);
    app.use(SecurityMiddleware.requestTimeout(30000)); // 30 second timeout
    
    // Rate limiting
    app.use('/api', RateLimiter.createModerate());
    app.use('/api/assets/update-all-prices', RateLimiter.createStrict());
    
    // Compression middleware
    app.use(CompressionMiddleware.create());
    
    // Response caching
    app.use(ResponseCache.cacheStats);
    app.use('/api/portfolios', CacheConfigs.portfolios);
    app.use('/api/portfolios/', CacheConfigs.portfolioById);
    app.use('/api/portfolios/', CacheConfigs.portfolioPerformance);
    app.use('/api/assets', CacheConfigs.assets);
    app.use('/api/assets/', CacheConfigs.assetById);
    app.use('/api/assets/search', CacheConfigs.assetSearch);
    app.use('/api/statistics', CacheConfigs.statistics);
    
    // Cache invalidation for write operations
    app.use('/api/portfolios', CacheInvalidation.portfolioModified);
    app.use('/api/assets', CacheInvalidation.assetModified);
    app.use('/api/assets/prices/update-all', CacheInvalidation.pricesUpdated);
    
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Error handling middleware for JSON parsing
    app.use((error: any, req: any, res: any, next: any) => {
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        logger.error('JSON parsing error', { 
          message: error.message,
          body: req.body,
          headers: req.headers 
        });
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
      next(error);
    });
    
    // Health check endpoints
    HealthCheck.setDataSource(AppDataSource);
    app.get('/health', HealthCheck.basic);
    app.get('/health/detailed', HealthCheck.detailed);
    app.get('/health/ready', HealthCheck.readiness);
    app.get('/health/live', HealthCheck.liveness);
    
    // Performance monitoring endpoints (disabled)
    // app.get('/api/performance/metrics', PerformanceDashboard.getMetrics);
    // app.get('/api/performance/report', PerformanceDashboard.getDetailedReport);
    // app.get('/api/performance/health', PerformanceDashboard.getSystemHealth);
    // app.delete('/api/performance/clear', PerformanceDashboard.clearMetrics);
    
    // Register TSOA routes with /api prefix
    const apiRouter = express.Router();
    RegisterRoutes(apiRouter);
    app.use('/api', apiRouter);
    
    // Global error handler (must be last)
    app.use(ErrorHandler.handle);
    
    // Start HTTP server with WebSocket support
    server.listen(Number(port), '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`, {
        port,
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
      });
      
      // Start the price update scheduler
      priceUpdateScheduler.start();
      logger.info('Price update scheduler started - prices will be updated every 30 seconds');
    });
  })
  .catch((error) => {
    logger.error('Error during Data Source initialization', { error });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
