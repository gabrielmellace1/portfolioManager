import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { AssetType } from '../types';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { PieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Analytics: React.FC = () => {
  const { portfolios, assets, updateAllPrices } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      await updateAllPrices();
    } catch (err) {
      console.error('Failed to refresh prices:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getAssetTypeColor = (type: AssetType) => {
    switch (type) {
      case AssetType.STOCK:
        return '#3b82f6';
      case AssetType.OPTION:
        return '#8b5cf6';
      case AssetType.BOND:
        return '#10b981';
      case AssetType.CRYPTO:
        return '#f59e0b';
      case AssetType.CASH:
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getAssetTypeData = () => {
    const typeData = assets.reduce((acc, asset) => {
      const currentPrice = asset.currentPrice || asset.purchasePrice;
      const value = asset.quantity * currentPrice;
      
      if (!acc[asset.type]) {
        acc[asset.type] = { type: asset.type, value: 0, count: 0 };
      }
      acc[asset.type].value += value;
      acc[asset.type].count += 1;
      return acc;
    }, {} as Record<string, { type: string; value: number; count: number }>);

    return Object.values(typeData).map(item => ({
      name: item.type,
      value: item.value,
      count: item.count,
      color: getAssetTypeColor(item.type as AssetType)
    }));
  };

  const getPortfolioData = () => {
    return portfolios.map(portfolio => {
      const portfolioAssets = assets.filter(a => a.portfolioId === portfolio.id);
      const totalValue = portfolioAssets.reduce((sum, asset) => {
        const currentPrice = asset.currentPrice || asset.purchasePrice;
        return sum + (asset.quantity * currentPrice);
      }, 0);
      const totalCost = portfolioAssets.reduce((sum, asset) => {
        return sum + (asset.quantity * asset.purchasePrice);
      }, 0);
      const pnl = totalValue - totalCost;
      const pnlPercentage = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

      return {
        name: portfolio.name,
        value: totalValue,
        cost: totalCost,
        pnl: pnl,
        pnlPercentage: pnlPercentage,
        assetCount: portfolioAssets.length
      };
    });
  };

  const getTopPerformers = () => {
    return assets
      .map(asset => {
        const currentPrice = asset.currentPrice || asset.purchasePrice;
        const pnl = (currentPrice - asset.purchasePrice) * asset.quantity;
        const pnlPercentage = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
        return {
          ...asset,
          pnl,
          pnlPercentage
        };
      })
      .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
      .slice(0, 5);
  };

  const getWorstPerformers = () => {
    return assets
      .map(asset => {
        const currentPrice = asset.currentPrice || asset.purchasePrice;
        const pnl = (currentPrice - asset.purchasePrice) * asset.quantity;
        const pnlPercentage = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
        return {
          ...asset,
          pnl,
          pnlPercentage
        };
      })
      .sort((a, b) => a.pnlPercentage - b.pnlPercentage)
      .slice(0, 5);
  };

  const getTotalValue = () => {
    return assets.reduce((sum, asset) => {
      const currentPrice = asset.currentPrice || asset.purchasePrice;
      return sum + (asset.quantity * currentPrice);
    }, 0);
  };

  const getTotalCost = () => {
    return assets.reduce((sum, asset) => {
      return sum + (asset.quantity * asset.purchasePrice);
    }, 0);
  };

  const getTotalPnL = () => {
    return getTotalValue() - getTotalCost();
  };

  const getTotalPnLPercentage = () => {
    const totalCost = getTotalCost();
    if (totalCost === 0) return 0;
    return (getTotalPnL() / totalCost) * 100;
  };

  const assetTypeData = getAssetTypeData();
  const portfolioData = getPortfolioData();
  const topPerformers = getTopPerformers();
  const worstPerformers = getWorstPerformers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detailed analysis of your investment portfolio
          </p>
        </div>
        <button
          onClick={handleRefreshPrices}
          disabled={refreshing}
          className="btn btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Prices
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${getTotalValue().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total P&L</p>
              <p className={`text-2xl font-semibold ${
                getTotalPnL() >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                ${getTotalPnL().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">P&L %</p>
              <p className={`text-2xl font-semibold ${
                getTotalPnLPercentage() >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {getTotalPnLPercentage().toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assets.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                  data={assetTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Performance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'value' ? `$${Number(value).toLocaleString()}` : `${Number(value).toFixed(2)}%`,
                  name === 'value' ? 'Value' : 'P&L %'
                ]} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Value" />
                <Bar dataKey="pnlPercentage" fill="#10b981" name="P&L %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top and Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((asset, index) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-success-600">#{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {asset.name || asset.ticker}
                    </div>
                    <div className="text-sm text-gray-500">{asset.ticker}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-success-600">
                    +{asset.pnlPercentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    ${asset.pnl.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performers */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Worst Performers</h3>
          <div className="space-y-3">
            {worstPerformers.map((asset, index) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-danger-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-danger-600">#{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {asset.name || asset.ticker}
                    </div>
                    <div className="text-sm text-gray-500">{asset.ticker}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-danger-600">
                    {asset.pnlPercentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    ${asset.pnl.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
