# Windows 部署和卸载指南

## 概述

本文档提供了 Server Status Monitor 在 Windows 系统上的完整部署和卸载指南。我们提供了多种安装方式以满足不同场景的需求。

## 系统要求

- **操作系统**: Windows 7 / Server 2008 R2 或更高版本
- **PowerShell**: 版本 3.0 或更高
- **管理员权限**: 需要以管理员身份运行安装脚本
- **Python**: 可选，用于安装依赖包

## 安装脚本说明

### PowerShell 部署脚本 (`deploy-windows.ps1`)

**功能特性:**
- 完整的系统兼容性检查
- 详细的错误处理和回滚机制
- 自动备份现有安装
- Windows 服务配置
- 环境变量和注册表配置
- 桌面快捷方式创建
- 详细的日志记录

**使用方式:**
```powershell
# 标准安装
powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1"

# 静默安装
powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1" -Silent

# 完全静默安装
powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1" -VerySilent

# 安静模式
powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1" -Quiet
```

### Batch 部署脚本 (`install.bat`)

**功能特性:**
- 兼容性更好的批处理实现
- 基本的系统检查
- 调用 PowerShell 脚本进行实际安装
- 简单的日志记录

**使用方式:**
```batch
# 标准安装
install.bat

# 静默安装
install.bat /SILENT

# 完全静默安装
install.bat /VERYSILENT

# 安静模式
install.bat /QUIET
```

## 卸载脚本说明

### PowerShell 卸载脚本 (`uninstall-windows.ps1`)

**功能特性:**
- 完整的清理操作
- 停止并删除 Windows 服务
- 清理环境变量和注册表
- 删除安装目录和快捷方式
- 验证卸载结果

**使用方式:**
```powershell
# 标准卸载
powershell -ExecutionPolicy Bypass -File "uninstall-windows.ps1"

# 安静模式卸载
powershell -ExecutionPolicy Bypass -File "uninstall-windows.ps1" -Quiet
```

### Batch 卸载脚本 (`uninstall.bat`)

**功能特性:**
- 简单的批处理界面
- 调用 PowerShell 脚本进行实际卸载

**使用方式:**
```batch
# 标准卸载
uninstall.bat

# 安静模式卸载
uninstall.bat /QUIET
```

## 安装流程

### 1. 系统检查
- 验证 Windows 版本兼容性
- 检查 PowerShell 版本
- 确认管理员权限

### 2. 备份现有安装
- 如果存在旧版本，自动备份到临时目录
- 保留配置文件和用户数据

### 3. 文件复制
- 复制后端 Python 文件到安装目录
- 复制前端文件到子目录
- 验证文件完整性

### 4. 系统配置
- **环境变量**: 设置 PATH 和应用特定变量
- **注册表**: 创建卸载条目和配置信息
- **Windows 服务**: 创建并启动监控服务

### 5. 依赖安装
- 自动检测并安装 Python 依赖包
- 配置运行时环境

### 6. 快捷方式创建
- 桌面快捷方式
- 开始菜单快捷方式（可选）

### 7. 安装验证
- 检查所有组件是否正确安装
- 验证服务状态
- 生成安装报告

## 卸载流程

### 1. 停止服务
- 停止运行的 Windows 服务
- 确保无进程占用文件

### 2. 清理系统配置
- **环境变量**: 从 PATH 中移除安装目录
- **注册表**: 删除所有相关注册表项
- **Windows 服务**: 删除服务配置

### 3. 删除文件
- 删除安装目录
- 删除桌面和开始菜单快捷方式
- 清理临时文件

### 4. 验证卸载
- 确认所有组件已完全移除
- 生成卸载报告

## 安装目录结构

安装完成后，系统将创建以下目录结构：

```
%PROGRAMFILES%\ServerStatusMonitor\
├── main.py                 # 主应用程序
├── requirements.txt        # Python 依赖列表
├── api/                    # API 模块
├── core/                   # 核心模块
├── monitor/                # 监控模块
└── frontend/              # 前端文件
    ├── index.html
    ├── css/
    ├── js/
    └── components/
```

## 环境变量配置

安装脚本会自动配置以下环境变量：

- **SERVER_STATUS_HOME**: 安装目录路径
- **SERVER_STATUS_PORT**: 服务运行端口（默认 48877）
- **PATH**: 添加安装目录到系统路径

## 注册表配置

安装脚本会创建以下注册表项：

- **HKLM\SOFTWARE\ServerStatusMonitor**: 应用程序配置信息
- **HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ServerStatusMonitor**: 卸载程序信息

## 日志文件

所有安装和卸载操作都会记录到以下日志文件：

- **安装日志**: `%TEMP%\ServerStatusMonitor_install.log`
- **卸载日志**: `%TEMP%\ServerStatusMonitor_uninstall.log`
- **批处理日志**: `%TEMP%\ServerStatusMonitor_install_batch.log`
- **批处理卸载日志**: `%TEMP%\ServerStatusMonitor_uninstall_batch.log`

## 故障排除

### 常见问题

1. **权限不足**
   - 解决方案：以管理员身份运行脚本

2. **PowerShell 执行策略限制**
   - 解决方案：脚本会自动设置执行策略，或手动运行：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **文件被占用**
   - 解决方案：关闭所有相关进程后重试

4. **防病毒软件阻止**
   - 解决方案：临时禁用防病毒软件或添加例外

### 获取帮助

如果遇到问题，请检查日志文件获取详细信息，或联系：
- **邮箱**: wututua@qq.com
- **GitHub**: https://github.com/wututua/Tu_server_status/

## 版本信息

- **脚本版本**: 1.0.0
- **应用程序版本**: 1.0.0
- **作者**: wututua
- **最后更新**: 2024-01-05

## 技术支持

如需技术支持，请提供以下信息：
1. 操作系统版本
2. PowerShell 版本
3. 相关的日志文件内容
4. 错误截图或描述

---

**注意**: 在运行安装脚本前，请确保已备份重要数据，并在测试环境中验证脚本功能。