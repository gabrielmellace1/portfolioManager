-- Audit tables for tracking changes
-- This migration adds audit functionality to track all changes

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values TEXT, -- JSON string of old values
    new_values TEXT, -- JSON string of new values
    changed_by VARCHAR(100), -- User who made the change
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create triggers for portfolio audit logging
CREATE TRIGGER IF NOT EXISTS audit_portfolios_insert
    AFTER INSERT ON portfolios
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_at)
        VALUES ('portfolios', NEW.id, 'INSERT', json_object(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        ), CURRENT_TIMESTAMP);
    END;

CREATE TRIGGER IF NOT EXISTS audit_portfolios_update
    AFTER UPDATE ON portfolios
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_at)
        VALUES ('portfolios', NEW.id, 'UPDATE', json_object(
            'id', OLD.id,
            'name', OLD.name,
            'description', OLD.description,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at
        ), json_object(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        ), CURRENT_TIMESTAMP);
    END;

CREATE TRIGGER IF NOT EXISTS audit_portfolios_delete
    AFTER DELETE ON portfolios
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_at)
        VALUES ('portfolios', OLD.id, 'DELETE', json_object(
            'id', OLD.id,
            'name', OLD.name,
            'description', OLD.description,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at
        ), CURRENT_TIMESTAMP);
    END;

-- Create triggers for asset audit logging
CREATE TRIGGER IF NOT EXISTS audit_assets_insert
    AFTER INSERT ON assets
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_at)
        VALUES ('assets', NEW.id, 'INSERT', json_object(
            'id', NEW.id,
            'type', NEW.type,
            'ticker', NEW.ticker,
            'quantity', NEW.quantity,
            'purchase_price', NEW.purchase_price,
            'current_price', NEW.current_price,
            'name', NEW.name,
            'description', NEW.description,
            'portfolio_id', NEW.portfolio_id,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        ), CURRENT_TIMESTAMP);
    END;

CREATE TRIGGER IF NOT EXISTS audit_assets_update
    AFTER UPDATE ON assets
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_at)
        VALUES ('assets', NEW.id, 'UPDATE', json_object(
            'id', OLD.id,
            'type', OLD.type,
            'ticker', OLD.ticker,
            'quantity', OLD.quantity,
            'purchase_price', OLD.purchase_price,
            'current_price', OLD.current_price,
            'name', OLD.name,
            'description', OLD.description,
            'portfolio_id', OLD.portfolio_id,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at
        ), json_object(
            'id', NEW.id,
            'type', NEW.type,
            'ticker', NEW.ticker,
            'quantity', NEW.quantity,
            'purchase_price', NEW.purchase_price,
            'current_price', NEW.current_price,
            'name', NEW.name,
            'description', NEW.description,
            'portfolio_id', NEW.portfolio_id,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at
        ), CURRENT_TIMESTAMP);
    END;

CREATE TRIGGER IF NOT EXISTS audit_assets_delete
    AFTER DELETE ON assets
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_at)
        VALUES ('assets', OLD.id, 'DELETE', json_object(
            'id', OLD.id,
            'type', OLD.type,
            'ticker', OLD.ticker,
            'quantity', OLD.quantity,
            'purchase_price', OLD.purchase_price,
            'current_price', OLD.current_price,
            'name', OLD.name,
            'description', OLD.description,
            'portfolio_id', OLD.portfolio_id,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at
        ), CURRENT_TIMESTAMP);
    END;
