class TradingApp {
    constructor() {
        this.allTrades = [];
        this.init();
    }

    async init() {
        if (!API.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        this.setupTheme();
        this.setupMobileMenu();
        this.setupLogout();
        await this.loadDashboard();
        this.setupEventListeners();
        
        setTimeout(() => {
            this.setupCharts();
        }, 1000);
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => API.logout());
        }
    }

    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const savedTheme = localStorage.getItem('tradingJournalTheme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                themeToggle.innerHTML = '<span class="icon icon-sun"></span>';
            }
            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-theme');
                const isDark = document.body.classList.contains('dark-theme');
                localStorage.setItem('tradingJournalTheme', isDark ? 'dark' : 'light');
                this.innerHTML = isDark ? '<span class="icon icon-sun"></span>' : '<span class="icon icon-moon"></span>';
                if (window.tradingApp) {
                    setTimeout(() => window.tradingApp.setupCharts(), 500);
                }
            });
        }
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('show'));
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
                    navLinks.classList.remove('show');
                }
            });
        }
    }

    async loadDashboard() {
        try {
            const trades = await StorageManager.getTrades();
            const stats = await StorageManager.getStatistics();
            
            if (trades) {
                this.allTrades = trades;
                this.updateSummaryCards(trades, stats);
                this.updateRecentTrades(trades);
                this.updateStats(trades, stats);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    updateSummaryCards(trades, stats) {
        if (!stats) return;

        const profit = stats.totalProfit || 0;
        this.updateElement('totalPL', `$${profit.toFixed(2)}`, `summary-value ${profit >= 0 ? 'positive' : 'negative'}`);
        this.updateElement('dashboardWinRate', `${stats.winRate || 0}%`);
        this.updateElement('totalTrades', stats.totalTrades || 0);
        this.updateElement('totalProfit', `$${profit.toFixed(2)}`, 'stat-value positive');
        this.updateElement('winRate', `${stats.winRate || 0}%`);

        const winRateProgress = document.getElementById('winRateProgress');
        if (winRateProgress) {
            winRateProgress.style.width = `${stats.winRate || 0}%`;
        }

        const avgRiskReward = StorageManager.calculateAvgRiskReward(trades);
        this.updateElement('avgRiskReward', `1:${avgRiskReward.toFixed(1)}`);

        const bestTrade = StorageManager.getBestTrade(trades);
        if (bestTrade) {
            const profit = StorageManager.calculateProfit(bestTrade);
            this.updateElement('bestTrade', `$${profit.toFixed(2)}`, 'summary-value positive');
            const bestDate = bestTrade.trade_date || bestTrade.date;
            const bestDateObj = new Date(bestDate);
            const formattedBestDate = !isNaN(bestDateObj.getTime()) 
                ? bestDateObj.toLocaleDateString() 
                : 'Invalid Date';
            this.updateElement('bestTradeMeta', `${bestTrade.asset} (${formattedBestDate})`);
        }
    }

    updateElement(id, value, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            if (className) {
                element.className = className;
            }
        }
    }

    updateRecentTrades(trades) {
        const container = document.getElementById('recentTradesList');
        if (!container) return;

        const recentTrades = StorageManager.getRecentTrades(trades, 5);
        container.innerHTML = '';

        if (recentTrades.length === 0) {
            container.innerHTML = `
                <div class="trade-item">
                    <div class="trade-info">
                        <span class="trade-symbol">No trades yet</span>
                        <span class="trade-date">Add your first trade!</span>
                    </div>
                </div>
            `;
            return;
        }

        recentTrades.forEach((trade, index) => {
            const profit = StorageManager.calculateProfit(trade);
            const tradeDate = new Date(trade.trade_date || trade.date);
            const formattedDate = !isNaN(tradeDate.getTime()) 
                ? tradeDate.toLocaleDateString() 
                : 'Invalid Date';
            
            const tradeElement = document.createElement('div');
            tradeElement.className = 'trade-item';
            tradeElement.style.animationDelay = `${index * 0.1}s`;
            tradeElement.innerHTML = `
                <div class="trade-info">
                    <span class="trade-symbol">${trade.asset}</span>
                    <span class="trade-date">${formattedDate}</span>
                </div>
                <div class="trade-profit ${profit >= 0 ? 'positive' : 'negative'}">
                    ${profit >= 0 ? '+' : ''}$${Math.abs(profit).toFixed(2)}
                </div>
            `;
            container.appendChild(tradeElement);
        });
    }

 updateStats(trades, stats) {
    if (!stats) return;
    const consecutiveStats = StorageManager.getConsecutiveStats(trades);
    this.updateElement('currentStreak', 
        `${consecutiveStats.currentStreak || 0} ${consecutiveStats.currentStreakType === 'win' ? 'wins' : 'losses'}`);

    const totalTrades = trades.length;
    const tradesWithStopLoss = trades.filter(t => t.stop_loss || t.stopLoss).length;
    const riskScore = totalTrades > 0 ? Math.round((tradesWithStopLoss / totalTrades) * 100) : 0;
    this.updateElement('riskScore', `${riskScore}%`);
    const emotions = trades.filter(t => t.emotion).map(t => t.emotion);
    const goodEmotions = emotions.filter(e => ['confident', 'neutral'].includes(e));
    const psychScore = emotions.length > 0 ? Math.round((goodEmotions.length / emotions.length) * 100) : 0;
    this.updateElement('psychologyScore', `${psychScore}%`);
}

    setupEventListeners() {
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', () => {
                this.setupCharts();
            });
        }
    }


    setupCharts() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) {
            console.error('Chart canvas not found!');
            return;
        }

        if (ctx.chart) {
            ctx.chart.destroy();
            ctx.chart = null;
        }

        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded!');
            return;
        }

        const chartPeriod = document.getElementById('chartPeriod');
        const period = chartPeriod ? chartPeriod.value : '1M';
        const chartData = this.getChartDataForPeriod(period);
        
        if (!chartData || chartData.dates.length === 0 || chartData.values.length === 0) {
            console.log('No chart data available');
            return;
        }

        try {
            const isDark = document.body.classList.contains('dark-theme');
            const textColor = isDark ? '#cbd5e1' : '#64748b';
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            const positiveColor = '#4cc9f0';
            const negativeColor = '#f72585';

            ctx.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.dates,
                    datasets: [{
                        label: 'Portfolio Value',
                        data: chartData.values,
                        borderColor: positiveColor,
                        backgroundColor: 'rgba(76, 201, 240, 0.1)',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: positiveColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4,
                        segment: {
                            borderColor: function(ctx) {
                                const index = ctx.p1DataIndex;
                                const values = chartData.values;
                                if (index > 0 && values[index] < values[index - 1]) {
                                    return negativeColor;
                                }
                                return positiveColor;
                            }
                        }
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: isDark ? '#334155' : '#ffffff',
                            titleColor: isDark ? '#f1f5f9' : '#1e293b',
                            bodyColor: isDark ? '#cbd5e1' : '#64748b',
                            borderColor: isDark ? '#475569' : '#e2e8f0',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: gridColor,
                                drawBorder: false
                            },
                            ticks: {
                                color: textColor,
                                font: { size: 11 },
                                maxRotation: 45
                            }
                        },
                        y: {
                            position: 'right',
                            grid: {
                                color: gridColor,
                                drawBorder: false
                            },
                            ticks: {
                                color: textColor,
                                font: { size: 11 },
                                callback: function(value) {
                                    return '$' + value.toFixed(0);
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });

            console.log('✅ Chart created successfully!');

        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }

    getChartDataForPeriod(period) {
        const trades = this.allTrades || [];
        
        if (trades.length === 0) {
            return { dates: [], values: [] };
        }

        const sortedTrades = [...trades].sort((a, b) => new Date(a.trade_date || a.date) - new Date(b.trade_date || b.date));
        
        let cumulativeProfit = 0;
        const cumulativeData = sortedTrades.map(trade => {
            const profit = StorageManager.calculateProfit(trade);
            cumulativeProfit += profit;
            return {
                date: trade.trade_date || trade.date,
                cumulative: cumulativeProfit
            };
        });

        let filteredData = [...cumulativeData];
        const now = new Date();
        
        switch(period) {
            case '7D':
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                filteredData = cumulativeData.filter(d => new Date(d.date) >= weekAgo);
                break;
            case '1M':
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                filteredData = cumulativeData.filter(d => new Date(d.date) >= monthAgo);
                break;
            case '3M':
                const threeMonthsAgo = new Date(now);
                threeMonthsAgo.setMonth(now.getMonth() - 3);
                filteredData = cumulativeData.filter(d => new Date(d.date) >= threeMonthsAgo);
                break;
            case '1Y':
                const yearAgo = new Date(now);
                yearAgo.setFullYear(now.getFullYear() - 1);
                filteredData = cumulativeData.filter(d => new Date(d.date) >= yearAgo);
                break;
            case 'ALL':
            default:
                filteredData = cumulativeData;
                break;
        }

        if (filteredData.length === 0 && cumulativeData.length > 0) {
            filteredData = cumulativeData;
        }

        if (filteredData.length > 0) {
            const firstDate = new Date(filteredData[0].date);
            firstDate.setDate(firstDate.getDate() - 1);
            filteredData.unshift({
                date: firstDate.toISOString().split('T')[0],
                cumulative: 0
            });
        }

        const dates = filteredData.map(d => {
            const date = new Date(d.date);
            switch(period) {
                case '7D':
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                case '1M':
                case '3M':
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                case '1Y':
                    return date.toLocaleDateString('en-US', { month: 'short' });
                default:
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        });

        const values = filteredData.map(d => Math.round(d.cumulative * 100) / 100);

        return { dates, values };
    }
}
document.addEventListener('DOMContentLoaded', function() {
    window.tradingApp = new TradingApp();
});