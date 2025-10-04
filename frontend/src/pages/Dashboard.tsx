import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { Portfolio, AssetType } from '../types';
import { PriceUpdateDisplay } from '../components/PriceUpdateDisplay';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus,
  Eye,
  RefreshCw,
  Wallet
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { portfolios, loading, error, updateAllPrices } = usePortfolio();
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

  const getTotalValue = (portfolio: Portfolio): number => {
    if (!portfolio.assets) return 0;
    return portfolio.assets.reduce((sum, asset) => {
      const currentPrice = asset.currentPrice || asset.purchasePrice;
      return sum + (asset.quantity * currentPrice);
    }, 0);
  };

  const getTotalCost = (portfolio: Portfolio): number => {
    if (!portfolio.assets) return 0;
    return portfolio.assets.reduce((sum, asset) => {
      return sum + (asset.quantity * asset.purchasePrice);
    }, 0);
  };

  const getTotalPnL = (portfolio: Portfolio): number => {
    return getTotalValue(portfolio) - getTotalCost(portfolio);
  };

  const getTotalPnLPercentage = (portfolio: Portfolio): number => {
    const totalCost = getTotalCost(portfolio);
    if (totalCost === 0) return 0;
    return (getTotalPnL(portfolio) / totalCost) * 100;
  };

  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.STOCK:
        return '📈';
      case AssetType.OPTION:
        return '📊';
      case AssetType.BOND:
        return '🏛️';
      case AssetType.CRYPTO:
        return '₿';
      case AssetType.CASH:
        return '💰';
      default:
        return '📄';
    }
  };

  const getAssetTypeColor = (type: AssetType) => {
    switch (type) {
      case AssetType.STOCK:
        return 'bg-blue-100 text-blue-800';
      case AssetType.OPTION:
        return 'bg-purple-100 text-purple-800';
      case AssetType.BOND:
        return 'bg-green-100 text-green-800';
      case AssetType.CRYPTO:
        return 'bg-yellow-100 text-yellow-800';
      case AssetType.CASH:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-danger-800">Error</h3>
            <div className="mt-2 text-sm text-danger-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your investment portfolios
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefreshPrices}
            disabled={refreshing}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Prices
          </button>
          <Link to="/create-portfolio" className="btn btn-secondary flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Create Portfolio
          </Link>
          <Link to="/add-asset" className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(portfolios || []).reduce((sum, p) => sum + getTotalValue(p), 0).toLocaleString()}
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
                (portfolios || []).reduce((sum, p) => sum + getTotalPnL(p), 0) >= 0 
                  ? 'text-success-600' 
                  : 'text-danger-600'
              }`}>
                ${(portfolios || []).reduce((sum, p) => sum + getTotalPnL(p), 0).toLocaleString()}
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
              <p className="text-sm font-medium text-gray-500">Portfolios</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(portfolios || []).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Price Updates */}
      <div className="mb-6">
        <PriceUpdateDisplay />
      </div>

      {/* Portfolios */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Portfolios</h2>
        
        {(portfolios || []).length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolios</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first portfolio.
            </p>
            <div className="mt-6 space-x-3">
              <Link to="/create-portfolio" className="btn btn-secondary">
                <Wallet className="h-4 w-4 mr-2" />
                Create Portfolio
              </Link>
              <Link to="/add-asset" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(portfolios || []).map((portfolio) => {
              const totalValue = getTotalValue(portfolio);
              const totalPnL = getTotalPnL(portfolio);
              const totalPnLPercentage = getTotalPnLPercentage(portfolio);
              
              return (
                <div key={portfolio.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{portfolio.name}</h3>
                    <Link
                      to={`/portfolio/${portfolio.id}`}
                      className="text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </div>
                  
                  {portfolio.description && (
                    <p className="text-sm text-gray-500 mb-4">{portfolio.description}</p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Value</span>
                      <span className="text-sm font-medium">${totalValue.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">P&L</span>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          totalPnL >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          ${totalPnL.toLocaleString()}
                        </span>
                        <span className={`ml-2 text-xs ${
                          totalPnLPercentage >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          ({totalPnLPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Assets</span>
                      <span className="text-sm font-medium">{portfolio.assets?.length || 0}</span>
                    </div>
                  </div>
                  
                  {/* Asset types */}
                  {portfolio.assets && portfolio.assets.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          portfolio.assets.reduce((acc, asset) => {
                            acc[asset.type] = (acc[asset.type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([type, count]) => (
                          <span
                            key={type}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(type as AssetType)}`}
                          >
                            {getAssetTypeIcon(type as AssetType)} {type} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
