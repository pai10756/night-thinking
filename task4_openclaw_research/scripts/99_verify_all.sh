#!/usr/bin/env bash
# ============================================================
#  OpenClaw 安裝步驟 7/7：全流程驗證
#  執行環境：WSL2 Ubuntu
#  用法：bash 99_verify_all.sh
# ============================================================
set -uo pipefail  # 不用 -e，因為我們需要收集所有結果

# --- 色彩定義 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# --- 計數器 ---
PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}✅ PASS${NC}  $1"; ((PASS++)); }
fail() { echo -e "  ${RED}❌ FAIL${NC}  $1"; ((FAIL++)); }
skip() { echo -e "  ${YELLOW}⚠️  SKIP${NC}  $1"; ((WARN++)); }

# --- Banner ---
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   OpenClaw 安裝驗證（步驟 7/7）              ║${NC}"
echo -e "${MAGENTA}║   正在檢查所有組件...                        ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════╝${NC}"
echo ""

OC_ENV_FILE="$HOME/.openclaw/.env"

# ============================================================
#  1. WSL2 環境
# ============================================================
echo -e "${CYAN}── 1. WSL2 環境 ──${NC}"

# 檢查是否在 WSL 中
if grep -qi microsoft /proc/version 2>/dev/null; then
    pass "正在 WSL2 環境中執行"
else
    skip "未在 WSL2 中執行（可能是原生 Linux 或其他環境）"
fi

# ============================================================
#  2. Node.js
# ============================================================
echo ""
echo -e "${CYAN}── 2. Node.js ──${NC}"

if command -v node &> /dev/null; then
    NODE_VER=$(node -v)
    NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -ge 22 ]; then
        pass "Node.js $NODE_VER（符合需求 ≥ v22）"
    else
        fail "Node.js $NODE_VER 版本過舊（需要 ≥ v22）"
    fi
else
    fail "Node.js 未安裝"
fi

if command -v npm &> /dev/null; then
    pass "npm $(npm -v)"
else
    fail "npm 未安裝"
fi

# ============================================================
#  3. OpenClaw
# ============================================================
echo ""
echo -e "${CYAN}── 3. OpenClaw ──${NC}"

if command -v openclaw &> /dev/null; then
    OC_VER=$(openclaw --version 2>/dev/null || echo "版本未知")
    pass "OpenClaw 已安裝（$OC_VER）"
else
    fail "OpenClaw 未安裝"
fi

# ============================================================
#  4. API 金鑰
# ============================================================
echo ""
echo -e "${CYAN}── 4. API 金鑰 ──${NC}"

if [ -f "$OC_ENV_FILE" ]; then
    pass ".env 設定檔存在"

    # 檢查檔案權限
    PERMS=$(stat -c "%a" "$OC_ENV_FILE" 2>/dev/null || echo "unknown")
    if [ "$PERMS" = "600" ]; then
        pass "檔案權限正確（600）"
    else
        skip "檔案權限為 $PERMS（建議設為 600）"
    fi

    # 檢查是否有 API Key
    HAS_KEY=false
    for key in OPENROUTER_API_KEY ANTHROPIC_API_KEY DEEPSEEK_API_KEY OPENAI_API_KEY; do
        if grep -q "^${key}=" "$OC_ENV_FILE" 2>/dev/null; then
            KEY_VAL=$(grep "^${key}=" "$OC_ENV_FILE" | cut -d'=' -f2)
            if [ -n "$KEY_VAL" ]; then
                # 顯示遮蔽的 key（只顯示前 8 字元）
                MASKED="${KEY_VAL:0:8}..."
                pass "$key 已設定（$MASKED）"
                HAS_KEY=true
            fi
        fi
    done

    if [ "$HAS_KEY" = false ]; then
        fail "未找到任何 API 金鑰"
    fi

    # 檢查模型設定
    if grep -q "^OPENCLAW_MODEL=" "$OC_ENV_FILE" 2>/dev/null; then
        MODEL=$(grep "^OPENCLAW_MODEL=" "$OC_ENV_FILE" | cut -d'=' -f2)
        pass "模型設定：$MODEL"
    else
        skip "未設定預設模型（將使用 OpenClaw 預設值）"
    fi
else
    fail ".env 設定檔不存在"
fi

# ============================================================
#  5. LINE 整合
# ============================================================
echo ""
echo -e "${CYAN}── 5. LINE 整合 ──${NC}"

if [ -f "$OC_ENV_FILE" ] && grep -q "^LINE_CHANNEL_ACCESS_TOKEN=" "$OC_ENV_FILE" 2>/dev/null; then
    TOKEN_VAL=$(grep "^LINE_CHANNEL_ACCESS_TOKEN=" "$OC_ENV_FILE" | cut -d'=' -f2)
    if [ -n "$TOKEN_VAL" ]; then
        pass "LINE Channel Access Token 已設定"
    else
        fail "LINE Channel Access Token 為空"
    fi
else
    skip "LINE 未設定（選填）"
fi

if [ -f "$OC_ENV_FILE" ] && grep -q "^LINE_CHANNEL_SECRET=" "$OC_ENV_FILE" 2>/dev/null; then
    pass "LINE Channel Secret 已設定"
else
    if [ -f "$OC_ENV_FILE" ] && grep -q "^LINE_CHANNEL_ACCESS_TOKEN=" "$OC_ENV_FILE" 2>/dev/null; then
        fail "LINE Channel Secret 未設定（但 Token 已設定）"
    fi
fi

# ============================================================
#  6. Telegram 整合
# ============================================================
echo ""
echo -e "${CYAN}── 6. Telegram 整合 ──${NC}"

if [ -f "$OC_ENV_FILE" ] && grep -q "^TELEGRAM_BOT_TOKEN=" "$OC_ENV_FILE" 2>/dev/null; then
    TG_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" "$OC_ENV_FILE" | cut -d'=' -f2)
    if [ -n "$TG_TOKEN" ]; then
        pass "Telegram Bot Token 已設定"

        # 測試 Token 有效性
        TG_CHECK=$(curl -s "https://api.telegram.org/bot${TG_TOKEN}/getMe" 2>/dev/null)
        if echo "$TG_CHECK" | grep -q '"ok":true'; then
            BOT_NAME=$(echo "$TG_CHECK" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
            pass "Telegram Bot 連線正常（@${BOT_NAME}）"
        else
            fail "Telegram Bot Token 無效或無法連線"
        fi
    else
        fail "Telegram Bot Token 為空"
    fi
else
    skip "Telegram 未設定（選填）"
fi

if [ -f "$OC_ENV_FILE" ] && grep -q "^TELEGRAM_ALLOWED_USER_IDS=" "$OC_ENV_FILE" 2>/dev/null; then
    pass "Telegram 使用者授權已設定"
else
    if [ -f "$OC_ENV_FILE" ] && grep -q "^TELEGRAM_BOT_TOKEN=" "$OC_ENV_FILE" 2>/dev/null; then
        skip "Telegram 使用者授權未設定（任何人都能使用你的 Bot）"
    fi
fi

# ============================================================
#  7. HTTPS 隧道
# ============================================================
echo ""
echo -e "${CYAN}── 7. HTTPS 隧道 ──${NC}"

if pgrep -x ngrok > /dev/null 2>&1; then
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$NGROK_URL" ]; then
        pass "ngrok 運行中：$NGROK_URL"
    else
        skip "ngrok 運行中但無法取得 URL"
    fi
elif pgrep -x cloudflared > /dev/null 2>&1; then
    pass "Cloudflare Tunnel 運行中"
else
    skip "HTTPS 隧道未運行（LINE 整合需要隧道）"
fi

if command -v ngrok &> /dev/null; then
    pass "ngrok 已安裝"
else
    skip "ngrok 未安裝"
fi

# ============================================================
#  8. ClawHub Skills
# ============================================================
echo ""
echo -e "${CYAN}── 8. ClawHub Skills ──${NC}"

# 嘗試列出已安裝的 skills
if command -v openclaw &> /dev/null; then
    SKILLS_OUTPUT=$(openclaw skill list 2>/dev/null || echo "")
    if [ -n "$SKILLS_OUTPUT" ]; then
        SKILL_COUNT=$(echo "$SKILLS_OUTPUT" | wc -l)
        pass "已安裝 $SKILL_COUNT 個 Skills"
    else
        skip "無法列出 Skills（OpenClaw 可能未啟動）"
    fi
else
    skip "OpenClaw 未安裝，無法檢查 Skills"
fi

# ============================================================
#  總結
# ============================================================
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  驗證結果總結${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}✅ 通過：$PASS${NC}"
echo -e "  ${RED}❌ 失敗：$FAIL${NC}"
echo -e "  ${YELLOW}⚠️  跳過：$WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "  ${GREEN}🎉 全部通過！你的 OpenClaw 環境已經準備就緒。${NC}"
    echo ""
    echo "  啟動 OpenClaw："
    echo "    openclaw"
    echo ""
elif [ $FAIL -le 2 ]; then
    echo -e "  ${YELLOW}⚡ 大部分設定正常，有 $FAIL 個項目需要修正。${NC}"
    echo "  請根據上方 FAIL 項目的說明進行修正。"
    echo ""
else
    echo -e "  ${RED}⚠️  有 $FAIL 個項目失敗，建議依序重新執行安裝腳本。${NC}"
    echo ""
fi

echo "  📌 如需重新設定："
echo "     - WSL2 問題    → 重新執行 01_wsl2_setup.ps1（在 PowerShell）"
echo "     - OpenClaw 問題 → 重新執行 02_openclaw_install.sh"
echo "     - API 金鑰問題  → 重新執行 05_api_keys_config.sh"
echo "     - LINE 問題    → 重新執行 03_line_setup.sh"
echo "     - Telegram 問題 → 重新執行 04_telegram_setup.sh"
echo ""
