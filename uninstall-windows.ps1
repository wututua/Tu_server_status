# =====================================================
# Server Status Monitor - Windows Uninstall Script
# 版本: 1.0.0
# 作者: wututua
# 最后更新: 2024-01-05
# =====================================================

param(
    [switch]$Quiet = $false
)

# 脚本信息
$ScriptVersion = "1.0.0"
$ScriptAuthor = "wututua"
$ScriptName = "Server Status Monitor - Windows 卸载脚本"

# 配置参数
$AppName = "Server Status Monitor"
$InstallDir = "$env:PROGRAMFILES\ServerStatusMonitor"
$ServiceName = "ServerStatusMonitor"
$LogPath = "$env:TEMP\ServerStatusMonitor_uninstall.log"

# 导入系统管理模块
Import-Module -Name Microsoft.PowerShell.Management -ErrorAction SilentlyContinue

# =====================================================
# 日志记录函数
# =====================================================
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    try {
        Add-Content -Path $LogPath -Value $LogEntry -ErrorAction SilentlyContinue
    } catch {
        # 如果日志写入失败，尝试输出到控制台
        Write-Host $LogEntry
    }
    
    if ($Level -eq "ERROR" -or !$Quiet) {
        Write-Host $LogEntry -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } else { "White" })
    }
}

# =====================================================
# 错误处理函数
# =====================================================
function Handle-Error {
    param(
        [string]$Operation,
        [object]$Exception
    )
    
    Write-Log -Message "操作失败: $Operation" -Level "ERROR"
    Write-Log -Message "错误详情: $($Exception.Message)" -Level "ERROR"
    Write-Log -Message "错误堆栈: $($Exception.StackTrace)" -Level "ERROR"
    
    if (!$Quiet) {
        Write-Host "`n卸载过程中发生错误。请检查日志文件: $LogPath" -ForegroundColor Red
    }
    
    exit 1
}

# =====================================================
# 系统兼容性检查
# =====================================================
function Test-SystemCompatibility {
    Write-Log -Message "正在检查系统兼容性..."
    
    # 检查Windows版本
    $OSVersion = [System.Environment]::OSVersion.Version
    $MinVersion = New-Object Version(6, 1)  # Windows 7/Server 2008 R2
    
    if ($OSVersion -lt $MinVersion) {
        Write-Log -Message "系统版本过低，需要Windows 7/Server 2008 R2或更高版本" -Level "ERROR"
        exit 1
    }
    
    # 检查PowerShell版本
    if ($PSVersionTable.PSVersion.Major -lt 3) {
        Write-Log -Message "PowerShell版本过低，需要PowerShell 3.0或更高版本" -Level "ERROR"
        exit 1
    }
    
    # 检查管理员权限
    $IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (!$IsAdmin) {
        Write-Log -Message "需要管理员权限运行此脚本" -Level "ERROR"
        exit 1
    }
    
    Write-Log -Message "系统兼容性检查通过"
}

# =====================================================
# 停止Windows服务
# =====================================================
function Stop-WindowsService {
    Write-Log -Message "正在停止Windows服务..."
    
    try {
        $Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($Service) {
            # 检查服务状态
            if ($Service.Status -eq "Running") {
                Write-Log -Message "服务正在运行，正在停止..."
                
                # 尝试优雅停止
                Stop-Service -Name $ServiceName -Force
                
                # 等待服务停止
                $Timeout = 30
                for ($i = 0; $i -lt $Timeout; $i++) {
                    $Service.Refresh()
                    if ($Service.Status -eq "Stopped") {
                        Write-Log -Message "Windows服务已优雅停止"
                        break
                    }
                    Start-Sleep -Seconds 1
                }
                
                # 如果服务仍在运行，强制终止
                if ($Service.Status -ne "Stopped") {
                    Write-Log -Message "服务停止超时，尝试强制终止..." -Level "WARNING"
                    
                    # 查找相关进程
                    $Processes = Get-WmiObject Win32_Process | Where-Object { 
                        $_.CommandLine -like "*$ServiceName*" -or $_.Name -like "*python*"
                    }
                    
                    foreach ($Process in $Processes) {
                        try {
                            Stop-Process -Id $Process.ProcessId -Force -ErrorAction SilentlyContinue
                            Write-Log -Message "已终止进程: $($Process.Name) (PID: $($Process.ProcessId))" -Level "WARNING"
                        } catch {
                            Write-Log -Message "无法终止进程: $($Process.Name)" -Level "WARNING"
                        }
                    }
                }
            } else {
                Write-Log -Message "Windows服务未运行"
            }
            
            # 删除服务
            Write-Log -Message "正在删除服务注册..."
            $DeleteResult = sc.exe delete $ServiceName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log -Message "Windows服务已删除"
            } else {
                Write-Log -Message "删除服务失败: $DeleteResult" -Level "WARNING"
            }
        } else {
            Write-Log -Message "未找到Windows服务"
        }
    } catch {
        Write-Log -Message "停止Windows服务失败: $($_.Exception.Message)" -Level "WARNING"
    }
}

# =====================================================
# 删除桌面快捷方式
# =====================================================
function Remove-Shortcuts {
    Write-Log -Message "正在删除快捷方式..."
    
    try {
        # 删除桌面快捷方式
        $DesktopPath = [Environment]::GetFolderPath("Desktop")
        $ShortcutPath = "$DesktopPath\Server Status Monitor.lnk"
        
        if (Test-Path $ShortcutPath) {
            Remove-Item -Path $ShortcutPath -Force
            Write-Log -Message "桌面快捷方式已删除"
        } else {
            Write-Log -Message "未找到桌面快捷方式"
        }
        
        # 删除开始菜单快捷方式（如果存在）
        $StartMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Server Status Monitor.lnk"
        if (Test-Path $StartMenuPath) {
            Remove-Item -Path $StartMenuPath -Force
            Write-Log -Message "开始菜单快捷方式已删除"
        }
        
    } catch {
        Write-Log -Message "删除快捷方式失败: $($_.Exception.Message)" -Level "WARNING"
    }
}

# =====================================================
# 清理环境变量
# =====================================================
function Remove-EnvironmentVariables {
    Write-Log -Message "正在清理环境变量..."
    
    try {
        # 从系统PATH中移除安装目录
        $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($CurrentPath -like "*$InstallDir*") {
            $NewPath = ($CurrentPath -split ';' | Where-Object { $_ -ne $InstallDir }) -join ';'
            [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
            Write-Log -Message "PATH环境变量已清理"
        }
        
        # 删除应用程序特定环境变量
        [Environment]::SetEnvironmentVariable("SERVER_STATUS_HOME", $null, "Machine")
        [Environment]::SetEnvironmentVariable("SERVER_STATUS_PORT", $null, "Machine")
        
        Write-Log -Message "环境变量清理完成"
    } catch {
        Handle-Error -Operation "清理环境变量" -Exception $_.Exception
    }
}

# =====================================================
# 清理注册表项
# =====================================================
function Remove-RegistryEntries {
    Write-Log -Message "正在清理注册表项..."
    
    try {
        $RegistryPaths = @(
            "HKLM:\SOFTWARE\ServerStatusMonitor",
            "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ServerStatusMonitor"
        )
        
        foreach ($RegistryPath in $RegistryPaths) {
            if (Test-Path $RegistryPath) {
                Remove-Item -Path $RegistryPath -Recurse -Force
                Write-Log -Message "注册表项已删除: $RegistryPath"
            } else {
                Write-Log -Message "注册表项不存在: $RegistryPath"
            }
        }
        
        Write-Log -Message "注册表项清理完成"
    } catch {
        Handle-Error -Operation "清理注册表项" -Exception $_.Exception
    }
}

# =====================================================
# 删除安装目录
# =====================================================
function Remove-InstallationDirectory {
    Write-Log -Message "正在删除安装目录..."
    
    try {
        if (Test-Path $InstallDir) {
            # 检查是否有进程正在使用文件
            $ProcessesUsingFiles = Get-Process | Where-Object {
                $_.Path -like "$InstallDir\*" -or 
                ($_.Modules | Where-Object { $_.FileName -like "$InstallDir\*" })
            }
            
            if ($ProcessesUsingFiles) {
                Write-Log -Message "发现以下进程正在使用安装目录文件:" -Level "WARNING"
                foreach ($Process in $ProcessesUsingFiles) {
                    Write-Log -Message "  - $($Process.ProcessName) (PID: $($Process.Id))" -Level "WARNING"
                    
                    # 尝试优雅停止
                    try {
                        # 发送关闭信号
                        $Process.CloseMainWindow() | Out-Null
                        
                        # 等待进程退出
                        $Timeout = 10
                        if (!$Process.WaitForExit($Timeout * 1000)) {
                            Write-Log -Message "进程未响应，强制终止..." -Level "WARNING"
                            Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
                        }
                        
                        Write-Log -Message "进程已停止: $($Process.ProcessName)" -Level "WARNING"
                    } catch {
                        Write-Log -Message "无法停止进程: $($Process.ProcessName)" -Level "ERROR"
                    }
                }
                
                # 再次检查是否有进程残留
                Start-Sleep -Seconds 2
                $RemainingProcesses = Get-Process | Where-Object {
                    $_.Path -like "$InstallDir\*"
                }
                
                if ($RemainingProcesses) {
                    Write-Log -Message "仍有进程残留，尝试强制删除..." -Level "WARNING"
                    
                    # 使用Robocopy进行强制删除（空文件夹镜像删除法）
                    $EmptyDir = "$env:TEMP\empty"
                    New-Item -ItemType Directory -Path $EmptyDir -Force | Out-Null
                    
                    try {
                        & robocopy $EmptyDir $InstallDir /MIR /NJH /NJS /NP /NFL /NDL 2>&1 | Out-Null
                        Write-Log -Message "使用Robocopy强制删除完成" -Level "WARNING"
                    } catch {
                        Write-Log -Message "Robocopy删除失败: $($_.Exception.Message)" -Level "ERROR"
                    }
                    
                    # 清理临时目录
                    Remove-Item -Path $EmptyDir -Recurse -Force -ErrorAction SilentlyContinue
                }
            }
            
            # 删除安装目录
            Write-Log -Message "正在删除安装目录..."
            Remove-Item -Path $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
            
            # 验证删除
            if (Test-Path $InstallDir) {
                Write-Log -Message "安装目录删除失败，目录仍存在" -Level "ERROR"
                throw "无法删除安装目录"
            } else {
                Write-Log -Message "安装目录已删除: $InstallDir"
            }
        } else {
            Write-Log -Message "安装目录不存在: $InstallDir"
        }
    } catch {
        Handle-Error -Operation "删除安装目录" -Exception $_.Exception
    }
}

# =====================================================
# 清理临时文件
# =====================================================
function Cleanup-TemporaryFiles {
    Write-Log -Message "正在清理临时文件..."
    
    try {
        # 清理可能存在的临时文件
        $TempPatterns = @(
            "$env:TEMP\ServerStatusMonitor_*",
            "$env:TEMP\nssm.exe",
            "$env:TEMP\ServerStatusMonitor_backup"
        )
        
        foreach ($Pattern in $TempPatterns) {
            Get-ChildItem -Path $env:TEMP -Filter "ServerStatusMonitor_*" -ErrorAction SilentlyContinue | 
                ForEach-Object {
                    try {
                        Remove-Item -Path $_.FullName -Recurse -Force
                        Write-Log -Message "临时文件已删除: $($_.Name)"
                    } catch {
                        Write-Log -Message "无法删除临时文件: $($_.Name)" -Level "WARNING"
                    }
                }
        }
        
        Write-Log -Message "临时文件清理完成"
    } catch {
        Write-Log -Message "临时文件清理失败: $($_.Exception.Message)" -Level "WARNING"
    }
}

# =====================================================
# 验证卸载
# =====================================================
function Test-Uninstallation {
    Write-Log -Message "正在验证卸载..."
    
    $VerificationPoints = @(
        @{ Name = "安装目录"; Test = { Test-Path $InstallDir }; Expected = $false },
        @{ Name = "Windows服务"; Test = { Get-Service -Name $ServiceName -ErrorAction SilentlyContinue }; Expected = $false },
        @{ Name = "环境变量"; Test = { [Environment]::GetEnvironmentVariable("SERVER_STATUS_HOME", "Machine") }; Expected = $null },
        @{ Name = "注册表项"; Test = { Test-Path "HKLM:\SOFTWARE\ServerStatusMonitor" }; Expected = $false }
    )
    
    $FailedPoints = @()
    
    foreach ($Point in $VerificationPoints) {
        $Result = & $Point.Test
        $IsExpected = if ($Point.Expected -eq $null) { $Result -eq $null } else { [bool]$Result -eq $Point.Expected }
        
        if (!$IsExpected) {
            $FailedPoints += $Point.Name
            Write-Log -Message "验证失败: $($Point.Name)" -Level "WARNING"
        } else {
            Write-Log -Message "验证通过: $($Point.Name)"
        }
    }
    
    if ($FailedPoints.Count -eq 0) {
        Write-Log -Message "卸载验证通过"
        return $true
    } else {
        Write-Log -Message "卸载验证失败，以下项目未完全清理: $($FailedPoints -join ', ')" -Level "WARNING"
        return $false
    }
}

# =====================================================
# 主卸载流程
# =====================================================
function Start-Uninstallation {
    Write-Log -Message "开始卸载 $AppName"
    Write-Log -Message "脚本版本: $ScriptVersion"
    Write-Log -Message "作者: $ScriptAuthor"
    Write-Log -Message "日志文件: $LogPath"
    
    # 记录系统信息
    Write-Log -Message "系统信息 - OS: $([System.Environment]::OSVersion.VersionString)"
    Write-Log -Message "系统信息 - PowerShell: $($PSVersionTable.PSVersion)"
    
    $UninstallSteps = @(
        "Test-SystemCompatibility",
        "Stop-WindowsService",
        "Remove-Shortcuts",
        "Remove-EnvironmentVariables",
        "Remove-RegistryEntries",
        "Remove-InstallationDirectory",
        "Cleanup-TemporaryFiles",
        "Test-Uninstallation"
    )
    
    $FailedSteps = @()
    
    foreach ($Step in $UninstallSteps) {
        try {
            Write-Log -Message "正在执行: $Step"
            & $Step
            Write-Log -Message "步骤完成: $Step"
        } catch {
            $FailedSteps += $Step
            Write-Log -Message "步骤失败: $Step - $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    if ($FailedSteps.Count -gt 0) {
        Write-Log -Message "卸载完成，但以下步骤出现错误: $($FailedSteps -join ', ')" -Level "WARNING"
    } else {
        Write-Log -Message "卸载成功完成"
    }
    
    # 显示完成信息
    if (!$Quiet) {
        Write-Host "`n=====================================================" -ForegroundColor Green
        Write-Host "$AppName 卸载完成！" -ForegroundColor Green
        Write-Host "日志文件: $LogPath" -ForegroundColor Yellow
        Write-Host "=====================================================" -ForegroundColor Green
    }
}

# =====================================================
# 脚本入口点
# =====================================================
try {
    # 设置执行策略
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
    
    # 创建日志文件
    New-Item -ItemType File -Path $LogPath -Force | Out-Null
    
    # 开始卸载
    Start-Uninstallation
    
} catch {
    Handle-Error -Operation "脚本执行" -Exception $_.Exception
} finally {
    Write-Log -Message "脚本执行完成"
}