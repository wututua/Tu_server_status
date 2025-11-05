// 服务器监控系统 - 图表管理模块
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = {
            cpu: this.createCPUChartConfig(),
            memory: this.createMemoryChartConfig(),
            network: this.createNetworkChartConfig(),
            disk: this.createDiskChartConfig()
        };
        
        this.init();
    }

    /**
     * 初始化图表管理器
     */
    init() {
        // 等待DOM加载完成后再创建图表
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createCharts();
            });
        } else {
            this.createCharts();
        }
    }

    /**
     * 创建所有图表
     */
    createCharts() {
        Object.keys(this.chartConfigs).forEach(chartType => {
            const canvas = document.getElementById(`${chartType}ChartCanvas`);
            if (canvas) {
                this.createChart(chartType, canvas);
            }
        });
    }

    /**
     * 创建单个图表
     */
    createChart(chartType, canvas) {
        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs[chartType];
        
        this.charts[chartType] = new Chart(ctx, config);
    }

    /**
     * 更新图表数据
     */
    updateCharts(dataHistory) {
        Object.keys(this.charts).forEach(chartType => {
            if (this.charts[chartType] && dataHistory[chartType]) {
                this.updateChart(chartType, dataHistory[chartType]);
            }
        });
    }

    /**
     * 更新单个图表
     */
    updateChart(chartType, data) {
        const chart = this.charts[chartType];
        if (!chart) return;

        const config = this.chartConfigs[chartType];
        
        switch (chartType) {
            case 'cpu':
                this.updateCPUChart(chart, data);
                break;
            case 'memory':
                this.updateMemoryChart(chart, data);
                break;
            case 'network':
                this.updateNetworkChart(chart, data);
                break;
            case 'disk':
                this.updateDiskChart(chart, data);
                break;
        }

        chart.update('none');
    }

    /**
     * 更新CPU使用率图表
     */
    updateCPUChart(chart, data) {
        const labels = data.map(item => 
            item.time.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        );
        
        const usageData = data.map(item => item.usage);

        chart.data.labels = labels;
        chart.data.datasets[0].data = usageData;

        // 根据最新数据设置颜色
        const latestUsage = usageData[usageData.length - 1] || 0;
        chart.data.datasets[0].borderColor = this.getUsageColor(latestUsage);
        chart.data.datasets[0].backgroundColor = this.getUsageColor(latestUsage, 0.1);
    }

    /**
     * 更新内存使用图表
     */
    updateMemoryChart(chart, data) {
        const labels = data.map(item => 
            item.time.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        );
        
        const usageData = data.map(item => item.usage);
        const usedData = data.map(item => item.used);

        chart.data.labels = labels;
        chart.data.datasets[0].data = usageData;
        chart.data.datasets[1].data = usedData;

        // 根据最新数据设置颜色
        const latestUsage = usageData[usageData.length - 1] || 0;
        chart.data.datasets[0].borderColor = this.getUsageColor(latestUsage);
        chart.data.datasets[0].backgroundColor = this.getUsageColor(latestUsage, 0.1);
    }

    /**
     * 更新网络流量图表
     */
    updateNetworkChart(chart, data) {
        const labels = data.map(item => 
            item.time.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        );
        
        const uploadData = data.map(item => item.upload);
        const downloadData = data.map(item => item.download);

        chart.data.labels = labels;
        chart.data.datasets[0].data = uploadData;
        chart.data.datasets[1].data = downloadData;
    }

    /**
     * 更新磁盘I/O图表
     */
    updateDiskChart(chart, data) {
        const labels = data.map(item => 
            item.time.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        );
        
        const readData = data.map(item => item.read);
        const writeData = data.map(item => item.write);

        chart.data.labels = labels;
        chart.data.datasets[0].data = readData;
        chart.data.datasets[1].data = writeData;
    }

    /**
     * 创建CPU使用率图表配置
     */
    createCPUChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU使用率 (%)',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3498db',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            maxTicksLimit: 6,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * 创建内存使用图表配置
     */
    createMemoryChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '内存使用率 (%)',
                    data: [],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y'
                }, {
                    label: '已使用内存 (GB)',
                    data: [],
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3498db',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            maxTicksLimit: 6,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 10
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#b3b3b3',
                            callback: function(value) {
                                return value.toFixed(1) + ' GB';
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * 创建网络流量图表配置
     */
    createNetworkChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '上行速率 (MB/s)',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }, {
                    label: '下行速率 (MB/s)',
                    data: [],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3498db',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} MB/s`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            maxTicksLimit: 6,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            callback: function(value) {
                                return value.toFixed(1) + ' MB/s';
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * 创建磁盘I/O图表配置
     */
    createDiskChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '读取速度 (MB/s)',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }, {
                    label: '写入速度 (MB/s)',
                    data: [],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3498db',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} MB/s`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            maxTicksLimit: 6,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            callback: function(value) {
                                return value.toFixed(1) + ' MB/s';
                            },
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * 根据使用率获取颜色
     */
    getUsageColor(usage, alpha = 1) {
        if (usage > 80) {
            return `rgba(231, 76, 60, ${alpha})`; // 红色
        } else if (usage > 60) {
            return `rgba(243, 156, 18, ${alpha})`; // 橙色
        } else {
            return `rgba(52, 152, 219, ${alpha})`; // 蓝色
        }
    }

    /**
     * 重置所有图表数据
     */
    resetCharts() {
        Object.keys(this.charts).forEach(chartType => {
            const chart = this.charts[chartType];
            if (chart) {
                chart.data.labels = [];
                chart.data.datasets.forEach(dataset => {
                    dataset.data = [];
                });
                chart.update('none');
            }
        });
    }

    /**
     * 销毁所有图表
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// 页面加载完成后初始化图表管理器
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
});