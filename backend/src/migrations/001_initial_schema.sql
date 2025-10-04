-- Initial database schema migration
-- This file contains the initial database structure

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    quantity DECIMAL(15,8) NOT NULL CHECK (quantity > 0),
    purchase_price DECIMAL(15,4) NOT NULL CHECK (purchase_price > 0),
    current_price DECIMAL(15,4) CHECK (current_price IS NULL OR current_price > 0),
    name VARCHAR(255),
    description TEXT,
    strike_price DECIMAL(15,4),
    expiration_date DATETIME,
    option_type VARCHAR(4),
    coupon_rate DECIMAL(5,4),
    maturity_date DATETIME,
    face_value DECIMAL(15,4),
    symbol VARCHAR(20),
    portfolio_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_ticker ON assets(ticker);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_portfolio_type ON assets(portfolio_id, type);

CREATE INDEX IF NOT EXISTS idx_portfolios_name ON portfolios(name);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_portfolios_updated_at 
    AFTER UPDATE ON portfolios
    FOR EACH ROW
    BEGIN
        UPDATE portfolios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_assets_updated_at 
    AFTER UPDATE ON assets
    FOR EACH ROW
    BEGIN
        UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
