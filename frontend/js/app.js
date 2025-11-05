// 服务器监控系统 - 主应用逻辑
class ServerMonitor {
    constructor() {
        this.currentServer = null;
        this.servers = [];
        this.refreshInterval = 5000; // 默认5秒更新间隔
        this.timer = null;
        this.isFirstLoad = true; // 首次加载标志
        this.dataHistory = {
            cpu: [],
            memory: [],
            network: [],
            disk: []
        };
        this.maxHistoryPoints = 60;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        await this.loadServerConfig();
        this.setupEventListeners();
        this.startTimeUpdate();
        
        // 仅在首次加载时显示加载动画
        if (this.isFirstLoad) {
            this.showLoading();
            this.isFirstLoad = false;
        }
        
        await this.loadInitialData();
        this.startAutoRefresh();
    }

    /**
     * 从配置文件加载服务器列表
     */
    async loadServerConfig() {
        try {
            const response = await fetch('config/servers.json');
            if (!response.ok) {
                throw new Error('无法加载服务器配置文件');
            }
            
            const config = await response.json();
            this.servers = config.servers;
            this.minRefreshInterval = config.minRefreshInterval || 5000;
            
            // 填充服务器选择器
            this.populateServerSelector();
            
            // 设置默认服务器
            this.selectDefaultServer(config.defaultServer);
            
        } catch (error) {
            console.error('加载服务器配置失败:', error);
            this.showError('无法加载服务器列表');
            // 使用默认配置
            this.servers = [
                {
                    id: 'local',
                    name: '本地服务器',
                    url: 'http://localhost:48877/api/status',
                    description: '本地开发环境'
                }
            ];
            this.populateServerSelector();
        }
    }

    /**
     * 填充服务器选择器
     */
    populateServerSelector() {
        const serverSelect = document.getElementById('serverSelect');
        serverSelect.innerHTML = '';
        
        this.servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = `${server.name} - ${server.description}`;
            serverSelect.appendChild(option);
        });
    }

    /**
     * 选择默认服务器
     */
    selectDefaultServer(serverId) {
        const server = this.servers.find(s => s.id === serverId) || this.servers[0];
        if (server) {
            this.currentServer = server;
            document.getElementById('serverSelect').value = server.id;
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 服务器选择器
        document.getElementById('serverSelect').addEventListener('change', (e) => {
            this.changeServer(e.target.value);
        });

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // 更新间隔选择
        document.getElementById('intervalSelect').addEventListener('change', (e) => {
            this.refreshInterval = parseInt(e.target.value);
            this.restartAutoRefresh();
        });

        // 图表标签页切换
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchChart(tab.dataset.chart);
            });
        });

        // 错误提示关闭
        document.getElementById('closeToast').addEventListener('click', () => {
            this.hideError();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.refreshData();
            }
        });
    }

    /**
     * 切换服务器
     */
    async changeServer(serverId) {
        const server = this.servers.find(s => s.id === serverId);
        if (!server) return;

        this.currentServer = server;
        
        // 停止当前自动刷新
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // 重置数据历史
        this.resetDataHistory();

        // 显示连接服务器的加载状态
        this.showLoading('正在连接服务器...');
        
        try {
            await this.fetchData();
            this.hideLoading();
            this.startAutoRefresh();
        } catch (error) {
            this.hideLoading();
            this.showError(`无法连接到服务器: ${server.name}`);
            // 尝试重新连接
            setTimeout(() => this.startAutoRefresh(), 5000);
        }
    }

    /**
     * 重置数据历史
     */
    resetDataHistory() {
        this.dataHistory = {
            cpu: [],
            memory: [],
            network: [],
            disk: []
        };
        
        // 重置图表
        if (window.chartManager) {
            window.chartManager.resetCharts();
        }
    }

    /**
     * 条件式文本更新方法
     */
    updateTextIfChanged(element, newText) {
        if (element && element.textContent !== newText) {
            element.textContent = newText;
        }
    }

    /**
     * 开始实时时钟更新
     */
    startTimeUpdate() {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('zh-CN');
            this.updateTextIfChanged(document.getElementById('currentTime'), timeStr);
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    /**
     * 加载初始数据
     */
    async loadInitialData() {
        try {
            await this.fetchData();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('初始化数据加载失败');
        }
    }

    /**
     * 获取服务器数据（优化版本，避免闪烁）
     */
    async fetchData() {
        if (!this.currentServer) {
            throw new Error('未选择服务器');
        }

        try {
            const response = await fetch(this.currentServer.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.updateUI(data);
            this.updateHistory(data);
            this.updateApiStatus(true);
            
        } catch (error) {
            console.error('获取数据失败:', error);
            this.updateApiStatus(false);
            throw error;
        }
    }

    /**
     * 更新UI界面（无闪烁版本）
     */
    updateUI(data) {
        // 条件式更新，仅在值发生变化时更新DOM
        this.updateCPUInfo(data.cpu);
        this.updateMemoryInfo(data.memory);
        this.updateDiskInfo(data.disk_io);
        this.updateNetworkInfo(data.network);
        this.updateSystemInfo(data);
        
        // 无动画效果，确保界面稳定
    }



    /**
     * 更新CPU信息显示（无闪烁版本）
     */
    updateCPUInfo(cpu) {
        const cpuUsage = document.getElementById('cpuUsage');
        const cpuCores = document.getElementById('cpuCores');
        const cpuFreq = document.getElementById('cpuFreq');
        const cpuRing = document.getElementById('cpuRing');

        // 条件式更新，避免不必要的DOM操作
        this.updateTextIfChanged(cpuUsage, `${cpu.usage_percent}%`);
        this.updateTextIfChanged(cpuCores, cpu.core_count.toString());
        this.updateTextIfChanged(cpuFreq, `${(cpu.current_freq / 1000).toFixed(2)} GHz`);

        // 直接更新进度环，无动画效果
        const circumference = 2 * Math.PI * 35;
        const offset = circumference - (cpu.usage_percent / 100) * circumference;
        cpuRing.style.strokeDasharray = `${circumference} ${circumference}`;
        cpuRing.style.strokeDashoffset = offset;

        // 根据使用率设置颜色，无过渡效果
        if (cpu.usage_percent > 80) {
            cpuRing.style.stroke = 'var(--danger-color)';
            cpuUsage.style.color = 'var(--danger-color)';
        } else if (cpu.usage_percent > 60) {
            cpuRing.style.stroke = 'var(--warning-color)';
            cpuUsage.style.color = 'var(--warning-color)';
        } else {
            cpuRing.style.stroke = 'var(--primary-color)';
            cpuUsage.style.color = 'var(--primary-color)';
        }
    }

    /**
     * 更新内存信息显示
     */
    updateMemoryInfo(memory) {
        const memoryUsage = document.getElementById('memoryUsage');
        const memoryUsed = document.getElementById('memoryUsed');
        const memoryTotal = document.getElementById('memoryTotal');
        const memoryRing = document.getElementById('memoryRing');

        // 仅在值变化时更新
        if (memoryUsage.textContent !== `${memory.usage_percent}%`) {
            memoryUsage.textContent = `${memory.usage_percent}%`;
        }
        const usedGb = `${(memory.used / 1024 / 1024 / 1024).toFixed(1)} GB`;
        if (memoryUsed.textContent !== usedGb) {
            memoryUsed.textContent = usedGb;
        }
        const totalGb = `${(memory.total / 1024 / 1024 / 1024).toFixed(1)} GB`;
        if (memoryTotal.textContent !== totalGb) {
            memoryTotal.textContent = totalGb;
        }

        // 更新进度环
        const circumference = 2 * Math.PI * 35;
        const offset = circumference - (memory.usage_percent / 100) * circumference;
        memoryRing.style.strokeDasharray = `${circumference} ${circumference}`;
        memoryRing.style.strokeDashoffset = offset;

        // 根据使用率设置颜色
        if (memory.usage_percent > 80) {
            memoryRing.style.stroke = 'var(--danger-color)';
            memoryUsage.style.color = 'var(--danger-color)';
        } else if (memory.usage_percent > 60) {
            memoryRing.style.stroke = 'var(--warning-color)';
            memoryUsage.style.color = 'var(--warning-color)';
        } else {
            memoryRing.style.stroke = 'var(--secondary-color)';
            memoryUsage.style.color = 'var(--secondary-color)';
        }
    }

    /**
     * 更新磁盘I/O信息显示
     */
    updateDiskInfo(disk) {
        const diskRead = document.getElementById('diskRead');
        const diskWrite = document.getElementById('diskWrite');

        const readSpeed = `${disk.read_speed_mb} MB/s`;
        const writeSpeed = `${disk.write_speed_mb} MB/s`;

        if (diskRead.textContent !== readSpeed) {
            diskRead.textContent = readSpeed;
        }
        if (diskWrite.textContent !== writeSpeed) {
            diskWrite.textContent = writeSpeed;
        }
    }

    /**
     * 更新网络信息显示
     */
    updateNetworkInfo(network) {
        const networkUpload = document.getElementById('networkUpload');
        const networkDownload = document.getElementById('networkDownload');
        const todayTraffic = document.getElementById('todayTraffic');

        const uploadSpeed = `${network.upload_speed_mb} MB/s`;
        const downloadSpeed = `${network.download_speed_mb} MB/s`;
        const totalTraffic = `${(network.today_upload_gb + network.today_download_gb).toFixed(2)} GB`;

        if (networkUpload.textContent !== uploadSpeed) {
            networkUpload.textContent = uploadSpeed;
        }
        if (networkDownload.textContent !== downloadSpeed) {
            networkDownload.textContent = downloadSpeed;
        }
        if (todayTraffic.textContent !== totalTraffic) {
            todayTraffic.textContent = totalTraffic;
        }
    }

    /**
     * 更新系统信息显示
     */
    updateSystemInfo(data) {
        const uptime = document.getElementById('uptime');
        const systemLoad = document.getElementById('systemLoad');
        const lastUpdate = document.getElementById('lastUpdate');

        // 格式化运行时间
        const uptimeStr = this.formatUptime(data.uptime);
        if (uptime.textContent !== uptimeStr) {
            uptime.textContent = uptimeStr;
        }

        // 格式化系统负载
        const loadStr = `${data.system_load.load_1min} / ${data.system_load.load_5min} / ${data.system_load.load_15min}`;
        if (systemLoad.textContent !== loadStr) {
            systemLoad.textContent = loadStr;
        }

        // 更新最后更新时间
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN');
        if (lastUpdate.textContent !== timeStr) {
            lastUpdate.textContent = timeStr;
        }
    }

    /**
     * 格式化运行时间
     */
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

    /**
     * 更新数据历史记录
     */
    updateHistory(data) {
        const timestamp = new Date(data.timestamp);

        // CPU历史数据
        this.dataHistory.cpu.push({
            time: timestamp,
            usage: data.cpu.usage_percent
        });

        // 内存历史数据
        this.dataHistory.memory.push({
            time: timestamp,
            usage: data.memory.usage_percent,
            used: data.memory.used / 1024 / 1024 / 1024 // GB
        });

        // 网络历史数据
        this.dataHistory.network.push({
            time: timestamp,
            upload: data.network.upload_speed_mb,
            download: data.network.download_speed_mb
        });

        // 磁盘历史数据
        this.dataHistory.disk.push({
            time: timestamp,
            read: data.disk_io.read_speed_mb,
            write: data.disk_io.write_speed_mb
        });

        // 保持历史数据长度
        Object.keys(this.dataHistory).forEach(key => {
            if (this.dataHistory[key].length > this.maxHistoryPoints) {
                this.dataHistory[key].shift();
            }
        });

        // 更新图表
        if (window.chartManager) {
            window.chartManager.updateCharts(this.dataHistory);
        }
    }

    /**
     * 切换图表显示
     */
    switchChart(chartType) {
        // 更新标签页状态
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

        // 更新图表显示
        document.querySelectorAll('.chart-wrapper').forEach(wrapper => {
            wrapper.classList.remove('active');
        });
        document.getElementById(`${chartType}Chart`).classList.add('active');
    }

    /**
     * 更新API状态显示
     */
    updateApiStatus(isOk) {
        const apiStatus = document.getElementById('apiStatus');
        if (isOk) {
            apiStatus.textContent = '正常';
            apiStatus.className = 'info-value status-ok';
        } else {
            apiStatus.textContent = '异常';
            apiStatus.className = 'info-value status-error';
        }
    }

    /**
     * 手动刷新数据（优化版本）
     */
    async refreshData() {
        const btn = document.getElementById('refreshBtn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>刷新中...';

        try {
            await this.fetchData();
        } catch (error) {
            this.showError('数据刷新失败');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }, 300); // 短暂延迟避免闪烁
        }
    }

    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.fetchData().catch(error => {
                console.error('自动刷新失败:', error);
            });
        }, this.refreshInterval);
    }

    /**
     * 重启自动刷新
     */
    restartAutoRefresh() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.startAutoRefresh();
    }

    /**
     * 显示加载遮罩
     */
    showLoading(message = '正在连接服务器...') {
        const loadingContent = document.querySelector('.loading-content p');
        loadingContent.textContent = message;
        document.getElementById('loadingOverlay').classList.add('show');
    }

    /**
     * 隐藏加载遮罩
     */
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    /**
     * 显示错误提示
     */
    showError(message) {
        const toast = document.getElementById('errorToast');
        const errorMsg = document.getElementById('errorMessage');
        
        errorMsg.textContent = message;
        toast.classList.add('show');

        // 5秒后自动隐藏
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    /**
     * 隐藏错误提示
     */
    hideError() {
        document.getElementById('errorToast').classList.remove('show');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.serverMonitor = new ServerMonitor();
});