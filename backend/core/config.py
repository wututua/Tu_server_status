# 配置管理模块

import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # 兼容旧版本pydantic
    from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用基础配置
    app_name: str = "Server Monitor API"
    app_version: str = "1.0.0"
    
    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 48877
    
    # 日志配置
    log_level: str = "INFO"
    log_format: str = "json"
    
    # 监控配置
    monitor_interval: int = 2  # 数据采集间隔（秒）
    
    # CORS 配置
    cors_origins: list = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# 全局配置实例
settings = Settings()

def get_settings() -> Settings:
    """获取配置实例"""
    return settings

def load_environment_variables():
    """加载环境变量"""
    # 这里可以添加环境变量验证逻辑
    pass