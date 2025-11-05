// 仪表板组件 - 负责主界面布局和组件协调
class Dashboard {
    constructor() {
        this.components = {};
        this.isInitialized = false;
    }

    /**
     * 初始化仪表板
     */
    async init() {
        if (this.isInitialized) return;

        // 注册组件
        this.registerComponents();
        
        // 初始化组件
        await this.initComponents();
        
        this.isInitialized = true;
        console.log('Dashboard initialized successfully');
    }

    /**
     * 注册组件
     */
    registerComponents() {
        this.components = {
            serverSelector: new ServerSelector(),
            metricCards: new MetricCards(),
            charts: new Charts(),
            systemInfo: new SystemInfoPanel()
        };
    }

    /**
     * 初始化所有组件
     */
    async initComponents() {
        for (const [name, component] of Object.entries(this.components)) {
            try {
                await component.init();
                console.log(`Component ${name} initialized`);
            } catch (error) {
                console.error(`Failed to initialize component ${name}:`, error);
            }
        }
    }

    /**
     * 更新仪表板数据
     */
    update(data) {
        if (!this.isInitialized) return;

        // 更新各组件
        this.components.metricCards.update(data);
        this.components.charts.update(data);
        this.components.systemInfo.update(data);
    }

    /**
     * 切换服务器
     */
    async switchServer(serverId) {
        await this.components.serverSelector.selectServer(serverId);
        this.reset();
    }

    /**
     * 重置仪表板
     */
    reset() {
        this.components.charts.reset();
        this.components.metricCards.reset();
    }

    /**
     * 销毁仪表板
     */
    destroy() {
        Object.values(this.components).forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.isInitialized = false;
    }
}

// 服务器选择器组件
class ServerSelector {
    constructor() {
        this.servers = [];
        this.currentServer = null;
        this.selectElement = null;
    }

    async init() {
        this.selectElement = document.getElementById('serverSelect');
        await this.loadServers();
        this.setupEventListeners();
    }

    async loadServers() {
        try {
            const response = await fetch('config/servers.json');
            const config = await response.json();
            this.servers = config.servers;
            this.populateSelector();
        } catch (error) {
            console.error('Failed to load servers:', error);
            this.servers = this.getDefaultServers();
            this.populateSelector();
        }
    }

    populateSelector() {
        this.selectElement.innerHTML = '';
        this.servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = `${server.name} - ${server.description}`;
            this.selectElement.appendChild(option);
        });
    }

    getDefaultServers() {
        return [{
            id: 'local',
            name: '本地服务器',
            url: 'http://localhost:48877/api/status',
            description: '本地开发环境'
        }];
    }

    setupEventListeners() {
        this.selectElement.addEventListener('change', (e) => {
            this.selectServer(e.target.value);
        });
    }

    async selectServer(serverId) {
        const server = this.servers.find(s => s.id === serverId);
        if (server) {
            this.currentServer = server;
            this.selectElement.value = serverId;
            
            // 触发服务器切换事件
            const event = new CustomEvent('serverChanged', { 
                detail: { server } 
            });
            document.dispatchEvent(event);
        }
    }

    destroy() {
        // 清理事件监听器
        this.selectElement.innerHTML = '';
    }
}

// 指标卡片组件
class MetricCards {
    constructor() {
        this.cards = {};
    }

    async init() {
        this.initializeCards();
    }

    initializeCards() {
        this.cards = {
            cpu: new CPUMetricCard(),
            memory: new MemoryMetricCard(),
            disk: new DiskMetricCard(),
            network: new NetworkMetricCard()
        };
    }

    update(data) {
        Object.values(this.cards).forEach(card => {
            card.update(data);
        });
    }

    reset() {
        Object.values(this.cards).forEach(card => {
            if (card.reset) card.reset();
        });
    }

    destroy() {
        Object.values(this.cards).forEach(card => {
            if (card.destroy) card.destroy();
        });
    }
}

// 图表组件
class Charts {
    constructor() {
        this.chartManager = null;
    }

    async init() {
        this.chartManager = new ChartManager();
        await this.chartManager.init();
    }

    update(data) {
        if (this.chartManager) {
            this.chartManager.update(data);
        }
    }

    reset() {
        if (this.chartManager) {
            this.chartManager.reset();
        }
    }

    destroy() {
        if (this.chartManager) {
            this.chartManager.destroy();
        }
    }
}

// 系统信息面板组件
class SystemInfoPanel {
    constructor() {
        this.elements = {};
    }

    async init() {
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            uptime: document.getElementById('uptime'),
            systemLoad: document.getElementById('systemLoad'),
            lastUpdate: document.getElementById('lastUpdate'),
            apiStatus: document.getElementById('apiStatus')
        };
    }

    update(data) {
        this.updateUptime(data.uptime);
        this.updateSystemLoad(data.system_load);
        this.updateLastUpdate();
        this.updateApiStatus(true);
    }

    updateUptime(uptime) {
        if (this.elements.uptime) {
            this.elements.uptime.textContent = this.formatUptime(uptime);
        }
    }

    updateSystemLoad(load) {
        if (this.elements.systemLoad) {
            const loadStr = `${load.load_1min} / ${load.load_5min} / ${load.load_15min}`;
            this.elements.systemLoad.textContent = loadStr;
        }
    }

    updateLastUpdate() {
        if (this.elements.lastUpdate) {
            const now = new Date();
            this.elements.lastUpdate.textContent = now.toLocaleTimeString('zh-CN');
        }
    }

    updateApiStatus(isOk) {
        if (this.elements.apiStatus) {
            this.elements.apiStatus.textContent = isOk ? '正常' : '异常';
            this.elements.apiStatus.className = isOk ? 
                'info-value status-ok' : 'info-value status-error';
        }
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days}天 ${hours}小时 ${minutes}分钟`;
        } else if (hours > 0) {
            return `${hours}小时 ${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }

    destroy() {
        // 清理
        this.elements = {};
    }
}

// 导出仪表板类
window.Dashboard = Dashboard;