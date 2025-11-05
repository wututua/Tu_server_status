@echo off
REM =====================================================
REM Server Status Monitor - Windows Batch Uninstaller
REM 版本: 1.0.0
REM 作者: wututua
REM 最后更新: 2024-01-05
REM =====================================================

setlocal enabledelayedexpansion

REM 脚本信息
set SCRIPT_VERSION=1.0.0
set SCRIPT_AUTHOR=wututua
set APP_NAME=Server Status Monitor

REM 配置参数
set INSTALL_DIR=%PROGRAMFILES%\ServerStatusMonitor
set LOG_FILE=%TEMP%\ServerStatusMonitor_uninstall_batch.log

REM 参数解析
set QUIET=0

:PARSE_ARGS
if "%~1"=="" goto :END_PARSE
if /i "%~1"=="/QUIET" set QUIET=1
shift
goto :PARSE_ARGS

:END_PARSE

REM 日志记录函数
call :LOG_INFO "开始执行 %APP_NAME% 卸载脚本"
call :LOG_INFO "脚本版本: %SCRIPT_VERSION%"
call :LOG_INFO "作者: %SCRIPT_AUTHOR%"

REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    call :LOG_ERROR "需要管理员权限运行此脚本"
    pause
    exit /b 1
)

REM 检查Windows版本
for /f "tokens=4-5 delims=. " %%i in ('ver') do set MAJOR=%%i&set MINOR=%%j
if !MAJOR! lss 6 (
    call :LOG_ERROR "系统版本过低，需要Windows 7/Server 2008 R2或更高版本"
    pause
    exit /b 1
)
if !MAJOR! equ 6 if !MINOR! lss 1 (
    call :LOG_ERROR "系统版本过低，需要Windows 7/Server 2008 R2或更高版本"
    pause
    exit /b 1
)

call :LOG_INFO "系统兼容性检查通过"

REM 检查PowerShell版本
powershell -Command "if ($PSVersionTable.PSVersion.Major -lt 3) { exit 1 }"
if %errorlevel% neq 0 (
    call :LOG_ERROR "PowerShell版本过低，需要PowerShell 3.0或更高版本"
    pause
    exit /b 1
)

call :LOG_INFO "PowerShell版本检查通过"

REM 检查是否已安装
if not exist "%INSTALL_DIR%" (
    call :LOG_WARNING "未找到安装目录，可能已卸载"
)

REM 执行PowerShell卸载脚本
call :LOG_INFO "正在调用PowerShell卸载脚本..."

set PS_SCRIPT=uninstall-windows.ps1
set PS_ARGS=

if %QUIET% equ 1 set PS_ARGS=%PS_ARGS% -Quiet

powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %PS_ARGS%

if %errorlevel% neq 0 (
    call :LOG_ERROR "PowerShell卸载脚本执行失败"
    if %QUIET% equ 0 pause
    exit /b %errorlevel%
)

call :LOG_INFO "卸载脚本执行完成"

if %QUIET% equ 0 (
    echo.
    echo =====================================================
    echo    %APP_NAME% 卸载完成！
    echo    日志文件: %LOG_FILE%
    echo =====================================================
    echo.
    pause
)

endlocal
exit /b 0

REM =====================================================
REM 日志记录函数
REM =====================================================
:LOG_INFO
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set datetime=%%a
set timestamp=!datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!:!datetime:~12,2!

echo [!timestamp!] [INFO] %~1 >> "%LOG_FILE%"
if %QUIET% equ 0 echo [!timestamp!] [INFO] %~1
goto :EOF

:LOG_WARNING
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set datetime=%%a
set timestamp=!datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!:!datetime:~12,2!

echo [!timestamp!] [INFO] %~1 >> "%LOG_FILE%"
if %QUIET% equ 0 echo [!timestamp!] [WARNING] %~1
goto :EOF

:LOG_ERROR
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set datetime=%%a
set timestamp=!datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!:!datetime:~12,2!

echo [!timestamp!] [ERROR] %~1 >> "%LOG_FILE%"
echo [!timestamp!] [ERROR] %~1
goto :EOF