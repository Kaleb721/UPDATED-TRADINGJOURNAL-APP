const { Trade, calculateTradeProfit } = require('../models/Trade');
const logger = require('../config/logger');
exports.getAllTrades = async (req, res, next) => {
    try {
        const filters = {
            asset: req.query.asset,
            tradeType: req.query.type,
            status: req.query.status,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        };

        let trades = await Trade.findByUserId(req.user.id, filters);
        
        if (filters.status && filters.status !== 'all') {
            trades = trades.filter(trade => {
                const profit = calculateTradeProfit(trade);
                return filters.status === 'win' ? profit > 0 : profit < 0;
            });
        }

        const tradesWithProfit = trades.map(trade => ({
            ...trade,
            profit: calculateTradeProfit(trade)
        }));

        res.json({
            success: true,
            data: tradesWithProfit,
            count: tradesWithProfit.length
        });
    } catch (error) {
        console.error('Get trades error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get trades'
        });
    }
};
exports.getTrade = async (req, res, next) => {
    try {
        const trade = await Trade.findById(req.params.id, req.user.id);
        
        if (!trade) {
            return res.status(404).json({
                success: false,
                message: 'Trade not found'
            });
        }

        const screenshots = await Trade.getScreenshots(trade.id);
        const profit = calculateTradeProfit(trade);

        res.json({
            success: true,
            data: { 
                ...trade, 
                profit, 
                screenshots 
            }
        });
    } catch (error) {
        console.error('Get trade error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get trade'
        });
    }
};

exports.createTrade = async (req, res, next) => {
    try {
        const tradeData = {
            userId: req.user.id,
            date: req.body.date,
            asset: req.body.asset.toUpperCase(),
            type: req.body.type,
            entryPrice: parseFloat(req.body.entryPrice),
            exitPrice: parseFloat(req.body.exitPrice),
            quantity: parseFloat(req.body.quantity),
            fees: req.body.fees ? parseFloat(req.body.fees) : 0,
            stopLoss: req.body.stopLoss ? parseFloat(req.body.stopLoss) : null,
            takeProfit: req.body.takeProfit ? parseFloat(req.body.takeProfit) : null,
            strategy: req.body.strategy || null,
            emotion: req.body.emotion || null,
            setup: req.body.setup || '',
            notes: req.body.notes || '',
            screenshotNotes: req.body.screenshotNotes || ''
        };

        const trade = await Trade.create(tradeData);
        if (req.body.screenshots && Array.isArray(req.body.screenshots) && req.body.screenshots.length > 0) {
            for (const screenshot of req.body.screenshots) {
                await Trade.addScreenshot(trade.id, {
                    imageData: screenshot.data,
                    fileName: screenshot.name || 'screenshot.jpg',
                    fileSize: screenshot.size || 0,
                    fileType: screenshot.type || 'image/jpeg'
                });
            }
        }

        const profit = calculateTradeProfit(trade);
        logger.info(`Trade created: ${trade.asset} by user ${req.user.username}`);

        res.status(201).json({
            success: true,
            message: 'Trade created successfully',
            data: { ...trade, profit }
        });
    } catch (error) {
        console.error('Create trade error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create trade'
        });
    }
};

exports.updateTrade = async (req, res, next) => {
    try {
        const existingTrade = await Trade.findById(req.params.id, req.user.id);
        if (!existingTrade) {
            return res.status(404).json({
                success: false,
                message: 'Trade not found'
            });
        }

        const tradeData = {
            date: req.body.date,
            asset: req.body.asset.toUpperCase(),
            type: req.body.type,
            entryPrice: parseFloat(req.body.entryPrice),
            exitPrice: parseFloat(req.body.exitPrice),
            quantity: parseFloat(req.body.quantity),
            fees: req.body.fees ? parseFloat(req.body.fees) : 0,
            stopLoss: req.body.stopLoss ? parseFloat(req.body.stopLoss) : null,
            takeProfit: req.body.takeProfit ? parseFloat(req.body.takeProfit) : null,
            strategy: req.body.strategy || null,
            emotion: req.body.emotion || null,
            setup: req.body.setup || '',
            notes: req.body.notes || '',
            screenshotNotes: req.body.screenshotNotes || ''
        };

        const trade = await Trade.update(req.params.id, req.user.id, tradeData);
        const profit = calculateTradeProfit(trade);

        res.json({
            success: true,
            message: 'Trade updated successfully',
            data: { ...trade, profit }
        });
    } catch (error) {
        console.error('Update trade error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update trade'
        });
    }
};

exports.deleteTrade = async (req, res, next) => {
    try {
        const deleted = await Trade.delete(req.params.id, req.user.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Trade not found'
            });
        }

        res.json({
            success: true,
            message: 'Trade deleted successfully'
        });
    } catch (error) {
        console.error('Delete trade error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete trade'
        });
    }
};

exports.getStatistics = async (req, res, next) => {
    try {
        const stats = await Trade.getStatistics(req.user.id);
        const trades = await Trade.findByUserId(req.user.id);
        
        const winRate = stats.total_trades > 0 
            ? (parseInt(stats.winning_trades) / parseInt(stats.total_trades)) * 100 
            : 0;

        let totalProfit = 0;
        let totalLoss = 0;
        let profits = [];
        
        trades.forEach(trade => {
            const profit = calculateTradeProfit(trade);
            if (profit > 0) {
                totalProfit += profit;
                profits.push(profit);
            } else {
                totalLoss += Math.abs(profit);
            }
        });

        const avgProfit = trades.length > 0 
            ? trades.reduce((sum, t) => sum + calculateTradeProfit(t), 0) / trades.length 
            : 0;

        const largestWin = profits.length > 0 ? Math.max(...profits) : 0;
        const largestLoss = trades.length > 0 
            ? Math.min(...trades.map(t => calculateTradeProfit(t))) 
            : 0;

        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

        const validTrades = trades.filter(t => t.stop_loss && t.take_profit);
        let avgRiskReward = 0;
        if (validTrades.length > 0) {
            const totalRatio = validTrades.reduce((sum, trade) => {
                const risk = Math.abs(trade.entry_price - trade.stop_loss);
                const reward = Math.abs(trade.take_profit - trade.entry_price);
                return sum + (risk > 0 ? reward / risk : 0);
            }, 0);
            avgRiskReward = totalRatio / validTrades.length;
        }

        res.json({
            success: true,
            data: {
                totalTrades: parseInt(stats.total_trades),
                winningTrades: parseInt(stats.winning_trades),
                losingTrades: parseInt(stats.total_trades) - parseInt(stats.winning_trades),
                totalProfit: parseFloat(stats.total_profit),
                avgProfit: parseFloat(avgProfit),
                winRate: parseFloat(winRate.toFixed(2)),
                profitFactor: profitFactor === Infinity ? 0 : parseFloat(profitFactor.toFixed(2)),
                largestWin: parseFloat(largestWin.toFixed(2)),
                largestLoss: parseFloat(largestLoss.toFixed(2)),
                avgRiskReward: parseFloat(avgRiskReward.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get statistics'
        });
    }
};

exports.getAssets = async (req, res, next) => {
    try {
        const assets = await Trade.getUniqueAssets(req.user.id);
        res.json({
            success: true,
            data: assets
        });
    } catch (error) {
        console.error('Get assets error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get assets'
        });
    }
};