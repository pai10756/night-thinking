# OpenClaw 台灣安裝教學手冊

> 最後更新：2026-03-16 ｜ 目標：30 分鐘從零到可用
>
> 本手冊專為 **Windows 台灣用戶** 撰寫，涵蓋 WSL2 環境、LINE / Telegram 整合、必備 Skills 安裝與雲端部署。

---

## 目錄

1. [什麼是 OpenClaw？](#什麼是-openclaw)
2. [第一章：WSL2 環境準備](#第一章wsl2-環境準備)
3. [第二章：安裝 Node.js](#第二章安裝-nodejs)
4. [第三章：安裝 OpenClaw](#第三章安裝-openclaw)
5. [第四章：設定 API 金鑰](#第四章設定-api-金鑰)
6. [第五章：LINE 整合](#第五章line-整合)
7. [第六章：Telegram 整合](#第六章telegram-整合)
8. [第七章：安裝必備 Skills](#第七章安裝必備-skills)
9. [第八章：雲端部署（進階）](#第八章雲端部署進階)
10. [第九章：疑難排解](#第九章疑難排解)
11. [附錄](#附錄)

---

## 什麼是 OpenClaw？

OpenClaw 是一個**開源 AI Agent 框架**（GitHub 263K+ Stars），它不只是聊天機器人——它能**代替你執行真實任務**。

| 特點 | 說明 |
|------|------|
| 自主執行 | 不只對話，能操作工具、讀寫檔案、呼叫 API |
| 24/7 運行 | 部署到伺服器後可全天候待命 |
| 多通道 | 透過 LINE、Telegram、WhatsApp、Discord 等 IM 軟體操作 |
| 記憶力 | 跨對話保留記憶，越用越懂你 |
| 模組化 | 透過 ClawHub 安裝 13,000+ 社區 Skills 擴充功能 |
| 模型自由 | 支援 Claude、GPT、DeepSeek、Gemini、開源模型 |

**簡單來說：** 你在 LINE 傳一句「幫我整理今天的 Email 重點」，OpenClaw 就會幫你做到。

---

## 第一章：WSL2 環境準備

> ⏱ 預估時間：5-10 分鐘 ｜ 難度：⭐
>
> 💡 提供自動化腳本：`scripts/01_wsl2_setup.ps1`

### 為什麼需要 WSL2？

OpenClaw 在 Linux 環境下運行最穩定。WSL2（Windows Subsystem for Linux 2）讓你在 Windows 上直接跑 Linux，不需要另外裝虛擬機。

### 系統需求

- Windows 10 版本 22H2 以上，或 Windows 11
- 至少 8 GB RAM（建議 16 GB）
- 至少 10 GB 可用硬碟空間

### 手動安裝步驟

**1. 以系統管理員身份開啟 PowerShell**

按 `Win + X`，選擇「Windows Terminal（系統管理員）」

**2. 安裝 WSL2**

```powershell
wsl --install
```

這會一併安裝 WSL2 和預設的 Ubuntu。如果你想指定 Ubuntu 24.04：

```powershell
wsl --install -d Ubuntu-24.04
```

**3. 重新開機**

安裝完成後需要重新開機。

**4. 設定 Ubuntu 使用者**

重開機後，Ubuntu 會自動開啟，要求你設定：
- 使用者名稱（建議用英文小寫）
- 密碼（輸入時不會顯示，這是正常的）

**5. 設定記憶體限制**

WSL2 預設會使用系統 50% 的 RAM。在 PowerShell 中建立設定檔：

```powershell
notepad $env:USERPROFILE\.wslconfig
```

寫入以下內容（依你的 RAM 大小調整）：

```ini
[wsl2]
memory=4GB
swap=2GB
processors=2
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
```

| 系統 RAM | 建議 WSL2 memory |
|---------|-----------------|
| 8 GB | 2GB |
| 16 GB | 4GB |
| 32 GB | 8GB |

**6. 驗證安裝**

```powershell
wsl --version
wsl --list --verbose
```

確認 VERSION 欄位顯示 `2`。

### 使用自動化腳本（推薦）

```powershell
# 以系統管理員身份執行
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\01_wsl2_setup.ps1
```

腳本會自動完成所有步驟，包含記憶體設定。

---

## 第二章：安裝 Node.js

> ⏱ 預估時間：3 分鐘 ｜ 難度：⭐
>
> 💡 已整合在 `scripts/02_openclaw_install.sh` 中

以下操作都在 **WSL2 Ubuntu 終端機** 中進行。從開始選單搜尋「Ubuntu」開啟。

### 安裝 nvm（Node Version Manager）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

安裝完成後，重新載入設定：

```bash
source ~/.bashrc
```

### 安裝 Node.js

```bash
# 安裝 Node 24（推薦）
nvm install 24
nvm use 24
nvm alias default 24

# 驗證
node -v   # 應顯示 v24.x.x
npm -v    # 應顯示 10.x.x
```

如果 Node 24 安裝失敗，可改用 Node 22 LTS：

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

---

## 第三章：安裝 OpenClaw

> ⏱ 預估時間：3-5 分鐘 ｜ 難度：⭐
>
> 💡 自動化腳本：`scripts/02_openclaw_install.sh`

### 安裝

```bash
# 先安裝必要系統套件
sudo apt-get update
sudo apt-get install -y curl git build-essential

# 安裝 OpenClaw
npm install -g openclaw
```

### 初始化設定

```bash
openclaw onboard
```

互動式精靈會引導你完成基本設定。如果你還沒有 API 金鑰，可以先按 `Ctrl+C` 跳過，之後再設定。

### 驗證

```bash
openclaw --version
```

### ⚠️ 安全性注意

OpenClaw 的 Canvas Host **預設綁定 0.0.0.0**，代表區域網路內的任何裝置都能連到你的介面。如果只在本機使用，建議修改：

```bash
# 編輯設定檔
nano ~/.openclaw/config.json
```

將 `host` 改為 `"127.0.0.1"`。

### 使用自動化腳本（推薦）

```bash
bash scripts/02_openclaw_install.sh
```

一鍵完成 Node.js + OpenClaw 安裝。

---

## 第四章：設定 API 金鑰

> ⏱ 預估時間：3-5 分鐘 ｜ 難度：⭐⭐
>
> 💡 自動化腳本：`scripts/05_api_keys_config.sh`

OpenClaw 需要連接 AI 模型才能運作。以下是四種選擇：

### 方案比較

| 方案 | 優點 | 缺點 | 適合 |
|------|------|------|------|
| **OpenRouter（推薦）** | 一組 Key 用多種模型、統一計費 | 多一層中間商 | 新手、想嘗試不同模型 |
| **Anthropic 直連** | 直接用 Claude，延遲最低 | 只能用 Claude 系列 | Claude 愛好者 |
| **DeepSeek** | 便宜、中文能力強 | 品質不如 Claude/GPT | 預算有限 |
| **OpenAI** | GPT-4o 很強 | 價格較高 | GPT 愛好者 |

### 方案 1：OpenRouter（推薦新手）

1. 前往 [openrouter.ai](https://openrouter.ai) 註冊
2. 點選右上角 **Keys** → **Create Key**
3. 複製 `sk-or-...` 開頭的金鑰

設定到 OpenClaw：

```bash
# 建立 / 編輯環境變數檔
nano ~/.openclaw/.env
```

加入：

```env
OPENROUTER_API_KEY=sk-or-你的金鑰
OPENCLAW_MODEL_PROVIDER=openrouter
OPENCLAW_MODEL=openrouter/anthropic/claude-sonnet-4-5
```

### 方案 2：Anthropic（Claude 直連）

1. 前往 [console.anthropic.com](https://console.anthropic.com) 註冊
2. 點選 **API Keys** → **Create Key**
3. 複製 `sk-ant-...` 開頭的金鑰

```env
ANTHROPIC_API_KEY=sk-ant-你的金鑰
OPENCLAW_MODEL_PROVIDER=anthropic
OPENCLAW_MODEL=claude-sonnet-4-5-20260514
```

### 方案 3：DeepSeek（省錢方案）

1. 前往 [platform.deepseek.com](https://platform.deepseek.com) 註冊
2. 建立 API Key

```env
DEEPSEEK_API_KEY=你的金鑰
OPENCLAW_MODEL_PROVIDER=openai-completions
OPENCLAW_MODEL=deepseek-chat
OPENCLAW_API_BASE_URL=https://api.deepseek.com/v1
```

### 方案 4：OpenAI（GPT）

1. 前往 [platform.openai.com](https://platform.openai.com) 註冊
2. 建立 Secret Key

```env
OPENAI_API_KEY=sk-你的金鑰
OPENCLAW_MODEL_PROVIDER=openai
OPENCLAW_MODEL=gpt-4o
```

### 費用參考

| 模型 | 每百萬 Token 輸入 | 每百萬 Token 輸出 | 月估算（輕度使用） |
|------|------------------|------------------|-----------------|
| Claude Sonnet 4.5 | $3 | $15 | NT$100-300 |
| GPT-4o | $2.5 | $10 | NT$80-250 |
| DeepSeek Chat | $0.14 | $0.28 | NT$10-50 |

### 使用自動化腳本（推薦）

```bash
bash scripts/05_api_keys_config.sh
```

互動式選單，自動驗證金鑰、設定模型。

---

## 第五章：LINE 整合

> ⏱ 預估時間：10-15 分鐘 ｜ 難度：⭐⭐⭐
>
> 💡 自動化腳本：`scripts/03_line_setup.sh`（設定寫入）、`scripts/06_ngrok_tunnel.sh`（HTTPS 隧道）

這是台灣用戶最需要的功能——讓你的 AI 助手出現在 LINE 上。

### 整體流程圖

```
你的手機 LINE → LINE 伺服器 → ngrok/CF Tunnel → WSL2 OpenClaw → AI 模型
      ↑                                                              |
      └──────────────────── AI 回覆 ──────────────────────────────────┘
```

### 步驟 1：建立 LINE Channel

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入你的 LINE 帳號
3. **建立 Provider**：點選 Create → 輸入名稱
4. **建立 Channel**：選擇 **Messaging API**
   - Channel name：你的 Bot 名稱（例如「我的 AI 助手」）
   - Channel description：簡短說明
   - Category / Subcategory：選擇最接近的類別
5. 同意條款 → 建立

### 步驟 2：取得憑證

在 Channel 頁面中：

- **Messaging API 分頁** → 拉到底部 → 點選 **Issue** 產生 Channel access token
- **Basic settings 分頁** → 找到 **Channel secret**

記下這兩組字串。

### 步驟 3：安裝 HTTPS 隧道

LINE Webhook 要求 HTTPS。你需要一個工具將本機服務暴露到公網。

**方式 A：ngrok（新手推薦）**

```bash
# 安裝 ngrok
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
    | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
sudo apt-get update && sudo apt-get install -y ngrok

# 設定 auth token（前往 https://dashboard.ngrok.com/signup 註冊取得）
ngrok config add-authtoken 你的token

# 啟動隧道（OpenClaw LINE 預設使用 port 3100）
ngrok http 3100
```

**方式 B：Cloudflare Tunnel（長期推薦）**

```bash
# 安裝
curl -sSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
sudo dpkg -i /tmp/cloudflared.deb

# 啟動 Quick Tunnel（不需帳號）
cloudflared tunnel --url http://localhost:3100
```

啟動後會顯示一個 `https://xxx.trycloudflare.com` 或 `https://xxx.ngrok-free.app` 的 URL。

### 步驟 4：設定 OpenClaw LINE 環境變數

```bash
nano ~/.openclaw/.env
```

加入：

```env
LINE_CHANNEL_ACCESS_TOKEN=你的token
LINE_CHANNEL_SECRET=你的secret
OPENCLAW_CHANNEL_LINE_ENABLED=true
```

### 步驟 5：設定 LINE Webhook

回到 LINE Developers Console → 你的 Channel → Messaging API 分頁：

1. **Webhook URL** 填入：`https://你的隧道URL/webhook/line`
2. 啟用 **Use webhook**（開關打開）
3. 點選 **Verify** 確認連線成功
4. **關閉** Auto-reply messages（避免自動回覆干擾）
5. **關閉** Greeting messages

### 步驟 6：測試

1. 啟動 OpenClaw：`openclaw`
2. 用手機 LINE 掃描 Channel 頁面上的 QR Code 加好友
3. 傳一則訊息：「你好，自我介紹一下」
4. 如果收到 AI 回覆——**恭喜你成功了！** 🎉

### ⚠️ 注意事項

- ngrok 免費版每次重啟 URL 會變，需要重新到 LINE Console 更新 Webhook URL
- 如果要長期使用，建議改用 Cloudflare Tunnel 或部署到雲端伺服器

---

## 第六章：Telegram 整合

> ⏱ 預估時間：5 分鐘 ｜ 難度：⭐⭐
>
> 💡 自動化腳本：`scripts/04_telegram_setup.sh`

Telegram 整合比 LINE 簡單很多，不需要 HTTPS 隧道。

### 步驟 1：建立 Telegram Bot

1. 開啟 Telegram，搜尋 **@BotFather**（認明藍勾勾）
2. 發送 `/newbot`
3. 輸入 Bot 顯示名稱（例如：我的 AI 助手）
4. 輸入 Bot username（必須以 `_bot` 結尾，例如：`my_ai_helper_bot`）
5. BotFather 會回覆 Bot Token，格式如：`1234567890:ABCDefGhIjKlMnOpQrStUvWxYz`

### 步驟 2：取得你的 User ID

為了安全性，建議設定只有你能使用 Bot。

1. 搜尋 **@userinfobot**
2. 發送任意訊息，它會回覆你的 User ID（純數字）

### 步驟 3：設定 OpenClaw

```bash
nano ~/.openclaw/.env
```

加入：

```env
TELEGRAM_BOT_TOKEN=你的bot_token
OPENCLAW_CHANNEL_TELEGRAM_ENABLED=true
TELEGRAM_ALLOWED_USER_IDS=你的user_id
```

### 步驟 4：測試

1. 啟動 OpenClaw：`openclaw`
2. 在 Telegram 搜尋你的 Bot，發送 `/start`
3. 傳一則訊息：「你好，自我介紹一下」
4. 收到 AI 回覆即成功！

### 進階自訂

用 @BotFather 可以進一步設定：

| 指令 | 功能 |
|------|------|
| `/setdescription` | 設定 Bot 說明 |
| `/setabouttext` | 設定關於資訊 |
| `/setuserpic` | 設定 Bot 頭像 |
| `/setcommands` | 設定快捷指令選單 |

---

## 第七章：安裝必備 Skills

> ⏱ 預估時間：5 分鐘 ｜ 難度：⭐⭐

OpenClaw 的真正威力在於 **Skills**——透過 ClawHub 可以安裝 13,000+ 社區開發的技能包。

### 安裝 Skill 的方法

```bash
# 從 ClawHub 安裝
openclaw skill install <skill名稱>

# 列出已安裝的 Skills
openclaw skill list

# 搜尋 Skills
openclaw skill search <關鍵字>
```

### 推薦必備 Skills

| Skill | 功能 | 推薦原因 |
|-------|------|---------|
| **GOG** | Google Workspace 整合（Gmail、Calendar、Drive、Sheets） | 最實用！直接操作 Google 全家桶 |
| **Summarize** | 長文摘要生成 | 丟文章 URL 就能得到結構化摘要 |
| **Obsidian** | Obsidian 筆記庫操作 | 自動整理筆記 |
| **Web-Search** | 網路搜尋 | 讓 Agent 能搜尋即時資訊 |
| **File-Manager** | 檔案管理 | 讀寫、整理本機檔案 |

### 安裝範例

```bash
# 安裝 Google Workspace 整合
openclaw skill install gog

# 安裝摘要功能
openclaw skill install summarize

# 安裝網路搜尋
openclaw skill install web-search
```

### 瀏覽更多 Skills

- ClawHub 官方：[clawhub.ai](https://clawhub.ai)
- GitHub 精選清單：[awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)

---

## 第八章：雲端部署（進階）

> ⏱ 預估時間：30-60 分鐘 ｜ 難度：⭐⭐⭐

如果你想讓 OpenClaw 24/7 全天候運行，需要部署到雲端伺服器。

### 方案比較

| 方案 | 月費 | 難度 | 特色 |
|------|------|------|------|
| **Oracle Cloud Free Tier** | **$0**（永久免費） | ⭐⭐⭐ | 4 ARM CPUs、24GB RAM、200GB 儲存 |
| **DigitalOcean 1-Click** | ~$6/月 | ⭐ | Marketplace 一鍵部署 |
| **ClawCloud** | 依用量 | ⭐ | 1 分鐘部署，最簡單 |
| **Hetzner VPS** | ~€4/月 | ⭐⭐ | 歐洲機房，性價比高 |

### 推薦：Oracle Cloud Free Tier（免費）

Oracle 提供永久免費的 ARM 虛擬機，規格足以運行 OpenClaw：

1. 前往 [cloud.oracle.com](https://cloud.oracle.com) 註冊（需要信用卡驗證，但不會收費）
2. 建立 Compute Instance：
   - Shape：VM.Standard.A1.Flex
   - OCPU：2（免費額度內）
   - RAM：12 GB
   - Image：Ubuntu 24.04
3. SSH 連線到 Instance
4. 依照第二、三、四章安裝 OpenClaw
5. 使用 systemd 設定自動啟動

### 推薦：ClawCloud（最簡單）

如果不想碰伺服器：

1. 前往 [clawcloud.sh](https://www.clawcloud.sh)
2. 選擇 Telegram / Discord / 飛書
3. 輸入你的 Bot Token 和 API Key
4. 一分鐘內完成部署

### 長期運行設定（systemd）

在 VPS 上設定自動啟動：

```bash
sudo nano /etc/systemd/system/openclaw.service
```

```ini
[Unit]
Description=OpenClaw AI Agent
After=network.target

[Service]
Type=simple
User=你的使用者名稱
WorkingDirectory=/home/你的使用者名稱
ExecStart=/home/你的使用者名稱/.nvm/versions/node/v24.0.0/bin/openclaw
Restart=always
RestartSec=10
EnvironmentFile=/home/你的使用者名稱/.openclaw/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable openclaw
sudo systemctl start openclaw
sudo systemctl status openclaw
```

---

## 第九章：疑難排解

### WSL2 相關

| 問題 | 解法 |
|------|------|
| `wsl --install` 失敗 | 確認以系統管理員身份執行。到 BIOS 啟用 VT-x / AMD-V 虛擬化 |
| WSL2 吃太多記憶體 | 設定 `.wslconfig`（見第一章），然後 `wsl --shutdown` 重啟 |
| Ubuntu 開啟很慢 | 關閉 Windows 防毒軟體的即時掃描，或將 WSL 路徑加入排除清單 |

### OpenClaw 相關

| 問題 | 解法 |
|------|------|
| `openclaw: command not found` | 確認 Node.js 正確安裝：`node -v`。重新安裝：`npm install -g openclaw` |
| API 呼叫失敗 | 檢查 `.env` 中的 API 金鑰是否正確。執行 `bash scripts/05_api_keys_config.sh` 重新設定 |
| 回覆很慢 | 可能是模型太大或 API 服務端延遲。嘗試切換到較小的模型（如 DeepSeek） |

### LINE 相關

| 問題 | 解法 |
|------|------|
| Webhook Verify 失敗 | 確認 ngrok 正在運行、URL 正確、OpenClaw 已啟動 |
| 收不到訊息 | 確認已關閉 Auto-reply messages |
| ngrok URL 變了 | 免費版每次重啟都會變。重新到 LINE Console 更新 Webhook URL |
| 「此官方帳號目前無法使用」 | 確認 Channel 狀態為 Published |

### Telegram 相關

| 問題 | 解法 |
|------|------|
| Bot 不回覆 | 確認 `TELEGRAM_ALLOWED_USER_IDS` 包含你的 User ID |
| Token 無效 | 重新到 @BotFather 取得 Token，或用 `/revoke` 重新產生 |

---

## 附錄

### A. 環境變數範本（.env.example）

```env
# ============================================
# OpenClaw 環境變數設定範本
# 檔案位置：~/.openclaw/.env
# ============================================

# --- AI 模型設定（選一組） ---

# 方案 1：OpenRouter（推薦）
OPENROUTER_API_KEY=sk-or-你的金鑰
OPENCLAW_MODEL_PROVIDER=openrouter
OPENCLAW_MODEL=openrouter/anthropic/claude-sonnet-4-5

# 方案 2：Anthropic 直連
# ANTHROPIC_API_KEY=sk-ant-你的金鑰
# OPENCLAW_MODEL_PROVIDER=anthropic
# OPENCLAW_MODEL=claude-sonnet-4-5-20260514

# 方案 3：DeepSeek
# DEEPSEEK_API_KEY=你的金鑰
# OPENCLAW_MODEL_PROVIDER=openai-completions
# OPENCLAW_MODEL=deepseek-chat
# OPENCLAW_API_BASE_URL=https://api.deepseek.com/v1

# --- LINE 整合 ---
# LINE_CHANNEL_ACCESS_TOKEN=你的token
# LINE_CHANNEL_SECRET=你的secret
# OPENCLAW_CHANNEL_LINE_ENABLED=true

# --- Telegram 整合 ---
# TELEGRAM_BOT_TOKEN=你的bot_token
# OPENCLAW_CHANNEL_TELEGRAM_ENABLED=true
# TELEGRAM_ALLOWED_USER_IDS=你的user_id
```

### B. 指令速查表

| 指令 | 功能 |
|------|------|
| `openclaw` | 啟動 OpenClaw |
| `openclaw onboard` | 執行初始化精靈 |
| `openclaw --version` | 查看版本 |
| `openclaw skill install <name>` | 安裝 Skill |
| `openclaw skill list` | 列出已安裝 Skills |
| `openclaw skill search <keyword>` | 搜尋 Skills |
| `ngrok http 3100` | 啟動 ngrok 隧道 |
| `wsl --shutdown` | 重啟 WSL2 |

### C. 社群資源

| 資源 | 連結 |
|------|------|
| OpenClaw GitHub | [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) |
| OpenClaw 官方文件 | [docs.openclaw.ai](https://docs.openclaw.ai) |
| ClawHub Skills 市場 | [clawhub.ai](https://clawhub.ai) |
| LINE Developers | [developers.line.biz](https://developers.line.biz) |
| Telegram BotFather | [@BotFather](https://t.me/BotFather) |

### D. 全流程驗證

安裝完成後，執行驗證腳本確認所有組件：

```bash
bash scripts/99_verify_all.sh
```

會輸出每個組件的 PASS / FAIL 狀態總表。

---

> 📺 搭配影片教學效果更佳！YouTube 搜尋「時時靜好 OpenClaw」
>
> 💬 有問題歡迎在影片下方留言
