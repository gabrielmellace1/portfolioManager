import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { AssetController } from '../../controllers/AssetController';
import { AssetService } from '../../services/AssetService';
import { AssetRepository } from '../../repositories/AssetRepository';
import { PortfolioRepository } from '../../repositories/PortfolioRepository';
import { TestHelpers } from '../utils/testHelpers';

describe('AssetController API Tests', () => {
  let app: express.Application;
  let dataSource: DataSource;
  let assetController: AssetController;

  beforeAll(async () => {
    dataSource = (global as any).testDataSource;
    
    const assetRepository = new AssetRepository(dataSource);
    const portfolioRepository = new PortfolioRepository(dataSource);
    const assetService = new AssetService(assetRepository, portfolioRepository);
    assetController = new AssetController(assetService);

    app = express();
    app.use(express.json());
    
    // Setup routes
    app.get('/assets', (req, res) => assetController.getAllAssets(req, res));
    app.get('/assets/search', (req, res) => assetController.searchAssets(req, res));
    app.get('/assets/performance', (req, res) => assetController.getPerformanceMetrics(req, res));
    app.get('/assets/statistics', (req, res) => assetController.getAssetStatistics(req, res));
    app.get('/assets/:id', (req, res) => assetController.getAssetById(req, res));
    app.post('/assets', (req, res) => assetController.createAsset(req, res));
    app.put('/assets/:id', (req, res) => assetController.updateAsset(req, res));
    app.delete('/assets/:id', (req, res) => assetController.deleteAsset(req, res));
    app.put('/assets/:id/price', (req, res) => assetController.updateAssetPrice(req, res));
    app.put('/assets/prices/update-all', (req, res) => assetController.updateAllAssetPrices(req, res));
  });

  beforeEach(async () => {
    await TestHelpers.cleanupDatabase(dataSource);
  });

  describe('GET /assets', () => {
    it('should return all assets', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAssets(dataSource, portfolio, 2);

      const response = await request(app)
        .get('/assets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return assets with pagination', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAssets(dataSource, portfolio, 5);

      const response = await request(app)
        .get('/assets?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /assets/:id', () => {
    it('should return asset by id', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      const asset = await TestHelpers.createTestAsset(dataSource, portfolio);

      const response = await request(app)
        .get(`/assets/${asset.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(asset.id);
      expect(response.body.data.ticker).toBe('TEST');
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .get('/assets/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /assets', () => {
    it('should create asset successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      const assetData = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: 'STOCK',
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 150.0,
        purchaseDate: '2023-01-01',
        portfolioId: portfolio.id,
      };

      const response = await request(app)
        .post('/assets')
        .send(assetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticker).toBe('AAPL');
      expect(response.body.data.name).toBe('Apple Inc.');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        ticker: '', // Invalid: empty ticker
        name: 'Test Asset',
        type: 'STOCK',
        quantity: -10, // Invalid: negative quantity
        purchasePrice: 150.0,
        currentPrice: 150.0,
        purchaseDate: '2023-01-01',
        portfolioId: 1,
      };

      const response = await request(app)
        .post('/assets')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /assets/:id', () => {
    it('should update asset successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      const asset = await TestHelpers.createTestAsset(dataSource, portfolio);

      const updateData = {
        name: 'Updated Asset Name',
        quantity: 200,
        currentPrice: 200.0,
      };

      const response = await request(app)
        .put(`/assets/${asset.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Asset Name');
      expect(response.body.data.quantity).toBe(200);
    });

    it('should return 404 for non-existent asset', async () => {
      const updateData = {
        name: 'Updated Asset Name',
      };

      const response = await request(app)
        .put('/assets/999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /assets/:id', () => {
    it('should delete asset successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      const asset = await TestHelpers.createTestAsset(dataSource, portfolio);

      const response = await request(app)
        .delete(`/assets/${asset.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .delete('/assets/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /assets/search', () => {
    it('should search assets by ticker', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAsset(dataSource, portfolio, { ticker: 'AAPL' });
      await TestHelpers.createTestAsset(dataSource, portfolio, { ticker: 'GOOGL' });

      const response = await request(app)
        .get('/assets/search?query=AAPL&fields=ticker')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].ticker).toBe('AAPL');
    });
  });

  describe('GET /assets/performance', () => {
    it('should return performance metrics', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAsset(dataSource, portfolio, {
        ticker: 'AAPL',
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 160.0,
      });

      const response = await request(app)
        .get('/assets/performance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalAssets).toBe(1);
    });
  });
});
