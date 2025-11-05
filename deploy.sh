#!/bin/bash

# 服务器监控系统部署脚本

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# 检查Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log "Docker环境检查通过"
}

# 构建镜像
build_images() {
    log "构建Docker镜像..."
    docker-compose build
    
    if [ $? -eq 0 ]; then
        log "镜像构建完成"
    else
        error "镜像构建失败"
        exit 1
    fi
}

# 启动服务
start_services() {
    log "启动服务..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        log "服务启动成功"
    else
        error "服务启动失败"
        exit 1
    fi
}

# 检查服务状态
check_services() {
    log "检查服务状态..."
    
    # 等待服务启动
    sleep 10
    
    # 检查API服务
    if curl -f http://localhost:48877/health &> /dev/null; then
        log "API服务运行正常"
    else
        error "API服务未响应"
        exit 1
    fi
    
    # 检查前端服务
    if curl -f http://localhost &> /dev/null; then
        log "前端服务运行正常"
    else
        error "前端服务未响应"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "="*60
    echo "🚀 服务器监控系统部署完成！"
    echo "="*60
    echo ""
    echo "📊 服务信息："
    echo "   前端界面: http://localhost"
    echo "   后端API: http://localhost:48877"
    echo "   健康检查: http://localhost:48877/health"
    echo ""
    echo "🔧 管理命令："
    echo "   查看服务状态: docker-compose ps"
    echo "   查看日志: docker-compose logs -f"
    echo "   停止服务: docker-compose down"
    echo "   重启服务: docker-compose restart"
    echo ""
    echo "📋 健康检查："
    echo "   运行: curl http://localhost:48877/health"
    echo ""
    echo "="*60
}

# 主函数
main() {
    echo "🚀 开始部署服务器监控系统..."
    echo ""
    
    # 检查Docker环境
    check_docker
    
    # 构建镜像
    build_images
    
    # 启动服务
    start_services
    
    # 检查服务状态
    check_services
    
    # 显示部署信息
    show_deployment_info
}

# 执行主函数
main "$@"