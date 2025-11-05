"""
服务器监控系统后端API
FastAPI + psutil 实现系统资源监控

重构版本：使用模块化架构
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 导入自定义模块
from core.config import settings
from api.routes import router as monitoring_router
from api.health import router as health_router

# 创建FastAPI应用实例
app = FastAPI(
    title="服务器监控系统API",
    description="实时监控服务器性能指标的RESTful API",
    version="1.0.0"
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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