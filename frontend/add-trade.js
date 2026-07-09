class AddTradePage {
    constructor() {
        if (!API.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        this.isEditMode = false;
        this.editTradeId = null;
        this.screenshots = [];
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupMobileMenu();
        this.setupLogout();
        this.setupEventListeners();
        this.checkEditMode();
        this.setDefaultDate();
        this.setupLiveCalculations();
        this.setupScreenshotUpload();
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

    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            this.isEditMode = true;
            this.editTradeId = parseInt(editId);
            this.loadTradeForEdit();
        }
    }

    async loadTradeForEdit() {
        try {
            const trade = await StorageManager.getTradeById(this.editTradeId);
            if (!trade) {
                StorageManager.showNotification('Trade not found', 'error');
                return;
            }

            const pageTitle = document.querySelector('.page-title');
            const submitBtn = document.getElementById('submitBtn');
            if (pageTitle) pageTitle.textContent = 'Edit Trade';
            if (submitBtn) submitBtn.innerHTML = '<span class="icon icon-check-circle"></span> Update Trade';

            this.setValue('tradeId', trade.id);
            this.setValue('tradeDate', trade.trade_date || trade.date);
            this.setValue('asset', trade.asset);
            this.setValue('tradeType', trade.trade_type || trade.type);
            this.setValue('quantity', trade.quantity);
            this.setValue('entryPrice', trade.entry_price || trade.entryPrice);
            this.setValue('exitPrice', trade.exit_price || trade.exitPrice);
            this.setValue('stopLoss', trade.stop_loss || trade.stopLoss || '');
            this.setValue('takeProfit', trade.take_profit || trade.takeProfit || '');
            this.setValue('fees', trade.fees || 0);
            this.setValue('strategy', trade.strategy || '');
            this.setValue('emotion', trade.emotion || '');
            this.setValue('setup', trade.setup || '');
            this.setValue('notes', trade.notes || '');
            this.setValue('screenshotNotes', trade.screenshot_notes || trade.screenshotNotes || '');

            if (trade.screenshots && trade.screenshots.length > 0) {
                this.screenshots = trade.screenshots;
                this.renderScreenshots();
            }
            this.calculateProfit();
        } catch (error) {
            console.error('Error loading trade:', error);
            StorageManager.showNotification('Error loading trade data', 'error');
        }
    }

    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value !== null && value !== undefined ? value : '';
    }

    setDefaultDate() {
        if (!this.isEditMode) {
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('tradeDate');
            if (dateInput) {
                dateInput.value = today;
                dateInput.max = today;
            }
        }
    }

    setupEventListeners() {
        document.getElementById('tradeForm')?.addEventListener('submit', (e) => this.handleSubmit(e));
        ['entryPrice', 'exitPrice', 'quantity', 'fees', 'takeProfit'].forEach(field => {
            document.getElementById(field)?.addEventListener('input', () => {
                this.calculateProfit();
            });
        });
    }

    setupScreenshotUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const browseBtn = document.getElementById('browseBtn');
        const fileInput = document.getElementById('screenshotInput');

        if (uploadArea && browseBtn && fileInput) {
            browseBtn.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('click', () => fileInput.click());

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
                uploadArea.style.background = 'var(--bg-primary)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'var(--bg-secondary)';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'var(--bg-secondary)';
                this.handleScreenshotFiles(e.dataTransfer.files);
            });

            fileInput.addEventListener('change', (e) => {
                this.handleScreenshotFiles(e.target.files);
                e.target.value = '';
            });
        }
    }

    handleScreenshotFiles(files) {
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        for (let i = 0; i < Math.min(files.length, maxFiles - this.screenshots.length); i++) {
            const file = files[i];
            if (!allowedTypes.includes(file.type)) {
                StorageManager.showNotification(`File ${file.name} is not a supported image type`, 'error');
                continue;
            }
            if (file.size > maxSize) {
                StorageManager.showNotification(`File ${file.name} is too large (max 5MB)`, 'error');
                continue;
            }
            this.compressAndAddScreenshot(file);
        }
    }

    compressAndAddScreenshot(file) {
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
                const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                // Add to screenshots array
                const screenshot = { data: compressedData, name: file.name, size: file.size, type: file.type };
                if (window.addTradePage) {
                    window.addTradePage.screenshots.push(screenshot);
                    window.addTradePage.renderScreenshots();
                }
            };
        };
    }

    renderScreenshots() {
        const preview = document.getElementById('screenshotPreview');
        if (!preview) return;
        preview.innerHTML = '';
        if (this.screenshots.length === 0) {
            preview.innerHTML = '<p class="text-muted">No screenshots uploaded</p>';
            return;
        }
        this.screenshots.forEach((screenshot, index) => {
            const item = document.createElement('div');
            item.className = 'screenshot-item';
            item.innerHTML = `
                <img src="${screenshot.data}" alt="Trade screenshot ${index + 1}">
                <button type="button" class="screenshot-remove" data-index="${index}"><span class="icon icon-times"></span></button>
            `;
            preview.appendChild(item);
        });
        preview.querySelectorAll('.screenshot-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.screenshot-remove').dataset.index);
                this.removeScreenshot(index);
            });
        });
    }

    removeScreenshot(index) {
        this.screenshots.splice(index, 1);
        this.renderScreenshots();
    }

    setupLiveCalculations() {
        this.calculateProfit();
    }

    calculateProfit() {
        const entryPrice = parseFloat(document.getElementById('entryPrice')?.value) || 0;
        const exitPrice = parseFloat(document.getElementById('exitPrice')?.value) || 0;
        const quantity = parseFloat(document.getElementById('quantity')?.value) || 0;
        const fees = parseFloat(document.getElementById('fees')?.value) || 0;
        const tradeType = document.getElementById('tradeType')?.value;

        if (!entryPrice || !exitPrice || !quantity || !tradeType) {
            return;
        }

        const priceDifference = exitPrice - entryPrice;
        const direction = tradeType === 'long' ? 1 : -1;
        const grossProfit = priceDifference * direction * quantity;
        const netProfit = grossProfit - fees;
        const investment = entryPrice * quantity;
        const roi = investment > 0 ? (netProfit / investment) * 100 : 0;

        let riskReward = '-';
        const stopLoss = parseFloat(document.getElementById('stopLoss')?.value);
        const takeProfit = parseFloat(document.getElementById('takeProfit')?.value);

        if (stopLoss && takeProfit) {
            const risk = Math.abs(entryPrice - stopLoss);
            const reward = Math.abs(takeProfit - entryPrice);
            if (risk > 0) {
                riskReward = `1:${(reward / risk).toFixed(2)}`;
            }
        }

        const profitElement = document.getElementById('profitPreview');
        if (profitElement) {
            profitElement.textContent = netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`;
            profitElement.className = `profit-value ${netProfit >= 0 ? 'positive' : 'negative'}`;
        }

        this.updateElement('riskRewardRatio', riskReward);
        this.updateElement('roi', `${roi.toFixed(2)}%`);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    validateForm() {
        let isValid = true;
        const requiredFields = ['tradeDate', 'asset', 'tradeType', 'quantity', 'entryPrice', 'exitPrice'];

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            if (!input || !input.value.trim()) {
                isValid = false;
                if (input) input.classList.add('error');
                if (errorElement) errorElement.textContent = 'This field is required';
            } else {
                if (input) input.classList.remove('error');
                if (errorElement) errorElement.textContent = '';
            }
        });

        const quantity = document.getElementById('quantity');
        if (quantity && quantity.value <= 0) {
            isValid = false;
            quantity.classList.add('error');
            const errorElement = document.getElementById('quantityError');
            if (errorElement) errorElement.textContent = 'Quantity must be greater than 0';
        }

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) {
            StorageManager.showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        const trade = {
            date: document.getElementById('tradeDate').value,
            asset: document.getElementById('asset').value.toUpperCase(),
            type: document.getElementById('tradeType').value,
            entryPrice: parseFloat(document.getElementById('entryPrice').value),
            exitPrice: parseFloat(document.getElementById('exitPrice').value),
            quantity: parseFloat(document.getElementById('quantity').value),
            fees: parseFloat(document.getElementById('fees').value) || 0,
            stopLoss: document.getElementById('stopLoss').value ? parseFloat(document.getElementById('stopLoss').value) : null,
            takeProfit: document.getElementById('takeProfit').value ? parseFloat(document.getElementById('takeProfit').value) : null,
            strategy: document.getElementById('strategy').value || null,
            emotion: document.getElementById('emotion').value || null,
            setup: document.getElementById('setup').value || '',
            notes: document.getElementById('notes').value || '',
            screenshots: this.screenshots,
            screenshotNotes: document.getElementById('screenshotNotes').value || ''
        };

        try {
            if (this.isEditMode) {
                const tradeId = document.getElementById('tradeId').value;
                await StorageManager.updateTrade(parseInt(tradeId), trade);
                StorageManager.showNotification('Trade updated successfully!', 'success');
                setTimeout(() => window.location.href = 'trades.html', 1500);
            } else {
                await StorageManager.addTrade(trade);
                StorageManager.showNotification('Trade saved successfully!', 'success');
                document.getElementById('tradeForm').reset();
                this.screenshots = [];
                this.renderScreenshots();
                this.setDefaultDate();
                this.calculateProfit();
            }
        } catch (error) {
            console.error('Error saving trade:', error);
            StorageManager.showNotification('Error saving trade: ' + error.message, 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.addTradePage = new AddTradePage();
});