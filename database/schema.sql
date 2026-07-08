DROP TABLE IF EXISTS screenshots CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_date DATE NOT NULL,
    asset VARCHAR(20) NOT NULL,
    trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('long', 'short')),
    entry_price DECIMAL(15, 4) NOT NULL,
    exit_price DECIMAL(15, 4) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL,
    fees DECIMAL(15, 4) DEFAULT 0,
    stop_loss DECIMAL(15, 4),
    take_profit DECIMAL(15, 4),
    strategy VARCHAR(50),
    emotion VARCHAR(50),
    setup TEXT,
    notes TEXT,
    screenshot_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE screenshots (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    image_data TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_trade_date ON trades(trade_date);
CREATE INDEX idx_trades_asset ON trades(asset);
CREATE INDEX idx_screenshots_trade_id ON screenshots(trade_id);


