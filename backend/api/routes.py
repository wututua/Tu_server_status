# FastAPI 路由定义

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import psutil
import time
import platform
import subprocess
import json
import os

router = APIRouter(prefix="/api", tags=["monitoring"])

# 全局变量用于存储上次的磁盘和网络数据
last_disk_io = psutil.disk_io_counters()
last_net_io = psutil.net_io_counters()
last_timestamp = time.time()

# 今日流量数据存储
traffic_data_file = "traffic_data.json"
today_traffic = {
    "upload_bytes": 0,
    "download_bytes": 0,
    "last_reset_date": None,  # UTC+8的日期字符串，格式: YYYY-MM-DD
    "last_net_io_bytes_sent": 0,
    "last_net_io_bytes_recv": 0
}

# 加载流量数据
def load_traffic_data():
    global today_traffic
    try:
        if os.path.exists(traffic_data_file):
            with open(traffic_data_file, 'r', encoding='utf-8') as f:
                saved_data = json.load(f)
                today_traffic.update(saved_data)
    except Exception as e:
        print(f"加载流量数据失败: {e}")
        # 使用默认值继续

# 保存流量数据
def save_traffic_data():
    try:
        with open(traffic_data_file, 'w', encoding='utf-8') as f:
            json.dump(today_traffic, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"保存流量数据失败: {e}")

# 获取UTC+8的当前时间
def get_utc8_time():
    import pytz
    utc8_tz = pytz.timezone('Asia/Shanghai')  # UTC+8时区
    return datetime.now(utc8_tz)

# 初始化流量数据系统
def init_traffic_system():
    """在应用启动时初始化流量数据系统"""
    global today_traffic, last_net_io
    
    # 加载现有数据
    load_traffic_data()
    
    # 初始化网络计数器
    current_net_io = psutil.net_io_counters()
    
    # 如果今天是第一次运行或需要重置，初始化基准值
    current_time = get_utc8_time()
    today_date = current_time.strftime("%Y-%m-%d")
    
    if today_traffic["last_reset_date"] is None or today_traffic["last_reset_date"] != today_date:
        print(f"初始化流量系统（UTC+8 {today_date}）")
        today_traffic["upload_bytes"] = 0
        today_traffic["download_bytes"] = 0
        today_traffic["last_reset_date"] = today_date
        today_traffic["last_net_io_bytes_sent"] = current_net_io.bytes_sent if current_net_io else 0
        today_traffic["last_net_io_bytes_recv"] = current_net_io.bytes_recv if current_net_io else 0
        save_traffic_data()
    
    # 设置 last_net_io 为当前值
    last_net_io = current_net_io

# 初始化流量数据系统
def init_traffic_system():
    """在应用启动时初始化流量数据系统"""
    global today_traffic, last_net_io
    
    # 加载现有数据
    load_traffic_data()
    
    # 初始化网络计数器
    current_net_io = psutil.net_io_counters()
    
    # 如果今天是第一次运行或需要重置，初始化基准值
    current_time = get_utc8_time()
    today_date = current_time.strftime("%Y-%m-%d")
    
    if today_traffic["last_reset_date"] is None or today_traffic["last_reset_date"] != today_date:
        print(f"初始化流量系统（UTC+8 {today_date}）")
        today_traffic["upload_bytes"] = 0
        today_traffic["download_bytes"] = 0
        today_traffic["last_reset_date"] = today_date
        today_traffic["last_net_io_bytes_sent"] = current_net_io.bytes_sent if current_net_io else 0
        today_traffic["last_net_io_bytes_recv"] = current_net_io.bytes_recv if current_net_io else 0
        save_traffic_data()
    
    # 设置 last_net_io 为当前值
    last_net_io = current_net_io

# 检查是否需要重置今日流量
def check_and_reset_traffic():
    global today_traffic, last_net_io
    
    current_time = get_utc8_time()
    today_date = current_time.strftime("%Y-%m-%d")
    
    # 如果是新的一天，重置流量数据
    if today_traffic["last_reset_date"] != today_date:
        print(f"检测到新的一天（UTC+8 {today_date}），重置今日流量")
        today_traffic["upload_bytes"] = 0
        today_traffic["download_bytes"] = 0
        today_traffic["last_reset_date"] = today_date
        today_traffic["last_net_io_bytes_sent"] = last_net_io.bytes_sent if last_net_io else 0
        today_traffic["last_net_io_bytes_recv"] = last_net_io.bytes_recv if last_net_io else 0
        save_traffic_data()
    
    return today_date

# 获取后端版本号
def get_version_info():
    try:
        # 从当前文件或setup.py中获取版本信息
        with open('setup.py', 'r') as f:
            content = f.read()
            import re
            version_match = re.search(r"version=['\"]([^'\"]+)['\"]", content)
            if version_match:
                return version_match.group(1)
    except:
        pass
    return "1.0.0"  # 默认版本号

# 获取网络连接数
def get_network_connections():
    try:
        connections = psutil.net_connections()
        return len([conn for conn in connections if conn.status == 'ESTABLISHED'])
    except:
        return 0

# 获取显卡信息
def get_gpu_info():
    gpu_info = {
        "has_gpu": False,
        "gpu_usage": 0,
        "gpu_memory_used": 0,
        "gpu_memory_total": 0,
        "gpu_name": ""
    }
    
    try:
        # 尝试使用nvidia-smi获取NVIDIA显卡信息
        result = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total,name', '--format=csv,noheader,nounits'], 
                              capture_output=True, text=True, timeout=5)
        
        if result.returncode == 0 and result.stdout.strip():
            lines = result.stdout.strip().split('\n')
            if lines:
                data = lines[0].split(',')
                if len(data) >= 4:
                    gpu_info["has_gpu"] = True
                    gpu_info["gpu_usage"] = float(data[0].strip())
                    gpu_info["gpu_memory_used"] = float(data[1].strip())
                    gpu_info["gpu_memory_total"] = float(data[2].strip())
                    gpu_info["gpu_name"] = data[3].strip()
    except:
        # 如果没有NVIDIA显卡，尝试其他方式
        pass
    
    return gpu_info

@router.get("/status")
async def get_server_status():
    """获取完整的服务器状态信息"""
    global last_disk_io, last_net_io, last_timestamp, today_traffic
    
    current_timestamp = time.time()
    time_interval = current_timestamp - last_timestamp
    
    # 加载流量数据并检查是否需要重置
    load_traffic_data()
    check_and_reset_traffic()
    
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
    
    # 计算今日流量（基于UTC+8时间）
    if last_net_io:
        # 计算本次统计间隔内的流量增量
        upload_increment = current_net_io.bytes_sent - today_traffic["last_net_io_bytes_sent"]
        download_increment = current_net_io.bytes_recv - today_traffic["last_net_io_bytes_recv"]
        
        # 更新今日流量（防止重启后数据丢失）
        today_traffic["upload_bytes"] += max(0, upload_increment)
        today_traffic["download_bytes"] += max(0, download_increment)
        today_traffic["last_net_io_bytes_sent"] = current_net_io.bytes_sent
        today_traffic["last_net_io_bytes_recv"] = current_net_io.bytes_recv
        
        # 保存更新后的数据
        save_traffic_data()
    
    today_upload_gb = round(today_traffic["upload_bytes"] / (1024 * 1024 * 1024), 3)
    today_download_gb = round(today_traffic["download_bytes"] / (1024 * 1024 * 1024), 3)
    
    network_info = {
        "bytes_sent": current_net_io.bytes_sent,
        "bytes_recv": current_net_io.bytes_recv,
        "packets_sent": current_net_io.packets_sent,
        "packets_recv": current_net_io.packets_recv,
        "upload_speed_mb": round(upload_speed / (1024 * 1024), 2),
        "download_speed_mb": round(download_speed / (1024 * 1024), 2),
        "today_upload_gb": today_upload_gb,
        "today_download_gb": today_download_gb,
        "today_upload_bytes": today_traffic["upload_bytes"],
        "today_download_bytes": today_traffic["download_bytes"],
        "traffic_reset_date": today_traffic["last_reset_date"]
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
    
    # 获取网络连接数
    network_connections = get_network_connections()
    
    # 获取显卡信息
    gpu_info = get_gpu_info()
    
    # 获取版本信息
    version_info = get_version_info()
    
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
        "uptime": uptime_info,
        "network_connections": network_connections,
        "gpu": gpu_info,
        "version": version_info
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