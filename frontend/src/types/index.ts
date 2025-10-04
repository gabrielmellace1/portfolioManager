export enum AssetType {
  STOCK = 'stock',
  OPTION = 'option',
  BOND = 'bond',
  CRYPTO = 'crypto',
  CASH = 'cash'
}

export interface Asset {
  id: number;
  type: AssetType;
  ticker: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  name?: string;
  description?: string;
  strikePrice?: number;
  expirationDate?: string;
  optionType?: 'call' | 'put';
  couponRate?: number;
  maturityDate?: string;
  faceValue?: number;
  symbol?: string;
  portfolioId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  assets?: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioPerformance {
  totalValue: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercentage: number;
  assetsByType: Record<string, Asset[]>;
}

export interface AssetPerformance {
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
}

export interface CreateAssetRequest {
  type: AssetType;
  ticker: string;
  quantity: number;
  purchasePrice: number;
  portfolioId: number;
  name?: string;
  description?: string;
  strikePrice?: number;
  expirationDate?: string;
  optionType?: 'call' | 'put';
  couponRate?: number;
  maturityDate?: string;
  faceValue?: number;
  symbol?: string;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
}
