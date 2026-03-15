#!/usr/bin/env bash
# ============================================================
#  OpenClaw 安裝步驟 6/7：Telegram Bot 整合
#  執行環境：WSL2 Ubuntu
#  用法：bash 04_telegram_setup.sh
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
echo -e "${MAGENTA}║   OpenClaw 安裝步驟 6/7：Telegram Bot 整合   ║${NC}"
echo -e "${MAGENTA}║   預估時間：5 分鐘                           ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════╝${NC}"
echo ""

# --- OpenClaw 設定檔路徑 ---
OC_ENV_FILE="$HOME/.openclaw/.env"
mkdir -p "$HOME/.openclaw"

# ============================================================
#  前置檢查
# ============================================================
step "前置檢查"

if ! command -v openclaw &> /dev/null; then
    err "OpenClaw 尚未安裝。請先執行 02_openclaw_install.sh"
    exit 1
fi
ok "OpenClaw 已安裝"

# ============================================================
#  步驟 1：建立 Telegram Bot
# ============================================================
step "步驟 1：建立 Telegram Bot"

echo ""
echo "  請在 Telegram 中完成以下操作："
echo ""
echo -e "  ${CYAN}1. 開啟 Telegram，搜尋 @BotFather${NC}"
echo "     （認明有藍勾勾的官方帳號）"
echo ""
echo -e "  ${CYAN}2. 發送 /newbot 指令${NC}"
echo ""
echo -e "  ${CYAN}3. 按照提示輸入：${NC}"
echo "     - Bot 顯示名稱（例如：我的 AI 助手）"
echo "     - Bot username（必須以 _bot 結尾，例如：my_ai_helper_bot）"
echo ""
echo -e "  ${CYAN}4. BotFather 會回覆一組 Bot Token，格式如：${NC}"
echo "     1234567890:ABCDefGhIjKlMnOpQrStUvWxYz"
echo ""

read -p "  完成上述步驟後，按 Enter 繼續... "

# ============================================================
#  步驟 2：輸入 Bot Token
# ============================================================
step "步驟 2：輸入 Telegram Bot Token"

echo ""
read -sp "  請貼上 Bot Token: " TG_BOT_TOKEN
echo ""

if [ -z "$TG_BOT_TOKEN" ]; then
    err "Bot Token 不能為空"
    exit 1
fi

# 基本格式驗證
if [[ ! "$TG_BOT_TOKEN" =~ ^[0-9]+:.+$ ]]; then
    warn "Token 格式看起來不正確（應為 數字:字串）"
    read -p "  確定要繼續嗎？(y/N): " confirm
    [[ "$confirm" != "y" && "$confirm" != "Y" ]] && exit 1
fi

# 驗證 Token 有效性
echo "  正在驗證 Token..."
TG_RESPONSE=$(curl -s "https://api.telegram.org/bot${TG_BOT_TOKEN}/getMe" 2>/dev/null)

if echo "$TG_RESPONSE" | grep -q '"ok":true'; then
    BOT_USERNAME=$(echo "$TG_RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    ok "Token 有效！Bot: @${BOT_USERNAME}"
else
    err "Token 無效或 Telegram API 無法連線"
    err "回應：$TG_RESPONSE"
    read -p "  是否仍要儲存此 Token？(y/N): " save_anyway
    [[ "$save_anyway" != "y" && "$save_anyway" != "Y" ]] && exit 1
fi

# ============================================================
#  步驟 3：取得你的 Telegram User ID
# ============================================================
step "步驟 3：取得你的 Telegram User ID"

echo ""
echo "  為了安全起見，你需要授權自己的 User ID。"
echo ""
echo "  取得方式："
echo -e "  ${CYAN}方法 1：${NC}在 Telegram 搜尋 @userinfobot，發送任意訊息"
echo "          它會回覆你的 User ID（純數字）"
echo ""
echo -e "  ${CYAN}方法 2：${NC}在 Telegram 搜尋 @raw_data_bot，發送 /start"
echo "          它會顯示你的 User ID"
echo ""

read -p "  請輸入你的 Telegram User ID: " TG_USER_ID

if [ -z "$TG_USER_ID" ]; then
    warn "未輸入 User ID，將跳過授權設定"
    warn "注意：未授權的話，任何人都能與你的 Bot 互動"
fi

# ============================================================
#  步驟 4：寫入 OpenClaw 設定
# ============================================================
step "步驟 4：寫入 OpenClaw 設定"

# 備份
if [ -f "$OC_ENV_FILE" ]; then
    cp "$OC_ENV_FILE" "${OC_ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
fi

# 寫入 Telegram 環境變數
declare -A TG_VARS=(
    ["TELEGRAM_BOT_TOKEN"]="$TG_BOT_TOKEN"
    ["OPENCLAW_CHANNEL_TELEGRAM_ENABLED"]="true"
)

if [ -n "${TG_USER_ID:-}" ]; then
    TG_VARS["TELEGRAM_ALLOWED_USER_IDS"]="$TG_USER_ID"
fi

for key in "${!TG_VARS[@]}"; do
    value="${TG_VARS[$key]}"
    if grep -q "^${key}=" "$OC_ENV_FILE" 2>/dev/null; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$OC_ENV_FILE"
    else
        echo "${key}=${value}" >> "$OC_ENV_FILE"
    fi
done

chmod 600 "$OC_ENV_FILE"
ok "Telegram 設定已寫入 $OC_ENV_FILE"

# ============================================================
#  步驟 5：測試
# ============================================================
step "步驟 5：測試 Telegram Bot"

echo ""
echo "  請確認 OpenClaw 正在運行中。"
echo "  如果尚未啟動，請開啟另一個終端機執行：openclaw"
echo ""
echo "  然後："
echo "    1. 開啟 Telegram"
echo "    2. 搜尋你剛建立的 Bot（@${BOT_USERNAME:-你的bot名稱}）"
echo "    3. 發送 /start"
echo "    4. 發送一則訊息，例如：「你好，自我介紹一下」"
echo "    5. 如果收到 AI 回覆，代表設定成功！"
echo ""

read -p "  測試完成了嗎？(y/N): " test_result

if [[ "$test_result" == "y" || "$test_result" == "Y" ]]; then
    ok "Telegram Bot 設定成功！恭喜！🎉"
else
    echo ""
    warn "如果測試失敗，請檢查："
    echo "    1. OpenClaw 是否正在運行"
    echo "    2. Bot Token 是否正確"
    echo "    3. 你的 User ID 是否已加入授權清單"
    echo "    4. OpenClaw 終端機是否有錯誤訊息"
    echo ""
fi

# ============================================================
#  Telegram 進階設定提示
# ============================================================
step "進階設定（選填）"

echo ""
echo "  你可以用 @BotFather 進一步自訂 Bot："
echo "    /setdescription — 設定 Bot 說明文字"
echo "    /setabouttext   — 設定 Bot 關於資訊"
echo "    /setuserpic     — 設定 Bot 頭像"
echo "    /setcommands    — 設定快捷指令列表"
echo ""

# ============================================================
#  完成
# ============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Telegram Bot 整合設定完成！                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  📌 下一步："
echo "     1. 執行：bash 99_verify_all.sh（驗證全部設定）"
echo ""
