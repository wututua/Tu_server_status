"""
系统硬件信息路由
提供详细的系统硬件信息查询接口
"""

from fastapi import APIRouter
from monitor.system_monitor import get_system_hardware_info

router = APIRouter(prefix="/api", tags=["system-info"])

@router.get("/system/hardware")
async def get_system_hardware():
    """
    获取完整的系统硬件信息
    
    返回详细的系统硬件信息，包括：
    - 操作系统信息
    - CPU详细信息
    - 内存信息
    - 磁盘信息
    - GPU信息
    - 网络接口信息
    - BIOS信息
    - 系统运行时间
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info,
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取系统硬件信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/os")
async def get_os_info():
    """
    获取操作系统信息
    
    返回操作系统相关的详细信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("os_info", {}),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取操作系统信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/cpu")
async def get_cpu_detailed_info():
    """
    获取CPU详细信息
    
    返回CPU的详细规格和使用信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("cpu_info", {}),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取CPU信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/memory")
async def get_memory_detailed_info():
    """
    获取内存详细信息
    
    返回内存的详细规格和使用信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("memory_info", {}),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取内存信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/disk")
async def get_disk_detailed_info():
    """
    获取磁盘详细信息
    
    返回所有磁盘分区的详细信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("disk_info", []),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取磁盘信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/gpu")
async def get_gpu_detailed_info():
    """
    获取GPU详细信息
    
    返回所有GPU的详细信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("gpu_info", []),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取GPU信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/network")
async def get_network_detailed_info():
    """
    获取网络接口详细信息
    
    返回所有网络接口的详细信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("network_info", {}),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取网络信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/bios")
async def get_bios_info():
    """
    获取BIOS信息
    
    返回BIOS版本和日期信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("bios_info", {}),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取BIOS信息失败: {str(e)}",
            "data": None
        }

@router.get("/system/uptime")
async def get_system_uptime():
    """
    获取系统运行时间
    
    返回系统运行时间的详细信息
    """
    try:
        hardware_info = get_system_hardware_info()
        return {
            "success": True,
            "data": hardware_info.get("system_uptime", {}),
            "timestamp": hardware_info.get("os_info", {}).get("timestamp", "")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"获取系统运行时间失败: {str(e)}",
            "data": None
        }