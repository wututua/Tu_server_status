# CPU 监控模块

import psutil
import time
from typing import Dict, Any

class CPUMonitor:
    """CPU 监控类"""
    
    def __init__(self):
        self.last_cpu_times = psutil.cpu_times()
        self.last_timestamp = time.time()
    
    def get_cpu_info(self) -> Dict[str, Any]:
        """获取 CPU 信息"""
        
        # CPU 使用率
        usage_percent = psutil.cpu_percent(interval=1)
        
        # CPU 核心数
        core_count = psutil.cpu_count()
        
        # CPU 频率
        cpu_freq = psutil.cpu_freq()
        current_freq = cpu_freq.current if cpu_freq else 0
        max_freq = cpu_freq.max if cpu_freq else 0
        
        # CPU 时间统计
        cpu_times = psutil.cpu_times()
        
        return {
            "usage_percent": usage_percent,
            "core_count": core_count,
            "current_freq": current_freq,
            "max_freq": max_freq,
            "user_time": cpu_times.user,
            "system_time": cpu_times.system,
            "idle_time": cpu_times.idle
        }
    
    def get_cpu_usage_details(self) -> Dict[str, Any]:
        """获取详细的 CPU 使用情况"""
        
        # 每个核心的使用率
        per_cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
        
        # CPU 负载
        load_avg = psutil.getloadavg()
        
        return {
            "per_cpu_percent": per_cpu_percent,
            "load_1min": load_avg[0],
            "load_5min": load_avg[1],
            "load_15min": load_avg[2]
        }

def get_cpu_status() -> Dict[str, Any]:
    """获取 CPU 状态（便捷函数）"""
    monitor = CPUMonitor()
    return monitor.get_cpu_info()