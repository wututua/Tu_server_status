# Windows 部署脚本说明

## 脚本文件

### 主要脚本
- **`deploy-windows.ps1`** - PowerShell 部署脚本（主引擎）
- **`uninstall-windows.ps1`** - PowerShell 卸载脚本
- **`install.bat`** - 批处理部署脚本（兼容性包装）
- **`uninstall.bat`** - 批处理卸载脚本

### 配置文件
- **`server_status_config.json`** - 应用程序配置信息
- **`README-Windows-Installation.md`** - 详细安装指南

## 功能特性

### 部署脚本功能
- ✅ **系统兼容性检查** - 支持Windows 7/Server 2008 R2及以上
- ✅ **自动备份机制** - 智能备份现有安装
- ✅ **环境变量配置** - 自动设置PATH和应用程序变量
- ✅ **注册表管理** - 创建卸载程序条目和配置信息
- ✅ **Windows服务集成** - 自动创建并启动监控服务
- ✅ **Python依赖安装** - 自动检测并安装依赖包
- ✅ **快捷方式创建** - 桌面和开始菜单快捷方式
- ✅ **完整错误处理** - 详细的错误级别分类

### 卸载脚本功能
- ✅ **完整清理** - 删除所有安装文件
- ✅ **环境变量清理** - 彻底移除系统配置
- ✅ **注册表清理** - 删除所有相关注册表项
- ✅ **服务停止和删除** - 完整的服务管理
- ✅ **快捷方式删除** - 清理桌面和开始菜单条目
- ✅ **临时文件清理** - 清理所有临时文件

### 参数支持
- **`/SILENT`** - 静默安装模式
- **`/VERYSILENT`** - 完全静默模式
- **`/QUIET`** - 安静模式（减少控制台输出）

## 使用方法

### 标准安装
```batch
# 批处理方式
install.bat

# PowerShell方式
powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1"
```

### 静默安装
```batch
install.bat /SILENT
# 或
powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1" -Silent
```

### 卸载
```batch
uninstall.bat
# 或
powershell -ExecutionPolicy Bypass -File "uninstall-windows.ps1"
```

## 技术特点

### 错误处理机制
- **三级日志系统**：INFO/WARNING/ERROR 详细分级
- **时间戳记录**：精确的操作时间记录
- **系统信息记录**：OS版本、PowerShell版本等信息
- **回滚机制**：关键步骤失败时自动回滚
- **进程监控**：自动检测和处理占用进程

### 兼容性支持
- **Windows版本**：Windows 7/Server 2008 R2及以上
- **PowerShell**：版本3.0及以上
- **架构支持**：32位和64位系统完全兼容
- **权限管理**：自动检测管理员权限

### 安全性
- **签名验证**：脚本包含完整的版本信息和作者注释
- **执行策略**：自动处理PowerShell执行策略
- **路径验证**：所有操作都经过严格路径验证
- **文件完整性**：安装前验证文件完整性

## 日志文件位置

- **安装日志**：`%TEMP%\ServerStatusMonitor_install.log`
- **卸载日志**：`%TEMP%\ServerStatusMonitor_uninstall.log`
- **批处理日志**：`%TEMP%\ServerStatusMonitor_install_batch.log`
- **批处理卸载日志**：`%TEMP%\ServerStatusMonitor_uninstall_batch.log`

## 系统要求

- **操作系统**：Windows 7 / Server 2008 R2 或更高版本
- **PowerShell**：版本 3.0 或更高
- **Python**：3.7 或更高版本（推荐）
- **管理员权限**：需要管理员权限运行
- **内存**：至少 512MB 可用内存
- **磁盘空间**：至少 100MB 可用空间

## 故障排除

### 常见问题

1. **权限不足**
   - 解决方案：以管理员身份运行脚本

2. **PowerShell执行策略限制**
   - 解决方案：脚本会自动设置执行策略，如仍失败可手动设置：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **服务无法启动**
   - 解决方案：检查Python是否正确安装，或使用手动模式运行

4. **安装目录无法删除**
   - 解决方案：检查是否有进程占用，重启后重试

### 技术支持

如遇到问题，请检查日志文件或联系：
- **邮箱**：wututua@qq.com
- **GitHub Issues**：[提交问题](https://github.com/wututua/Tu_server_status/issues)