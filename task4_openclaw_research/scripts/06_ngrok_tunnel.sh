#!/usr/bin/env bash
# ============================================================
#  OpenClaw 安裝步驟 4/7：ngrok HTTPS 隧道
#  執行環境：WSL2 Ubuntu
#  用法：bash 06_ngrok_tunnel.sh
# ============================================================
set -euo pipefail

# --- 色彩定義 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "  ${RED}❌ $1${NC}"; }
step() { echo -e "\n${CYAN}▶ $1${NC}"; }

# --- Banner ---
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   OpenClaw 安裝步驟 4/7：ngrok HTTPS 隧道    ║${NC}"
echo -e "${MAGENTA}║   預估時間：3 分鐘                           ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
#  步驟 1：選擇隧道工具
# ============================================================
step "步驟 1：選擇 HTTPS 隧道工具"

echo ""
echo "  LINE 整合需要 HTTPS 公開 URL。以下兩種方式可選："
echo ""
echo -e "  ${CYAN}1) ngrok（推薦新手）${NC}"
echo "     - 簡單好用，一行指令啟動"
echo "     - 免費版每次重啟 URL 會變"
echo "     - 需註冊 ngrok 帳號取得 auth token"
echo ""
echo -e "  ${CYAN}2) Cloudflare Tunnel（推薦長期使用）${NC}"
echo "     - 完全免費，URL 可固定"
echo "     - 設定稍複雜，需有 Cloudflare 帳號"
echo ""

while true; do
    read -p "  請選擇 (1/2): " choice
    case $choice in
        1) TOOL="ngrok"; break;;
        2) TOOL="cloudflare"; break;;
        *) echo -e "  ${RED}請輸入 1 或 2${NC}";;
    esac
done

# ============================================================
#  ngrok 安裝流程
# ============================================================
if [ "$TOOL" = "ngrok" ]; then

    # --- 安裝 ngrok ---
    step "步驟 2：安裝 ngrok"

    if command -v ngrok &> /dev/null; then
        ok "ngrok 已安裝（$(ngrok version 2>/dev/null)）"
    else
        echo "  正在安裝 ngrok..."

        # 使用官方安裝方式
        curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
            | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
            | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
        sudo apt-get update -qq
        sudo apt-get install -y -qq ngrok > /dev/null 2>&1

        if command -v ngrok &> /dev/null; then
            ok "ngrok 安裝完成"
        else
            err "ngrok 安裝失敗。請手動安裝："
            err "  前往 https://ngrok.com/download"
            exit 1
        fi
    fi

    # --- 設定 auth token ---
    step "步驟 3：設定 ngrok Auth Token"

    # 檢查是否已設定
    if ngrok config check 2>/dev/null | grep -q "valid"; then
        ok "ngrok auth token 已設定"
    else
        echo ""
        echo "  📝 如何取得 ngrok Auth Token："
        echo "     1. 前往 https://dashboard.ngrok.com/signup 註冊（免費）"
        echo "     2. 登入後點選 Your Authtoken"
        echo "     3. 複製 token"
        echo ""
        read -sp "  請貼上 ngrok Auth Token: " NGROK_TOKEN
        echo ""

        if [ -n "$NGROK_TOKEN" ]; then
            ngrok config add-authtoken "$NGROK_TOKEN"
            ok "ngrok auth token 已設定"
        else
            warn "未輸入 token，ngrok 將以未驗證模式運行（有連線限制）"
        fi
    fi

    # --- 啟動隧道 ---
    step "步驟 4：啟動 ngrok 隧道"

    PORT=${1:-3100}
    echo "  目標連接埠：$PORT（OpenClaw LINE 預設埠）"
    echo ""

    # 檢查是否有已在運行的 ngrok
    if pgrep -x ngrok > /dev/null 2>&1; then
        warn "ngrok 已在運行中"
        EXISTING_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$EXISTING_URL" ]; then
            ok "現有隧道 URL：$EXISTING_URL"
            echo ""
            echo -e "  ${YELLOW}LINE Webhook URL：${EXISTING_URL}/webhook/line${NC}"
        fi

        read -p "  是否重新啟動？(y/N): " restart
        if [[ "$restart" == "y" || "$restart" == "Y" ]]; then
            pkill ngrok || true
            sleep 1
        else
            echo "  保留現有連線"
            exit 0
        fi
    fi

    echo "  正在啟動 ngrok..."
    ngrok http "$PORT" --log=stdout > /tmp/ngrok.log 2>&1 &
    NGROK_PID=$!

    # 等待啟動
    sleep 3

    # 取得公開 URL
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$PUBLIC_URL" ]; then
        ok "ngrok 隧道已啟動！"
        echo ""
        echo -e "  ${GREEN}╔══════════════════════════════════════════════════╗${NC}"
        echo -e "  ${GREEN}║  公開 URL：${PUBLIC_URL}${NC}"
        echo -e "  ${GREEN}║  LINE Webhook：${PUBLIC_URL}/webhook/line${NC}"
        echo -e "  ${GREEN}╚══════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "  ngrok 管理介面：http://127.0.0.1:4040"
        echo "  ngrok PID：$NGROK_PID"
        echo ""
        warn "注意：免費版 ngrok 每次重啟都會產生新的 URL"
        warn "重啟後需要更新 LINE Webhook 設定"
    else
        err "無法取得 ngrok 公開 URL"
        err "請檢查 /tmp/ngrok.log 查看錯誤訊息"
        exit 1
    fi

# ============================================================
#  Cloudflare Tunnel 安裝流程
# ============================================================
else
    step "步驟 2：安裝 cloudflared"

    if command -v cloudflared &> /dev/null; then
        ok "cloudflared 已安裝"
    else
        echo "  正在安裝 cloudflared..."
        curl -sSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
        sudo dpkg -i /tmp/cloudflared.deb
        rm /tmp/cloudflared.deb
        ok "cloudflared 安裝完成"
    fi

    step "步驟 3：啟動 Cloudflare Quick Tunnel"

    PORT=${1:-3100}
    echo "  目標連接埠：$PORT"
    echo ""
    echo "  正在啟動 Cloudflare Quick Tunnel..."
    echo "  （Quick Tunnel 不需要 Cloudflare 帳號，但 URL 每次不同）"
    echo ""

    cloudflared tunnel --url "http://localhost:$PORT" 2>&1 | tee /tmp/cloudflared.log &
    CF_PID=$!

    # 等待取得 URL
    sleep 5
    CF_URL=$(grep -o 'https://.*trycloudflare.com' /tmp/cloudflared.log | head -1)

    if [ -n "$CF_URL" ]; then
        ok "Cloudflare Tunnel 已啟動！"
        echo ""
        echo -e "  ${GREEN}╔══════════════════════════════════════════════════╗${NC}"
        echo -e "  ${GREEN}║  公開 URL：${CF_URL}${NC}"
        echo -e "  ${GREEN}║  LINE Webhook：${CF_URL}/webhook/line${NC}"
        echo -e "  ${GREEN}╚══════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "  cloudflared PID：$CF_PID"
    else
        warn "URL 可能還在生成中，請查看 /tmp/cloudflared.log"
    fi
fi

echo ""
echo "  📌 下一步："
echo "     1. 複製上方的 LINE Webhook URL"
echo "     2. 執行：bash 03_line_setup.sh（完成 LINE 整合設定）"
echo ""
