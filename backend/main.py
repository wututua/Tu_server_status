"""
服务器监控系统后端API
FastAPI + psutil 实现系统资源监控
"""

import psutil
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# 创建FastAPI应用实例
app = FastAPI(
    title="服务器监控系统API",
    description="实时监控服务器性能指标的RESTful API",
    version="1.0.0"
)

# 配置CORS中间件，允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型定义
class CPUInfo(BaseModel):
    """CPU信息模型"""
    usage_percent: float
    core_count: int
    current_freq: float
    max_freq: float

class MemoryInfo(BaseModel):
    """内存信息模型"""
    total: int
    available: int
    used: int
    usage_percent: float
    free: int

class DiskIOInfo(BaseModel):
    """磁盘I/O信息模型"""
    read_bytes: int
    write_bytes: int
    read_count: int
    write_count: int
    read_speed_mb: float
    write_speed_mb: float

class NetworkInfo(BaseModel):
    """网络信息模型"""
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    upload_speed_mb: float
    download_speed_mb: float
    today_upload_gb: float
    today_download_gb: float

class SystemLoad(BaseModel):
    """系统负载信息模型"""
    load_1min: float
    load_5min: float
    load_15min: float
    cpu_count: int

class ServerStatus(BaseModel):
    """服务器状态综合信息模型"""
    timestamp: str
    cpu: CPUInfo
    memory: MemoryInfo
    disk_io: DiskIOInfo
    network: NetworkInfo
    system_load: SystemLoad
    uptime: int

# 全局变量用于存储网络流量统计
network_stats = {
    'start_time': datetime.now(),
    'last_bytes_sent': 0,
    'last_bytes_recv': 0,
    'total_bytes_sent': 0,
    'total_bytes_recv': 0
}

# 全局变量用于存储磁盘IO统计
disk_stats = {
    'start_time': datetime.now(),
    'last_read_bytes': 0,
    'last_write_bytes': 0,
    'total_read_bytes': 0,
    'total_write_bytes': 0
}

# 全局变量用于存储磁盘IO统计
disk_stats = {
    'start_time': datetime.now(),
    'last_read_bytes': 0,
    'last_write_bytes': 0,
    'total_read_bytes': 0,
    'total_write_bytes': 0
}

def get_cpu_info() -> CPUInfo:
    """获取CPU使用信息"""
    try:
        usage = psutil.cpu_percent(interval=1)
        freq = psutil.cpu_freq()
        
        return CPUInfo(
            usage_percent=round(usage, 2),
            core_count=psutil.cpu_count(),
            current_freq=round(freq.current, 2) if freq else 0,
            max_freq=round(freq.max, 2) if freq else 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取CPU信息失败: {str(e)}")

def get_memory_info() -> MemoryInfo:
    """获取内存使用信息"""
    try:
        mem = psutil.virtual_memory()
        
        return MemoryInfo(
            total=mem.total,
            available=mem.available,
            used=mem.used,
            usage_percent=round(mem.percent, 2),
            free=mem.free
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取内存信息失败: {str(e)}")

def get_disk_io_info() -> DiskIOInfo:
    """获取磁盘I/O信息"""
    try:
        global disk_stats
        
        # 获取当前磁盘I/O统计
        disk_io = psutil.disk_io_counters()
        current_time = datetime.now()
        
        if disk_io:
            # 计算瞬时速度（MB/s）
            time_diff = (current_time - disk_stats['start_time']).total_seconds()
            
            if time_diff > 0 and disk_stats['last_read_bytes'] > 0:
                read_speed_mb = (disk_io.read_bytes - disk_stats['last_read_bytes']) / time_diff / 1024 / 1024
                write_speed_mb = (disk_io.write_bytes - disk_stats['last_write_bytes']) / time_diff / 1024 / 1024
            else:
                read_speed_mb = write_speed_mb = 0
            
            # 更新统计
            disk_stats['last_read_bytes'] = disk_io.read_bytes
            disk_stats['last_write_bytes'] = disk_io.write_bytes
            disk_stats['total_read_bytes'] = disk_io.read_bytes
            disk_stats['total_write_bytes'] = disk_io.write_bytes
        else:
            read_speed_mb = write_speed_mb = 0
            
        return DiskIOInfo(
            read_bytes=disk_io.read_bytes if disk_io else 0,
            write_bytes=disk_io.write_bytes if disk_io else 0,
            read_count=disk_io.read_count if disk_io else 0,
            write_count=disk_io.write_count if disk_io else 0,
            read_speed_mb=round(read_speed_mb, 2),
            write_speed_mb=round(write_speed_mb, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取磁盘I/O信息失败: {str(e)}")

def get_network_info() -> NetworkInfo:
    """获取网络流量信息"""
    try:
        global network_stats
        
        # 获取当前网络统计
        net_io = psutil.net_io_counters()
        current_time = datetime.now()
        
        if net_io:
            # 计算瞬时速度（MB/s）
            time_diff = (current_time - network_stats['start_time']).total_seconds()
            
            if time_diff > 0 and network_stats['last_bytes_sent'] > 0:
                upload_speed = (net_io.bytes_sent - network_stats['last_bytes_sent']) / time_diff / 1024 / 1024
                download_speed = (net_io.bytes_recv - network_stats['last_bytes_recv']) / time_diff / 1024 / 1024
            else:
                upload_speed = download_speed = 0
            
            # 累加总流量（避免重置）
            if network_stats['last_bytes_sent'] > 0:
                network_stats['total_bytes_sent'] += (net_io.bytes_sent - network_stats['last_bytes_sent'])
                network_stats['total_bytes_recv'] += (net_io.bytes_recv - network_stats['last_bytes_recv'])
            
            # 更新统计
            network_stats['last_bytes_sent'] = net_io.bytes_sent
            network_stats['last_bytes_recv'] = net_io.bytes_recv
            
            # 转换为GB（使用累加的总流量）
            today_upload_gb = round(network_stats['total_bytes_sent'] / 1024 / 1024 / 1024, 2)
            today_download_gb = round(network_stats['total_bytes_recv'] / 1024 / 1024 / 1024, 2)
            
            return NetworkInfo(
                bytes_sent=net_io.bytes_sent,
                bytes_recv=net_io.bytes_recv,
                packets_sent=net_io.packets_sent,
                packets_recv=net_io.packets_recv,
                upload_speed_mb=round(upload_speed, 2),
                download_speed_mb=round(download_speed, 2),
                today_upload_gb=today_upload_gb,
                today_download_gb=today_download_gb
            )
        else:
            return NetworkInfo(
                bytes_sent=0, bytes_recv=0, packets_sent=0, packets_recv=0,
                upload_speed_mb=0, download_speed_mb=0,
                today_upload_gb=0, today_download_gb=0
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取网络信息失败: {str(e)}")

def get_system_load() -> SystemLoad:
    """获取系统负载信息"""
    try:
        load_avg = psutil.getloadavg()
        
        return SystemLoad(
            load_1min=round(load_avg[0], 2) if len(load_avg) > 0 else 0,
            load_5min=round(load_avg[1], 2) if len(load_avg) > 1 else 0,
            load_15min=round(load_avg[2], 2) if len(load_avg) > 2 else 0,
            cpu_count=psutil.cpu_count()
        )
    except Exception as e:
        # 如果系统不支持getloadavg（如Windows），返回默认值
        return SystemLoad(
            load_1min=0, load_5min=0, load_15min=0, cpu_count=psutil.cpu_count()
        )

def get_uptime() -> int:
    """获取系统运行时间（秒）"""
    try:
        return int(time.time() - psutil.boot_time())
    except:
        return 0

@app.get("/", response_model=Dict[str, str])
async def root():
    """API根路径，返回服务状态"""
    return {
        "message": "服务器监控系统API服务运行正常",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status", response_model=ServerStatus)
async def get_server_status():
    """获取完整的服务器状态信息"""
    try:
        # 并行获取各项指标
        cpu_info = get_cpu_info()
        memory_info = get_memory_info()
        disk_io_info = get_disk_io_info()
        network_info = get_network_info()
        system_load = get_system_load()
        uptime = get_uptime()
        
        return ServerStatus(
            timestamp=datetime.now().isoformat(),
            cpu=cpu_info,
            memory=memory_info,
            disk_io=disk_io_info,
            network=network_info,
            system_load=system_load,
            uptime=uptime
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取服务器状态失败: {str(e)}")

@app.get("/api/cpu")
async def get_cpu_status():
    """获取CPU状态信息"""
    return get_cpu_info()

@app.get("/api/memory")
async def get_memory_status():
    """获取内存状态信息"""
    return get_memory_info()

@app.get("/api/disk")
async def get_disk_status():
    """获取磁盘I/O状态信息"""
    return get_disk_io_info()

@app.get("/api/network")
async def get_network_status():
    """获取网络状态信息"""
    return get_network_info()

@app.get("/api/load")
async def get_system_load_status():
    """获取系统负载信息"""
    return get_system_load()

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 错误处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局异常处理"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "服务器内部错误",
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    # 启动FastAPI服务，监听48877端口
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=48877,
        reload=True,
        log_level="info"
    )