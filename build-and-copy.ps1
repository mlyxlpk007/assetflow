# PowerShell script: Build frontend and copy to C# project
# Encoding: UTF-8 with BOM

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building frontend and copying to C# project" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist directory exists
if (-not (Test-Path "dist")) {
    Write-Host "Error: dist directory not found! Please run 'npm run build' first" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "Step 1: Building frontend..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend build successful!" -ForegroundColor Green
Write-Host ""

# Check wwwroot directory
$wwwrootPath = "RDTrackingSystem\wwwroot"
Write-Host "Step 2: Preparing wwwroot directory..." -ForegroundColor Green
if (-not (Test-Path $wwwrootPath)) {
    New-Item -ItemType Directory -Path $wwwrootPath -Force | Out-Null
    Write-Host "Created wwwroot directory: $wwwrootPath" -ForegroundColor Yellow
} else {
    Write-Host "wwwroot directory exists: $wwwrootPath" -ForegroundColor Yellow
}

# Clear wwwroot directory
Write-Host "Step 3: Clearing wwwroot directory..." -ForegroundColor Green
if (Test-Path $wwwrootPath) {
    $items = Get-ChildItem -Path $wwwrootPath -Recurse -ErrorAction SilentlyContinue
    if ($items) {
        Remove-Item -Path "$wwwrootPath\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cleared wwwroot directory" -ForegroundColor Yellow
    }
}

# Copy dist directory contents to wwwroot
Write-Host "Step 4: Copying files to wwwroot..." -ForegroundColor Green
$distPath = "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "Error: dist directory not found!" -ForegroundColor Red
    exit 1
}

# Get list of files to copy
$files = Get-ChildItem -Path $distPath -Recurse
Write-Host "Found $($files.Count) files to copy" -ForegroundColor Yellow

# Copy all files
Copy-Item -Path "$distPath\*" -Destination $wwwrootPath -Recurse -Force

# Verify copy result
Write-Host ""
Write-Host "Step 5: Verifying copy result..." -ForegroundColor Green
$copiedFiles = Get-ChildItem -Path $wwwrootPath -Recurse -File
Write-Host "Copied $($copiedFiles.Count) files to wwwroot" -ForegroundColor Yellow

# Check key files
$indexHtml = Join-Path $wwwrootPath "index.html"
if (Test-Path $indexHtml) {
    Write-Host "[OK] index.html copied" -ForegroundColor Green
} else {
    Write-Host "[ERROR] index.html not found!" -ForegroundColor Red
    exit 1
}

$assetsDir = Join-Path $wwwrootPath "assets"
if (Test-Path $assetsDir) {
    $assetFiles = Get-ChildItem -Path $assetsDir -File
    Write-Host "[OK] assets directory copied ($($assetFiles.Count) files)" -ForegroundColor Green
} else {
    Write-Host "[ERROR] assets directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete! Files copied to $wwwrootPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tip: If UI is not updated, please:" -ForegroundColor Yellow
Write-Host "  1. Restart the C# application" -ForegroundColor Yellow
Write-Host "  2. Press Ctrl+F5 in browser to force refresh" -ForegroundColor Yellow
Write-Host "  3. Clear browser cache" -ForegroundColor Yellow
