import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { PortfolioController } from '../../controllers/PortfolioController';
import { PortfolioService } from '../../services/PortfolioService';
import { PortfolioRepository } from '../../repositories/PortfolioRepository';
import { AssetRepository } from '../../repositories/AssetRepository';
import { TestHelpers } from '../utils/testHelpers';

describe('PortfolioController API Tests', () => {
  let app: express.Application;
  let dataSource: DataSource;
  let portfolioController: PortfolioController;

  beforeAll(async () => {
    dataSource = (global as any).testDataSource;
    
    const portfolioRepository = new PortfolioRepository(dataSource);
    const assetRepository = new AssetRepository(dataSource);
    const portfolioService = new PortfolioService(portfolioRepository, assetRepository);
    portfolioController = new PortfolioController(portfolioService);

    app = express();
    app.use(express.json());
    
    // Setup routes
    app.get('/portfolios', (req, res) => portfolioController.getAllPortfolios(req, res));
    app.get('/portfolios/statistics', (req, res) => portfolioController.getPortfolioStatistics(req, res));
    app.get('/portfolios/:id', (req, res) => portfolioController.getPortfolioById(req, res));
    app.get('/portfolios/:id/performance', (req, res) => portfolioController.getPortfolioPerformance(req, res));
    app.post('/portfolios', (req, res) => portfolioController.createPortfolio(req, res));
    app.put('/portfolios/:id', (req, res) => portfolioController.updatePortfolio(req, res));
    app.delete('/portfolios/:id', (req, res) => portfolioController.deletePortfolio(req, res));
  });

  beforeEach(async () => {
    await TestHelpers.cleanupDatabase(dataSource);
  });

  describe('GET /portfolios', () => {
    it('should return all portfolios', async () => {
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 1' });
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 2' });

      const response = await request(app)
        .get('/portfolios')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return portfolios with pagination', async () => {
      // Create 5 test portfolios
      for (let i = 1; i <= 5; i++) {
        await TestHelpers.createTestPortfolio(dataSource, { name: `Portfolio ${i}` });
      }

      const response = await request(app)
        .get('/portfolios?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /portfolios/:id', () => {
    it('should return portfolio by id', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      const response = await request(app)
        .get(`/portfolios/${portfolio.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(portfolio.id);
      expect(response.body.data.name).toBe('Test Portfolio');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(app)
        .get('/portfolios/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /portfolios', () => {
    it('should create portfolio successfully', async () => {
      const portfolioData = {
        name: 'New Portfolio',
        description: 'New Portfolio Description',
      };

      const response = await request(app)
        .post('/portfolios')
        .send(portfolioData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Portfolio');
      expect(response.body.data.description).toBe('New Portfolio Description');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        description: 'Test Description',
      };

      const response = await request(app)
        .post('/portfolios')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for duplicate portfolio name', async () => {
      const portfolioData = {
        name: 'Duplicate Portfolio',
        description: 'Test Description',
      };

      // Create first portfolio
      await request(app)
        .post('/portfolios')
        .send(portfolioData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/portfolios')
        .send(portfolioData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('PUT /portfolios/:id', () => {
    it('should update portfolio successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      const updateData = {
        name: 'Updated Portfolio Name',
        description: 'Updated Description',
      };

      const response = await request(app)
        .put(`/portfolios/${portfolio.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Portfolio Name');
      expect(response.body.data.description).toBe('Updated Description');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const updateData = {
        name: 'Updated Portfolio Name',
      };

      const response = await request(app)
        .put('/portfolios/999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /portfolios/:id', () => {
    it('should delete portfolio successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      const response = await request(app)
        .delete(`/portfolios/${portfolio.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(app)
        .delete('/portfolios/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /portfolios/:id/performance', () => {
    it('should return portfolio performance', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAsset(dataSource, portfolio, {
        ticker: 'AAPL',
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 160.0,
      });

      const response = await request(app)
        .get(`/portfolios/${portfolio.id}/performance`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.portfolio).toBeDefined();
      expect(response.body.data.assets).toHaveLength(1);
      expect(response.body.data.summary).toBeDefined();
    });

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(app)
        .get('/portfolios/999/performance')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /portfolios/statistics', () => {
    it('should return portfolio statistics', async () => {
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 1' });
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 2' });

      const response = await request(app)
        .get('/portfolios/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPortfolios).toBe(2);
      expect(response.body.data.totalAssets).toBe(0);
    });
  });
});
