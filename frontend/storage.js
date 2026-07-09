const StorageManager = {
    init: function() {
        if (!localStorage.getItem('tradingJournalData')) {
            const sampleData = {
                trades: [
                    {
                        id: 1,
                        date: '2024-01-15',
                        asset: 'AAPL',
                        type: 'long',
                        entryPrice: 185.50,
                        exitPrice: 192.75,
                        quantity: 10,
                        fees: 5.00,
                        stopLoss: 182.00,
                        takeProfit: 195.00,
                        strategy: 'swing',
                        emotion: 'confident',
                        setup: 'Breakout above resistance with high volume',
                        notes: 'Perfect entry timing, exited at target',
                        screenshots: [],
                        screenshotNotes: ''
                    },
                    {
                        id: 2,
                        date: '2024-01-18',
                        asset: 'GOOGL',
                        type: 'long',
                        entryPrice: 142.30,
                        exitPrice: 140.50,
                        quantity: 5,
                        fees: 5.00,
                        stopLoss: 141.00,
                        takeProfit: 146.00,
                        strategy: 'day',
                        emotion: 'anxious',
                        setup: 'Oversold bounce attempt',
                        notes: 'Should have waited for confirmation, premature entry',
                        screenshots: [],
                        screenshotNotes: ''
                    },
                    {
                        id: 3,
                        date: '2024-01-22',
                        asset: 'BTC',
                        type: 'short',
                        entryPrice: 42000,
                        exitPrice: 41500,
                        quantity: 0.1,
                        fees: 10.00,
                        stopLoss: 42500,
                        takeProfit: 41000,
                        strategy: 'swing',
                        emotion: 'neutral',
                        setup: 'Resistance rejection with bearish divergence',
                        notes: 'Good risk management, perfect execution',
                        screenshots: [],
                        screenshotNotes: ''
                    }
                ],
                settings: {
                    currency: 'USD',
                    riskPercent: 2,
                    theme: 'light'
                }
            };
            this.saveAllData(sampleData);
        }
        
    },
     getAllData: function() {
        const data = localStorage.getItem('tradingJournalData');
        return data ? JSON.parse(data) : { trades: [], settings: {} };
    },
    saveAllData: function(data) {
        localStorage.setItem('tradingJournalData', JSON.stringify(data));
    },
    getTrades: function() {
        const data = this.getAllData();
        return data.trades || [];
    },
    getTradeById: function(id) {
        const trades = this.getTrades();
        return trades.find(trade => trade.id === id);
    },
    saveTrades: function(trades) {
        const data = this.getAllData();
        data.trades = trades;
        this.saveAllData(data);
    },
    addTrade: function(trade) {
        const trades = this.getTrades();
        const newId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;
        const newTrade = {
            id: newId,
            date: trade.date,
            asset: trade.asset,
            type: trade.type,
            entryPrice: parseFloat(trade.entryPrice),
            exitPrice: parseFloat(trade.exitPrice),
            quantity: parseFloat(trade.quantity),
            fees: parseFloat(trade.fees) || 0,
            stopLoss: trade.stopLoss ? parseFloat(trade.stopLoss) : null,
            takeProfit: trade.takeProfit ? parseFloat(trade.takeProfit) : null,
            strategy: trade.strategy || null,
            emotion: trade.emotion || null,
            setup: trade.setup || '',
            notes: trade.notes || '',
            screenshots: trade.screenshots || [],
            screenshotNotes: trade.screenshotNotes || '',
            createdAt: new Date().toISOString()
        };
        trades.push(newTrade);
        this.saveTrades(trades);
        return newTrade;
    },
    updateTrade: function(id, updatedTrade) {
        const trades = this.getTrades();
        const index = trades.findIndex(t => t.id === id);
        
        if (index !== -1) {
            trades[index] = {
                ...trades[index],
                ...updatedTrade,
                entryPrice: parseFloat(updatedTrade.entryPrice),
                exitPrice: parseFloat(updatedTrade.exitPrice),
                quantity: parseFloat(updatedTrade.quantity),
                fees: parseFloat(updatedTrade.fees) || 0,
                stopLoss: updatedTrade.stopLoss ? parseFloat(updatedTrade.stopLoss) : null,
                takeProfit: updatedTrade.takeProfit ? parseFloat(updatedTrade.takeProfit) : null,
                screenshots: updatedTrade.screenshots || trades[index].screenshots,
                screenshotNotes: updatedTrade.screenshotNotes || trades[index].screenshotNotes,
                updatedAt: new Date().toISOString()
            };
            
            this.saveTrades(trades);
            return true;
        }
        
        return false;
    },   deleteTrade: function(id) {
        const trades = this.getTrades();
        const filteredTrades = trades.filter(t => t.id !== id);
        if (filteredTrades.length !== trades.length) {
            this.saveTrades(filteredTrades);
            return true;
        }
        return false;
    },
    calculateProfit: function(trade) {
        const priceDifference = trade.exitPrice - trade.entryPrice;
        const direction = trade.type === 'long' ? 1 : -1;
        const profit = (priceDifference * direction * trade.quantity) - (trade.fees || 0);
        return Math.round(profit * 100) / 100;
    },
    calculateTotalProfitLoss: function() {
        const trades = this.getTrades();
        return trades.reduce((total, trade) => total + this.calculateProfit(trade), 0);
    },
    calculateWinRate: function() {
        const trades = this.getTrades();
        if (trades.length === 0) return 0;
        const winningTrades = trades.filter(trade => this.calculateProfit(trade) > 0);
        return Math.round((winningTrades.length / trades.length) * 100);
    },
    calculateAvgRiskReward: function() {
        const trades = this.getTrades();
        const validTrades = trades.filter(t => t.stopLoss && t.takeProfit);
        if (validTrades.length === 0) return 0;
        const totalRatio = validTrades.reduce((sum, trade) => {
            const risk = Math.abs(trade.entryPrice - trade.stopLoss);
            const reward = Math.abs(trade.takeProfit - trade.entryPrice);
            return sum + (reward / risk);
        }, 0);  
        return Math.round((totalRatio / validTrades.length) * 100) / 100;
    },
    getRecentTrades: function(limit = 5) {
        const trades = this.getTrades();
        return trades
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },
    getUniqueAssets: function() {
        const trades = this.getTrades();
        const assets = [...new Set(trades.map(t => t.asset))];
        return assets.sort();
    },
    getBestTrade: function() {
        const trades = this.getTrades();
        if (trades.length === 0) return null; 
        return trades.reduce((best, trade) => {
            const profit = this.calculateProfit(trade);
            const bestProfit = this.calculateProfit(best);
            return profit > bestProfit ? trade : best;
        });
    },
    getConsecutiveStats: function() {
        const trades = this.getTrades().sort((a, b) => new Date(a.date) - new Date(b.date));  
        let currentStreak = 0;
        let maxWinningStreak = 0;
        let maxLosingStreak = 0;
        let currentType = null;
        let lastProfitType = null;
        trades.forEach(trade => {
            const profit = this.calculateProfit(trade);
            const type = profit > 0 ? 'win' : 'loss'; 
            if (type === currentType) {
                currentStreak++;
            } else {
                currentStreak = 1;
                currentType = type;
            }
            if (type === 'win') {
                maxWinningStreak = Math.max(maxWinningStreak, currentStreak);
            } else {
                maxLosingStreak = Math.max(maxLosingStreak, currentStreak);
            }
            lastProfitType = type;
        });
        return {
            currentStreak: currentStreak,
            currentStreakType: lastProfitType,
            maxWinningStreak: maxWinningStreak,
            maxLosingStreak: maxLosingStreak
        };
    },
    exportToCSV: function(trades = null) {
        const data = trades || this.getTrades();
        if (data.length === 0) {
            this.showNotification('No trades to export', 'error');
            return;
        }
        const headers = ['Date', 'Asset', 'Type', 'Entry', 'Exit', 'Quantity', 'Fees', 'Stop Loss', 'Take Profit', 'P&L', 'Strategy', 'Emotion'];
        const rows = data.map(trade => {
            const profit = this.calculateProfit(trade);
            return [
                trade.date,
                trade.asset,
                trade.type === 'long' ? 'Long' : 'Short',
                trade.entryPrice,
                trade.exitPrice,
                trade.quantity,
                trade.fees || 0,
                trade.stopLoss || '',
                trade.takeProfit || '',
                profit,
                trade.strategy || '',
                trade.emotion || ''
            ];
        });
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trading-journal-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    },
    getStatistics: function() {
        const trades = this.getTrades();
        const profits = trades.map(t => this.calculateProfit(t));
        const winningTrades = profits.filter(p => p > 0);
        const losingTrades = profits.filter(p => p < 0);
        return {
            totalTrades: trades.length,
            totalProfit: profits.reduce((a, b) => a + b, 0),
            avgProfit: trades.length > 0 ? profits.reduce((a, b) => a + b, 0) / trades.length : 0,
            winRate: this.calculateWinRate(),
            avgWin: winningTrades.length > 0 ? winningTrades.reduce((a, b) => a + b, 0) / winningTrades.length : 0,
            avgLoss: losingTrades.length > 0 ? losingTrades.reduce((a, b) => a + b, 0) / losingTrades.length : 0,
            largestWin: Math.max(...profits, 0),
            largestLoss: Math.min(...profits, 0),
            profitFactor: winningTrades.length > 0 && losingTrades.length > 0 ? 
                Math.abs(winningTrades.reduce((a, b) => a + b, 0) / losingTrades.reduce((a, b) => a + b, 0)) : 0
        };
    },
    backupToFile: function() {
        const data = this.getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Data backed up successfully!', 'success');
    },
     restoreFromFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveAllData(data);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    },
    showNotification: function(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="icon icon-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></span>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    compressImage: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onload = function() {
                            resolve(reader.result);
                        };
                    }, 'image/jpeg', 0.7);
                };
            };
            reader.onerror = reject;
        });
    }
};
document.addEventListener('DOMContentLoaded', function() {
    StorageManager.init();
});