"""
系统硬件信息监控模块
支持跨平台（Windows/Linux/MacOS）获取系统硬件信息
"""

import psutil
import platform
import subprocess
import re
from typing import Dict, List, Optional
import sys

class SystemMonitor:
    """系统硬件信息监控类"""
    
    def __init__(self):
        self.system_info = {}
    
    def safe_subprocess_run(self, command, **kwargs):
        """安全的子进程调用，处理编码问题"""
        try:
            # 在Windows上使用gbk编码，其他系统使用utf-8
            if platform.system() == "Windows":
                if 'encoding' not in kwargs:
                    kwargs['encoding'] = 'gbk'
            else:
                if 'encoding' not in kwargs:
                    kwargs['encoding'] = 'utf-8'
            
            return subprocess.run(command, **kwargs)
        except UnicodeDecodeError:
            # 如果发生编码错误，尝试使用字节模式
            try:
                result = subprocess.run(command, capture_output=True, **{k: v for k, v in kwargs.items() if k not in ['text', 'encoding']})
                if result.returncode == 0:
                    # 尝试不同编码解码
                    for encoding in ['gbk', 'utf-8', 'latin-1']:
                        try:
                            stdout = result.stdout.decode(encoding)
                            result.stdout = stdout
                            return result
                        except UnicodeDecodeError:
                            continue
                    # 如果所有编码都失败，返回原始字节
                    return result
            except Exception as e:
                print(f"子进程执行错误: {e}", file=sys.stderr)
                return None
        except Exception as e:
            print(f"子进程执行错误: {e}", file=sys.stderr)
            return None
        
    def get_system_info(self) -> Dict:
        """获取完整的系统硬件信息"""
        
        return {
            "os_info": self.get_os_info(),
            "cpu_info": self.get_cpu_info(),
            "memory_info": self.get_memory_info(),
            "disk_info": self.get_disk_info(),
            "gpu_info": self.get_gpu_info(),
            "network_info": self.get_network_info(),
            "bios_info": self.get_bios_info(),
            "system_uptime": self.get_system_uptime()
        }
    
    def get_os_info(self) -> Dict:
        """获取操作系统信息"""
        system = platform.system()
        
        os_info = {
            "system": system,
            "version": platform.version(),
            "release": platform.release(),
            "architecture": platform.architecture()[0],
            "machine": platform.machine(),
            "processor": platform.processor(),
            "platform": platform.platform()
        }
        
        # Windows 特定信息
        if system == "Windows":
            try:
                result = self.safe_subprocess_run(['systeminfo'], capture_output=True, text=True)
                if result and result.returncode == 0:
                    # 解析Windows版本信息
                    for line in result.stdout.split('\n'):
                        if 'OS 名称:' in line or 'OS Name:' in line:
                            os_info["os_name"] = line.split(':')[1].strip()
                        elif 'OS 版本:' in line or 'OS Version:' in line:
                            os_info["os_version"] = line.split(':')[1].strip()
            except:
                pass
        
        # Linux 特定信息
        elif system == "Linux":
            try:
                # 获取Linux发行版信息
                with open('/etc/os-release', 'r') as f:
                    for line in f:
                        if line.startswith('PRETTY_NAME='):
                            os_info["os_name"] = line.split('=')[1].strip().strip('"')
                            break
            except:
                pass
        
        return os_info
    
    def get_cpu_info(self) -> Dict:
        """获取CPU详细信息"""
        cpu_info = {
            "physical_cores": psutil.cpu_count(logical=False),
            "total_cores": psutil.cpu_count(logical=True),
            "usage_percent": psutil.cpu_percent(interval=1),
            "current_frequency": 0.0,
            "max_frequency": 0.0,
            "model": "Unknown",
            "vendor": "Unknown"
        }
        
        # 获取CPU频率
        cpu_freq = psutil.cpu_freq()
        if cpu_freq:
            cpu_info["current_frequency"] = cpu_freq.current
            cpu_info["max_frequency"] = cpu_freq.max
        
        # 获取CPU型号信息
        system = platform.system()
        
        if system == "Windows":
            try:
                result = self.safe_subprocess_run(
                    ['wmic', 'cpu', 'get', 'name,manufacturer', '/format:list'],
                    capture_output=True, text=True
                )
                if result and result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if line.startswith('Name='):
                            cpu_info["model"] = line.split('=')[1].strip()
                        elif line.startswith('Manufacturer='):
                            cpu_info["vendor"] = line.split('=')[1].strip()
            except:
                pass
        
        elif system == "Linux":
            try:
                # 从/proc/cpuinfo获取CPU信息
                with open('/proc/cpuinfo', 'r') as f:
                    cpuinfo = f.read()
                    
                # 提取型号名称
                model_match = re.search(r'model name\s+:\s+(.+)', cpuinfo)
                if model_match:
                    cpu_info["model"] = model_match.group(1).strip()
                
                # 提取供应商
                vendor_match = re.search(r'vendor_id\s+:\s+(.+)', cpuinfo)
                if vendor_match:
                    cpu_info["vendor"] = vendor_match.group(1).strip()
                    
            except:
                pass
        
        elif system == "Darwin":  # macOS
            try:
                result = subprocess.run(['sysctl', '-n', 'machdep.cpu.brand_string'],
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    cpu_info["model"] = result.stdout.strip()
                
                result = subprocess.run(['sysctl', '-n', 'machdep.cpu.vendor'],
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    cpu_info["vendor"] = result.stdout.strip()
            except:
                pass
        
        return cpu_info
    
    def get_memory_info(self) -> Dict:
        """获取内存详细信息"""
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "free": memory.free,
            "usage_percent": memory.percent,
            "swap_total": swap.total,
            "swap_used": swap.used,
            "swap_free": swap.free,
            "swap_usage_percent": swap.percent
        }
    
    def get_disk_info(self) -> List[Dict]:
        """获取磁盘分区信息"""
        disk_info = []
        
        # 获取所有磁盘分区
        partitions = psutil.disk_partitions()
        
        for partition in partitions:
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                
                disk_info.append({
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "fstype": partition.fstype,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "usage_percent": usage.percent
                })
            except PermissionError:
                # 有些分区可能没有权限访问
                continue
        
        return disk_info
    
    def get_gpu_info(self) -> List[Dict]:
        """获取GPU信息"""
        gpu_info = []
        system = platform.system()
        
                # NVIDIA GPU (Windows/Linux)
        try:
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=index,name,memory.total,memory.used,utilization.gpu,temperature.gpu', 
                 '--format=csv,noheader,nounits'],
                capture_output=True, text=True, encoding='utf-8', timeout=10
            )
            
            if result.returncode == 0 and result.stdout.strip():
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    data = line.split(', ')
                    if len(data) >= 6:
                        gpu_info.append({
                            "vendor": "NVIDIA",
                            "index": int(data[0]),
                            "name": data[1].strip(),
                            "memory_total": float(data[2]),
                            "memory_used": float(data[3]),
                            "usage_percent": float(data[4]),
                            "temperature": float(data[5])
                        })
        except:
            pass
        
        # AMD GPU (Windows)
        if system == "Windows" and not gpu_info:
            try:
                # 尝试使用wmic获取AMD显卡信息
                result = self.safe_subprocess_run(
                    ['wmic', 'path', 'win32_VideoController', 'get', 'name,adapterram', '/format:list'],
                    capture_output=True, text=True
                )
                
                if result and result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    current_gpu = {}
                    
                    for line in lines:
                        if line.startswith('Name='):
                            current_gpu["name"] = line.split('=')[1].strip()
                            if 'AMD' in current_gpu["name"] or 'Radeon' in current_gpu["name"]:
                                current_gpu["vendor"] = "AMD"
                        elif line.startswith('AdapterRAM='):
                            memory_bytes = int(line.split('=')[1].strip())
                            current_gpu["memory_total"] = memory_bytes / (1024 * 1024)  # 转换为MB
                    
                    if current_gpu.get("name") and current_gpu.get("vendor"):
                        gpu_info.append(current_gpu)
                        
            except:
                pass
        
        return gpu_info
    
    def get_network_info(self) -> Dict:
        """获取网络接口信息"""
        network_info = {
            "interfaces": [],
            "total_upload": 0,
            "total_download": 0
        }
        
        # 获取网络接口统计
        net_io = psutil.net_io_counters(pernic=True)
        
        for interface, stats in net_io.items():
            # 跳过虚拟和内部接口
            if interface.startswith(('lo', 'virbr', 'docker', 'veth')):
                continue
                
            network_info["interfaces"].append({
                "name": interface,
                "bytes_sent": stats.bytes_sent,
                "bytes_recv": stats.bytes_recv,
                "packets_sent": stats.packets_sent,
                "packets_recv": stats.packets_recv
            })
            
            network_info["total_upload"] += stats.bytes_sent
            network_info["total_download"] += stats.bytes_recv
        
        return network_info
    
    def get_bios_info(self) -> Dict:
        """获取BIOS信息"""
        bios_info = {
            "bios_version": "Unknown",
            "bios_date": "Unknown"
        }
        
        system = platform.system()
        
        if system == "Windows":
            try:
                result = self.safe_subprocess_run(
                    ['wmic', 'bios', 'get', 'version,releasedate', '/format:list'],
                    capture_output=True, text=True
                )
                
                if result and result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if line.startswith('Version='):
                            bios_info["bios_version"] = line.split('=')[1].strip()
                        elif line.startswith('ReleaseDate='):
                            bios_info["bios_date"] = line.split('=')[1].strip()
            except:
                pass
        
        elif system == "Linux":
            try:
                # 尝试从/sys文件系统获取BIOS信息
                with open('/sys/class/dmi/id/bios_version', 'r') as f:
                    bios_info["bios_version"] = f.read().strip()
                
                with open('/sys/class/dmi/id/bios_date', 'r') as f:
                    bios_info["bios_date"] = f.read().strip()
            except:
                pass
        
        return bios_info
    
    def get_system_uptime(self) -> Dict:
        """获取系统运行时间"""
        boot_time = psutil.boot_time()
        uptime_seconds = int(psutil.time.time() - boot_time)
        
        # 转换为可读格式
        days = uptime_seconds // 86400
        hours = (uptime_seconds % 86400) // 3600
        minutes = (uptime_seconds % 3600) // 60
        seconds = uptime_seconds % 60
        
        return {
            "seconds": uptime_seconds,
            "days": days,
            "hours": hours,
            "minutes": minutes,
            "readable": f"{days}天{hours}小时{minutes}分钟{seconds}秒"
        }

# 全局系统监控实例
system_monitor = SystemMonitor()

def get_system_hardware_info() -> Dict:
    """获取系统硬件信息（对外接口）"""
    return system_monitor.get_system_info()