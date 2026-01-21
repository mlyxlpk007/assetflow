# Check file sync status script
# Encoding: UTF-8 with BOM

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking dist and wwwroot file sync status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$distPath = "dist"
$wwwrootPath = "RDTrackingSystem\wwwroot"

# Check dist directory
if (-not (Test-Path $distPath)) {
    Write-Host "[ERROR] dist directory not found!" -ForegroundColor Red
    Write-Host "  Please run: npm run build" -ForegroundColor Yellow
    exit 1
}

# Check wwwroot directory
if (-not (Test-Path $wwwrootPath)) {
    Write-Host "[ERROR] wwwroot directory not found!" -ForegroundColor Red
    Write-Host "  Please run: .\build-and-copy.ps1" -ForegroundColor Yellow
    exit 1
}

# Get file lists
$distFiles = Get-ChildItem -Path $distPath -Recurse -File | Sort-Object FullName
$wwwrootFiles = Get-ChildItem -Path $wwwrootPath -Recurse -File | Sort-Object FullName

Write-Host "dist directory files ($($distFiles.Count) files):" -ForegroundColor Green
foreach ($file in $distFiles) {
    $relativePath = $file.FullName.Replace((Resolve-Path $distPath).Path + "\", "")
    $size = "{0:N0}" -f $file.Length
    Write-Host "  $relativePath ($size bytes)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "wwwroot directory files ($($wwwrootFiles.Count) files):" -ForegroundColor Green
foreach ($file in $wwwrootFiles) {
    $relativePath = $file.FullName.Replace((Resolve-Path $wwwrootPath).Path + "\", "")
    $size = "{0:N0}" -f $file.Length
    Write-Host "  $relativePath ($size bytes)" -ForegroundColor Gray
}

Write-Host ""

# Compare key files
$distIndex = Join-Path $distPath "index.html"
$wwwrootIndex = Join-Path $wwwrootPath "index.html"

if (Test-Path $distIndex) {
    $distHash = (Get-FileHash $distIndex -Algorithm MD5).Hash
    Write-Host "dist/index.html MD5: $distHash" -ForegroundColor Cyan
}

if (Test-Path $wwwrootIndex) {
    $wwwrootHash = (Get-FileHash $wwwrootIndex -Algorithm MD5).Hash
    Write-Host "wwwroot/index.html MD5: $wwwrootHash" -ForegroundColor Cyan
    
    if ($distHash -eq $wwwrootHash) {
        Write-Host "[OK] index.html files are synced" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] index.html files are NOT synced! Need to re-copy" -ForegroundColor Red
        Write-Host "  Please run: .\build-and-copy.ps1" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] wwwroot/index.html not found!" -ForegroundColor Red
    Write-Host "  Please run: .\build-and-copy.ps1" -ForegroundColor Yellow
}

Write-Host ""
