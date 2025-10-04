-- Performance views for common queries
-- This migration adds views to optimize common query patterns

-- View for portfolio performance summary
CREATE VIEW IF NOT EXISTS portfolio_performance AS
SELECT 
    p.id as portfolio_id,
    p.name as portfolio_name,
    p.description as portfolio_description,
    p.created_at as portfolio_created_at,
    p.updated_at as portfolio_updated_at,
    COUNT(a.id) as asset_count,
    COALESCE(SUM(a.quantity * COALESCE(a.current_price, a.purchase_price)), 0) as total_value,
    COALESCE(SUM(a.quantity * a.purchase_price), 0) as total_cost,
    COALESCE(SUM(a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price)), 0) as total_pnl,
    CASE 
        WHEN COALESCE(SUM(a.quantity * a.purchase_price), 0) > 0 
        THEN (COALESCE(SUM(a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price)), 0) / COALESCE(SUM(a.quantity * a.purchase_price), 0)) * 100
        ELSE 0 
    END as total_pnl_percentage
FROM portfolios p
LEFT JOIN assets a ON p.id = a.portfolio_id
GROUP BY p.id, p.name, p.description, p.created_at, p.updated_at;

-- View for asset performance summary
CREATE VIEW IF NOT EXISTS asset_performance AS
SELECT 
    a.id,
    a.type,
    a.ticker,
    a.name,
    a.quantity,
    a.purchase_price,
    a.current_price,
    a.quantity * COALESCE(a.current_price, a.purchase_price) as total_value,
    a.quantity * a.purchase_price as total_cost,
    a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price) as unrealized_pnl,
    CASE 
        WHEN a.purchase_price > 0 
        THEN ((COALESCE(a.current_price, a.purchase_price) - a.purchase_price) / a.purchase_price) * 100
        ELSE 0 
    END as unrealized_pnl_percentage,
    a.portfolio_id,
    p.name as portfolio_name,
    a.created_at,
    a.updated_at
FROM assets a
LEFT JOIN portfolios p ON a.portfolio_id = p.id;

-- View for assets by type performance
CREATE VIEW IF NOT EXISTS assets_by_type_performance AS
SELECT 
    a.type,
    a.portfolio_id,
    p.name as portfolio_name,
    COUNT(a.id) as asset_count,
    COALESCE(SUM(a.quantity * COALESCE(a.current_price, a.purchase_price)), 0) as total_value,
    COALESCE(SUM(a.quantity * a.purchase_price), 0) as total_cost,
    COALESCE(SUM(a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price)), 0) as total_pnl,
    CASE 
        WHEN COALESCE(SUM(a.quantity * a.purchase_price), 0) > 0 
        THEN (COALESCE(SUM(a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price)), 0) / COALESCE(SUM(a.quantity * a.purchase_price), 0)) * 100
        ELSE 0 
    END as total_pnl_percentage
FROM assets a
LEFT JOIN portfolios p ON a.portfolio_id = p.id
GROUP BY a.type, a.portfolio_id, p.name;

-- View for top performers
CREATE VIEW IF NOT EXISTS top_performers AS
SELECT 
    a.id,
    a.ticker,
    a.name,
    a.type,
    a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price) as unrealized_pnl,
    CASE 
        WHEN a.purchase_price > 0 
        THEN ((COALESCE(a.current_price, a.purchase_price) - a.purchase_price) / a.purchase_price) * 100
        ELSE 0 
    END as unrealized_pnl_percentage,
    a.portfolio_id,
    p.name as portfolio_name
FROM assets a
LEFT JOIN portfolios p ON a.portfolio_id = p.id
WHERE a.current_price IS NOT NULL
ORDER BY unrealized_pnl_percentage DESC;

-- View for worst performers
CREATE VIEW IF NOT EXISTS worst_performers AS
SELECT 
    a.id,
    a.ticker,
    a.name,
    a.type,
    a.quantity * (COALESCE(a.current_price, a.purchase_price) - a.purchase_price) as unrealized_pnl,
    CASE 
        WHEN a.purchase_price > 0 
        THEN ((COALESCE(a.current_price, a.purchase_price) - a.purchase_price) / a.purchase_price) * 100
        ELSE 0 
    END as unrealized_pnl_percentage,
    a.portfolio_id,
    p.name as portfolio_name
FROM assets a
LEFT JOIN portfolios p ON a.portfolio_id = p.id
WHERE a.current_price IS NOT NULL
ORDER BY unrealized_pnl_percentage ASC;

-- View for assets needing price updates
CREATE VIEW IF NOT EXISTS assets_needing_price_update AS
SELECT 
    a.id,
    a.ticker,
    a.type,
    a.name,
    a.portfolio_id,
    p.name as portfolio_name,
    a.updated_at,
    datetime('now') as current_time,
    (julianday('now') - julianday(a.updated_at)) * 24 * 60 as minutes_since_update
FROM assets a
LEFT JOIN portfolios p ON a.portfolio_id = p.id
WHERE a.current_price IS NULL 
   OR a.updated_at < datetime('now', '-5 minutes')
ORDER BY a.updated_at ASC;
