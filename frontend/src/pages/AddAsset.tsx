import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { AssetType, CreateAssetRequest } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

const AddAsset: React.FC = () => {
  const navigate = useNavigate();
  const { portfolios, createAsset, loading } = usePortfolio();
  const [formData, setFormData] = useState<CreateAssetRequest>({
    type: AssetType.STOCK,
    ticker: '',
    quantity: 0,
    purchasePrice: 0,
    portfolioId: portfolios[0]?.id || 0,
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (portfolios.length > 0 && !formData.portfolioId) {
      setFormData(prev => ({ ...prev, portfolioId: portfolios[0].id }));
    }
  }, [portfolios]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (!formData.portfolioId) {
      newErrors.portfolioId = 'Portfolio is required';
    }

    // Option-specific validation
    if (formData.type === AssetType.OPTION) {
      if (!formData.strikePrice || formData.strikePrice <= 0) {
        newErrors.strikePrice = 'Strike price is required for options';
      }
      if (!formData.expirationDate) {
        newErrors.expirationDate = 'Expiration date is required for options';
      }
      if (!formData.optionType) {
        newErrors.optionType = 'Option type is required';
      }
    }

    // Bond-specific validation
    if (formData.type === AssetType.BOND) {
      if (!formData.couponRate || formData.couponRate <= 0) {
        newErrors.couponRate = 'Coupon rate is required for bonds';
      }
      if (!formData.maturityDate) {
        newErrors.maturityDate = 'Maturity date is required for bonds';
      }
      if (!formData.faceValue || formData.faceValue <= 0) {
        newErrors.faceValue = 'Face value is required for bonds';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await createAsset(formData);
      navigate('/');
    } catch (error) {
      console.error('Failed to create asset:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateAssetRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderOptionFields = () => {
    if (formData.type !== AssetType.OPTION) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Strike Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.strikePrice || ''}
            onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value))}
            className={`input ${errors.strikePrice ? 'border-danger-500' : ''}`}
            placeholder="Enter strike price"
          />
          {errors.strikePrice && <p className="mt-1 text-sm text-danger-600">{errors.strikePrice}</p>}
        </div>

        <div>
          <label className="label">Expiration Date</label>
          <input
            type="date"
            value={formData.expirationDate || ''}
            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
            className={`input ${errors.expirationDate ? 'border-danger-500' : ''}`}
          />
          {errors.expirationDate && <p className="mt-1 text-sm text-danger-600">{errors.expirationDate}</p>}
        </div>

        <div>
          <label className="label">Option Type</label>
          <select
            value={formData.optionType || ''}
            onChange={(e) => handleInputChange('optionType', e.target.value)}
            className={`input ${errors.optionType ? 'border-danger-500' : ''}`}
          >
            <option value="">Select option type</option>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
          {errors.optionType && <p className="mt-1 text-sm text-danger-600">{errors.optionType}</p>}
        </div>
      </div>
    );
  };

  const renderBondFields = () => {
    if (formData.type !== AssetType.BOND) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Coupon Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.couponRate || ''}
            onChange={(e) => handleInputChange('couponRate', parseFloat(e.target.value))}
            className={`input ${errors.couponRate ? 'border-danger-500' : ''}`}
            placeholder="Enter coupon rate"
          />
          {errors.couponRate && <p className="mt-1 text-sm text-danger-600">{errors.couponRate}</p>}
        </div>

        <div>
          <label className="label">Maturity Date</label>
          <input
            type="date"
            value={formData.maturityDate || ''}
            onChange={(e) => handleInputChange('maturityDate', e.target.value)}
            className={`input ${errors.maturityDate ? 'border-danger-500' : ''}`}
          />
          {errors.maturityDate && <p className="mt-1 text-sm text-danger-600">{errors.maturityDate}</p>}
        </div>

        <div>
          <label className="label">Face Value</label>
          <input
            type="number"
            step="0.01"
            value={formData.faceValue || ''}
            onChange={(e) => handleInputChange('faceValue', parseFloat(e.target.value))}
            className={`input ${errors.faceValue ? 'border-danger-500' : ''}`}
            placeholder="Enter face value"
          />
          {errors.faceValue && <p className="mt-1 text-sm text-danger-600">{errors.faceValue}</p>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Asset</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new investment to your portfolio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Asset Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as AssetType)}
                className="input"
              >
                <option value={AssetType.STOCK}>Stock</option>
                <option value={AssetType.OPTION}>Option</option>
                <option value={AssetType.BOND}>Bond</option>
                <option value={AssetType.CRYPTO}>Crypto</option>
                <option value={AssetType.CASH}>Cash</option>
              </select>
            </div>

            <div>
              <label className="label">Portfolio</label>
              {portfolios.length === 0 ? (
                <div className="text-center py-4 border border-gray-300 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">No portfolios available</p>
                  <Link to="/create-portfolio" className="btn btn-sm btn-primary">
                    Create Portfolio
                  </Link>
                </div>
              ) : (
                <>
                  <select
                    value={formData.portfolioId}
                    onChange={(e) => handleInputChange('portfolioId', parseInt(e.target.value))}
                    className={`input ${errors.portfolioId ? 'border-danger-500' : ''}`}
                  >
                    <option value="">Select portfolio</option>
                    {portfolios.map((portfolio) => (
                      <option key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </option>
                    ))}
                  </select>
                  {errors.portfolioId && <p className="mt-1 text-sm text-danger-600">{errors.portfolioId}</p>}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Ticker/Symbol</label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => handleInputChange('ticker', e.target.value)}
                className={`input ${errors.ticker ? 'border-danger-500' : ''}`}
                placeholder="e.g., AAPL, BTC-USD"
              />
              {errors.ticker && <p className="mt-1 text-sm text-danger-600">{errors.ticker}</p>}
            </div>

            <div>
              <label className="label">Name (Optional)</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input"
                placeholder="e.g., Apple Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
                className={`input ${errors.quantity ? 'border-danger-500' : ''}`}
                placeholder="Enter quantity"
              />
              {errors.quantity && <p className="mt-1 text-sm text-danger-600">{errors.quantity}</p>}
            </div>

            <div>
              <label className="label">Purchase Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value))}
                className={`input ${errors.purchasePrice ? 'border-danger-500' : ''}`}
                placeholder="Enter purchase price"
              />
              {errors.purchasePrice && <p className="mt-1 text-sm text-danger-600">{errors.purchasePrice}</p>}
            </div>
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input"
              rows={3}
              placeholder="Add any additional notes about this investment"
            />
          </div>
        </div>

        {/* Option-specific fields */}
        {renderOptionFields()}

        {/* Bond-specific fields */}
        {renderBondFields()}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? 'Adding...' : 'Add Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAsset;
