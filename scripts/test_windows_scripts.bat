@echo off
REM =====================================================
REM Windows 部署脚本测试工具
REM 版本: 1.0.0
REM 作者: wututua
REM =====================================================

echo.
echo =====================================================
echo    Windows 部署脚本测试工具
echo =====================================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 需要管理员权限运行此脚本
    echo 请以管理员身份运行此脚本
    pause
    exit /b 1
)

echo [信息] 管理员权限检查通过

REM 检查Windows版本
for /f "tokens=4-5 delims=. " %%i in ('ver') do set MAJOR=%%i&set MINOR=%%j
echo [信息] 检测到Windows版本: !MAJOR!.!MINOR!

if !MAJOR! lss 6 (
    echo [错误] 系统版本过低，需要Windows 7/Server 2008 R2或更高版本
    pause
    exit /b 1
)

if !MAJOR! equ 6 if !MINOR! lss 1 (
    echo [错误] 系统版本过低，需要Windows 7/Server 2008 R2或更高版本
    pause
    exit /b 1
)

echo [信息] Windows版本兼容性检查通过

REM 检查PowerShell版本
powershell -Command "if ($PSVersionTable.PSVersion.Major -lt 3) { exit 1 }"
if %errorlevel% neq 0 (
    echo [错误] PowerShell版本过低，需要PowerShell 3.0或更高版本
    pause
    exit /b 1
)

echo [信息] PowerShell版本检查通过

REM 检查脚本文件是否存在
echo.
echo [信息] 正在检查脚本文件...

if not exist "deploy-windows.ps1" (
    echo [错误] 未找到 deploy-windows.ps1 文件
    pause
    exit /b 1
)

if not exist "uninstall-windows.ps1" (
    echo [错误] 未找到 uninstall-windows.ps1 文件
    pause
    exit /b 1
)

if not exist "install.bat" (
    echo [错误] 未找到 install.bat 文件
    pause
    exit /b 1
)

if not exist "uninstall.bat" (
    echo [错误] 未找到 uninstall.bat 文件
    pause
    exit /b 1
)

echo [信息] 所有脚本文件检查通过

REM 检查Python是否可用
echo.
echo [信息] 正在检查Python环境...
powershell -Command "Get-Command python -ErrorAction SilentlyContinue" >nul 2>&1
if %errorlevel% equ 0 (
    echo [信息] Python环境检查通过
) else (
    powershell -Command "Get-Command python3 -ErrorAction SilentlyContinue" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [信息] Python3环境检查通过
    ) else (
        echo [警告] 未找到Python环境，某些功能可能受限
    )
)

REM 显示测试结果
echo.
echo =====================================================
echo    测试完成！
echo =====================================================
echo.
echo [通过] 所有基础检查已完成
echo [信息] 系统支持Windows部署脚本运行
echo.
echo 可用的部署命令：
echo   - 标准安装: install.bat
echo   - 静默安装: install.bat /SILENT
echo   - 卸载: uninstall.bat
echo.
echo 可用的PowerShell命令：
echo   - 标准安装: powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1"
echo   - 静默安装: powershell -ExecutionPolicy Bypass -File "deploy-windows.ps1" -Silent
echo   - 卸载: powershell -ExecutionPolicy Bypass -File "uninstall-windows.ps1"
echo.

pause