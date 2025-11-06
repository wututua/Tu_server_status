/**
 * 检测前端网络连接状态和显卡信息
 * @returns {Object} 包含网络状态和显卡信息的对象
 */
function detectClientHardware() {
    const result = {
        network: {
            status: 'unknown',
            isOnline: false,
            error: null
        },
        graphics: {
            vendor: 'unknown',
            renderer: 'unknown',
            hasWebGL: false,
            error: null
        }
    };

    try {
        // 1. 检测网络连接状态
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            result.network.isOnline = navigator.onLine;
            result.network.status = navigator.onLine ? 'online' : 'offline';
            
            // 添加网络状态变化的监听器
            if (typeof window !== 'undefined') {
                window.addEventListener('online', () => {
                    console.log('网络连接已恢复');
                    result.network.isOnline = true;
                    result.network.status = 'online';
                });
                
                window.addEventListener('offline', () => {
                    console.log('网络连接已断开');
                    result.network.isOnline = false;
                    result.network.status = 'offline';
                });
            }
        } else {
            result.network.error = '浏览器不支持网络状态检测';
        }

        // 2. 检测显卡信息（通过WebGL）
        const canvas = document.createElement('canvas');
        let gl = null;
        
        // 尝试获取WebGL上下文
        const contexts = ['webgl', 'experimental-webgl', 'webgl2'];
        for (const contextType of contexts) {
            try {
                gl = canvas.getContext(contextType);
                if (gl) break;
            } catch (e) {
                // 继续尝试下一个上下文类型
                continue;
            }
        }

        if (gl) {
            result.graphics.hasWebGL = true;
            
            // 获取显卡信息
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                result.graphics.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
                result.graphics.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
            } else {
                // 如果无法获取详细的显卡信息，尝试获取基本信息
                try {
                    const vendor = gl.getParameter(gl.VENDOR) || 'unknown';
                    const renderer = gl.getParameter(gl.RENDERER) || 'unknown';
                    
                    result.graphics.vendor = vendor;
                    result.graphics.renderer = renderer;
                } catch (e) {
                    result.graphics.error = '无法获取显卡详细信息: ' + e.message;
                }
            }
            
            // 检查WebGL功能支持
            result.graphics.extensions = gl.getSupportedExtensions() || [];
            
        } else {
            result.graphics.error = '浏览器不支持WebGL或WebGL被禁用';
            result.graphics.hasWebGL = false;
        }
        
    } catch (error) {
        console.error('硬件检测失败:', error);
        
        // 提供详细的错误信息
        if (error.name === 'SecurityError') {
            result.graphics.error = '安全限制：无法访问显卡信息（可能是跨域问题）';
        } else if (error.name === 'TypeError') {
            result.graphics.error = '类型错误：显卡检测参数无效';
        } else {
            result.graphics.error = `检测失败: ${error.name} - ${error.message}`;
        }
    }

    return result;
}

/**
 * 格式化并显示客户端硬件信息
 * @param {Object} hardwareInfo - 硬件检测结果
 */
function displayClientHardwareInfo(hardwareInfo) {
    // 隐藏硬件信息显示，仅在控制台输出
    console.log('客户端硬件信息:', hardwareInfo);
    
    // 清理可能存在的旧信息面板
    const existingInfo = document.querySelector('.client-hardware-info');
    if (existingInfo) {
        existingInfo.remove();
    }
}

/**
 * 定期检测客户端硬件状态
 */
function startClientHardwareMonitoring() {
    // 初始检测
    const hardwareInfo = detectClientHardware();
    displayClientHardwareInfo(hardwareInfo);
    
    // 定期更新网络状态（每30秒）
    setInterval(() => {
        const currentInfo = detectClientHardware();
        displayClientHardwareInfo(currentInfo);
    }, 30000);
    
    return hardwareInfo;
}

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
        
        // 检测客户端硬件信息
        this.clientHardwareInfo = startClientHardwareMonitoring();
        
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
     * 更新UI界面
     */
    updateUI(data) {
        // 条件式更新，仅在值发生变化时更新DOM
        this.updateCPUInfo(data.cpu);
        this.updateMemoryInfo(data.memory);
        this.updateDiskInfo(data.disk_io);
        this.updateNetworkInfo(data.network);
        this.updateSystemInfo(data);
        
        // 新增功能更新
        this.updateNetworkConnections(data.network_connections);
        this.updateGPUInfo(data.gpu);
        this.updateVersionInfo(data.version);
        
        // 无动画效果，确保界面稳定
    }



    /**
     * 更新CPU信息显示
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
     * 更新网络连接数信息
     */
    updateNetworkConnections(connections) {
        const connectionsElement = document.getElementById('networkConnections');
        const activeConnectionsElement = document.getElementById('activeConnections');
        const statusElement = document.getElementById('connectionsStatus');
        
        if (connectionsElement) {
            this.updateTextIfChanged(connectionsElement, connections.toString());
        }
        
        if (activeConnectionsElement) {
            this.updateTextIfChanged(activeConnectionsElement, connections.toString());
        }
        
        if (statusElement) {
            if (connections > 1000) {
                statusElement.textContent = '高负载';
                statusElement.className = 'info-value status-error';
            } else if (connections > 500) {
                statusElement.textContent = '中等';
                statusElement.className = 'info-value status-warning';
            } else {
                statusElement.textContent = '正常';
                statusElement.className = 'info-value status-ok';
            }
        }
    }

    /**
     * 更新显卡信息
     */
    updateGPUInfo(gpu) {
        const gpuUsageElement = document.getElementById('gpuUsage');
        const gpuMemoryUsedElement = document.getElementById('gpuMemoryUsed');
        const gpuMemoryTotalElement = document.getElementById('gpuMemoryTotal');
        const gpuNameElement = document.getElementById('gpuName');
        const gpuRingElement = document.getElementById('gpuRing');
        
        if (!gpu.has_gpu) {
            // 没有显卡的情况
            if (gpuUsageElement) {
                gpuUsageElement.textContent = '无显卡';
                gpuUsageElement.style.color = 'var(--text-muted)';
            }
            if (gpuMemoryUsedElement) {
                gpuMemoryUsedElement.textContent = '--';
            }
            if (gpuMemoryTotalElement) {
                gpuMemoryTotalElement.textContent = '--';
            }
            if (gpuNameElement) {
                gpuNameElement.textContent = '该服务器无显卡';
            }
            if (gpuRingElement) {
                gpuRingElement.style.display = 'none';
            }
        } else {
            // 有显卡的情况
            if (gpuUsageElement) {
                this.updateTextIfChanged(gpuUsageElement, `${gpu.gpu_usage}%`);
                
                // 根据使用率设置颜色
                if (gpu.gpu_usage > 80) {
                    gpuUsageElement.style.color = 'var(--danger-color)';
                } else if (gpu.gpu_usage > 60) {
                    gpuUsageElement.style.color = 'var(--warning-color)';
                } else {
                    gpuUsageElement.style.color = 'var(--warning-color)';
                }
            }
            
            if (gpuMemoryUsedElement) {
                this.updateTextIfChanged(gpuMemoryUsedElement, `${(gpu.gpu_memory_used / 1024).toFixed(1)} GB`);
            }
            
            if (gpuMemoryTotalElement) {
                this.updateTextIfChanged(gpuMemoryTotalElement, `${(gpu.gpu_memory_total / 1024).toFixed(1)} GB`);
            }
            
            if (gpuNameElement) {
                this.updateTextIfChanged(gpuNameElement, gpu.gpu_name);
            }
            
            if (gpuRingElement) {
                gpuRingElement.style.display = 'block';
                const circumference = 2 * Math.PI * 35;
                const offset = circumference - (gpu.gpu_usage / 100) * circumference;
                gpuRingElement.style.strokeDasharray = `${circumference} ${circumference}`;
                gpuRingElement.style.strokeDashoffset = offset;
                
                // 根据使用率设置颜色
                if (gpu.gpu_usage > 80) {
                    gpuRingElement.style.stroke = 'var(--danger-color)';
                } else if (gpu.gpu_usage > 60) {
                    gpuRingElement.style.stroke = 'var(--warning-color)';
                } else {
                    gpuRingElement.style.stroke = 'var(--warning-color)';
                }
            }
        }
    }

    /**
     * 更新版本信息
     */
    updateVersionInfo(version) {
        const versionElement = document.getElementById('backendVersion');
        if (versionElement) {
            this.updateTextIfChanged(versionElement, `版本: ${version}`);
        }
    }

    /**
     * 更新网络连接数信息
     */
    updateNetworkConnections(connections) {
        const connectionsElement = document.getElementById('networkConnections');
        const activeConnectionsElement = document.getElementById('activeConnections');
        const statusElement = document.getElementById('connectionsStatus');
        
        if (connectionsElement) {
            this.updateTextIfChanged(connectionsElement, connections.toString());
        }
        
        if (activeConnectionsElement) {
            this.updateTextIfChanged(activeConnectionsElement, connections.toString());
        }
        
        if (statusElement) {
            if (connections > 1000) {
                statusElement.textContent = '高负载';
                statusElement.className = 'info-value status-error';
            } else if (connections > 500) {
                statusElement.textContent = '中等';
                statusElement.className = 'info-value status-warning';
            } else {
                statusElement.textContent = '正常';
                statusElement.className = 'info-value status-ok';
            }
        }
    }

    /**
     * 更新显卡信息
     */
    updateGPUInfo(gpu) {
        const gpuUsageElement = document.getElementById('gpuUsage');
        const gpuMemoryUsedElement = document.getElementById('gpuMemoryUsed');
        const gpuMemoryTotalElement = document.getElementById('gpuMemoryTotal');
        const gpuNameElement = document.getElementById('gpuName');
        const gpuRingElement = document.getElementById('gpuRing');
        
        if (!gpu.has_gpu) {
            // 没有显卡的情况
            if (gpuUsageElement) {
                gpuUsageElement.textContent = '无显卡';
                gpuUsageElement.style.color = 'var(--text-muted)';
            }
            if (gpuMemoryUsedElement) {
                gpuMemoryUsedElement.textContent = '--';
            }
            if (gpuMemoryTotalElement) {
                gpuMemoryTotalElement.textContent = '--';
            }
            if (gpuNameElement) {
                gpuNameElement.textContent = '该服务器无显卡';
            }
            if (gpuRingElement) {
                gpuRingElement.style.display = 'none';
            }
        } else {
            // 有显卡的情况
            if (gpuUsageElement) {
                this.updateTextIfChanged(gpuUsageElement, `${gpu.gpu_usage}%`);
                
                // 根据使用率设置颜色
                if (gpu.gpu_usage > 80) {
                    gpuUsageElement.style.color = 'var(--danger-color)';
                } else if (gpu.gpu_usage > 60) {
                    gpuUsageElement.style.color = 'var(--warning-color)';
                } else {
                    gpuUsageElement.style.color = 'var(--warning-color)';
                }
            }
            
            if (gpuMemoryUsedElement) {
                this.updateTextIfChanged(gpuMemoryUsedElement, `${(gpu.gpu_memory_used / 1024).toFixed(1)} GB`);
            }
            
            if (gpuMemoryTotalElement) {
                this.updateTextIfChanged(gpuMemoryTotalElement, `${(gpu.gpu_memory_total / 1024).toFixed(1)} GB`);
            }
            
            if (gpuNameElement) {
                this.updateTextIfChanged(gpuNameElement, gpu.gpu_name);
            }
            
            if (gpuRingElement) {
                gpuRingElement.style.display = 'block';
                const circumference = 2 * Math.PI * 35;
                const offset = circumference - (gpu.gpu_usage / 100) * circumference;
                gpuRingElement.style.strokeDasharray = `${circumference} ${circumference}`;
                gpuRingElement.style.strokeDashoffset = offset;
                
                // 根据使用率设置颜色
                if (gpu.gpu_usage > 80) {
                    gpuRingElement.style.stroke = 'var(--danger-color)';
                } else if (gpu.gpu_usage > 60) {
                    gpuRingElement.style.stroke = 'var(--warning-color)';
                } else {
                    gpuRingElement.style.stroke = 'var(--warning-color)';
                }
            }
        }
    }

    /**
     * 更新版本信息
     */
    updateVersionInfo(version) {
        const versionElement = document.getElementById('backendVersion');
        if (versionElement) {
            this.updateTextIfChanged(versionElement, `版本: ${version}`);
        }
    }

    /**
     * 更新网络连接数信息
     */
    updateNetworkConnections(connections) {
        const connectionsElement = document.getElementById('networkConnections');
        const activeConnectionsElement = document.getElementById('activeConnections');
        const statusElement = document.getElementById('connectionsStatus');
        
        if (connectionsElement) {
            this.updateTextIfChanged(connectionsElement, connections.toString());
        }
        
        if (activeConnectionsElement) {
            this.updateTextIfChanged(activeConnectionsElement, connections.toString());
        }
        
        if (statusElement) {
            if (connections > 1000) {
                statusElement.textContent = '高负载';
                statusElement.className = 'info-value status-error';
            } else if (connections > 500) {
                statusElement.textContent = '中等';
                statusElement.className = 'info-value status-warning';
            } else {
                statusElement.textContent = '正常';
                statusElement.className = 'info-value status-ok';
            }
        }
    }

    /**
     * 更新显卡信息
     */
    updateGPUInfo(gpu) {
        const gpuUsageElement = document.getElementById('gpuUsage');
        const gpuMemoryUsedElement = document.getElementById('gpuMemoryUsed');
        const gpuMemoryTotalElement = document.getElementById('gpuMemoryTotal');
        const gpuNameElement = document.getElementById('gpuName');
        const gpuRingElement = document.getElementById('gpuRing');
        
        if (!gpu.has_gpu) {
            // 没有显卡的情况
            if (gpuUsageElement) {
                gpuUsageElement.textContent = '无显卡';
                gpuUsageElement.style.color = 'var(--text-muted)';
            }
            if (gpuMemoryUsedElement) {
                gpuMemoryUsedElement.textContent = '--';
            }
            if (gpuMemoryTotalElement) {
                gpuMemoryTotalElement.textContent = '--';
            }
            if (gpuNameElement) {
                gpuNameElement.textContent = '该服务器无显卡';
            }
            if (gpuRingElement) {
                gpuRingElement.style.display = 'none';
            }
        } else {
            // 有显卡的情况
            if (gpuUsageElement) {
                this.updateTextIfChanged(gpuUsageElement, `${gpu.gpu_usage}%`);
                
                // 根据使用率设置颜色
                if (gpu.gpu_usage > 80) {
                    gpuUsageElement.style.color = 'var(--danger-color)';
                } else if (gpu.gpu_usage > 60) {
                    gpuUsageElement.style.color = 'var(--warning-color)';
                } else {
                    gpuUsageElement.style.color = 'var(--warning-color)';
                }
            }
            
            if (gpuMemoryUsedElement) {
                this.updateTextIfChanged(gpuMemoryUsedElement, `${(gpu.gpu_memory_used / 1024).toFixed(1)} GB`);
            }
            
            if (gpuMemoryTotalElement) {
                this.updateTextIfChanged(gpuMemoryTotalElement, `${(gpu.gpu_memory_total / 1024).toFixed(1)} GB`);
            }
            
            if (gpuNameElement) {
                this.updateTextIfChanged(gpuNameElement, gpu.gpu_name);
            }
            
            if (gpuRingElement) {
                gpuRingElement.style.display = 'block';
                const circumference = 2 * Math.PI * 35;
                const offset = circumference - (gpu.gpu_usage / 100) * circumference;
                gpuRingElement.style.strokeDasharray = `${circumference} ${circumference}`;
                gpuRingElement.style.strokeDashoffset = offset;
                
                // 根据使用率设置颜色
                if (gpu.gpu_usage > 80) {
                    gpuRingElement.style.stroke = 'var(--danger-color)';
                } else if (gpu.gpu_usage > 60) {
                    gpuRingElement.style.stroke = 'var(--warning-color)';
                } else {
                    gpuRingElement.style.stroke = 'var(--warning-color)';
                }
            }
        }
    }

    /**
     * 更新版本信息
     */
    updateVersionInfo(version) {
        const versionElement = document.getElementById('backendVersion');
        if (versionElement) {
            this.updateTextIfChanged(versionElement, `版本: ${version}`);
        }
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
    
    // 初始化系统信息卡片
    try {
        window.systemInfoCard = new SystemInfoCard('systemInfoCardContainer');
        console.log('系统信息卡片组件初始化成功');
    } catch (error) {
        console.error('系统信息卡片组件初始化失败:', error);
    }
});