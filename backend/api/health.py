# 健康检查端点

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import psutil

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    """健康检查端点"""
    try:
        # 检查系统资源是否可访问
        psutil.cpu_percent(interval=0.1)
        psutil.virtual_memory()
        
        return {"status": "healthy", "message": "Server monitor is running normally"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

@router.get("/")
async def root():
    """根路径端点"""
    return {"message": "Server Monitor API", "status": "ok"}