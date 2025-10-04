-- Performance optimization indexes
-- This migration adds additional indexes for better query performance

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_assets_portfolio_ticker ON assets(portfolio_id, ticker);
CREATE INDEX IF NOT EXISTS idx_assets_type_ticker ON assets(type, ticker);
CREATE INDEX IF NOT EXISTS idx_assets_updated_at ON assets(updated_at);

-- Add index for price update queries
CREATE INDEX IF NOT EXISTS idx_assets_price_update ON assets(current_price, updated_at) 
    WHERE current_price IS NULL OR updated_at < datetime('now', '-5 minutes');

-- Add index for performance calculations
CREATE INDEX IF NOT EXISTS idx_assets_performance ON assets(portfolio_id, type, current_price, purchase_price);

-- Add index for search functionality
CREATE INDEX IF NOT EXISTS idx_assets_search ON assets(ticker, name) 
    WHERE ticker IS NOT NULL OR name IS NOT NULL;

-- Add index for option-specific queries
CREATE INDEX IF NOT EXISTS idx_assets_options ON assets(type, expiration_date, strike_price) 
    WHERE type = 'option';

-- Add index for bond-specific queries
CREATE INDEX IF NOT EXISTS idx_assets_bonds ON assets(type, maturity_date, coupon_rate) 
    WHERE type = 'bond';

-- Add index for crypto-specific queries
CREATE INDEX IF NOT EXISTS idx_assets_crypto ON assets(type, symbol) 
    WHERE type = 'crypto';
