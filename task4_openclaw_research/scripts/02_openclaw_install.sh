#!/usr/bin/env bash
# ============================================================
#  OpenClaw 安裝步驟 2/7：Node.js + OpenClaw 安裝
#  執行環境：WSL2 Ubuntu
#  用法：bash 02_openclaw_install.sh
# ============================================================
set -euo pipefail

# --- 色彩定義 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "  ${RED}❌ $1${NC}"; }
step() { echo -e "\n${CYAN}▶ $1${NC}"; }

# --- Banner ---
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   OpenClaw 安裝步驟 2/7：Node.js + OpenClaw  ║${NC}"
echo -e "${MAGENTA}║   預估時間：5-8 分鐘                         ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
#  步驟 1：更新系統套件
# ============================================================
step "步驟 1：更新系統套件"

sudo apt-get update -qq
sudo apt-get install -y -qq curl git build-essential > /dev/null 2>&1
ok "系統套件已更新"

# ============================================================
#  步驟 2：安裝 nvm (Node Version Manager)
# ============================================================
step "步驟 2：安裝 nvm"

export NVM_DIR="$HOME/.nvm"

if [ -d "$NVM_DIR" ] && [ -s "$NVM_DIR/nvm.sh" ]; then
    ok "nvm 已安裝，跳過"
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
else
    echo "  正在安裝 nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

    # 載入 nvm
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

    ok "nvm 安裝完成"
fi

# 確認 nvm 可用
if ! command -v nvm &> /dev/null; then
    err "nvm 載入失敗。請嘗試："
    err "  1. 關閉終端機重新開啟"
    err "  2. 執行：source ~/.bashrc"
    err "  3. 再重新執行此腳本"
    exit 1
fi

# ============================================================
#  步驟 3：安裝 Node.js
# ============================================================
step "步驟 3：安裝 Node.js"

# 優先嘗試 Node 24，失敗則用 Node 22 LTS
CURRENT_NODE=$(node -v 2>/dev/null || echo "none")

if [[ "$CURRENT_NODE" == v24.* ]]; then
    ok "Node 24 已安裝（$CURRENT_NODE）"
elif [[ "$CURRENT_NODE" == v22.* ]]; then
    ok "Node 22 LTS 已安裝（$CURRENT_NODE），可正常使用"
    warn "如需升級到 Node 24，執行：nvm install 24"
else
    echo "  正在安裝 Node 24（推薦版本）..."
    if nvm install 24 2>/dev/null; then
        nvm use 24
        nvm alias default 24
        ok "Node 24 安裝完成（$(node -v)）"
    else
        warn "Node 24 安裝失敗，改用 Node 22 LTS..."
        nvm install 22
        nvm use 22
        nvm alias default 22
        ok "Node 22 LTS 安裝完成（$(node -v)）"
    fi
fi

echo "  Node: $(node -v)  |  npm: $(npm -v)"

# ============================================================
#  步驟 4：安裝 OpenClaw
# ============================================================
step "步驟 4：安裝 OpenClaw"

if command -v openclaw &> /dev/null; then
    CURRENT_OC=$(openclaw --version 2>/dev/null || echo "unknown")
    ok "OpenClaw 已安裝（$CURRENT_OC）"
    warn "如需更新，執行：npm update -g openclaw"
else
    echo "  正在安裝 OpenClaw（全域安裝）..."
    npm install -g openclaw

    if command -v openclaw &> /dev/null; then
        ok "OpenClaw 安裝完成（$(openclaw --version 2>/dev/null)）"
    else
        err "OpenClaw 安裝失敗。請嘗試："
        err "  1. 確認 Node.js 正確安裝：node -v"
        err "  2. 手動安裝：npm install -g openclaw"
        err "  3. 如有權限問題：sudo npm install -g openclaw"
        exit 1
    fi
fi

# ============================================================
#  步驟 5：執行 OpenClaw 初始化精靈
# ============================================================
step "步驟 5：初始化 OpenClaw"

echo ""
echo -e "  ${YELLOW}接下來會啟動 OpenClaw 的互動式設定精靈。${NC}"
echo -e "  ${YELLOW}精靈會問你幾個問題，包括：${NC}"
echo "    - 選擇 AI 模型提供者"
echo "    - 輸入 API 金鑰"
echo "    - 設定偏好"
echo ""
echo -e "  ${YELLOW}如果你還沒有 API 金鑰，可以先按 Ctrl+C 跳過，${NC}"
echo -e "  ${YELLOW}之後用 05_api_keys_config.sh 腳本設定。${NC}"
echo ""

read -p "  按 Enter 啟動設定精靈，或按 Ctrl+C 跳過... "

openclaw onboard

# ============================================================
#  步驟 6：安全性設定提醒
# ============================================================
step "步驟 6：安全性注意事項"

echo ""
warn "Canvas Host 預設綁定 0.0.0.0（區網內所有裝置都能存取）"
echo "  如果只在本機使用，建議在 OpenClaw 設定中改為 127.0.0.1"
echo "  設定檔位置：~/.openclaw/config.json"
echo ""

# ============================================================
#  完成
# ============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Node.js + OpenClaw 安裝完成！              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  📌 下一步："
echo "     1. 執行：bash 05_api_keys_config.sh（設定 API 金鑰）"
echo "     2. 或者：bash 03_line_setup.sh（設定 LINE 整合）"
echo ""
