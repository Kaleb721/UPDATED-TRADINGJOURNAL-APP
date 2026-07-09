const db = require('../config/database');
const logger = require('../config/logger');

class Trade {
    static async create(tradeData) {
        const {
            userId, date, asset, type, entryPrice, exitPrice,
            quantity, fees, stopLoss, takeProfit, strategy,
            emotion, setup, notes, screenshotNotes
        } = tradeData;

        const query = `
            INSERT INTO trades (
                user_id, trade_date, asset, trade_type,
                entry_price, exit_price, quantity, fees,
                stop_loss, take_profit, strategy, emotion,
                setup, notes, screenshot_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;
        const values = [
            userId, date, asset, type,
            entryPrice, exitPrice, quantity, fees || 0,
            stopLoss || null, takeProfit || null,
            strategy || null, emotion || null,
            setup || '', notes || '', screenshotNotes || ''
        ];

        try {
            const result = await db.query(query, values);
            logger.info(`Trade created: ${asset} for user ${userId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating trade:', error);
            throw error;
        }
    }

    static async findByUserId(userId, filters = {}) {
        let query = 'SELECT * FROM trades WHERE user_id = $1';
        const values = [userId];
        let paramIndex = 2;

        if (filters.asset && filters.asset !== 'all') {
            query += ` AND asset = $${paramIndex}`;
            values.push(filters.asset.toUpperCase());
            paramIndex++;
        }

        if (filters.tradeType && filters.tradeType !== 'all') {
            query += ` AND trade_type = $${paramIndex}`;
            values.push(filters.tradeType);
            paramIndex++;
        }

        if (filters.dateFrom && filters.dateFrom !== '') {
            query += ` AND trade_date >= $${paramIndex}`;
            values.push(filters.dateFrom);
            paramIndex++;
        }

        if (filters.dateTo && filters.dateTo !== '') {
            query += ` AND trade_date <= $${paramIndex}`;
            values.push(filters.dateTo);
            paramIndex++;
        }

        query += ' ORDER BY trade_date DESC, id DESC';

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching trades:', error);
            throw error;
        }
    }

    static async findById(tradeId, userId) {
        const query = 'SELECT * FROM trades WHERE id = $1 AND user_id = $2';
        try {
            const result = await db.query(query, [tradeId, userId]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error finding trade:', error);
            throw error;
        }
    }

    static async update(tradeId, userId, tradeData) {
        const {
            date, asset, type, entryPrice, exitPrice,
            quantity, fees, stopLoss, takeProfit, strategy,
            emotion, setup, notes, screenshotNotes
        } = tradeData;

        const query = `
            UPDATE trades SET
                trade_date = $1,
                asset = $2,
                trade_type = $3,
                entry_price = $4,
                exit_price = $5,
                quantity = $6,
                fees = $7,
                stop_loss = $8,
                take_profit = $9,
                strategy = $10,
                emotion = $11,
                setup = $12,
                notes = $13,
                screenshot_notes = $14,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $15 AND user_id = $16
            RETURNING *
        `;
        const values = [
            date, asset.toUpperCase(), type, entryPrice, exitPrice,
            quantity, fees || 0,
            stopLoss || null, takeProfit || null,
            strategy || null, emotion || null,
            setup || '', notes || '', screenshotNotes || '',
            tradeId, userId
        ];

        try {
            const result = await db.query(query, values);
            if (result.rows[0]) {
                logger.info(`Trade updated: ${asset} for user ${userId}`);
            }
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error updating trade:', error);
            throw error;
        }
    }

    static async delete(tradeId, userId) {
        await db.query('DELETE FROM screenshots WHERE trade_id = $1', [tradeId]);
        
        const query = 'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id';
        try {
            const result = await db.query(query, [tradeId, userId]);
            if (result.rows[0]) {
                logger.info(`Trade deleted: ID ${tradeId} for user ${userId}`);
            }
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error deleting trade:', error);
            throw error;
        }
    }

    static async addScreenshot(tradeId, screenshotData) {
        const query = `
            INSERT INTO screenshots (trade_id, image_data, file_name, file_size, file_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { imageData, fileName, fileSize, fileType } = screenshotData;
        
        try {
            const result = await db.query(query, [
                tradeId, imageData, fileName, fileSize, fileType
            ]);
            logger.info(`Screenshot added to trade ${tradeId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error adding screenshot:', error);
            throw error;
        }
    }

    static async getScreenshots(tradeId) {
        const query = 'SELECT * FROM screenshots WHERE trade_id = $1 ORDER BY created_at';
        try {
            const result = await db.query(query, [tradeId]);
            return result.rows;
        } catch (error) {
            logger.error('Error fetching screenshots:', error);
            throw error;
        }
    }

    static async getStatistics(userId) {
        const query = `
            SELECT 
                COUNT(*) as total_trades,
                COUNT(*) FILTER (WHERE (exit_price - entry_price) * 
                    CASE WHEN trade_type = 'long' THEN 1 ELSE -1 END * quantity - fees > 0) as winning_trades,
                COALESCE(SUM((exit_price - entry_price) * 
                    CASE WHEN trade_type = 'long' THEN 1 ELSE -1 END * quantity - fees), 0) as total_profit,
                COALESCE(AVG((exit_price - entry_price) * 
                    CASE WHEN trade_type = 'long' THEN 1 ELSE -1 END * quantity - fees), 0) as avg_profit
            FROM trades
            WHERE user_id = $1
        `;
        try {
            const result = await db.query(query, [userId]);
            return result.rows[0] || { 
                total_trades: 0, 
                winning_trades: 0, 
                total_profit: 0, 
                avg_profit: 0 
            };
        } catch (error) {
            logger.error('Error calculating statistics:', error);
            throw error;
        }
    }

    static async getUniqueAssets(userId) {
        const query = 'SELECT DISTINCT asset FROM trades WHERE user_id = $1 ORDER BY asset';
        try {
            const result = await db.query(query, [userId]);
            return result.rows.map(row => row.asset);
        } catch (error) {
            logger.error('Error fetching unique assets:', error);
            throw error;
        }
    }
}

function calculateTradeProfit(trade) {
    const priceDifference = trade.exit_price - trade.entry_price;
    const direction = trade.trade_type === 'long' ? 1 : -1;
    const profit = (priceDifference * direction * trade.quantity) - (trade.fees || 0);
    return parseFloat(profit.toFixed(2));
}

module.exports = { Trade, calculateTradeProfit };