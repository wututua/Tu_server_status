# 磁盘监控模块

import psutil
import time
from typing import Dict, Any, List

class DiskMonitor:
    """磁盘监控类"""
    
    def __init__(self):
        self.last_disk_io = psutil.disk_io_counters()
        self.last_timestamp = time.time()
    
    def get_disk_usage(self) -> List[Dict[str, Any]]:
        """获取磁盘使用情况"""
        
        disk_partitions = psutil.disk_partitions()
        disk_info = []
        
        for partition in disk_partitions:
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                
                disk_info.append({
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "fstype": partition.fstype,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "percent": usage.percent
                })
            except PermissionError:
                # 跳过没有权限访问的分区
                continue
        
        return disk_info
    
    def get_disk_io(self) -> Dict[str, Any]:
        """获取磁盘 I/O 信息"""
        
        current_timestamp = time.time()
        time_interval = current_timestamp - self.last_timestamp
        
        current_disk_io = psutil.disk_io_counters()
        
        if self.last_disk_io and time_interval > 0:
            read_speed = (current_disk_io.read_bytes - self.last_disk_io.read_bytes) / time_interval
            write_speed = (current_disk_io.write_bytes - self.last_disk_io.write_bytes) / time_interval
        else:
            read_speed = write_speed = 0
        
        disk_io_info = {
            "read_bytes": current_disk_io.read_bytes,
            "write_bytes": current_disk_io.write_bytes,
            "read_count": current_disk_io.read_count,
            "write_count": current_disk_io.write_count,
            "read_speed_mb": round(read_speed / (1024 * 1024), 2),
            "write_speed_mb": round(write_speed / (1024 * 1024), 2)
        }
        
        # 更新最后的数据
        self.last_disk_io = current_disk_io
        self.last_timestamp = current_timestamp
        
        return disk_io_info
    
    def get_disk_summary(self) -> Dict[str, Any]:
        """获取磁盘摘要信息"""
        
        disk_usage = self.get_disk_usage()
        total_disk_size = 0
        total_disk_used = 0
        
        for disk in disk_usage:
            total_disk_size += disk["total"]
            total_disk_used += disk["used"]
        
        return {
            "total_disk_size_gb": round(total_disk_size / (1024**3), 2),
            "total_disk_used_gb": round(total_disk_used / (1024**3), 2),
            "total_disk_free_gb": round((total_disk_size - total_disk_used) / (1024**3), 2),
            "disk_count": len(disk_usage)
        }

def get_disk_status() -> Dict[str, Any]:
    """获取磁盘状态（便捷函数）"""
    monitor = DiskMonitor()
    
    return {
        "partitions": monitor.get_disk_usage(),
        "io": monitor.get_disk_io(),
        "summary": monitor.get_disk_summary()
    }