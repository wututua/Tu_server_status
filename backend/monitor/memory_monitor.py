# 内存监控模块

import psutil
from typing import Dict, Any

class MemoryMonitor:
    """内存监控类"""
    
    def get_memory_info(self) -> Dict[str, Any]:
        """获取内存信息"""
        
        # 虚拟内存
        virtual_memory = psutil.virtual_memory()
        
        # 交换内存
        swap_memory = psutil.swap_memory()
        
        # 内存详细信息
        memory_info = {
            "virtual": {
                "total": virtual_memory.total,
                "available": virtual_memory.available,
                "used": virtual_memory.used,
                "free": virtual_memory.free,
                "percent": virtual_memory.percent,
                "cached": getattr(virtual_memory, 'cached', 0),
                "buffers": getattr(virtual_memory, 'buffers', 0)
            },
            "swap": {
                "total": swap_memory.total,
                "used": swap_memory.used,
                "free": swap_memory.free,
                "percent": swap_memory.percent
            }
        }
        
        return memory_info
    
    def get_memory_usage_summary(self) -> Dict[str, Any]:
        """获取内存使用摘要"""
        
        virtual_memory = psutil.virtual_memory()
        swap_memory = psutil.swap_memory()
        
        return {
            "total_memory_gb": round(virtual_memory.total / (1024**3), 2),
            "used_memory_gb": round(virtual_memory.used / (1024**3), 2),
            "available_memory_gb": round(virtual_memory.available / (1024**3), 2),
            "memory_usage_percent": virtual_memory.percent,
            "swap_usage_percent": swap_memory.percent
        }

def get_memory_status() -> Dict[str, Any]:
    """获取内存状态（便捷函数）"""
    monitor = MemoryMonitor()
    return monitor.get_memory_info()