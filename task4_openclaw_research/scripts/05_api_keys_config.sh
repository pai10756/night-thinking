#!/usr/bin/env bash
# ============================================================
#  OpenClaw 安裝步驟 3/7：API 金鑰設定
#  執行環境：WSL2 Ubuntu
#  用法：bash 05_api_keys_config.sh
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
echo -e "${MAGENTA}║   OpenClaw 安裝步驟 3/7：API 金鑰設定        ║${NC}"
echo -e "${MAGENTA}║   預估時間：3-5 分鐘                         ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════╝${NC}"
echo ""

# --- OpenClaw 設定檔路徑 ---
OC_ENV_FILE="$HOME/.openclaw/.env"
mkdir -p "$HOME/.openclaw"

# ============================================================
#  選擇 AI 模型提供者
# ============================================================
step "選擇 AI 模型提供者"

echo ""
echo "  可用的 AI 模型提供者："
echo ""
echo -e "  ${CYAN}1) OpenRouter（推薦）${NC}"
echo "     - 統一入口，支援 Claude / GPT / DeepSeek / Gemini 等"
echo "     - 只需一組 API Key 即可切換多種模型"
echo "     - 註冊網址：https://openrouter.ai"
echo ""
echo -e "  ${CYAN}2) Anthropic（Claude 直連）${NC}"
echo "     - 直接使用 Claude API"
echo "     - 註冊網址：https://console.anthropic.com"
echo ""
echo -e "  ${CYAN}3) DeepSeek（省錢方案）${NC}"
echo "     - 中國 AI 模型，價格低廉"
echo "     - 註冊網址：https://platform.deepseek.com"
echo ""
echo -e "  ${CYAN}4) OpenAI（GPT）${NC}"
echo "     - 使用 GPT-4o 等模型"
echo "     - 註冊網址：https://platform.openai.com"
echo ""

while true; do
    read -p "  請選擇 (1-4): " choice
    case $choice in
        1) PROVIDER="openrouter"; break;;
        2) PROVIDER="anthropic"; break;;
        3) PROVIDER="deepseek"; break;;
        4) PROVIDER="openai"; break;;
        *) echo -e "  ${RED}請輸入 1-4${NC}";;
    esac
done

# ============================================================
#  輸入 API 金鑰
# ============================================================
step "輸入 API 金鑰"

case $PROVIDER in
    openrouter)
        echo ""
        echo "  📝 如何取得 OpenRouter API Key："
        echo "     1. 前往 https://openrouter.ai 註冊/登入"
        echo "     2. 點選右上角 Keys"
        echo "     3. Create Key，複製 sk-or-... 開頭的金鑰"
        echo ""
        read -sp "  請貼上 OpenRouter API Key: " API_KEY
        echo ""

        # 基本格式驗證
        if [[ ! "$API_KEY" =~ ^sk-or- ]]; then
            warn "金鑰格式看起來不像 OpenRouter（應以 sk-or- 開頭）"
            read -p "  確定要繼續嗎？(y/N): " confirm
            [[ "$confirm" != "y" && "$confirm" != "Y" ]] && exit 1
        fi

        ENV_KEY="OPENROUTER_API_KEY"
        MODEL_CONFIG='OPENCLAW_MODEL_PROVIDER=openrouter
OPENCLAW_MODEL=openrouter/anthropic/claude-sonnet-4-5'
        ;;

    anthropic)
        echo ""
        echo "  📝 如何取得 Anthropic API Key："
        echo "     1. 前往 https://console.anthropic.com 註冊/登入"
        echo "     2. 點選 API Keys"
        echo "     3. Create Key，複製 sk-ant-... 開頭的金鑰"
        echo ""
        read -sp "  請貼上 Anthropic API Key: " API_KEY
        echo ""

        if [[ ! "$API_KEY" =~ ^sk-ant- ]]; then
            warn "金鑰格式看起來不像 Anthropic（應以 sk-ant- 開頭）"
            read -p "  確定要繼續嗎？(y/N): " confirm
            [[ "$confirm" != "y" && "$confirm" != "Y" ]] && exit 1
        fi

        ENV_KEY="ANTHROPIC_API_KEY"
        MODEL_CONFIG='OPENCLAW_MODEL_PROVIDER=anthropic
OPENCLAW_MODEL=claude-sonnet-4-5-20260514'
        ;;

    deepseek)
        echo ""
        echo "  📝 如何取得 DeepSeek API Key："
        echo "     1. 前往 https://platform.deepseek.com 註冊/登入"
        echo "     2. 點選 API Keys"
        echo "     3. 建立金鑰並複製"
        echo ""
        read -sp "  請貼上 DeepSeek API Key: " API_KEY
        echo ""

        ENV_KEY="DEEPSEEK_API_KEY"
        MODEL_CONFIG='OPENCLAW_MODEL_PROVIDER=openai-completions
OPENCLAW_MODEL=deepseek-chat
OPENCLAW_API_BASE_URL=https://api.deepseek.com/v1'
        ;;

    openai)
        echo ""
        echo "  📝 如何取得 OpenAI API Key："
        echo "     1. 前往 https://platform.openai.com 註冊/登入"
        echo "     2. 點選 API Keys"
        echo "     3. Create new secret key，複製 sk-... 開頭的金鑰"
        echo ""
        read -sp "  請貼上 OpenAI API Key: " API_KEY
        echo ""

        if [[ ! "$API_KEY" =~ ^sk- ]]; then
            warn "金鑰格式看起來不像 OpenAI（應以 sk- 開頭）"
            read -p "  確定要繼續嗎？(y/N): " confirm
            [[ "$confirm" != "y" && "$confirm" != "Y" ]] && exit 1
        fi

        ENV_KEY="OPENAI_API_KEY"
        MODEL_CONFIG='OPENCLAW_MODEL_PROVIDER=openai
OPENCLAW_MODEL=gpt-4o'
        ;;
esac

# ============================================================
#  寫入設定
# ============================================================
step "寫入設定"

# 如果 .env 已存在，備份
if [ -f "$OC_ENV_FILE" ]; then
    cp "$OC_ENV_FILE" "${OC_ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
    warn "已備份現有 .env 檔案"
fi

# 寫入/更新 API Key
if [ -f "$OC_ENV_FILE" ] && grep -q "^${ENV_KEY}=" "$OC_ENV_FILE"; then
    # 更新現有的 key
    sed -i "s|^${ENV_KEY}=.*|${ENV_KEY}=${API_KEY}|" "$OC_ENV_FILE"
else
    echo "${ENV_KEY}=${API_KEY}" >> "$OC_ENV_FILE"
fi

# 寫入模型設定
while IFS= read -r line; do
    key=$(echo "$line" | cut -d'=' -f1)
    if grep -q "^${key}=" "$OC_ENV_FILE" 2>/dev/null; then
        sed -i "s|^${key}=.*|${line}|" "$OC_ENV_FILE"
    else
        echo "$line" >> "$OC_ENV_FILE"
    fi
done <<< "$MODEL_CONFIG"

# 設定檔案權限（只有自己能讀）
chmod 600 "$OC_ENV_FILE"

ok "API 金鑰已安全寫入 $OC_ENV_FILE"
ok "檔案權限已設為 600（僅限本人讀取）"

# ============================================================
#  測試連線
# ============================================================
step "測試 API 連線"

echo "  正在測試..."

case $PROVIDER in
    openrouter)
        RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
            -H "Authorization: Bearer $API_KEY" \
            "https://openrouter.ai/api/v1/models" 2>/dev/null || echo "000")
        ;;
    anthropic)
        RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
            -H "x-api-key: $API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            "https://api.anthropic.com/v1/models" 2>/dev/null || echo "000")
        ;;
    deepseek)
        RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
            -H "Authorization: Bearer $API_KEY" \
            "https://api.deepseek.com/v1/models" 2>/dev/null || echo "000")
        ;;
    openai)
        RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
            -H "Authorization: Bearer $API_KEY" \
            "https://api.openai.com/v1/models" 2>/dev/null || echo "000")
        ;;
esac

if [[ "$RESPONSE" == "200" ]]; then
    ok "API 連線成功！"
elif [[ "$RESPONSE" == "401" ]]; then
    err "API 金鑰無效（401 Unauthorized）"
    err "請確認金鑰是否正確，然後重新執行此腳本"
elif [[ "$RESPONSE" == "000" ]]; then
    warn "無法連線到 API 伺服器。可能是網路問題。"
    warn "金鑰已儲存，稍後可重新測試。"
else
    warn "收到非預期的回應碼：$RESPONSE"
    warn "金鑰已儲存，請稍後手動確認。"
fi

# ============================================================
#  完成
# ============================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   API 金鑰設定完成！                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  已設定的提供者：$PROVIDER"
echo "  設定檔位置：$OC_ENV_FILE"
echo ""
echo "  📌 下一步："
echo "     1. 執行：bash 03_line_setup.sh（設定 LINE 整合）"
echo "     2. 或者：bash 04_telegram_setup.sh（設定 Telegram 整合）"
echo ""
