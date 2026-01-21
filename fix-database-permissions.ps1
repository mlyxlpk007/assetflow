# 数据库权限修复脚本
# 用于检查和修复数据库文件的权限问题

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "数据库权限检查和修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取数据库路径
$configPath = Join-Path $PSScriptRoot "config.ini"
$dbPath = $null

if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    if ($configContent -match 'DatabasePath\s*=\s*(.+)') {
        $dbPath = $matches[1].Trim()
        Write-Host "从配置文件读取数据库路径: $dbPath" -ForegroundColor Yellow
    }
}

if (-not $dbPath -or -not (Test-Path $dbPath)) {
    # 默认路径
    $dbPath = Join-Path $PSScriptRoot "rdtracking_v2.db"
    Write-Host "使用默认数据库路径: $dbPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "检查数据库文件: $dbPath" -ForegroundColor Cyan
Write-Host ""

# 检查文件是否存在
if (-not (Test-Path $dbPath)) {
    Write-Host "数据库文件不存在，将创建新文件" -ForegroundColor Yellow
    
    # 检查目录是否存在
    $dbDir = Split-Path $dbPath -Parent
    if (-not (Test-Path $dbDir)) {
        Write-Host "创建数据库目录: $dbDir" -ForegroundColor Yellow
        try {
            New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
            Write-Host "目录创建成功" -ForegroundColor Green
        }
        catch {
            Write-Host "目录创建失败: $_" -ForegroundColor Red
            exit 1
        }
    }
}
else {
    Write-Host "数据库文件存在" -ForegroundColor Green
    
    # 检查文件属性
    $fileInfo = Get-Item $dbPath
    Write-Host "文件大小: $($fileInfo.Length) 字节" -ForegroundColor Gray
    Write-Host "只读属性: $($fileInfo.IsReadOnly)" -ForegroundColor Gray
    
    # 如果是只读，尝试取消
    if ($fileInfo.IsReadOnly) {
        Write-Host ""
        Write-Host "检测到文件是只读的，尝试取消只读属性..." -ForegroundColor Yellow
        try {
            $fileInfo.IsReadOnly = $false
            Write-Host "已取消只读属性" -ForegroundColor Green
        }
        catch {
            Write-Host "无法取消只读属性: $_" -ForegroundColor Red
            Write-Host "请以管理员身份运行此脚本" -ForegroundColor Yellow
        }
    }
    
    # 检查文件权限
    Write-Host ""
    Write-Host "检查文件权限..." -ForegroundColor Cyan
    try {
        $acl = Get-Acl $dbPath
        Write-Host "当前用户: $env:USERNAME" -ForegroundColor Gray
        Write-Host "文件所有者: $($acl.Owner)" -ForegroundColor Gray
        
        $hasWriteAccess = $false
        foreach ($access in $acl.Access) {
            if ($access.IdentityReference -eq $env:USERNAME -or 
                $access.IdentityReference -like "*$env:USERNAME*" -or
                $access.IdentityReference -like "*Users*" -or
                $access.IdentityReference -like "*Everyone*") {
                if ($access.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::Write) {
                    $hasWriteAccess = $true
                    Write-Host "找到写入权限: $($access.IdentityReference)" -ForegroundColor Green
                    break
                }
            }
        }
        
        if (-not $hasWriteAccess) {
            Write-Host "当前用户没有写入权限" -ForegroundColor Red
            Write-Host "尝试添加写入权限..." -ForegroundColor Yellow
            
            try {
                $permission = "$env:USERNAME", "FullControl", "Allow"
                $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
                $acl.SetAccessRule($accessRule)
                Set-Acl $dbPath $acl
                Write-Host "已添加写入权限" -ForegroundColor Green
            }
            catch {
                Write-Host "无法添加写入权限: $_" -ForegroundColor Red
                Write-Host "请以管理员身份运行此脚本" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "文件权限正常" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "无法检查文件权限: $_" -ForegroundColor Red
    }
}

# 检查目录权限
Write-Host ""
Write-Host "检查目录权限..." -ForegroundColor Cyan
$dbDir = Split-Path $dbPath -Parent
if (Test-Path $dbDir) {
    try {
        $testFile = Join-Path $dbDir ".write_test"
        try {
            "test" | Out-File -FilePath $testFile -Force
            Remove-Item $testFile -Force
            Write-Host "目录写入权限正常" -ForegroundColor Green
        }
        catch {
            Write-Host "目录没有写入权限" -ForegroundColor Red
            Write-Host "尝试添加目录写入权限..." -ForegroundColor Yellow
            
            try {
                $acl = Get-Acl $dbDir
                $permission = "$env:USERNAME", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
                $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
                $acl.SetAccessRule($accessRule)
                Set-Acl $dbDir $acl
                Write-Host "已添加目录写入权限" -ForegroundColor Green
            }
            catch {
                Write-Host "无法添加目录写入权限: $_" -ForegroundColor Red
                Write-Host "请以管理员身份运行此脚本" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "无法检查目录权限: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "权限检查完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果问题仍然存在，请尝试:" -ForegroundColor Yellow
Write-Host "1. 以管理员身份运行程序" -ForegroundColor Yellow
Write-Host "2. 检查文件是否被其他程序锁定" -ForegroundColor Yellow
Write-Host "3. 将数据库路径配置到用户目录（如 Documents 文件夹）" -ForegroundColor Yellow
Write-Host ""
