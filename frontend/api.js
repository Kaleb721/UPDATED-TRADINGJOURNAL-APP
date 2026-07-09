const API = {
    baseURL: '/api',
    
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    },

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders()
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.setToken(null);
                    this.setCurrentUser(null);
                    if (!window.location.pathname.includes('login.html') && 
                        !window.location.pathname.includes('register.html')) {
                        window.location.href = '/login.html';
                    }
                }
                throw new Error(result.message || 'API request failed');
            }
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    async register(userData) {
        const response = await this.request('/auth/register', 'POST', userData);
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setCurrentUser(response.data.user);
        }
        return response;
    },

    async login(credentials) {
        const response = await this.request('/auth/login', 'POST', credentials);
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setCurrentUser(response.data.user);
        }
        return response;
    },

    async logout() {
        this.setToken(null);
        this.setCurrentUser(null);
        window.location.href = '/login.html';
    },
    async getTrades(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
                queryParams.append(key, filters[key]);
            }
        });
        const queryString = queryParams.toString();
        const endpoint = `/trades${queryString ? '?' + queryString : ''}`;
        return this.request(endpoint, 'GET');
    },

    async getTrade(id) {
        return this.request(`/trades/${id}`, 'GET');
    },

    async createTrade(tradeData) {
        return this.request('/trades', 'POST', tradeData);
    },

    async updateTrade(id, tradeData) {
        return this.request(`/trades/${id}`, 'PUT', tradeData);
    },

    async deleteTrade(id) {
        return this.request(`/trades/${id}`, 'DELETE');
    },

    async getStatistics() {
        return this.request('/trades/statistics', 'GET');
    },

    async getAssets() {
        return this.request('/trades/assets', 'GET');
    }
};

const StorageManager = {
    async getTrades(filters = {}) {
        const response = await API.getTrades(filters);
        return response.success ? response.data : [];
    },

    async getTradeById(id) {
        const response = await API.getTrade(id);
        return response.success ? response.data : null;
    },

    async addTrade(trade) {
        const response = await API.createTrade(trade);
        return response.success ? response.data : null;
    },

    async updateTrade(id, trade) {
        const response = await API.updateTrade(id, trade);
        return response.success ? response.data : null;
    },

    async deleteTrade(id) {
        const response = await API.deleteTrade(id);
        return response.success;
    },

    async getStatistics() {
        const response = await API.getStatistics();
        return response.success ? response.data : null;
    },

    async getAssets() {
        const response = await API.getAssets();
        return response.success ? response.data : [];
    },

    calculateProfit(trade) {
        const priceDifference = (trade.exit_price || trade.exitPrice) - (trade.entry_price || trade.entryPrice);
        const direction = (trade.trade_type || trade.type) === 'long' ? 1 : -1;
        const profit = (priceDifference * direction * (trade.quantity)) - ((trade.fees || 0));
        return Math.round(profit * 100) / 100;
    },

    calculateWinRate(trades) {
        if (!trades || trades.length === 0) return 0;
        const winningTrades = trades.filter(t => this.calculateProfit(t) > 0);
        return Math.round((winningTrades.length / trades.length) * 100);
    },

    calculateAvgRiskReward(trades) {
        if (!trades || trades.length === 0) return 0;
        const validTrades = trades.filter(t => (t.stop_loss || t.stopLoss) && (t.take_profit || t.takeProfit));
        if (validTrades.length === 0) return 0;
        const totalRatio = validTrades.reduce((sum, trade) => {
            const risk = Math.abs((trade.entry_price || trade.entryPrice) - (trade.stop_loss || trade.stopLoss));
            const reward = Math.abs((trade.take_profit || trade.takeProfit) - (trade.entry_price || trade.entryPrice));
            return sum + (risk > 0 ? reward / risk : 0);
        }, 0);
        return Math.round((totalRatio / validTrades.length) * 100) / 100;
    },

    getRecentTrades(trades, limit = 5) {
        if (!trades || trades.length === 0) return [];
        return [...trades]
            .sort((a, b) => new Date(b.trade_date || b.date) - new Date(a.trade_date || a.date))
            .slice(0, limit);
    },

    getBestTrade(trades) {
        if (!trades || trades.length === 0) return null;
        return trades.reduce((best, trade) => {
            const profit = this.calculateProfit(trade);
            const bestProfit = best ? this.calculateProfit(best) : -Infinity;
            return profit > bestProfit ? trade : best;
        }, null);
    },

    getConsecutiveStats(trades) {
        if (!trades || trades.length === 0) {
            return { currentStreak: 0, currentStreakType: null, maxWinningStreak: 0, maxLosingStreak: 0 };
        }
        const sortedTrades = [...trades].sort((a, b) => new Date(a.trade_date || a.date) - new Date(b.trade_date || b.date));
        let currentStreak = 0;
        let maxWinningStreak = 0;
        let maxLosingStreak = 0;
        let currentType = null;
        let lastProfitType = null;

        sortedTrades.forEach(trade => {
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

    getUniqueAssets(trades) {
        if (!trades || trades.length === 0) return [];
        const assets = [...new Set(trades.map(t => t.asset))];
        return assets.sort();
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        const icon = type === 'success' ? '✅' : '❌';
        notification.innerHTML = `<span class="icon">${icon}</span><span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

window.API = API;
window.StorageManager = StorageManager;