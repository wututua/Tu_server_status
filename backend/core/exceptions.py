# 自定义异常类

class ServerMonitorError(Exception):
    """服务器监控基础异常类"""
    
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class MonitorError(ServerMonitorError):
    """监控数据采集异常"""
    pass

class ConfigError(ServerMonitorError):
    """配置错误异常"""
    pass

class APIError(ServerMonitorError):
    """API 相关异常"""
    pass

# 异常处理函数
def handle_monitor_error(error: Exception) -> dict:
    """处理监控错误"""
    return {
        "error": "Monitor data collection failed",
        "message": str(error),
        "type": error.__class__.__name__
    }

def handle_api_error(error: Exception) -> dict:
    """处理 API 错误"""
    return {
        "error": "API request failed",
        "message": str(error),
        "type": error.__class__.__name__
    }