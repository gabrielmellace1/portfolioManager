import { Response } from 'express';
import { ResponseHelper } from '../../utils/ResponseHelper';

describe('ResponseHelper', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('success', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      ResponseHelper.success(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Success',
        timestamp: expect.any(String),
      });
    });

    it('should send success response with custom message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Custom success message';
      ResponseHelper.success(mockResponse as Response, data, message);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
        timestamp: expect.any(String),
      });
    });
  });

  describe('created', () => {
    it('should send created response', () => {
      const data = { id: 1, name: 'New Item' };
      ResponseHelper.created(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Created successfully',
        timestamp: expect.any(String),
      });
    });
  });

  describe('error', () => {
    it('should send error response with default status', () => {
      const message = 'Something went wrong';
      ResponseHelper.error(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: message,
        timestamp: expect.any(String),
      });
    });

    it('should send error response with custom status', () => {
      const message = 'Not found';
      const statusCode = 404;
      ResponseHelper.error(mockResponse as Response, message, statusCode);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: message,
        timestamp: expect.any(String),
      });
    });
  });

  describe('validationError', () => {
    it('should send validation error response', () => {
      const errors = ['Name is required', 'Email is invalid'];
      ResponseHelper.validationError(mockResponse as Response, errors);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: errors,
        timestamp: expect.any(String),
      });
    });
  });

  describe('notFound', () => {
    it('should send not found response', () => {
      const resource = 'User';
      ResponseHelper.notFound(mockResponse as Response, resource);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: `${resource} not found`,
        timestamp: expect.any(String),
      });
    });
  });

  describe('unauthorized', () => {
    it('should send unauthorized response', () => {
      const message = 'Access denied';
      ResponseHelper.unauthorized(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: message,
        timestamp: expect.any(String),
      });
    });
  });

  describe('forbidden', () => {
    it('should send forbidden response', () => {
      const message = 'Insufficient permissions';
      ResponseHelper.forbidden(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: message,
        timestamp: expect.any(String),
      });
    });
  });

  describe('pagination', () => {
    it('should send paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      };
      
      ResponseHelper.pagination(mockResponse as Response, data, pagination);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination,
        message: 'Success',
        timestamp: expect.any(String),
      });
    });
  });
});
