#Requires -RunAsAdministrator
<#
.SYNOPSIS
    OpenClaw 安裝前置作業：WSL2 環境準備腳本
.DESCRIPTION
    自動檢查並安裝 WSL2 + Ubuntu 24.04，設定記憶體限制。
    適用於 Windows 10 22H2+ / Windows 11。
.NOTES
    執行方式：以系統管理員身份開啟 PowerShell，執行：
    Set-ExecutionPolicy Bypass -Scope Process -Force; .\01_wsl2_setup.ps1
#>

# ============================================================
#  色彩輸出函式
# ============================================================
function Write-Success { param([string]$Msg) Write-Host "  ✅ $Msg" -ForegroundColor Green }
function Write-Warn    { param([string]$Msg) Write-Host "  ⚠️  $Msg" -ForegroundColor Yellow }
function Write-Err     { param([string]$Msg) Write-Host "  ❌ $Msg" -ForegroundColor Red }
function Write-Step    { param([string]$Msg) Write-Host "`n▶ $Msg" -ForegroundColor Cyan }

# ============================================================
#  Banner
# ============================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   OpenClaw 安裝步驟 1/7：WSL2 環境準備      ║" -ForegroundColor Magenta
Write-Host "║   預估時間：5-10 分鐘（含下載）              ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ============================================================
#  步驟 1：檢查 Windows 版本
# ============================================================
Write-Step "步驟 1：檢查 Windows 版本"

$osVersion = [System.Environment]::OSVersion.Version
$buildNumber = $osVersion.Build

if ($buildNumber -lt 19041) {
    Write-Err "Windows 版本過舊（Build $buildNumber）。WSL2 需要 Windows 10 Build 19041 以上。"
    Write-Err "請先更新 Windows 後再執行此腳本。"
    exit 1
}
Write-Success "Windows Build $buildNumber — 符合 WSL2 需求"

# ============================================================
#  步驟 2：檢查 WSL2 是否已安裝
# ============================================================
Write-Step "步驟 2：檢查 WSL2 安裝狀態"

$wslInstalled = $false
$ubuntuInstalled = $false

try {
    $wslOutput = wsl --status 2>&1
    if ($LASTEXITCODE -eq 0) {
        $wslInstalled = $true
        Write-Success "WSL2 已安裝"

        # 檢查是否有 Ubuntu
        $distros = wsl --list --quiet 2>&1
        if ($distros -match "Ubuntu") {
            $ubuntuInstalled = $true
            Write-Success "Ubuntu 已安裝"
        }
    }
} catch {
    $wslInstalled = $false
}

# ============================================================
#  步驟 3：安裝 WSL2（如果尚未安裝）
# ============================================================
if (-not $wslInstalled) {
    Write-Step "步驟 3：安裝 WSL2"
    Write-Host "  正在安裝 WSL2，這可能需要幾分鐘..." -ForegroundColor White

    wsl --install --no-distribution
    if ($LASTEXITCODE -ne 0) {
        Write-Err "WSL2 安裝失敗。"
        Write-Err "常見原因："
        Write-Err "  1. 未以系統管理員身份執行"
        Write-Err "  2. BIOS 中虛擬化（VT-x / AMD-V）未啟用"
        Write-Err "  3. Hyper-V 功能被停用"
        Write-Host ""
        Write-Warn "請檢查上述問題後重新執行此腳本。"
        exit 1
    }
    Write-Success "WSL2 安裝完成"
    Write-Warn "可能需要重新開機才能生效。"
} else {
    Write-Step "步驟 3：WSL2 已存在，跳過安裝"
}

# ============================================================
#  步驟 4：安裝 Ubuntu 24.04（如果尚未安裝）
# ============================================================
if (-not $ubuntuInstalled) {
    Write-Step "步驟 4：安裝 Ubuntu 24.04"
    Write-Host "  正在下載 Ubuntu 24.04，這可能需要幾分鐘..." -ForegroundColor White

    wsl --install -d Ubuntu-24.04
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Ubuntu-24.04 安裝可能需要重新開機後完成。"
        Write-Warn "重新開機後，請再次執行此腳本確認安裝狀態。"
    } else {
        Write-Success "Ubuntu 24.04 安裝完成"
    }
} else {
    Write-Step "步驟 4：Ubuntu 已存在，跳過安裝"
}

# ============================================================
#  步驟 5：設定 .wslconfig 記憶體限制
# ============================================================
Write-Step "步驟 5：設定 WSL2 記憶體限制"

$wslConfigPath = "$env:USERPROFILE\.wslconfig"

# 偵測系統記憶體，設定合理上限
$totalMemGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
$wslMemGB = [math]::Min([math]::Max([math]::Floor($totalMemGB / 4), 2), 8)

Write-Host "  系統記憶體：${totalMemGB} GB" -ForegroundColor White
Write-Host "  WSL2 分配：${wslMemGB} GB（建議值）" -ForegroundColor White

if (Test-Path $wslConfigPath) {
    $existingConfig = Get-Content $wslConfigPath -Raw
    Write-Warn ".wslconfig 已存在，內容如下："
    Write-Host $existingConfig -ForegroundColor Gray

    $overwrite = Read-Host "  是否要覆蓋？(y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-Host "  保留現有設定" -ForegroundColor White
    } else {
        $writeConfig = $true
    }
} else {
    $writeConfig = $true
}

if ($writeConfig) {
    $wslConfig = @"
[wsl2]
memory=${wslMemGB}GB
swap=2GB
processors=2
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
"@

    Set-Content -Path $wslConfigPath -Value $wslConfig -Encoding UTF8
    Write-Success ".wslconfig 已寫入：$wslConfigPath"
    Write-Host "  內容：" -ForegroundColor White
    Write-Host $wslConfig -ForegroundColor Gray
}

# ============================================================
#  步驟 6：確認 WSL2 為預設版本
# ============================================================
Write-Step "步驟 6：確認 WSL2 為預設版本"

wsl --set-default-version 2 2>$null
Write-Success "已設定 WSL2 為預設版本"

# ============================================================
#  驗證
# ============================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   WSL2 環境準備完成！                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# 最終狀態檢查
try {
    $finalDistros = wsl --list --verbose 2>&1
    Write-Host "  目前已安裝的 Linux 發行版：" -ForegroundColor White
    Write-Host $finalDistros -ForegroundColor Gray
} catch {
    Write-Warn "無法列出發行版。如果剛剛安裝了 WSL2，請先重新開機。"
}

Write-Host ""
Write-Host "  📌 下一步：" -ForegroundColor Yellow
Write-Host "     1. 如果提示需要重新開機，請先重開機" -ForegroundColor White
Write-Host "     2. 開啟 Ubuntu 終端機（從開始選單搜尋 'Ubuntu'）" -ForegroundColor White
Write-Host "     3. 首次開啟會要求設定使用者名稱和密碼" -ForegroundColor White
Write-Host "     4. 然後執行：bash 02_openclaw_install.sh" -ForegroundColor White
Write-Host ""
