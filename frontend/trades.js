
class TradesPage {
    constructor() {
        if (!API.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        this.currentPage = 1;
        this.tradesPerPage = 10;
        this.filteredTrades = [];
        this.allTrades = [];
        this.init();
    }

    async init() {
        this.setupTheme();
        this.setupMobileMenu();
        this.setupLogout();
        await this.loadTrades();
        this.setupEventListeners();
        this.populateFilters();
        this.setupBackupRestore();
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

    async loadTrades(filters = {}) {
        try {
            this.allTrades = await StorageManager.getTrades(filters);
            this.filteredTrades = [...this.allTrades];
            this.currentPage = 1;
            this.renderTable();
            this.updateStats();
            this.updateFilters();
        } catch (error) {
            console.error('Error loading trades:', error);
            StorageManager.showNotification('Error loading trades', 'error');
        }
    }

    renderTable() {
        const tableBody = document.getElementById('tradesTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableCard = document.querySelector('.table-card');

        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.tradesPerPage;
        const endIndex = startIndex + this.tradesPerPage;
        const pageTrades = this.filteredTrades.slice(startIndex, endIndex);

        if (this.filteredTrades.length === 0) {
            if (tableCard) tableCard.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        } else {
            if (tableCard) tableCard.style.display = 'block';
            if (emptyState) emptyState.style.display = 'none';
        }

        tableBody.innerHTML = '';
        pageTrades.forEach(trade => {
            const profit = StorageManager.calculateProfit(trade);
            const row = document.createElement('tr');
            const hasScreenshots = trade.screenshots && trade.screenshots.length > 0;
            const tradeDate = new Date(trade.trade_date || trade.date);
const formattedDate = !isNaN(tradeDate.getTime()) 
    ? tradeDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '')
    : 'Invalid Date';
            const fullDate = tradeDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            row.innerHTML = `
                <td title="${fullDate}">${formattedDate}</td>
                <td><strong>${trade.asset}</strong></td>
                <td><span class="trade-type ${trade.trade_type || trade.type}">${(trade.trade_type || trade.type) === 'long' ? 'Long' : 'Short'}</span></td>
                <td>$${parseFloat(trade.entry_price || trade.entryPrice).toFixed(2)}</td>
                <td>$${parseFloat(trade.exit_price || trade.exitPrice).toFixed(2)}</td>
                <td>${parseFloat(trade.quantity).toLocaleString()}</td>
                <td class="${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}$${Math.abs(profit).toFixed(2)}</td>
                <td><span class="status-badge ${profit >= 0 ? 'win' : 'loss'}">${profit >= 0 ? 'Win' : 'Loss'}</span></td>
                <td>
                    <div class="action-buttons">
                        ${hasScreenshots ? `<button class="btn-icon view-images" data-id="${trade.id}" title="View Screenshots"><span class="icon icon-eye"></span></button>` : ''}
                        <button class="btn-icon edit-trade" data-id="${trade.id}" title="Edit Trade"><span class="icon icon-edit"></span></button>
                        <button class="btn-icon delete-trade" data-id="${trade.id}" title="Delete Trade"><span class="icon icon-trash"></span></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredTrades.length / this.tradesPerPage);
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');

        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
        }
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages || totalPages === 0;
    }

  updateStats() {
    const totalProfit = this.filteredTrades.reduce((sum, trade) => sum + StorageManager.calculateProfit(trade), 0);
    const winningTrades = this.filteredTrades.filter(t => StorageManager.calculateProfit(t) > 0).length;
    const winRate = this.filteredTrades.length > 0 ? Math.round((winningTrades / this.filteredTrades.length) * 100) : 0;
    const avgProfit = this.filteredTrades.length > 0 ? totalProfit / this.filteredTrades.length : 0;

    this.updateElement('filteredProfit', `$${totalProfit.toFixed(2)}`);
    this.updateElement('filteredWinRate', `${winRate}%`);
    this.updateElement('filteredTrades', this.filteredTrades.length);
    this.updateElement('avgFilteredProfit', `$${avgProfit.toFixed(2)}`);
    this.updateElement('tradeCount', `${this.filteredTrades.length} trades`);
}

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-trade')) {
                const tradeId = parseInt(e.target.closest('.edit-trade').dataset.id);
                this.editTrade(tradeId);
            }
            if (e.target.closest('.delete-trade')) {
                const tradeId = parseInt(e.target.closest('.delete-trade').dataset.id);
                this.deleteTrade(tradeId);
            }
            if (e.target.closest('.view-images')) {
                const tradeId = parseInt(e.target.closest('.view-images').dataset.id);
                this.viewTradeImages(tradeId);
            }
        });

        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredTrades.length / this.tradesPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });

        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
        document.getElementById('exportPDF')?.addEventListener('click', () => this.exportToCSV());
    }

    async applyFilters() {
        const assetFilter = document.getElementById('filterAsset');
        const statusFilter = document.getElementById('filterStatus');
        const typeFilter = document.getElementById('filterType');
        const dateFrom = document.getElementById('filterDateFrom');
        const dateTo = document.getElementById('filterDateTo');

        const filters = {
            asset: assetFilter ? assetFilter.value : 'all',
            type: typeFilter ? typeFilter.value : 'all',
            status: statusFilter ? statusFilter.value : 'all',
            dateFrom: dateFrom ? dateFrom.value : '',
            dateTo: dateTo ? dateTo.value : ''
        };

        await this.loadTrades(filters);
    }

    clearFilters() {
        ['filterAsset', 'filterStatus', 'filterType', 'filterDateFrom', 'filterDateTo'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = 'all' || '';
        });
        this.loadTrades();
    }

    async populateFilters() {
        try {
            const assets = await StorageManager.getAssets();
            const assetSelect = document.getElementById('filterAsset');
            if (assetSelect) {
                while (assetSelect.options.length > 1) {
                    assetSelect.remove(1);
                }
                assets.forEach(asset => {
                    const option = document.createElement('option');
                    option.value = asset;
                    option.textContent = asset;
                    assetSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error populating filters:', error);
        }
    }

    editTrade(tradeId) {
        window.location.href = `add-trade.html?edit=${tradeId}`;
    }

    async deleteTrade(tradeId) {
        if (confirm('Are you sure you want to delete this trade?')) {
            try {
                await StorageManager.deleteTrade(tradeId);
                StorageManager.showNotification('Trade deleted successfully!', 'success');
                await this.loadTrades();
            } catch (error) {
                StorageManager.showNotification('Error deleting trade', 'error');
            }
        }
    }

    viewTradeImages(tradeId) {
        StorageManager.showNotification('View screenshots feature coming soon!', 'success');
    }
    exportToCSV() {
        if (this.filteredTrades.length === 0) {
            StorageManager.showNotification('No trades to export', 'error');
            return;
        }

        try {

            const headers = ['Date', 'Asset', 'Type', 'Entry Price', 'Exit Price', 'Quantity', 'Fees', 'P&L', 'Strategy', 'Emotion'];
            
        
            const rows = this.filteredTrades.map(trade => {
                const profit = StorageManager.calculateProfit(trade);
                return [
                    trade.trade_date || trade.date,
                    trade.asset,
                    trade.trade_type || trade.type,
                    trade.entry_price || trade.entryPrice,
                    trade.exit_price || trade.exitPrice,
                    trade.quantity,
                    trade.fees || 0,
                    profit.toFixed(2),
                    trade.strategy || '',
                    trade.emotion || ''
                ];
            });


            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

    
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            StorageManager.showNotification(`Exported ${this.filteredTrades.length} trades to CSV!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            StorageManager.showNotification('Error exporting trades', 'error');
        }
    }

    async backupData() {
        try {
            const trades = await StorageManager.getTrades();
            const stats = await StorageManager.getStatistics();
            
            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                trades: trades,
                statistics: stats,
                totalTrades: trades.length
            };

    
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            StorageManager.showNotification(`Backup created with ${trades.length} trades!`, 'success');
        } catch (error) {
            console.error('Backup error:', error);
            StorageManager.showNotification('Error creating backup', 'error');
        }
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const backup = JSON.parse(event.target.result);
                    
                        if (!backup.trades || !Array.isArray(backup.trades)) {
                            throw new Error('Invalid backup file');
                        }

                        if (!confirm(`This will restore ${backup.trades.length} trades. Current trades will be replaced. Continue?`)) {
                            return;
                        }

                        const currentTrades = await StorageManager.getTrades();
                        for (const trade of currentTrades) {
                            await StorageManager.deleteTrade(trade.id);
                        }

                     
                        let restored = 0;
                        for (const trade of backup.trades) {
                            const { id, ...tradeData } = trade;
                            await StorageManager.addTrade(tradeData);
                            restored++;
                        }

                        StorageManager.showNotification(`Restored ${restored} trades successfully!`, 'success');
                        
            
                        setTimeout(() => window.location.reload(), 1500);

                    } catch (error) {
                        console.error('Restore error:', error);
                        StorageManager.showNotification('Error restoring data: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            } catch (error) {
                console.error('File read error:', error);
                StorageManager.showNotification('Error reading file', 'error');
            }
        };

        input.click();
    }

    setupBackupRestore() {
        const backupBtn = document.getElementById('backupData');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.backupData());
        }

        const restoreBtn = document.getElementById('restoreData');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.restoreData());
        }
    }

    async updateFilters() {
        try {
            const assets = await StorageManager.getAssets();
            const assetSelect = document.getElementById('filterAsset');
            if (assetSelect) {
                while (assetSelect.options.length > 1) {
                    assetSelect.remove(1);
                }
                assets.forEach(asset => {
                    const option = document.createElement('option');
                    option.value = asset;
                    option.textContent = asset;
                    assetSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error updating filters:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.tradesPage = new TradesPage();
});