# 后端服务

FastAPI 后端服务，提供服务器监控数据的 API 接口。

## 🏗️ 项目结构

```
backend/
├── api/                    # API 路由模块
│   ├── __init__.py
│   ├── routes.py          # 主要路由定义
│   └── health.py          # 健康检查端点
├── core/                  # 核心业务逻辑
│   ├── __init__.py
│   ├── config.py          # 配置管理
│   └── exceptions.py      # 自定义异常
├── monitor/               # 监控数据采集
│   ├── __init__.py
│   ├── cpu_monitor.py     # CPU 监控
│   ├── memory_monitor.py  # 内存监控
│   ├── disk_monitor.py    # 磁盘监控
│   └── network_monitor.py # 网络监控
├── utils/                 # 工具函数
│   ├── __init__.py
│   └── helpers.py         # 辅助函数
├── main.py               # 应用入口
├── requirements.txt      # 依赖管理
└── README.md            # 本文件
```

## 🚀 快速开始

### 安装依赖
```bash
pip install -r requirements.txt
```

### 启动服务
```bash
python main.py
```

服务将在 http://localhost:48877 启动

### 开发模式
```bash
# 启用热重载
uvicorn main:app --reload --host 0.0.0.0 --port 48877
```

## 📡 API 文档

启动服务后访问：
- Swagger UI: http://localhost:48877/docs
- ReDoc: http://localhost:48877/redoc

### 主要接口

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/status` | GET | 获取完整服务器状态 |
| `/api/health` | GET | 健康检查 |
| `/api/cpu` | GET | CPU 状态信息 |
| `/api/memory` | GET | 内存状态信息 |
| `/api/disk` | GET | 磁盘 I/O 信息 |
| `/api/network` | GET | 网络状态信息 |

## 🔧 配置

### 环境变量

```bash
# 服务配置
SERVER_HOST=0.0.0.0
SERVER_PORT=48877

# 日志配置
LOG_LEVEL=INFO
LOG_FORMAT=json

# 监控配置
MONITOR_INTERVAL=2  # 数据采集间隔（秒）
```

### 配置文件

在 `core/config.py` 中管理应用配置：

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Server Monitor API"
    host: str = "0.0.0.0"
    port: int = 48877
    
    class Config:
        env_file = ".env"
```

## 🧪 测试

### 运行测试
```bash
pytest tests/
```

### 测试覆盖率
```bash
pytest --cov=backend tests/
```

## 🐳 Docker 部署

### 构建镜像
```bash
docker build -t server-monitor-backend .
```

### 运行容器
```bash
docker run -d -p 48877:48877 server-monitor-backend
```

## 🔍 监控指标

### CPU 监控
- 使用率百分比
- 核心数统计
- 频率信息

### 内存监控
- 总内存/已用/可用
- 使用率百分比
- 缓存和交换信息

### 磁盘监控
- 读写速度（MB/s）
- I/O 操作次数
- 磁盘使用率

### 网络监控
- 上传/下载速度
- 数据包统计
- 今日流量统计

## 📊 性能优化

### 数据缓存
使用内存缓存减少重复计算：

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_metrics():
    # 缓存数据获取逻辑
    pass
```

### 异步处理
对于耗时操作使用异步处理：

```python
@app.get("/api/status")
async def get_status():
    # 异步获取数据
    data = await fetch_metrics()
    return data
```

## 🔒 安全考虑

### CORS 配置
在生产环境中限制跨域访问：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

### 速率限制
添加 API 调用频率限制：

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

## 📈 扩展开发

### 添加新的监控指标

1. 在 `monitor/` 目录创建新的监控模块
2. 实现数据采集逻辑
3. 在 `api/routes.py` 中添加对应的路由
4. 更新 API 文档

### 数据库集成
如需持久化存储：

```python
# 添加数据库模型
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
engine = create_engine("sqlite:///monitor.db")
```

## 🚨 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep 48877
   
   # 或修改端口配置
   SERVER_PORT=48878
   ```

2. **依赖安装失败**
   ```bash
   # 更新 pip
   pip install --upgrade pip
   
   # 使用虚拟环境
   python -m venv venv
   source venv/bin/activate
   ```

3. **权限问题**
   ```bash
   # 确保有系统监控权限
   sudo python main.py
   ```

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 或直接查看控制台输出
python main.py
```

## 📞 支持

- 问题反馈：[GitHub Issues](链接)
- 文档更新：[GitHub Wiki](链接)
- 开发讨论：[GitHub Discussions](链接)

---

**后端服务** · 稳定可靠 · 高性能监控