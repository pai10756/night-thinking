#!/usr/bin/env bash
# ============================================================
#  OpenClaw 安裝步驟 5/7：LINE Bot 整合
#  執行環境：WSL2 Ubuntu
#  用法：bash 03_line_setup.sh
#  前置條件：已執行 02_openclaw_install.sh、05_api_keys_config.sh
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
echo -e "${MAGENTA}║   OpenClaw 安裝步驟 5/7：LINE Bot 整合       ║${NC}"
echo -e "${MAGENTA}║   預估時間：10-15 分鐘                       ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════╝${NC}"
echo ""

# --- OpenClaw 設定檔路徑 ---
OC_ENV_FILE="$HOME/.openclaw/.env"

# ============================================================
#  前置檢查
# ============================================================
step "前置檢查"

if ! command -v openclaw &> /dev/null; then
    err "OpenClaw 尚未安裝。請先執行 02_openclaw_install.sh"
    exit 1
fi
ok "OpenClaw 已安裝"

if [ ! -f "$OC_ENV_FILE" ]; then
    warn ".env 檔案不存在，將建立新檔"
    mkdir -p "$(dirname "$OC_ENV_FILE")"
    touch "$OC_ENV_FILE"
    chmod 600 "$OC_ENV_FILE"
fi

# ============================================================
#  步驟 1：引導建立 LINE Channel（純文字說明）
# ============================================================
step "步驟 1：在 LINE Developers Console 建立 Channel"

echo ""
echo "  請在瀏覽器中完成以下操作："
echo ""
echo -e "  ${CYAN}1. 前往 LINE Developers Console：${NC}"
echo "     https://developers.line.biz/console/"
echo ""
echo -e "  ${CYAN}2. 登入後，建立 Provider（如果還沒有的話）：${NC}"
echo "     - 點選 Create → Provider name 填入你的名稱"
echo ""
echo -e "  ${CYAN}3. 在 Provider 下建立 Channel：${NC}"
echo "     - 選擇 Messaging API"
echo "     - 填入 Channel 名稱（例如：我的 AI 助手）"
echo "     - 選擇 Category 和 Subcategory"
echo "     - 同意條款後建立"
echo ""
echo -e "  ${CYAN}4. 進入 Channel 設定頁面：${NC}"
echo "     - 在 Messaging API 分頁，點選 Issue 產生 Channel access token"
echo "     - 在 Basic settings 分頁，找到 Channel secret"
echo ""

read -p "  完成上述步驟後，按 Enter 繼續... "

# ============================================================
#  步驟 2：輸入 LINE 憑證
# ============================================================
step "步驟 2：輸入 LINE 憑證"

echo ""
read -p "  請貼上 Channel Access Token（長字串）: " LINE_ACCESS_TOKEN
echo ""
read -p "  請貼上 Channel Secret: " LINE_CHANNEL_SECRET

if [ -z "$LINE_ACCESS_TOKEN" ] || [ -z "$LINE_CHANNEL_SECRET" ]; then
    err "Token 和 Secret 都必須填寫"
    exit 1
fi

ok "已收到 LINE 憑證"

# ============================================================
#  步驟 3：寫入 OpenClaw 設定
# ============================================================
step "步驟 3：寫入 OpenClaw 設定"

# 備份
if [ -f "$OC_ENV_FILE" ]; then
    cp "$OC_ENV_FILE" "${OC_ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
fi

# 寫入 LINE 相關環境變數
declare -A LINE_VARS=(
    ["LINE_CHANNEL_ACCESS_TOKEN"]="$LINE_ACCESS_TOKEN"
    ["LINE_CHANNEL_SECRET"]="$LINE_CHANNEL_SECRET"
    ["OPENCLAW_CHANNEL_LINE_ENABLED"]="true"
)

for key in "${!LINE_VARS[@]}"; do
    value="${LINE_VARS[$key]}"
    if grep -q "^${key}=" "$OC_ENV_FILE" 2>/dev/null; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$OC_ENV_FILE"
    else
        echo "${key}=${value}" >> "$OC_ENV_FILE"
    fi
done

chmod 600 "$OC_ENV_FILE"
ok "LINE 設定已寫入 $OC_ENV_FILE"

# ============================================================
#  步驟 4：確認 HTTPS 隧道
# ============================================================
step "步驟 4：確認 HTTPS 隧道"

WEBHOOK_URL=""

# 檢查 ngrok 是否在運行
if pgrep -x ngrok > /dev/null 2>&1; then
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$NGROK_URL" ]; then
        WEBHOOK_URL="${NGROK_URL}/webhook/line"
        ok "偵測到 ngrok 隧道：$NGROK_URL"
    fi
fi

# 檢查 cloudflared
if [ -z "$WEBHOOK_URL" ] && pgrep -x cloudflared > /dev/null 2>&1; then
    CF_URL=$(grep -o 'https://.*trycloudflare.com' /tmp/cloudflared.log 2>/dev/null | head -1)
    if [ -n "$CF_URL" ]; then
        WEBHOOK_URL="${CF_URL}/webhook/line"
        ok "偵測到 Cloudflare Tunnel：$CF_URL"
    fi
fi

if [ -z "$WEBHOOK_URL" ]; then
    warn "未偵測到 HTTPS 隧道"
    echo ""
    echo "  你有兩個選擇："
    echo "  1. 先執行 bash 06_ngrok_tunnel.sh 啟動隧道，再回來繼續"
    echo "  2. 手動輸入你的 HTTPS URL"
    echo ""
    read -p "  請輸入你的公開 HTTPS URL（或按 Enter 稍後設定）: " CUSTOM_URL
    if [ -n "$CUSTOM_URL" ]; then
        WEBHOOK_URL="${CUSTOM_URL}/webhook/line"
    fi
fi

# ============================================================
#  步驟 5：設定 LINE Webhook
# ============================================================
step "步驟 5：設定 LINE Webhook"

if [ -n "$WEBHOOK_URL" ]; then
    echo ""
    echo -e "  ${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${GREEN}║  你的 LINE Webhook URL：                            ║${NC}"
    echo -e "  ${GREEN}║                                                     ║${NC}"
    echo -e "  ${GREEN}║  ${WEBHOOK_URL}${NC}"
    echo -e "  ${GREEN}║                                                     ║${NC}"
    echo -e "  ${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "  請在 LINE Developers Console 設定 Webhook："
    echo ""
    echo -e "  ${CYAN}1. 回到你的 Channel → Messaging API 分頁${NC}"
    echo -e "  ${CYAN}2. 找到 Webhook settings${NC}"
    echo -e "  ${CYAN}3. 將上方 URL 貼入 Webhook URL 欄位${NC}"
    echo -e "  ${CYAN}4. 啟用 Use webhook（開關打開）${NC}"
    echo -e "  ${CYAN}5. 點選 Verify 確認連線成功${NC}"
    echo ""
    echo "  同時建議關閉以下功能（在同一頁面）："
    echo "    - 關閉 Auto-reply messages（自動回覆）"
    echo "    - 關閉 Greeting messages（歡迎訊息）"
    echo ""
else
    warn "尚未設定 HTTPS 隧道，Webhook URL 待稍後設定"
    echo "  設定隧道後，你的 Webhook URL 格式為："
    echo "  https://你的隧道URL/webhook/line"
fi

read -p "  完成 Webhook 設定後，按 Enter 繼續... "

# ============================================================
#  步驟 6：測試
# ============================================================
step "步驟 6：測試 LINE Bot"

echo ""
echo "  請確認 OpenClaw 正在運行中。"
echo "  如果尚未啟動，請開啟另一個終端機執行：openclaw"
echo ""
echo "  然後："
echo "    1. 用手機開啟 LINE"
echo "    2. 用 LINE 加入你剛建立的官方帳號為好友"
echo "       （在 Channel 的 Messaging API 頁面有 QR Code）"
echo "    3. 發送一則訊息，例如：「你好，自我介紹一下」"
echo "    4. 如果收到 AI 回覆，代表設定成功！"
echo ""

read -p "  測試完成了嗎？(y/N): " test_result

if [[ "$test_result" == "y" || "$test_result" == "Y" ]]; then
    ok "LINE Bot 設定成功！恭喜！🎉"
else
    echo ""
    warn "如果測試失敗，請檢查："
    echo "    1. OpenClaw 是否正在運行"
    echo "    2. ngrok / Cloudflare Tunnel 是否正在運行"
    echo "    3. Webhook URL 是否正確設定在 LINE Console"
    echo "    4. LINE Console 的 Verify 按鈕是否顯示成功"
    echo "    5. 是否已關閉 Auto-reply messages"
    echo ""
fi

# ============================================================
#  完成
# ============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   LINE Bot 整合設定完成！                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  📌 下一步："
echo "     1. 執行：bash 04_telegram_setup.sh（設定 Telegram 整合）"
echo "     2. 或者：bash 99_verify_all.sh（驗證全部設定）"
echo ""
