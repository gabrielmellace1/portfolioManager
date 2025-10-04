import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { AssetType } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Trash2,
  Edit
} from 'lucide-react';

const PortfolioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolios, assets, updateAssetPrice, deleteAsset, updateAllPrices } = usePortfolio();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioAssets, setPortfolioAssets] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      const portfolioId = parseInt(id);
      const foundPortfolio = portfolios.find(p => p.id === portfolioId);
      if (foundPortfolio) {
        setPortfolio(foundPortfolio);
        setPortfolioAssets(assets.filter(a => a.portfolioId === portfolioId));
      }
    }
  }, [id, portfolios, assets]);

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

  const handleUpdateAssetPrice = async (assetId: number) => {
    try {
      await updateAssetPrice(assetId);
    } catch (err) {
      console.error('Failed to update asset price:', err);
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(assetId);
      } catch (err) {
        console.error('Failed to delete asset:', err);
      }
    }
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

  const getTotalValue = () => {
    return portfolioAssets.reduce((sum, asset) => {
      const currentPrice = asset.currentPrice || asset.purchasePrice;
      return sum + (asset.quantity * currentPrice);
    }, 0);
  };

  const getTotalCost = () => {
    return portfolioAssets.reduce((sum, asset) => {
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

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Portfolio not found</h3>
          <p className="mt-1 text-sm text-gray-500">The portfolio you're looking for doesn't exist.</p>
          <Link to="/" className="mt-4 btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="mt-1 text-sm text-gray-500">{portfolio.description}</p>
          )}
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
          <Link to="/add-asset" className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Link>
        </div>
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
              <DollarSign className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {portfolioAssets.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Assets</h2>
          <Link to="/add-asset" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Link>
        </div>

        {portfolioAssets.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assets</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first asset to this portfolio.
            </p>
            <div className="mt-6">
              <Link to="/add-asset" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolioAssets.map((asset) => {
                  const currentPrice = asset.currentPrice || asset.purchasePrice;
                  const value = asset.quantity * currentPrice;
                  const pnl = (currentPrice - asset.purchasePrice) * asset.quantity;
                  const pnlPercentage = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;

                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-lg">{getAssetTypeIcon(asset.type)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {asset.name || asset.ticker}
                            </div>
                            <div className="text-sm text-gray-500">{asset.ticker}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAssetTypeColor(asset.type)}`}>
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${asset.purchasePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          ${currentPrice.toLocaleString()}
                          <button
                            onClick={() => handleUpdateAssetPrice(asset.id)}
                            className="ml-2 text-primary-600 hover:text-primary-700"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            pnl >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            ${pnl.toLocaleString()}
                          </span>
                          <span className={`ml-2 text-xs ${
                            pnlPercentage >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            ({pnlPercentage.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-danger-600 hover:text-danger-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
