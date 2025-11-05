# FastAPI 路由定义

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import psutil
import time

router = APIRouter(prefix="/api", tags=["monitoring"])

# 全局变量用于存储上次的磁盘和网络数据
last_disk_io = psutil.disk_io_counters()
last_net_io = psutil.net_io_counters()
last_timestamp = time.time()

@router.get("/status")
async def get_server_status():
    """获取完整的服务器状态信息"""
    global last_disk_io, last_net_io, last_timestamp
    
    current_timestamp = time.time()
    time_interval = current_timestamp - last_timestamp
    
    # CPU 信息
    cpu_info = {
        "usage_percent": psutil.cpu_percent(interval=1),
        "core_count": psutil.cpu_count(),
        "current_freq": psutil.cpu_freq().current if psutil.cpu_freq() else 0,
        "max_freq": psutil.cpu_freq().max if psutil.cpu_freq() else 0
    }
    
    # 内存信息
    memory = psutil.virtual_memory()
    memory_info = {
        "total": memory.total,
        "available": memory.available,
        "used": memory.used,
        "usage_percent": memory.percent,
        "free": memory.free
    }
    
    # 磁盘 I/O 信息
    current_disk_io = psutil.disk_io_counters()
    if last_disk_io:
        read_speed = (current_disk_io.read_bytes - last_disk_io.read_bytes) / time_interval
        write_speed = (current_disk_io.write_bytes - last_disk_io.write_bytes) / time_interval
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
    
    # 网络信息
    current_net_io = psutil.net_io_counters()
    if last_net_io:
        upload_speed = (current_net_io.bytes_sent - last_net_io.bytes_sent) / time_interval
        download_speed = (current_net_io.bytes_recv - last_net_io.bytes_recv) / time_interval
    else:
        upload_speed = download_speed = 0
    
    # 计算今日流量（简化处理）
    today_upload_gb = round(current_net_io.bytes_sent / (1024 * 1024 * 1024), 2)
    today_download_gb = round(current_net_io.bytes_recv / (1024 * 1024 * 1024), 2)
    
    network_info = {
        "bytes_sent": current_net_io.bytes_sent,
        "bytes_recv": current_net_io.bytes_recv,
        "packets_sent": current_net_io.packets_sent,
        "packets_recv": current_net_io.packets_recv,
        "upload_speed_mb": round(upload_speed / (1024 * 1024), 2),
        "download_speed_mb": round(download_speed / (1024 * 1024), 2),
        "today_upload_gb": today_upload_gb,
        "today_download_gb": today_download_gb
    }
    
    # 系统负载信息
    load_avg = psutil.getloadavg()
    system_load_info = {
        "load_1min": load_avg[0],
        "load_5min": load_avg[1],
        "load_15min": load_avg[2],
        "cpu_count": psutil.cpu_count()
    }
    
    # 系统运行时间
    uptime_info = int(time.time() - psutil.boot_time())
    
    # 更新全局变量
    last_disk_io = current_disk_io
    last_net_io = current_net_io
    last_timestamp = current_timestamp
    
    return {
        "timestamp": datetime.now().isoformat(),
        "cpu": cpu_info,
        "memory": memory_info,
        "disk_io": disk_io_info,
        "network": network_info,
        "system_load": system_load_info,
        "uptime": uptime_info
    }

@router.get("/cpu")
async def get_cpu_status():
    """获取 CPU 状态信息"""
    cpu_info = {
        "usage_percent": psutil.cpu_percent(interval=1),
        "core_count": psutil.cpu_count(),
        "current_freq": psutil.cpu_freq().current if psutil.cpu_freq() else 0,
        "max_freq": psutil.cpu_freq().max if psutil.cpu_freq() else 0
    }
    return cpu_info

@router.get("/memory")
async def get_memory_status():
    """获取内存状态信息"""
    memory = psutil.virtual_memory()
    memory_info = {
        "total": memory.total,
        "available": memory.available,
        "used": memory.used,
        "usage_percent": memory.percent,
        "free": memory.free
    }
    return memory_info

@router.get("/disk")
async def get_disk_status():
    """获取磁盘 I/O 状态信息"""
    global last_disk_io, last_timestamp
    
    current_timestamp = time.time()
    time_interval = current_timestamp - last_timestamp
    
    current_disk_io = psutil.disk_io_counters()
    if last_disk_io:
        read_speed = (current_disk_io.read_bytes - last_disk_io.read_bytes) / time_interval
        write_speed = (current_disk_io.write_bytes - last_disk_io.write_bytes) / time_interval
    else:
        read_speed = write_speed = 0
    
    disk_info = {
        "read_bytes": current_disk_io.read_bytes,
        "write_bytes": current_disk_io.write_bytes,
        "read_count": current_disk_io.read_count,
        "write_count": current_disk_io.write_count,
        "read_speed_mb": round(read_speed / (1024 * 1024), 2),
        "write_speed_mb": round(write_speed / (1024 * 1024), 2)
    }
    
    last_disk_io = current_disk_io
    last_timestamp = current_timestamp
    
    return disk_info

@router.get("/network")
async def get_network_status():
    """获取网络状态信息"""
    global last_net_io, last_timestamp
    
    current_timestamp = time.time()
    time_interval = current_timestamp - last_timestamp
    
    current_net_io = psutil.net_io_counters()
    if last_net_io:
        upload_speed = (current_net_io.bytes_sent - last_net_io.bytes_sent) / time_interval
        download_speed = (current_net_io.bytes_recv - last_net_io.bytes_recv) / time_interval
    else:
        upload_speed = download_speed = 0
    
    network_info = {
        "bytes_sent": current_net_io.bytes_sent,
        "bytes_recv": current_net_io.bytes_recv,
        "packets_sent": current_net_io.packets_sent,
        "packets_recv": current_net_io.packets_recv,
        "upload_speed_mb": round(upload_speed / (1024 * 1024), 2),
        "download_speed_mb": round(download_speed / (1024 * 1024), 2)
    }
    
    last_net_io = current_net_io
    last_timestamp = current_timestamp
    
    return network_info

@router.get("/load")
async def get_system_load():
    """获取系统负载信息"""
    load_avg = psutil.getloadavg()
    system_load_info = {
        "load_1min": load_avg[0],
        "load_5min": load_avg[1],
        "load_15min": load_avg[2],
        "cpu_count": psutil.cpu_count()
    }
    return system_load_info