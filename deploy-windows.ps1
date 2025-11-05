# =====================================================
# Server Status Monitor - Windows Deployment Script
# 版本: 1.0.0
# 作者: wututua
# 最后更新: 2024-01-05
# =====================================================

param(
    [switch]$Silent = $false,
    [switch]$VerySilent = $false,
    [switch]$Quiet = $false
)

# 脚本信息
$ScriptVersion = "1.0.0"
$ScriptAuthor = "wututua"
$ScriptName = "Server Status Monitor - Windows 部署脚本"

# 配置参数
$AppName = "Server Status Monitor"
$AppVersion = "1.0.0"
$InstallDir = "$env:PROGRAMFILES\ServerStatusMonitor"
$ServiceName = "ServerStatusMonitor"
$LogPath = "$env:TEMP\ServerStatusMonitor_install.log"
$BackupDir = "$env:TEMP\ServerStatusMonitor_backup"

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
    
    if (!$VerySilent -and !$Quiet) {
        Write-Host "`n安装过程中发生错误。请检查日志文件: $LogPath" -ForegroundColor Red
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
# 备份现有安装
# =====================================================
function Backup-ExistingInstallation {
    Write-Log -Message "正在备份现有安装..."
    
    if (Test-Path $InstallDir) {
        try {
            if (Test-Path $BackupDir) {
                Remove-Item -Path $BackupDir -Recurse -Force
            }
            
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
            Copy-Item -Path "$InstallDir\*" -Destination $BackupDir -Recurse -Force
            Write-Log -Message "现有安装已备份到: $BackupDir"
        } catch {
            Handle-Error -Operation "备份现有安装" -Exception $_.Exception
        }
    } else {
        Write-Log -Message "未发现现有安装，跳过备份"
    }
}

# =====================================================
# 创建安装目录
# =====================================================
function Create-InstallationDirectory {
    Write-Log -Message "正在创建安装目录..."
    
    try {
        if (Test-Path $InstallDir) {
            Remove-Item -Path "$InstallDir\*" -Recurse -Force
        } else {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
        
        Write-Log -Message "安装目录创建成功: $InstallDir"
    } catch {
        Handle-Error -Operation "创建安装目录" -Exception $_.Exception
    }
}

# =====================================================
# 复制应用程序文件
# =====================================================
function Copy-ApplicationFiles {
    Write-Log -Message "正在复制应用程序文件..."
    
    try {
        $SourceDir = "$PSScriptRoot\backend"
        
        if (!(Test-Path $SourceDir)) {
            throw "源目录不存在: $SourceDir"
        }
        
        # 复制Python文件
        Copy-Item -Path "$SourceDir\*" -Destination $InstallDir -Recurse -Force
        
        # 复制前端文件
        $FrontendDir = "$InstallDir\frontend"
        New-Item -ItemType Directory -Path $FrontendDir -Force | Out-Null
        Copy-Item -Path "$PSScriptRoot\frontend\*" -Destination $FrontendDir -Recurse -Force
        
        Write-Log -Message "应用程序文件复制完成"
    } catch {
        Handle-Error -Operation "复制应用程序文件" -Exception $_.Exception
    }
}

# =====================================================
# 配置环境变量
# =====================================================
function Set-EnvironmentVariables {
    Write-Log -Message "正在配置环境变量..."
    
    try {
        # 设置系统PATH环境变量
        $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($CurrentPath -notlike "*$InstallDir*") {
            $NewPath = "$InstallDir;$CurrentPath"
            [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
            Write-Log -Message "PATH环境变量已更新"
        }
        
        # 设置应用程序特定环境变量
        [Environment]::SetEnvironmentVariable("SERVER_STATUS_HOME", $InstallDir, "Machine")
        [Environment]::SetEnvironmentVariable("SERVER_STATUS_PORT", "48877", "Machine")
        
        Write-Log -Message "环境变量配置完成"
    } catch {
        Handle-Error -Operation "配置环境变量" -Exception $_.Exception
    }
}

# =====================================================
# 配置注册表项
# =====================================================
function Set-RegistryEntries {
    Write-Log -Message "正在配置注册表项..."
    
    try {
        $RegistryPath = "HKLM:\SOFTWARE\ServerStatusMonitor"
        
        # 创建注册表项
        if (!(Test-Path $RegistryPath)) {
            New-Item -Path $RegistryPath -Force | Out-Null
        }
        
        # 设置注册表值
        Set-ItemProperty -Path $RegistryPath -Name "InstallPath" -Value $InstallDir
        Set-ItemProperty -Path $RegistryPath -Name "Version" -Value $AppVersion
        Set-ItemProperty -Path $RegistryPath -Name "InstallDate" -Value (Get-Date -Format "yyyy-MM-dd")
        
        # 添加到卸载程序列表
        $UninstallPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ServerStatusMonitor"
        if (!(Test-Path $UninstallPath)) {
            New-Item -Path $UninstallPath -Force | Out-Null
        }
        
        Set-ItemProperty -Path $UninstallPath -Name "DisplayName" -Value $AppName
        Set-ItemProperty -Path $UninstallPath -Name "DisplayVersion" -Value $AppVersion
        Set-ItemProperty -Path $UninstallPath -Name "Publisher" -Value "wututua"
        Set-ItemProperty -Path $UninstallPath -Name "UninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -File `"$PSScriptRoot\uninstall-windows.ps1`""
        Set-ItemProperty -Path $UninstallPath -Name "QuietUninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -File `"$PSScriptRoot\uninstall-windows.ps1`" -Quiet"
        Set-ItemProperty -Path $UninstallPath -Name "InstallLocation" -Value $InstallDir
        Set-ItemProperty -Path $UninstallPath -Name "NoModify" -Value 1
        Set-ItemProperty -Path $UninstallPath -Name "NoRepair" -Value 1
        
        Write-Log -Message "注册表项配置完成"
    } catch {
        Handle-Error -Operation "配置注册表项" -Exception $_.Exception
    }
}

# =====================================================
# 安装Python依赖
# =====================================================
function Install-PythonDependencies {
    Write-Log -Message "正在安装Python依赖..."
    
    try {
        $RequirementsFile = "$InstallDir\requirements.txt"
        
        if (Test-Path $RequirementsFile) {
            # 检查Python是否已安装
            $PythonPath = Get-Command python -ErrorAction SilentlyContinue
            if (!$PythonPath) {
                $PythonPath = Get-Command python3 -ErrorAction SilentlyContinue
            }
            
            if ($PythonPath) {
                # 安装依赖
                $PythonExe = $PythonPath.Source
                Start-Process -FilePath $PythonExe -ArgumentList "-m pip install -r `"$RequirementsFile`"" -Wait -NoNewWindow
                Write-Log -Message "Python依赖安装完成"
            } else {
                Write-Log -Message "Python未安装，跳过依赖安装" -Level "WARNING"
            }
        } else {
            Write-Log -Message "未找到requirements.txt文件，跳过依赖安装" -Level "WARNING"
        }
    } catch {
        Write-Log -Message "Python依赖安装失败: $($_.Exception.Message)" -Level "WARNING"
    }
}

# =====================================================
# 创建Windows服务
# =====================================================
function Install-WindowsService {
    Write-Log -Message "正在创建Windows服务..."
    
    try {
        # 检查服务是否已存在
        $Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($Service) {
            # 停止并删除现有服务
            if ($Service.Status -eq "Running") {
                Stop-Service -Name $ServiceName -Force
            }
            sc.exe delete $ServiceName | Out-Null
        }
        
        # 创建新的服务
        $ServiceExe = "$InstallDir\main.py"
        nssm.exe install $ServiceName "$InstallDir\python.exe" "$ServiceExe"
        nssm.exe set $ServiceName Description "Server Status Monitor - 实时服务器监控系统"
        nssm.exe set $ServiceName Start SERVICE_AUTO_START
        nssm.exe set $ServiceName AppDirectory $InstallDir
        
        Write-Log -Message "Windows服务创建完成"
        
        # 启动服务
        Start-Service -Name $ServiceName
        Write-Log -Message "Windows服务已启动"
        
    } catch {
        Write-Log -Message "Windows服务创建失败: $($_.Exception.Message)" -Level "WARNING"
        Write-Log -Message "应用程序将以普通模式运行" -Level "INFO"
    }
}

# =====================================================
# 创建桌面快捷方式
# =====================================================
function Create-Shortcuts {
    Write-Log -Message "正在创建快捷方式..."
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        
        # 桌面快捷方式
        $DesktopPath = [Environment]::GetFolderPath("Desktop")
        $Shortcut = $WshShell.CreateShortcut("$DesktopPath\Server Status Monitor.lnk")
        $Shortcut.TargetPath = "$InstallDir\frontend\index.html"
        $Shortcut.WorkingDirectory = "$InstallDir\frontend"
        $Shortcut.Description = "Server Status Monitor - 实时服务器监控系统"
        $Shortcut.Save()
        
        Write-Log -Message "桌面快捷方式创建完成"
    } catch {
        Write-Log -Message "快捷方式创建失败: $($_.Exception.Message)" -Level "WARNING"
    }
}

# =====================================================
# 验证安装
# =====================================================
function Test-Installation {
    Write-Log -Message "正在验证安装..."
    
    try {
        # 检查安装目录
        if (!(Test-Path $InstallDir)) {
            throw "安装目录不存在"
        }
        
        # 检查必要文件
        $RequiredFiles = @("main.py", "requirements.txt", "frontend\index.html")
        foreach ($File in $RequiredFiles) {
            if (!(Test-Path "$InstallDir\$File")) {
                throw "必要文件缺失: $File"
            }
        }
        
        # 检查环境变量
        $EnvPath = [Environment]::GetEnvironmentVariable("SERVER_STATUS_HOME", "Machine")
        if ($EnvPath -ne $InstallDir) {
            throw "环境变量配置错误"
        }
        
        Write-Log -Message "安装验证通过"
        return $true
    } catch {
        Write-Log -Message "安装验证失败: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# =====================================================
# 回滚操作
# =====================================================
function Rollback-Installation {
    Write-Log -Message "正在回滚安装..." -Level "WARNING"
    
    try {
        # 停止服务
        $Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($Service -and $Service.Status -eq "Running") {
            Stop-Service -Name $ServiceName -Force
        }
        
        # 删除服务
        sc.exe delete $ServiceName | Out-Null
        
        # 删除安装目录
        if (Test-Path $InstallDir) {
            Remove-Item -Path $InstallDir -Recurse -Force
        }
        
        # 恢复环境变量
        $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        $NewPath = $CurrentPath -replace ";?$InstallDir;?", ""
        [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
        [Environment]::SetEnvironmentVariable("SERVER_STATUS_HOME", $null, "Machine")
        [Environment]::SetEnvironmentVariable("SERVER_STATUS_PORT", $null, "Machine")
        
        # 删除注册表项
        $RegistryPaths = @(
            "HKLM:\SOFTWARE\ServerStatusMonitor",
            "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ServerStatusMonitor"
        )
        
        foreach ($RegistryPath in $RegistryPaths) {
            if (Test-Path $RegistryPath) {
                Remove-Item -Path $RegistryPath -Recurse -Force
            }
        }
        
        # 恢复备份
        if (Test-Path $BackupDir) {
            if (Test-Path $InstallDir) {
                Remove-Item -Path $InstallDir -Recurse -Force
            }
            Move-Item -Path $BackupDir -Destination $InstallDir
        }
        
        Write-Log -Message "回滚操作完成" -Level "WARNING"
    } catch {
        Write-Log -Message "回滚操作失败: $($_.Exception.Message)" -Level "ERROR"
    }
}

# =====================================================
# 主安装流程
# =====================================================
function Start-Installation {
    Write-Log -Message "开始安装 $AppName v$AppVersion"
    Write-Log -Message "脚本版本: $ScriptVersion"
    Write-Log -Message "作者: $ScriptAuthor"
    Write-Log -Message "安装目录: $InstallDir"
    Write-Log -Message "日志文件: $LogPath"
    
    # 记录系统信息
    Write-Log -Message "系统信息 - OS: $([System.Environment]::OSVersion.VersionString)"
    Write-Log -Message "系统信息 - PowerShell: $($PSVersionTable.PSVersion)"
    Write-Log -Message "系统信息 - 架构: $([System.Environment]::Is64BitOperatingSystem ? '64位' : '32位')"
    Write-Log -Message "系统信息 - 用户名: $([System.Environment]::UserName)"
    Write-Log -Message "系统信息 - 计算机名: $([System.Environment]::MachineName)"
    
    # 安装步骤定义
    $InstallationSteps = @(
        @{ Name = "Test-SystemCompatibility"; Critical = $true },
        @{ Name = "Backup-ExistingInstallation"; Critical = $false },
        @{ Name = "Create-InstallationDirectory"; Critical = $true },
        @{ Name = "Copy-ApplicationFiles"; Critical = $true },
        @{ Name = "Set-EnvironmentVariables"; Critical = $false },
        @{ Name = "Set-RegistryEntries"; Critical = $false },
        @{ Name = "Install-PythonDependencies"; Critical = $false },
        @{ Name = "Install-WindowsService"; Critical = $false },
        @{ Name = "Create-Shortcuts"; Critical = $false },
        @{ Name = "Test-Installation"; Critical = $false }
    )
    
    $FailedSteps = @()
    $RollbackRequired = $false
    
    foreach ($StepInfo in $InstallationSteps) {
        $StepName = $StepInfo.Name
        $IsCritical = $StepInfo.Critical
        
        try {
            Write-Log -Message "正在执行: $StepName"
            & $StepName
            Write-Log -Message "步骤完成: $StepName"
            
            # 标记关键步骤完成后可能需要回滚
            if ($StepName -in @("Create-InstallationDirectory", "Copy-ApplicationFiles")) {
                $RollbackRequired = $true
            }
            
        } catch {
            $FailedSteps += $StepName
            Write-Log -Message "步骤失败: $StepName - $($_.Exception.Message)" -Level "ERROR"
            
            # 如果关键步骤失败，立即回滚
            if ($IsCritical) {
                Write-Log -Message "关键步骤失败，开始回滚安装..." -Level "ERROR"
                Rollback-Installation
                exit 1
            }
        }
    }
    
    # 处理非关键步骤失败
    if ($FailedSteps.Count -gt 0) {
        Write-Log -Message "安装完成，但以下步骤出现警告: $($FailedSteps -join ', ')" -Level "WARNING"
        
        # 如果安装基本完成但有警告，记录但不回滚
        if ($RollbackRequired) {
            Write-Log -Message "安装基本完成，非关键功能可能受限" -Level "WARNING"
        }
    } else {
        Write-Log -Message "安装成功完成"
    }
    
    # 显示完成信息
    if (!$VerySilent -and !$Quiet) {
        Write-Host "`n=====================================================" -ForegroundColor Green
        Write-Host "$AppName 安装完成！" -ForegroundColor Green
        Write-Host "安装目录: $InstallDir" -ForegroundColor Yellow
        Write-Host "服务名称: $ServiceName" -ForegroundColor Yellow
        Write-Host "访问地址: http://localhost:48877" -ForegroundColor Yellow
        Write-Host "日志文件: $LogPath" -ForegroundColor Yellow
        
        if ($FailedSteps.Count -gt 0) {
            Write-Host "警告: 以下功能可能受限: $($FailedSteps -join ', ')" -ForegroundColor Yellow
        }
        
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
    
    # 开始安装
    Start-Installation
    
} catch {
    Handle-Error -Operation "脚本执行" -Exception $_.Exception
} finally {
    Write-Log -Message "脚本执行完成"
}