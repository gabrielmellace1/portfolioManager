import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Portfolio, Asset, CreatePortfolioRequest, CreateAssetRequest } from '../types';
import { portfolioApi, assetApi } from '../services/api';

interface PortfolioContextType {
  portfolios: Portfolio[];
  assets: Asset[];
  loading: boolean;
  error: string | null;
  createPortfolio: (data: CreatePortfolioRequest) => Promise<Portfolio>;
  updatePortfolio: (id: number, data: Partial<Portfolio>) => Promise<Portfolio>;
  deletePortfolio: (id: number) => Promise<void>;
  createAsset: (data: CreateAssetRequest) => Promise<Asset>;
  updateAsset: (id: number, data: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (id: number) => Promise<void>;
  updateAssetPrice: (id: number) => Promise<Asset>;
  updateAllPrices: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [portfoliosData, assetsData] = await Promise.all([
        portfolioApi.getAll(),
        assetApi.getAll()
      ]);
      
      setPortfolios(portfoliosData);
      setAssets(assetsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createPortfolio = async (data: CreatePortfolioRequest): Promise<Portfolio> => {
    try {
      const newPortfolio = await portfolioApi.create(data);
      setPortfolios(prev => [...prev, newPortfolio]);
      return newPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
      throw err;
    }
  };

  const updatePortfolio = async (id: number, data: Partial<Portfolio>): Promise<Portfolio> => {
    try {
      const updatedPortfolio = await portfolioApi.update(id, data);
      setPortfolios(prev => prev.map(p => p.id === id ? updatedPortfolio : p));
      return updatedPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio');
      throw err;
    }
  };

  const deletePortfolio = async (id: number): Promise<void> => {
    try {
      await portfolioApi.delete(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setAssets(prev => prev.filter(a => a.portfolioId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio');
      throw err;
    }
  };

  const createAsset = async (data: CreateAssetRequest): Promise<Asset> => {
    try {
      const newAsset = await assetApi.create(data);
      setAssets(prev => [...prev, newAsset]);
      
      // Update the portfolio with the new asset
      const portfolio = portfolios.find(p => p.id === data.portfolioId);
      if (portfolio) {
        setPortfolios(prev => prev.map(p => 
          p.id === data.portfolioId 
            ? { ...p, assets: [...(p.assets || []), newAsset] }
            : p
        ));
      }
      
      return newAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
      throw err;
    }
  };

  const updateAsset = async (id: number, data: Partial<Asset>): Promise<Asset> => {
    try {
      const updatedAsset = await assetApi.update(id, data);
      setAssets(prev => prev.map(a => a.id === id ? updatedAsset : a));
      
      // Update the asset in the portfolio
      setPortfolios(prev => prev.map(p => ({
        ...p,
        assets: p.assets?.map(a => a.id === id ? updatedAsset : a) || []
      })));
      
      return updatedAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
      throw err;
    }
  };

  const deleteAsset = async (id: number): Promise<void> => {
    try {
      await assetApi.delete(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      
      // Remove the asset from the portfolio
      setPortfolios(prev => prev.map(p => ({
        ...p,
        assets: p.assets?.filter(a => a.id !== id) || []
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      throw err;
    }
  };

  const updateAssetPrice = async (id: number): Promise<Asset> => {
    try {
      const updatedAsset = await assetApi.updatePrice(id);
      setAssets(prev => prev.map(a => a.id === id ? updatedAsset : a));
      
      // Update the asset in the portfolio
      setPortfolios(prev => prev.map(p => ({
        ...p,
        assets: p.assets?.map(a => a.id === id ? updatedAsset : a) || []
      })));
      
      return updatedAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset price');
      throw err;
    }
  };

  const updateAllPrices = async (): Promise<void> => {
    try {
      await assetApi.updateAllPrices();
      await fetchData(); // Refresh all data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prices');
      throw err;
    }
  };

  const refreshData = async (): Promise<void> => {
    await fetchData();
  };

  const value: PortfolioContextType = {
    portfolios,
    assets,
    loading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetPrice,
    updateAllPrices,
    refreshData,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
