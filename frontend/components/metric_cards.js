// 指标卡片组件 - 负责各个监控指标的显示

// CPU指标卡片
class CPUMetricCard {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            usage: document.getElementById('cpuUsage'),
            cores: document.getElementById('cpuCores'),
            freq: document.getElementById('cpuFreq'),
            ring: document.getElementById('cpuRing')
        };
    }

    update(data) {
        if (!data || !data.cpu) return;
        
        const cpu = data.cpu;
        this.updateUsage(cpu.usage_percent);
        this.updateCores(cpu.core_count);
        this.updateFrequency(cpu.current_freq);
    }

    updateUsage(usage) {
        if (this.elements.usage) {
            this.elements.usage.textContent = `${usage}%`;
            this.updateRingColor(usage, this.elements.ring, this.elements.usage);
        }
    }

    updateCores(cores) {
        if (this.elements.cores) {
            this.elements.cores.textContent = cores.toString();
        }
    }

    updateFrequency(freq) {
        if (this.elements.freq) {
            const ghz = (freq / 1000).toFixed(2);
            this.elements.freq.textContent = `${ghz} GHz`;
        }
    }

    updateRingColor(usage, ringElement, textElement) {
        const circumference = 2 * Math.PI * 35;
        const offset = circumference - (usage / 100) * circumference;
        
        if (ringElement) {
            ringElement.style.strokeDasharray = `${circumference} ${circumference}`;
            ringElement.style.strokeDashoffset = offset;
            
            if (usage > 80) {
                ringElement.style.stroke = 'var(--danger-color)';
                textElement.style.color = 'var(--danger-color)';
            } else if (usage > 60) {
                ringElement.style.stroke = 'var(--warning-color)';
                textElement.style.color = 'var(--warning-color)';
            } else {
                ringElement.style.stroke = 'var(--primary-color)';
                textElement.style.color = 'var(--primary-color)';
            }
        }
    }

    reset() {
        if (this.elements.usage) this.elements.usage.textContent = '--%';
        if (this.elements.cores) this.elements.cores.textContent = '--';
        if (this.elements.freq) this.elements.freq.textContent = '-- GHz';
        if (this.elements.ring) {
            this.elements.ring.style.strokeDashoffset = '0';
            this.elements.ring.style.stroke = 'var(--border-color)';
        }
    }

    destroy() {
        this.elements = {};
    }
}

// 内存指标卡片
class MemoryMetricCard {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            usage: document.getElementById('memoryUsage'),
            used: document.getElementById('memoryUsed'),
            total: document.getElementById('memoryTotal'),
            ring: document.getElementById('memoryRing')
        };
    }

    update(data) {
        if (!data || !data.memory) return;
        
        const memory = data.memory;
        this.updateUsage(memory.usage_percent);
        this.updateMemoryUsage(memory.used, memory.total);
    }

    updateUsage(usage) {
        if (this.elements.usage) {
            this.elements.usage.textContent = `${usage}%`;
            this.updateRingColor(usage, this.elements.ring, this.elements.usage);
        }
    }

    updateMemoryUsage(used, total) {
        if (this.elements.used && this.elements.total) {
            const usedGb = (used / 1024 / 1024 / 1024).toFixed(1);
            const totalGb = (total / 1024 / 1024 / 1024).toFixed(1);
            
            this.elements.used.textContent = `${usedGb} GB`;
            this.elements.total.textContent = `${totalGb} GB`;
        }
    }

    updateRingColor(usage, ringElement, textElement) {
        const circumference = 2 * Math.PI * 35;
        const offset = circumference - (usage / 100) * circumference;
        
        if (ringElement) {
            ringElement.style.strokeDasharray = `${circumference} ${circumference}`;
            ringElement.style.strokeDashoffset = offset;
            
            if (usage > 80) {
                ringElement.style.stroke = 'var(--danger-color)';
                textElement.style.color = 'var(--danger-color)';
            } else if (usage > 60) {
                ringElement.style.stroke = 'var(--warning-color)';
                textElement.style.color = 'var(--warning-color)';
            } else {
                ringElement.style.stroke = 'var(--secondary-color)';
                textElement.style.color = 'var(--secondary-color)';
            }
        }
    }

    reset() {
        if (this.elements.usage) this.elements.usage.textContent = '--%';
        if (this.elements.used) this.elements.used.textContent = '-- GB';
        if (this.elements.total) this.elements.total.textContent = '-- GB';
        if (this.elements.ring) {
            this.elements.ring.style.strokeDashoffset = '0';
            this.elements.ring.style.stroke = 'var(--border-color)';
        }
    }

    destroy() {
        this.elements = {};
    }
}

// 磁盘I/O指标卡片
class DiskMetricCard {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            read: document.getElementById('diskRead'),
            write: document.getElementById('diskWrite')
        };
    }

    update(data) {
        if (!data || !data.disk_io) return;
        
        const disk = data.disk_io;
        this.updateReadSpeed(disk.read_speed_mb);
        this.updateWriteSpeed(disk.write_speed_mb);
    }

    updateReadSpeed(speed) {
        if (this.elements.read) {
            this.elements.read.textContent = `${speed} MB/s`;
        }
    }

    updateWriteSpeed(speed) {
        if (this.elements.write) {
            this.elements.write.textContent = `${speed} MB/s`;
        }
    }

    reset() {
        if (this.elements.read) this.elements.read.textContent = '-- MB/s';
        if (this.elements.write) this.elements.write.textContent = '-- MB/s';
    }

    destroy() {
        this.elements = {};
    }
}

// 网络指标卡片
class NetworkMetricCard {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            upload: document.getElementById('networkUpload'),
            download: document.getElementById('networkDownload'),
            traffic: document.getElementById('todayTraffic')
        };
    }

    update(data) {
        if (!data || !data.network) return;
        
        const network = data.network;
        this.updateUploadSpeed(network.upload_speed_mb);
        this.updateDownloadSpeed(network.download_speed_mb);
        this.updateTraffic(network.today_upload_gb, network.today_download_gb);
    }

    updateUploadSpeed(speed) {
        if (this.elements.upload) {
            this.elements.upload.textContent = `${speed} MB/s`;
        }
    }

    updateDownloadSpeed(speed) {
        if (this.elements.download) {
            this.elements.download.textContent = `${speed} MB/s`;
        }
    }

    updateTraffic(uploadGb, downloadGb) {
        if (this.elements.traffic) {
            const total = uploadGb + downloadGb;
            this.elements.traffic.textContent = `${total.toFixed(2)} GB`;
        }
    }

    reset() {
        if (this.elements.upload) this.elements.upload.textContent = '-- MB/s';
        if (this.elements.download) this.elements.download.textContent = '-- MB/s';
        if (this.elements.traffic) this.elements.traffic.textContent = '-- GB';
    }

    destroy() {
        this.elements = {};
    }
}

// 导出指标卡片类
window.CPUMetricCard = CPUMetricCard;
window.MemoryMetricCard = MemoryMetricCard;
window.DiskMetricCard = DiskMetricCard;
window.NetworkMetricCard = NetworkMetricCard;