// 系统信息卡片组件
class SystemInfoCard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isExpanded = false;
        this.systemData = null;
        
        // 初始化组件
        this.init();
        this.loadSystemInfo();
        
        // 定期刷新数据（每30秒）
        setInterval(() => this.loadSystemInfo(), 30000);
    }
    
    init() {
        this.container.innerHTML = `
            <div class="system-info-card">
                <div class="system-info-header" onclick="systemInfoCard.toggleExpand()">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-microchip"></i>
                            <span>系统信息</span>
                        </div>
                        <div class="header-actions">
                            <span class="last-update" id="systemLastUpdate">--</span>
                            <i class="expand-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                </div>
                <div class="system-info-content">
                    <!-- 基本系统信息 -->
                    <div class="system-basic-info">
                        <div class="system-item">
                            <i class="fas fa-desktop"></i>
                            <div class="item-content">
                                <span class="item-label">操作系统</span>
                                <span class="item-value" id="systemOs">--</span>
                            </div>
                        </div>
                        <div class="system-item">
                            <i class="fas fa-code-branch"></i>
                            <div class="item-content">
                                <span class="item-label">架构</span>
                                <span class="item-value" id="systemArch">--</span>
                            </div>
                        </div>
                        <div class="system-item">
                            <i class="fas fa-clock"></i>
                            <div class="item-content">
                                <span class="item-label">启动时间</span>
                                <span class="item-value" id="systemBootTime">--</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CPU信息 -->
                    <div class="system-section">
                        <h3><i class="fas fa-microchip"></i> CPU</h3>
                        <div class="cpu-info">
                            <div class="system-item">
                                <i class="fas fa-brain"></i>
                                <div class="item-content">
                                    <span class="item-label">型号</span>
                                    <span class="item-value" id="cpuModel">--</span>
                                </div>
                            </div>
                            <div class="system-item">
                                <i class="fas fa-tachometer-alt"></i>
                                <div class="item-content">
                                    <span class="item-label">频率</span>
                                    <span class="item-value" id="cpuFreq">--</span>
                                </div>
                            </div>
                            <div class="system-item">
                                <i class="fas fa-microchip"></i>
                                <div class="item-content">
                                    <span class="item-label">核心数</span>
                                    <span class="item-value" id="cpuCores">--</span>
                                </div>
                            </div>
                            <div class="system-item">
                                <i class="fas fa-chart-line"></i>
                                <div class="item-content">
                                    <span class="item-label">使用率</span>
                                    <div class="usage-container">
                                        <div class="usage-bar">
                                            <div class="usage-fill" id="cpuUsageFill" style="width: 0%"></div>
                                        </div>
                                        <span class="usage-text" id="cpuUsageText">0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 内存信息 -->
                    <div class="system-section">
                        <h3><i class="fas fa-memory"></i> 内存</h3>
                        <div class="memory-info">
                            <div class="system-item">
                                <i class="fas fa-database"></i>
                                <div class="item-content">
                                    <span class="item-label">总内存</span>
                                    <span class="item-value" id="memTotal">--</span>
                                </div>
                            </div>
                            <div class="system-item">
                                <i class="fas fa-chart-pie"></i>
                                <div class="item-content">
                                    <span class="item-label">使用率</span>
                                    <div class="usage-container">
                                        <div class="usage-bar">
                                            <div class="usage-fill" id="memUsageFill" style="width: 0%"></div>
                                        </div>
                                        <span class="usage-text" id="memUsageText">0%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="system-item">
                                <i class="fas fa-sync-alt"></i>
                                <div class="item-content">
                                    <span class="item-label">可用内存</span>
                                    <span class="item-value" id="memAvailable">--</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 磁盘信息 -->
                    <div class="system-section">
                        <h3><i class="fas fa-hdd"></i> 磁盘</h3>
                        <div class="disk-info" id="diskInfo">
                            <!-- 磁盘信息将动态加载 -->
                        </div>
                    </div>
                    
                    <!-- GPU信息 -->
                    <div class="system-section">
                        <h3><i class="fas fa-gamepad"></i> 显卡</h3>
                        <div class="gpu-info" id="gpuInfo">
                            <!-- GPU信息将动态加载 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加全局引用
        window.systemInfoCard = this;
    }
    
    async loadSystemInfo() {
        try {
            // 动态获取后端API地址 - 优先使用当前页面的主机和端口
            const apiBase = window.location.hostname === 'localhost' ? 
                'http://localhost:48877' : 
                `${window.location.protocol}//${window.location.host}`;
                
            // 并行获取系统硬件信息和CPU信息
            const [hardwareResponse, cpuResponse] = await Promise.all([
                fetch(`${apiBase}/api/system/hardware`),
                fetch(`${apiBase}/api/cpu`)
            ]);
            
            if (!hardwareResponse.ok || !cpuResponse.ok) {
                throw new Error(`HTTP error! status: ${hardwareResponse.status}/${cpuResponse.status}`);
            }
            
            const [hardwareResult, cpuResult] = await Promise.all([
                hardwareResponse.json(),
                cpuResponse.json()
            ]);
            
            // 检查API响应格式
            if (hardwareResult.success && hardwareResult.data && cpuResult) {
                this.systemData = hardwareResult.data;
                
                // 使用CPU API中的数据覆盖频率和核心数，确保数据一致性
                if (cpuResult) {
                    if (!this.systemData.cpu_info) {
                        this.systemData.cpu_info = {};
                    }
                    // 将CPU API中的频率和核心数数据合并到系统硬件信息中
                    this.systemData.cpu_info.current_frequency = cpuResult.current_freq;
                    this.systemData.cpu_info.max_frequency = cpuResult.max_freq;
                    this.systemData.cpu_info.total_cores = cpuResult.core_count;
                    this.systemData.cpu_info.usage_percent = cpuResult.usage_percent;
                    this.systemData.cpu_info.model = cpuResult.model;
                    this.systemData.cpu_info.vendor = cpuResult.vendor;
                }
                
                console.log('API返回数据:', this.systemData); // 调试信息
                console.log('CPU信息 (合并后):', this.systemData.cpu_info); // 调试信息
                this.updateDisplay();
            } else {
                throw new Error(hardwareResult.error || cpuResult.error || 'API返回数据格式错误');
            }
        } catch (error) {
            console.error('获取系统信息失败:', error);
            this.showError('无法获取系统信息: ' + error.message);
        }
    }
    
    updateDisplay() {
        if (!this.systemData) return;
        
        // 更新最后更新时间
        document.getElementById('systemLastUpdate').textContent = 
            new Date().toLocaleTimeString();
        
        // 基本系统信息 - 修复字段映射
        const osInfo = this.systemData.os_info || {};
        document.getElementById('systemOs').textContent = 
            `${osInfo.os_name || osInfo.platform || 'Unknown'} ${osInfo.version || ''}`;
        document.getElementById('systemArch').textContent = 
            osInfo.architecture || 'Unknown';
        
        // 修复启动时间字段
        const bootTime = this.systemData.system_uptime || {};
        document.getElementById('systemBootTime').textContent = 
            bootTime.readable || 'Unknown';
        
        // CPU信息 - 修复字段映射
        const cpuInfo = this.systemData.cpu_info || {};
        document.getElementById('cpuModel').textContent = 
            cpuInfo.model || '正在检测...';
        
        // 修复频率显示 - 添加更详细的调试和错误处理
        const currentFreq = cpuInfo.current_frequency;
        const maxFreq = cpuInfo.max_frequency;
        console.log('CPU频率数据:', { currentFreq, maxFreq }); // 调试信息
        
        if (currentFreq && currentFreq > 0) {
            document.getElementById('cpuFreq').textContent = 
                this.formatFrequency(currentFreq);
        } else if (maxFreq && maxFreq > 0) {
            document.getElementById('cpuFreq').textContent = 
                this.formatFrequency(maxFreq) + ' (最大)';
        } else {
            // 检查是否有其他频率字段
            const anyFreq = cpuInfo.frequency || cpuInfo.freq || cpuInfo.clock_speed;
            if (anyFreq && anyFreq > 0) {
                document.getElementById('cpuFreq').textContent = 
                    this.formatFrequency(anyFreq);
            } else {
                document.getElementById('cpuFreq').textContent = '频率未知';
                console.warn('无法获取CPU频率信息，请检查系统权限或psutil版本');
            }
        }
        
        // 修复核心数显示 - 添加更详细的调试信息
        const totalCores = cpuInfo.total_cores;
        const physicalCores = cpuInfo.physical_cores;
        console.log('CPU核心数据:', { totalCores, physicalCores }); // 调试信息
        
        if (totalCores && totalCores > 0) {
            document.getElementById('cpuCores').textContent = `${totalCores} 核心`;
        } else if (physicalCores && physicalCores > 0) {
            document.getElementById('cpuCores').textContent = `${physicalCores} 核心`;
        } else {
            // 尝试从后端获取核心数
            const logicalCores = cpuInfo.logical_cores || cpuInfo.cores || 0;
            if (logicalCores && logicalCores > 0) {
                document.getElementById('cpuCores').textContent = `${logicalCores} 核心`;
            } else {
                document.getElementById('cpuCores').textContent = '核心数未知';
            }
        }
        
        const cpuUsage = cpuInfo.usage_percent || 0;
        document.getElementById('cpuUsageFill').style.width = `${cpuUsage}%`;
        document.getElementById('cpuUsageText').textContent = `${cpuUsage}%`;
        
        // 内存信息 - 修复字段映射
        const memoryInfo = this.systemData.memory_info || {};
        document.getElementById('memTotal').textContent = 
            this.formatBytes(memoryInfo.total);
        
        const memUsage = memoryInfo.usage_percent || 0;
        document.getElementById('memUsageFill').style.width = `${memUsage}%`;
        document.getElementById('memUsageText').textContent = `${memUsage}%`;
        document.getElementById('memAvailable').textContent = 
            this.formatBytes(memoryInfo.available);
        
        // 磁盘信息
        this.updateDiskInfo();
        
        // GPU信息
        this.updateGpuInfo();
    }
    
    updateDiskInfo() {
        const diskInfoContainer = document.getElementById('diskInfo');
        const diskInfo = this.systemData.disk_info || [];
        
        if (diskInfo.length === 0) {
            diskInfoContainer.innerHTML = '<div class="no-data">无磁盘信息</div>';
            return;
        }
        
        diskInfoContainer.innerHTML = diskInfo.map(disk => `
            <div class="disk-item">
                <div class="disk-header">
                    <i class="fas fa-hdd"></i>
                    <span class="disk-mount">${disk.mountpoint || disk.device || 'Unknown'}</span>
                    <span class="disk-filesystem">(${disk.fstype || 'Unknown'})</span>
                </div>
                <div class="disk-stats">
                    <div class="disk-usage">
                        <div class="usage-bar">
                            <div class="usage-fill" style="width: ${disk.usage_percent || 0}%"></div>
                        </div>
                        <span class="usage-text">${disk.usage_percent || 0}%</span>
                    </div>
                    <div class="disk-space">
                        <span class="disk-used">${this.formatBytes(disk.used || 0)}</span>
                        <span>/</span>
                        <span class="disk-total">${this.formatBytes(disk.total || 0)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateGpuInfo() {
        const gpuInfoContainer = document.getElementById('gpuInfo');
        const gpuInfo = this.systemData.gpu_info || [];
        
        if (gpuInfo.length === 0) {
            gpuInfoContainer.innerHTML = '<div class="no-data">无显卡信息</div>';
            return;
        }
        
        gpuInfoContainer.innerHTML = gpuInfo.map(gpu => `
            <div class="gpu-item">
                <div class="gpu-header">
                    <i class="fas fa-gamepad"></i>
                    <span class="gpu-name">${gpu.name || gpu.vendor || 'Unknown GPU'}</span>
                </div>
                <div class="gpu-stats">
                    <div class="gpu-stat">
                        <span class="stat-label">内存:</span>
                        <span class="stat-value">${gpu.memory_total ? this.formatBytes(gpu.memory_total * 1024 * 1024) : 'N/A'}</span>
                    </div>
                    <div class="gpu-stat">
                        <span class="stat-label">使用率:</span>
                        <span class="stat-value">${gpu.usage_percent || gpu.usage || 0}%</span>
                    </div>
                    <div class="gpu-stat">
                        <span class="stat-label">温度:</span>
                        <span class="stat-value">${gpu.temperature || 'N/A'}°C</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        const content = this.container.querySelector('.system-info-content');
        const expandIcon = this.container.querySelector('.expand-icon');
        
        if (this.isExpanded) {
            content.style.maxHeight = content.scrollHeight + 'px';
            expandIcon.classList.remove('fa-chevron-down');
            expandIcon.classList.add('fa-chevron-up');
        } else {
            content.style.maxHeight = '0';
            expandIcon.classList.remove('fa-chevron-up');
            expandIcon.classList.add('fa-chevron-down');
        }
    }
    
    formatBytes(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    formatFrequency(freq) {
        if (!freq) return 'Unknown';
        return freq >= 1000 ? (freq / 1000).toFixed(1) + ' GHz' : freq + ' MHz';
    }
    
    formatBootTime(bootTime) {
        if (!bootTime) return 'Unknown';
        return new Date(bootTime).toLocaleString();
    }
    
    showError(message) {
        const content = this.container.querySelector('.system-info-content');
        content.innerHTML = `
            <div class="error-message">
                <div>${message}</div>
                <div style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">
                    请检查：
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>后端服务器是否运行 (端口 8000)</li>
                        <li>API接口 /api/system/hardware 是否可访问</li>
                        <li>控制台是否有详细的错误信息</li>
                    </ul>
                </div>
                <button onclick="window.systemInfoCard.loadSystemInfo()" 
                        style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 3px; cursor: pointer;">
                    重试
                </button>
            </div>
        `;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemInfoCard;
}