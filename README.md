# 🚀 Server Monitor - 实时服务器监控系统

> **项目仓库**: [https://github.com/wututua/Tu_server_status/](https://github.com/wututua/Tu_server_status/)

[![Python](https://img.shields.io/badge/Python-3.7+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-GPL3.0-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/wututua/Tu_server_status?style=social)](https://github.com/wututua/Tu_server_status)

一个基于FastAPI后端和现代HTML5前端的实时服务器监控系统，提供全面的服务器性能指标监控和可视化展示。

## ✨ 核心特性

- 🎯 **实时监控** - CPU、内存、磁盘、网络等全方位性能监控
- 📊 **可视化图表** - 使用Chart.js绘制动态趋势图表
- 🎨 **响应式设计** - 完美适配PC和移动设备
- ⚡ **高性能** - 优化的数据更新机制，无闪烁刷新
- 🔄 **多服务器支持** - 可配置多个监控目标
- 🛡️ **稳定可靠** - 完善的错误处理和重连机制

## 🖼️ 演示截图

<!-- 请在此处添加实际的项目截图 -->
*注：GitHub发布时请替换为实际的项目截图*

| 桌面端界面 | 移动端界面 |
|------------|------------|
| ![Desktop](https://via.placeholder.com/600x400/2d2d2d/ffffff?text=Desktop+View) | ![Mobile](https://via.placeholder.com/300x500/2d2d2d/ffffff?text=Mobile+View) |

## 📋 目录

- [快速开始](#-快速开始)
- [功能特性](#-功能特性)
- [技术架构](#-技术架构)
- [安装部署](#-安装部署)
- [API文档](#-api文档)
- [配置说明](#-配置说明)
- [Docker部署](#-docker部署)
- [故障排除](#-故障排除)
- [开发贡献](#-开发贡献)
- [许可证](#-许可证)

## 🚀 快速开始

### 系统要求
- **Python**: 3.7+
- **操作系统**: Windows/Linux/macOS
- **浏览器**: Chrome/Firefox/Safari/Edge (现代浏览器)

### 一键启动 (推荐)
```bash
# 克隆项目
git clone https://github.com/wututua/Tu_server_status.git
cd Tu_server_status

# 安装依赖
cd backend
pip install -r requirements.txt

# 启动后端服务
python main.py

# 在浏览器中打开前端
open frontend/index.html
```

### 5分钟快速体验
1. 安装Python依赖
2. 启动后端服务
3. 打开前端界面
4. 开始监控服务器状态！

---

## 🎯 功能特性

### 📊 监控指标
| 类别 | 指标 | 说明 |
|------|------|------|
| **CPU** | 使用率 | 实时CPU负载百分比 |
| | 核心数 | CPU物理核心数量 |
| | 频率 | 当前和最大运行频率 |
| **内存** | 使用率 | 内存使用百分比 |
| | 总量/已用/可用 | 内存使用详细数据 |
| **磁盘** | 读写速度 | 瞬时I/O速度监控 |
| | I/O操作 | 读写操作次数统计 |
| **网络** | 上传/下载速度 | 实时网络流量 |
| | 今日流量统计 | 累计网络使用量 |
| **系统** | 负载状态 | 1/5/15分钟系统负载 |
| | 运行时间 | 服务器持续运行时间 |

### 🎨 界面特色
- **多服务器切换** - 配置文件化管理多个监控目标
- **无闪烁更新** - 优化的数据刷新机制，避免视觉干扰
- **响应式布局** - 完美适配桌面和移动设备
- **暗色主题** - 现代化暗色界面设计
- **实时图表** - 60个数据点的历史趋势分析
- **键盘快捷键** - Ctrl+R快速刷新数据

## 🏗️ 技术架构

### 后端架构 (FastAPI)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FastAPI服务   │ ── │    数据采集      │ ── │   系统监控     │
│   (端口48877)   │    │    (psutil)      │    │   (实时)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  RESTful API    │    │ 数据计算与缓存   │    │ 错误处理机制    │
│  (JSON格式)     │    │  (瞬时速度)      │    │  (重连)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 前端架构 (原生HTML5)
```
┌─────────────────────────────────────────────────────────────┐
│                   前端界面 (index.html)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   应用逻辑   │  │   图表管理   │  │     样式主题         │ │
│  │   (app.js)  │  │  (charts.js) │  │    (style.css)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        │               │                     │
        ▼               ▼                     ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐
│ 数据获取与   │ │ 图表渲染与   │ │ 响应式布局与                │
│ 状态管理     │ │ 动画控制     │ │ 暗色主题                    │
└─────────────┘ └─────────────┘ └─────────────────────────────┘
```

### 技术栈详情

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **后端** | FastAPI | 0.68+ | 高性能Python Web框架 |
| | psutil | 5.8+ | 系统资源监控库 |
| | uvicorn | 0.15+ | ASGI服务器 |
| **前端** | HTML5 | - | 现代Web标准 |
| | JavaScript ES6 | - | 原生JavaScript |
| | Chart.js | 4.x | 数据可视化图表 |
| | Font Awesome | 6.x | 图标库 |
| | CSS3 | - | 响应式样式 |

### 核心特性
- **无依赖前端** - 纯原生技术，无需复杂构建工具
- **实时数据处理** - 优化的瞬时速度计算算法
- **模块化设计** - 前后端完全分离，易于扩展
- **生产就绪** - 完善的错误处理和日志记录

## 💻 安装部署

### 开发环境部署

#### 方法一：直接运行（推荐）
```bash
# 1. 克隆项目
git clone https://github.com/wututua/Tu_server_status.git
cd server-monitor

# 2. 安装Python依赖
cd backend
pip install -r requirements.txt

# 3. 启动后端服务
python main.py
# 服务将在 http://localhost:48877 启动

# 4. 访问前端界面
# 在浏览器中打开 frontend/index.html
# 或使用简易HTTP服务器
cd ..
python -m http.server 8000
# 访问 http://localhost:8000/frontend/
```

#### 方法二：使用虚拟环境
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 安装依赖
pip install -r backend/requirements.txt

# 启动服务
cd backend
python main.py
```

### 生产环境部署

#### 后端部署（使用Gunicorn）
```bash
# 安装Gunicorn
pip install gunicorn

# 启动生产服务
gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:48877 main:app

# 或使用systemd服务（Linux）
sudo nano /etc/systemd/system/server-monitor.service
```

#### 前端部署（Nginx配置）
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/server-monitor/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:48877;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 项目结构

```
server_status/
├── backend/                 # FastAPI后端服务
│   ├── main.py             # 主应用程序
│   └── requirements.txt    # Python依赖包
├── frontend/               # 前端界面
│   ├── index.html          # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       ├── app.js         # 主应用逻辑
│       └── charts.js      # 图表管理模块
└── README.md              # 项目说明文档
```

## 📡 API文档

### 基础信息
- **基础URL**: `http://localhost:48877`
- **数据格式**: JSON
- **认证方式**: 无需认证（生产环境建议添加）

### 主要接口

#### 🔍 GET /api/status
**描述**: 获取完整的服务器状态信息

**响应示例:**
```json
{
  "timestamp": "2024-01-01T12:00:00.000000",
  "cpu": {
    "usage_percent": 25.5,
    "core_count": 8,
    "current_freq": 3200.0,
    "max_freq": 4200.0
  },
  "memory": {
    "total": 17179869184,
    "available": 8589934592,
    "used": 8589934592,
    "usage_percent": 50.0,
    "free": 8589934592
  },
  "disk_io": {
    "read_bytes": 104857600,
    "write_bytes": 52428800,
    "read_count": 100,
    "write_count": 50,
    "read_speed_mb": 100.0,
    "write_speed_mb": 50.0
  },
  "network": {
    "bytes_sent": 1073741824,
    "bytes_recv": 2147483648,
    "packets_sent": 10000,
    "packets_recv": 20000,
    "upload_speed_mb": 10.5,
    "download_speed_mb": 21.0,
    "today_upload_gb": 1.0,
    "today_download_gb": 2.0
  },
  "system_load": {
    "load_1min": 1.2,
    "load_5min": 1.0,
    "load_15min": 0.8,
    "cpu_count": 8
  },
  "uptime": 86400
}
```

#### 📊 其他接口

| 接口 | 方法 | 描述 | 响应格式 |
|------|------|------|----------|
| `/` | GET | 服务状态检查 | `{"message": "ok"}` |
| `/api/cpu` | GET | CPU状态信息 | CPU信息对象 |
| `/api/memory` | GET | 内存状态信息 | 内存信息对象 |
| `/api/disk` | GET | 磁盘I/O状态信息 | 磁盘信息对象 |
| `/api/network` | GET | 网络状态信息 | 网络信息对象 |
| `/api/load` | GET | 系统负载信息 | 负载信息对象 |
| `/health` | GET | 健康检查端点 | `{"status": "healthy"}` |

### 使用示例

#### JavaScript (前端)
```javascript
async function fetchServerStatus() {
    try {
        const response = await fetch('http://localhost:48877/api/status');
        const data = await response.json();
        console.log('CPU使用率:', data.cpu.usage_percent + '%');
        console.log('内存使用:', data.memory.usage_percent + '%');
    } catch (error) {
        console.error('获取数据失败:', error);
    }
}
```

#### Python (后端调用)
```python
import requests

response = requests.get('http://localhost:48877/api/status')
data = response.json()
print(f"CPU使用率: {data['cpu']['usage_percent']}%")
```

#### cURL (命令行)
```bash
curl -X GET http://localhost:48877/api/status | jq .
```

## ⚙️ 配置说明

### 📁 项目结构
```
server-monitor/
├── backend/                 # FastAPI后端服务
│   ├── main.py             # 主应用程序
│   └── requirements.txt    # Python依赖包
├── frontend/               # 前端界面
│   ├── index.html          # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   ├── js/
│   │   ├── app.js         # 主应用逻辑
│   │   └── charts.js      # 图表管理模块
│   └── config/
│       └── servers.json   # 服务器配置文件
└── README.md              # 项目说明文档
```

### 🔧 前端配置

#### 服务器配置文件 (`frontend/config/servers.json`)
```json
{
  "servers": [
    {
      "id": "local",
      "name": "本地服务器",
      "url": "http://localhost:48877/api/status",
      "description": "本地开发环境"
    },
    {
      "id": "prod-1", 
      "name": "生产服务器1",
      "url": "http://192.168.1.100:48877/api/status",
      "description": "主要生产服务器"
    }
  ],
  "defaultServer": "local",
  "minRefreshInterval": 5000
}
```

#### 更新间隔设置
在前端界面右上角可以设置数据更新间隔：

| 间隔 | 适用场景 | 性能影响 |
|------|----------|----------|
| **1秒** | 实时监控需求 | 高负载，推荐开发环境 |
| **2秒** | 平衡性能与实时性 | 中等负载，推荐生产环境 |
| **5秒** | 资源受限环境 | 低负载，适合多服务器监控 |

#### 自定义API地址
修改 `frontend/js/app.js` 中的API配置：
```javascript
// 单个服务器配置
this.apiUrl = 'http://your-server-ip:48877/api/status';

// 或者使用配置文件中的多服务器支持
this.servers = [
    {
        id: 'custom',
        name: '自定义服务器',
        url: 'http://your-server:port/api/status',
        description: '自定义监控目标'
    }
];
```

### 🛠️ 后端配置

#### 端口配置 (`backend/main.py`)
```python
uvicorn.run(
    app,
    host="0.0.0.0",           # 监听所有网络接口
    port=48877,              # 修改端口号
    reload=True,              # 开发环境热重载
    log_level="info"          # 日志级别
)
```

#### 生产环境安全配置
```python
# CORS配置（生产环境）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # 限制具体域名
    allow_credentials=True,
    allow_methods=["GET"],                      # 仅允许GET请求
    allow_headers=["*"],
)

# 添加认证中间件（可选）
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### 🔄 性能优化配置

#### 数据缓存设置
```python
# 在backend/main.py中添加数据缓存
import time
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_data():
    # 数据缓存逻辑
    pass
```

#### 前端性能优化
- 启用浏览器缓存静态资源
- 使用CDN加速Chart.js和Font Awesome
- 压缩CSS和JavaScript文件
- 启用Gzip压缩

## 🐳 Docker部署

### 快速启动（推荐）

#### 使用Docker Compose
```bash
# 1. 创建docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  server-monitor:
    image: python:3.9-slim
    container_name: server-monitor
    working_dir: /app
    volumes:
      - ./backend:/app
      - ./frontend:/app/frontend
    ports:
      - "48877:48877"
    command: >
      sh -c "pip install -r requirements.txt && 
             python main.py"
    restart: unless-stopped
EOF

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

#### 使用Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .
COPY ../frontend /app/frontend

# 暴露端口
EXPOSE 48877

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:48877/health || exit 1

# 启动命令
CMD ["python", "main.py"]
```

### 生产环境Docker配置

#### 多阶段构建优化
```dockerfile
# 构建阶段
FROM python:3.9-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# 运行阶段
FROM python:3.9-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
COPY ../frontend /app/frontend

ENV PATH=/root/.local/bin:$PATH

EXPOSE 48877

# 非root用户运行
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

CMD ["python", "main.py"]
```

#### Kubernetes部署配置
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-monitor
spec:
  replicas: 2
  selector:
    matchLabels:
      app: server-monitor
  template:
    metadata:
      labels:
        app: server-monitor
    spec:
      containers:
      - name: server-monitor
        image: your-registry/server-monitor:latest
        ports:
        - containerPort: 48877
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 48877
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: server-monitor-service
spec:
  selector:
    app: server-monitor
  ports:
  - protocol: TCP
    port: 80
    targetPort: 48877
  type: LoadBalancer
```

## 🔧 故障排除

### 🚨 常见问题与解决方案

#### 连接问题
| 问题现象 | 可能原因 | 解决方案 |
|----------|----------|----------|
| **前端无法连接后端** | 后端服务未启动 | 检查 `python main.py` 是否正常运行 |
| | 端口被占用 | 修改端口或停止占用48877端口的程序 |
| | 防火墙阻止 | 检查防火墙设置，开放48877端口 |
| **API返回404错误** | 路径错误 | 确认API地址为 `http://localhost:48877/api/status` |
| | CORS配置问题 | 检查后端CORS配置是否正确 |

#### 数据显示问题
| 问题现象 | 可能原因 | 解决方案 |
|----------|----------|----------|
| **图表显示异常** | Chart.js加载失败 | 检查网络连接，确认CDN可用 |
| | 数据格式错误 | 检查API返回数据是否符合预期格式 |
| | 浏览器缓存 | 清除浏览器缓存或使用无痕模式 |
| **数据更新延迟** | 网络延迟 | 检查网络连接质量 |
| | 服务器负载高 | 调整更新间隔为5秒或更长 |
| | 浏览器性能 | 关闭其他标签页释放资源 |

#### 性能问题
| 问题现象 | 可能原因 | 解决方案 |
|----------|----------|----------|
| **CPU使用率过高** | 更新间隔过短 | 调整为2-5秒更新间隔 |
| | 图表渲染频繁 | 减少图表数据点数量（默认60个） |
| | 浏览器内存泄漏 | 定期刷新页面或重启浏览器 |

### 📊 日志诊断

#### 后端日志查看
```bash
# 查看实时日志
python main.py

# 或使用Gunicorn时
gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:48877 main:app --access-logfile -

# 检查服务状态
curl http://localhost:48877/health
```

#### 前端调试
```javascript
// 在浏览器控制台中检查
console.log('API响应:', responseData);

// 检查网络请求
// 打开浏览器开发者工具 → Network标签

// 检查JavaScript错误
// 打开浏览器开发者工具 → Console标签
```

### 🔍 高级诊断

#### 性能监控
```bash
# 监控后端进程资源使用
top -p $(pgrep -f "python main.py")

# 监控网络连接
netstat -tulpn | grep 48877

# 检查端口占用
lsof -i :48877
```

#### 数据库连接（如扩展）
```python
# 添加数据库连接监控
try:
    # 数据库操作
    pass
except Exception as e:
    logging.error(f"数据库连接错误: {e}")
```

### 🛠️ 维护命令

#### 系统服务管理（Linux）
```bash
# 创建systemd服务
sudo nano /etc/systemd/system/server-monitor.service

# 服务文件内容
[Unit]
Description=Server Monitor API
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/server-monitor/backend
ExecStart=/usr/local/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target

# 启用服务
sudo systemctl enable server-monitor
sudo systemctl start server-monitor
sudo systemctl status server-monitor
```

#### 日志轮转配置
```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/server-monitor

# 配置内容
/var/log/server-monitor/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 appuser appuser
}
```

## 👥 开发贡献

### 🏗️ 项目架构

#### 代码结构
```
server-monitor/
├── backend/                 # FastAPI后端
│   ├── main.py             # 主应用入口
│   ├── models.py          # 数据模型（可扩展）
│   ├── utils.py           # 工具函数
│   └── requirements.txt   # 依赖管理
├── frontend/              # 前端界面
│   ├── index.html        # 主页面
│   ├── css/
│   │   └── style.css     # 样式文件
│   ├── js/
│   │   ├── app.js        # 主应用逻辑
│   │   └── charts.js     # 图表组件
│   └── config/
│       └── servers.json  # 配置管理
└── docs/                 # 文档目录
    ├── api.md           # API文档
    └── deployment.md    # 部署指南
```

### 🔄 开发流程

#### 环境设置
```bash
# 1. Fork项目
git clone https://github.com/wututua/Tu_server_status.git
cd server-monitor

# 2. 创建开发分支
git checkout -b feature/your-feature

# 3. 安装开发依赖
cd backend
pip install -r requirements.txt

# 4. 启动开发服务器
python main.py
```

#### 代码规范
- **后端**: 遵循PEP8规范，使用Black格式化
- **前端**: 使用ES6+标准，变量命名清晰
- **注释**: 所有函数和类都有详细文档注释
- **提交信息**: 使用约定式提交（Conventional Commits）

### 🚀 扩展开发

#### 添加新的监控指标
1. **后端扩展** (`backend/main.py`)
```python
# 1. 添加数据获取函数
def get_new_metric():
    # 实现新的监控指标逻辑
    pass

# 2. 更新数据模型
class NewMetricInfo(BaseModel):
    metric_value: float
    metric_unit: str

# 3. 添加API端点
@app.get("/api/new-metric")
async def get_new_metric_status():
    return get_new_metric()
```

2. **前端集成** (`frontend/js/app.js`)
```javascript
// 1. 更新UI显示逻辑
updateNewMetricInfo(data) {
    const element = document.getElementById('newMetric');
    if (element) {
        element.textContent = `${data.new_metric.metric_value} ${data.new_metric.metric_unit}`;
    }
}

// 2. 在updateUI方法中调用
updateUI(data) {
    this.updateCPUInfo(data.cpu);
    this.updateNewMetricInfo(data.new_metric); // 新增
    // ... 其他更新
}
```

#### 自定义主题
修改 `frontend/css/style.css` 中的CSS变量：
```css
:root {
    /* 浅色主题示例 */
    --primary-color: #007acc;
    --bg-dark: #f5f5f5;
    --text-primary: #333333;
    /* ... 其他变量 */
}
```

### 🤝 贡献指南

#### 提交Pull Request
1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

#### 报告问题
- 使用GitHub Issues报告bug或建议
- 提供详细的问题描述和复现步骤
- 包含操作系统、Python版本等环境信息

#### 代码审查标准
- 代码符合项目规范
- 包含适当的测试用例
- 更新相关文档
- 不破坏现有功能

### 📈 版本历史

#### v1.1.0 (计划中)
- [ ] 添加数据库持久化支持
- [ ] 实现用户认证系统
- [ ] 添加邮件/短信告警功能
- [ ] 支持多语言界面

#### v1.0.0 (当前版本)
- ✅ 实时服务器性能监控
- ✅ 响应式前端界面
- ✅ 多服务器支持
- ✅ 无闪烁数据更新
- ✅ Docker部署支持

## 📄 许可证

本项目采用 [GPL3.0许可证](LICENSE) - 详见许可证文件。

## 🌟 Star历史

[![Stargazers over time](https://starchart.cc/wututua/Tu_server_status.svg)](https://starchart.cc/wututua/Tu_server_status)

## 🔗 相关项目

- [psutil](https://github.com/giampaolo/psutil) - 跨平台系统监控库
- [FastAPI](https://github.com/tiangolo/fastapi) - 高性能Python Web框架
- [Chart.js](https://github.com/chartjs/Chart.js) - 简单灵活的图表库

## 📞 联系方式

- **项目维护者**: [wututua](https://github.com/wututua)
- **游戏联系邮箱**: wututua@qq.com
- **GitHub Issues**: [提交问题](https://github.com/wututua/Tu_server_status/issues)
- **讨论区**: [GitHub Discussions](https://github.com/wututua/Tu_server_status/discussions)

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

<div align="center">

**如果这个项目对您有帮助，请给个⭐️支持一下！**

[![GitHub stars](https://img.shields.io/github/stars/wututua/Tu_server_status?style=social)](https://github.com/wututua/Tu_server_status)
[![GitHub forks](https://img.shields.io/github/forks/wututua/Tu_server_status?style=social)](https://github.com/wututua/Tu_server_status)

</div>