import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { TrendingUp, TrendingDown, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { assetApi } from '../services/api';

interface PriceUpdateDisplayProps {
  className?: string;
}

export const PriceUpdateDisplay: React.FC<PriceUpdateDisplayProps> = ({ className = '' }) => {
  const { status, priceUpdates, systemMessages } = useWebSocket();
  const [initialAssets, setInitialAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial assets on component mount
  useEffect(() => {
    const fetchInitialAssets = async () => {
      try {
        const assets = await assetApi.getAll();
        setInitialAssets(assets);
      } catch (error) {
        console.error('Failed to fetch initial assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialAssets();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Real-time Price Updates</h3>
        <div className="flex items-center space-x-2">
          {status.connected ? (
            <div className="flex items-center text-green-600">
              <Wifi className="w-4 h-4 mr-1" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {status.connecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System Messages */}
      {systemMessages.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">System Messages</h4>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {systemMessages.slice(-3).map((message, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : message.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {message.type === 'error' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                {message.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Updates */}
      {priceUpdates.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Latest Updates ({priceUpdates.length} assets)
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {priceUpdates.map((update) => (
              <div
                key={`${update.assetId}-${update.timestamp}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-gray-800">{update.ticker}</div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(update.currentPrice)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${getPriceChangeColor(update.priceChange)}`}>
                    {getPriceChangeIcon(update.priceChange)}
                    <span className="text-sm font-medium">
                      {formatPercent(update.priceChangePercent)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Current Prices ({initialAssets.length} assets)
          </h4>
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm">Loading assets...</p>
            </div>
          ) : initialAssets.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {initialAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-800">{asset.ticker}</div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(asset.currentPrice || asset.purchasePrice)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {asset.currentPrice ? 'Live' : 'Static'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-2">
                {status.connected ? (
                  <div className="text-green-600">
                    <Wifi className="w-8 h-8 mx-auto mb-2" />
                    <p>Waiting for price updates...</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <WifiOff className="w-8 h-8 mx-auto mb-2" />
                    <p>Not connected to price updates</p>
                  </div>
                )}
              </div>
              <p className="text-sm">
                {status.connected 
                  ? 'Price updates will appear here every 5 seconds'
                  : 'Connect to see real-time price updates'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Connection Error */}
      {status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Connection Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{status.error}</p>
        </div>
      )}
    </div>
  );
};
