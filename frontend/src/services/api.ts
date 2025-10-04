import axios from 'axios';
import { Asset, Portfolio, CreateAssetRequest, CreatePortfolioRequest, AssetPerformance, PortfolioPerformance } from '../types';

const API_BASE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Portfolio API
export const portfolioApi = {
  getAll: async (): Promise<Portfolio[]> => {
    const response = await api.get('/portfolios');
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<Portfolio> => {
    const response = await api.get(`/portfolios/${id}`);
    return response.data;
  },

  create: async (data: CreatePortfolioRequest): Promise<Portfolio> => {
    const response = await api.post('/portfolios', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Portfolio>): Promise<Portfolio> => {
    const response = await api.put(`/portfolios/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/portfolios/${id}`);
  },

  getPerformance: async (id: number): Promise<PortfolioPerformance> => {
    const response = await api.get(`/portfolios/${id}/performance`);
    return response.data;
  },

  getSummary: async (id: number): Promise<{
    portfolio: Portfolio;
    performance: PortfolioPerformance;
    assetCount: number;
    totalCost: number;
  }> => {
    const response = await api.get(`/portfolios/${id}/summary`);
    return response.data;
  },

  addAsset: async (portfolioId: number, assetData: CreateAssetRequest): Promise<Portfolio> => {
    const response = await api.post(`/portfolios/${portfolioId}/assets`, assetData);
    return response.data;
  },

  removeAsset: async (portfolioId: number, assetId: number): Promise<Portfolio> => {
    const response = await api.delete(`/portfolios/${portfolioId}/assets/${assetId}`);
    return response.data;
  },
};

// Asset API
export const assetApi = {
  getAll: async (): Promise<Asset[]> => {
    const response = await api.get('/assets');
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<Asset> => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  getByPortfolioId: async (portfolioId: number): Promise<Asset[]> => {
    const response = await api.get(`/assets/portfolio/${portfolioId}`);
    return response.data;
  },

  getByType: async (type: string): Promise<Asset[]> => {
    const response = await api.get(`/assets/type/${type}`);
    return response.data;
  },

  create: async (data: CreateAssetRequest): Promise<Asset> => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Asset>): Promise<Asset> => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  updatePrice: async (id: number): Promise<Asset> => {
    const response = await api.post(`/assets/${id}/update-price`);
    return response.data;
  },

  updateAllPrices: async (): Promise<void> => {
    await api.post('/assets/update-all-prices');
  },

  getPerformance: async (id: number): Promise<AssetPerformance> => {
    const response = await api.get(`/assets/${id}/performance`);
    return response.data;
  },
};

export default api;
