"""
服务器监控系统后端API
FastAPI + psutil 实现系统资源监控

重构版本：使用模块化架构
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# 导入自定义模块
from core.config import settings
from api.routes import router as monitoring_router, init_traffic_system
from api.health import router as health_router
from api.system_routes import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时初始化流量系统
    init_traffic_system()
    print("流量监控系统已初始化")
    yield
    # 应用关闭时的清理逻辑
    print("服务器监控系统正在关闭...")

# 创建FastAPI应用实例
app = FastAPI(
    title="服务器监控系统API",
    description="实时监控服务器性能指标的RESTful API",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(monitoring_router)
app.include_router(health_router)
app.include_router(system_router)

# 启动应用
if __name__ == "__main__":
    # 启动FastAPI服务
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info"
    )