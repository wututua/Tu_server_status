#!/usr/bin/env python3
"""
服务器监控系统安装脚本
自动安装项目依赖并配置环境
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

class SetupManager:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        
    def check_python_version(self):
        """检查Python版本"""
        if sys.version_info < (3, 7):
            print("❌ 需要Python 3.7或更高版本")
            sys.exit(1)
        print(f"✅ Python版本: {platform.python_version()}")
    
    def install_backend_dependencies(self):
        """安装后端依赖"""
        print("\n🔧 安装后端依赖...")
        requirements_file = self.backend_dir / "requirements.txt"
        
        if not requirements_file.exists():
            print("❌ 未找到requirements.txt文件")
            return False
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", 
                "-r", str(requirements_file)
            ])
            print("✅ 后端依赖安装完成")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ 后端依赖安装失败: {e}")
            return False
    
    def create_config_files(self):
        """创建配置文件"""
        print("\n📁 创建配置文件...")
        
        # 创建环境配置文件
        env_template = """# 服务器监控系统环境配置

# 后端配置
HOST=0.0.0.0
PORT=48877
DEBUG=False

# CORS配置
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/server_monitor.log

# 监控配置
MONITOR_INTERVAL=5  # 监控间隔(秒)
"""
        
        env_file = self.project_root / ".env"
        if not env_file.exists():
            env_file.write_text(env_template, encoding='utf-8')
            print("✅ 创建环境配置文件 (.env)")
        
        # 创建日志目录
        logs_dir = self.project_root / "logs"
        logs_dir.mkdir(exist_ok=True)
        print("✅ 创建日志目录 (logs/)")
        
        return True
    
    def validate_project_structure(self):
        """验证项目结构"""
        print("\n📋 验证项目结构...")
        
        required_dirs = [
            self.backend_dir,
            self.frontend_dir,
            self.backend_dir / "api",
            self.backend_dir / "core", 
            self.backend_dir / "monitor",
            self.frontend_dir / "js",
            self.frontend_dir / "css",
            self.frontend_dir / "config"
        ]
        
        all_exists = True
        for directory in required_dirs:
            if directory.exists():
                print(f"✅ {directory.relative_to(self.project_root)}")
            else:
                print(f"❌ {directory.relative_to(self.project_root)} - 目录不存在")
                all_exists = False
        
        return all_exists
    
    def display_usage_instructions(self):
        """显示使用说明"""
        print("\n" + "="*60)
        print("🚀 服务器监控系统安装完成！")
        print("="*60)
        
        print("\n📚 快速开始:")
        print("1. 启动后端服务:")
        print("   cd backend")
        print("   python main.py")
        
        print("\n2. 访问前端界面:")
        print("   打开浏览器访问: http://localhost:3000")
        
        print("\n3. Docker部署:")
        print("   docker-compose up -d")
        
        print("\n🔧 开发命令:")
        print("   后端开发: cd backend && python main.py")
        print("   前端开发: 使用Live Server等工具打开frontend/index.html")
        
        print("\n📖 更多信息:")
        print("   查看 README.md 获取详细文档")
        print("   查看 CONTRIBUTING.md 了解贡献指南")
        print("="*60)
    
    def run(self):
        """运行安装程序"""
        print("🚀 服务器监控系统安装程序")
        print("="*60)
        
        # 检查Python版本
        self.check_python_version()
        
        # 验证项目结构
        if not self.validate_project_structure():
            print("\n❌ 项目结构不完整，请检查文件结构")
            sys.exit(1)
        
        # 安装依赖
        if not self.install_backend_dependencies():
            print("\n❌ 依赖安装失败")
            sys.exit(1)
        
        # 创建配置文件
        self.create_config_files()
        
        # 显示使用说明
        self.display_usage_instructions()

if __name__ == "__main__":
    setup = SetupManager()
    setup.run()