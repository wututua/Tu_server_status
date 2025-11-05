# 网络监控模块

import psutil
import time
from typing import Dict, Any, List

class NetworkMonitor:
    """网络监控类"""
    
    def __init__(self):
        self.last_net_io = psutil.net_io_counters()
        self.last_timestamp = time.time()
        self.start_net_io = psutil.net_io_counters()  # 启动时的网络数据
    
    def get_network_io(self) -> Dict[str, Any]:
        """获取网络 I/O 信息"""
        
        current_timestamp = time.time()
        time_interval = current_timestamp - self.last_timestamp
        
        current_net_io = psutil.net_io_counters()
        
        if self.last_net_io and time_interval > 0:
            upload_speed = (current_net_io.bytes_sent - self.last_net_io.bytes_sent) / time_interval
            download_speed = (current_net_io.bytes_recv - self.last_net_io.bytes_recv) / time_interval
        else:
            upload_speed = download_speed = 0
        
        # 计算今日流量（相对于启动时的数据）
        today_upload = current_net_io.bytes_sent - self.start_net_io.bytes_sent
        today_download = current_net_io.bytes_recv - self.start_net_io.bytes_recv
        
        network_info = {
            "bytes_sent": current_net_io.bytes_sent,
            "bytes_recv": current_net_io.bytes_recv,
            "packets_sent": current_net_io.packets_sent,
            "packets_recv": current_net_io.packets_recv,
            "upload_speed_mb": round(upload_speed / (1024 * 1024), 2),
            "download_speed_mb": round(download_speed / (1024 * 1024), 2),
            "today_upload_gb": round(today_upload / (1024 * 1024 * 1024), 2),
            "today_download_gb": round(today_download / (1024 * 1024 * 1024), 2)
        }
        
        # 更新最后的数据
        self.last_net_io = current_net_io
        self.last_timestamp = current_timestamp
        
        return network_info
    
    def get_network_interfaces(self) -> List[Dict[str, Any]]:
        """获取网络接口信息"""
        
        interfaces = psutil.net_if_addrs()
        interface_stats = psutil.net_if_stats()
        
        interface_info = []
        
        for interface_name, addresses in interfaces.items():
            stats = interface_stats.get(interface_name, {})
            
            interface_data = {
                "name": interface_name,
                "is_up": stats.get("isup", False),
                "speed": stats.get("speed", 0),
                "mtu": stats.get("mtu", 0),
                "addresses": []
            }
            
            for address in addresses:
                interface_data["addresses"].append({
                    "family": address.family.name,
                    "address": address.address,
                    "netmask": address.netmask,
                    "broadcast": address.broadcast
                })
            
            interface_info.append(interface_data)
        
        return interface_info
    
    def get_network_connections(self) -> List[Dict[str, Any]]:
        """获取网络连接信息"""
        
        connections = psutil.net_connections(kind='inet')
        connection_info = []
        
        for conn in connections:
            connection_data = {
                "fd": conn.fd,
                "family": conn.family.name,
                "type": conn.type.name,
                "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "",
                "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "",
                "status": conn.status,
                "pid": conn.pid
            }
            connection_info.append(connection_data)
        
        return connection_info

def get_network_status() -> Dict[str, Any]:
    """获取网络状态（便捷函数）"""
    monitor = NetworkMonitor()
    
    return {
        "io": monitor.get_network_io(),
        "interfaces": monitor.get_network_interfaces(),
        "connections": monitor.get_network_connections()
    }