# OpenClaw 台灣安裝教學手冊

> 最後更新：2026-03-18 ｜ 目標：30 分鐘從零到可用
>
> 本手冊專為 **Windows 台灣用戶** 撰寫，涵蓋 WSL2 環境、LINE / Telegram 整合、必備 Skills 安裝與雲端部署。
>
> ⚠️ **模型名稱與定價為版本敏感資訊**，請以教學發布當日的官方驗證值為準。

---

## 目錄

**基礎篇（先完成這裡）**

1. [什麼是 OpenClaw？](#什麼是-openclaw)
2. [第一章：WSL2 環境準備](#第一章wsl2-環境準備)
3. [第二章：安裝 Node.js](#第二章安裝-nodejs)
4. [第三章：安裝 OpenClaw](#第三章安裝-openclaw)
5. [第四章：設定 API 金鑰](#第四章設定-api-金鑰)
6. [第五章：首次啟動，確認成功](#第五章首次啟動確認成功)

**進階篇（本機跑成功後再來）**

7. [第六章：LINE 整合](#第六章line-整合)
8. [第七章：Telegram 整合](#第七章telegram-整合)
9. [第八章：安裝必備 Skills](#第八章安裝必備-skills)
10. [第九章：雲端部署](#第九章雲端部署)
11. [第十章：疑難排解](#第十章疑難排解)
12. [附錄](#附錄)

---

## 什麼是 OpenClaw？

OpenClaw 是一個**開源 AI Agent 框架**（GitHub 264K+ Stars），它不只是聊天機器人——它能**代替你執行真實任務**。

| 特點 | 說明 |
|------|------|
| 自主執行 | 不只對話，能操作工具、讀寫檔案、呼叫 API |
| 24/7 運行 | 部署到伺服器後可全天候待命 |
| 多通道 | 透過 LINE、Telegram、WhatsApp、Discord 等 20+ IM 軟體操作 |
| 記憶力 | 跨對話保留記憶，越用越懂你 |
| 模組化 | 透過 ClawHub 安裝社區 Skills 擴充功能 |
| 模型自由 | 支援 Claude、GPT、DeepSeek、Gemini、Grok、開源模型 |

**簡單來說：** 你在 LINE 傳一句「幫我整理今天的 Email 重點」，OpenClaw 就會幫你做到。

---

## 第一次安裝的原則

在開始之前，請記住三件事：

### 1. 先成功，再理解

你不用把所有原理都搞懂。先裝成功，比先研究細節更重要。

### 2. 一次只做一件事

第一次只做「本機安裝成功」。LINE、Telegram、Skills、雲端部署——這些都等本機跑起來再說。

### 3. 只看成功標準

每一章都會告訴你：做什麼、成功長什麼樣、卡住先查什麼。照著做就好，不要自己加步驟。

---

# 基礎篇

---

## 第一章：WSL2 環境準備

> **這一步在做什麼：** 讓你的 Windows 電腦可以跑 Linux 工具
>
> **成功後你會得到：** 一個可以打開的 Ubuntu 視窗
>
> ⏱ 預估時間：5-10 分鐘 ｜ 💡 自動化腳本：`scripts/01_wsl2_setup.ps1`

### 為什麼需要 WSL2？

OpenClaw 在 Linux 環境下運行最穩定。WSL2（Windows Subsystem for Linux 2）讓你在 Windows 裡面開一個 Linux 小工作區，不需要另外裝虛擬機。

### 系統需求

- Windows 10 版本 22H2 以上，或 Windows 11
- 至少 8 GB RAM（建議 16 GB）
- 至少 10 GB 可用硬碟空間

### 手動安裝步驟

**1. 以系統管理員身份開啟 PowerShell**

在 Windows 左下角按右鍵，找到「Windows Terminal（系統管理員）」或「PowerShell（系統管理員）」，點開它。如果系統問你要不要允許，按**是**。

**2. 安裝 WSL2**

```powershell
wsl --install
```

這會一併安裝 WSL2 和預設的 Ubuntu。如果你想指定 Ubuntu 24.04：

```powershell
wsl --install -d Ubuntu-24.04
```

**3. 重新開機**

安裝完成後需要重新開機。這一步不要跳過。

**4. 設定 Ubuntu 使用者**

重開機後，從開始選單搜尋「Ubuntu」打開。第一次啟動可能需要等 1～3 分鐘，這是正常的。

系統會要求你設定：

- **使用者名稱**：用英文小寫，不要空格、不要中文（例如 `alex`）
- **密碼**：輸入時畫面**不會顯示任何字元**——這不是壞掉，也不是沒打進去，是正常的安全設計。輸入完按 `Enter`，再輸入一次確認。

**5. 設定記憶體限制**

WSL2 預設會使用系統 50% 的 RAM。回到 PowerShell 建立設定檔：

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

### ✅ 成功標準

你看到類似這樣的結果：

```text
NAME      STATE           VERSION
Ubuntu    Running         2
```

最重要的是 **VERSION 要是 2**。

### 卡住時先檢查

| 狀況 | 解法 |
|------|------|
| `wsl --install` 不能用 | 確認你是用「系統管理員」打開 PowerShell。確認 Windows 版本不太舊 |
| Ubuntu 打不開 | 先重新開機一次再試。到 BIOS 確認 VT-x / AMD-V 虛擬化已啟用 |
| Ubuntu 開了但很慢 | 第一次啟動本來就比較久，先等 1～3 分鐘 |

### 使用自動化腳本（推薦）

```powershell
# 以系統管理員身份執行
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\01_wsl2_setup.ps1
```

腳本會自動完成所有步驟，包含記憶體設定。

---

## 第二章：安裝 Node.js

> **這一步在做什麼：** 安裝 OpenClaw 需要的執行環境
>
> **成功後你會得到：** 你的電腦可以執行 OpenClaw
>
> ⏱ 預估時間：3 分鐘 ｜ 💡 已整合在 `scripts/02_openclaw_install.sh` 中

從這一章開始，除非特別說明，所有操作都在 **Ubuntu 視窗**中進行。從開始選單搜尋「Ubuntu」打開。

### 安裝 nvm（Node Version Manager）

nvm 是幫你安裝 Node.js 的工具。你先不用記名字，只要照做。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

> ⚠️ 請確認版本為 **v0.40.4** 以上。v0.40.3 及更早版本有已知安全漏洞（CVE-2026-1665）。

安裝完成後，讓設定生效：

```bash
source ~/.bashrc
```

### 安裝 Node.js

```bash
# 安裝 Node 22 LTS（推薦，穩定性最佳）
nvm install 22
nvm use 22
nvm alias default 22
```

如果你想使用更新的版本，也可以改裝 Node 24：

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

### ✅ 成功標準

```bash
node -v   # 應顯示 v22.x.x 或 v24.x.x
npm -v    # 應顯示版本號
```

只要有正常顯示版本號就可以。

### 卡住時先檢查

| 狀況 | 解法 |
|------|------|
| `curl` 不能用 | 先執行 `sudo apt update && sudo apt install -y curl` |
| `nvm: command not found` | 重新執行 `source ~/.bashrc`。還不行就把 Ubuntu 關掉重開 |
| `node -v` 沒反應 | 關掉 Ubuntu 重開，再輸入 `nvm use 22 && node -v` |

---

## 第三章：安裝 OpenClaw

> **這一步在做什麼：** 把 OpenClaw 本體裝到你的電腦裡
>
> **成功後你會得到：** 你的電腦會認得 `openclaw` 這個指令
>
> ⏱ 預估時間：3-5 分鐘 ｜ 💡 自動化腳本：`scripts/02_openclaw_install.sh`

### 安裝

```bash
# 先安裝必要工具
sudo apt-get update
sudo apt-get install -y curl git build-essential

# 安裝 OpenClaw
npm install -g openclaw
```

這一步可能需要幾分鐘，耐心等它跑完。

### 初始化設定

```bash
openclaw onboard
```

它會引導你完成基本設定。如果你還沒有 API 金鑰，可以先按 `Ctrl+C` 跳過，下一章再設定。

### ✅ 成功標準

```bash
openclaw --version
```

只要不是出現「找不到指令」，就代表安裝成功。

### ⚠️ 安全性注意

OpenClaw 的 Canvas Host **預設綁定 0.0.0.0**，代表區域網路內的任何裝置都能連到你的介面。如果只在本機使用，建議修改：

```bash
# 編輯設定檔
nano ~/.openclaw/openclaw.json
```

將 gateway 的 bind 設為 `"loopback"`，限制只有本機能連線。

### 卡住時先檢查

| 狀況 | 解法 |
|------|------|
| `openclaw: command not found` | 確認 `node -v` 正常。重新安裝：`npm install -g openclaw` |
| npm 安裝出錯 | 先確認 `npm -v` 正常，不正常就回第二章 |
| 還是不行 | 把 Ubuntu 關掉重開再試一次 |

### 使用自動化腳本（推薦）

```bash
bash scripts/02_openclaw_install.sh
```

一鍵完成 Node.js + OpenClaw 安裝。

### ⛔ 這一章完成後先不要碰

如果你是第一次安裝，先不要急著做：

- LINE / Telegram 串接
- Skills 安裝
- 雲端部署
- 進階設定檔修改

原因不是它們不重要，而是它們會讓你搞不清楚：到底是「OpenClaw 沒裝好」，還是「外部服務沒串好」。

**先確認本機能跑起來，再往下走。**

---

## 第四章：設定 API 金鑰

> **這一步在做什麼：** 讓 OpenClaw 有能力連到 AI 模型
>
> **成功後你會得到：** OpenClaw 不再只是空殼，而是真的能回應你
>
> ⏱ 預估時間：3-5 分鐘 ｜ 💡 自動化腳本：`scripts/05_api_keys_config.sh`

### 先用最白話的方式理解

你可以把 OpenClaw 想成一台機器。但這台機器自己不會思考，它必須連到外部 AI 服務才有辦法工作。所以你要準備一把鑰匙——**API Key**。

### 方案比較

| 方案 | 優點 | 缺點 | 適合 |
|------|------|------|------|
| **OpenRouter（推薦）** | 一組 Key 用多種模型、統一計費 | 多一層中間商 | 新手、想嘗試不同模型 |
| **Anthropic 直連** | 直接用 Claude，延遲最低 | 只能用 Claude 系列 | Claude 愛好者 |
| **DeepSeek** | 最便宜、中文能力強 | 品質不如 Claude/GPT | 預算有限 |
| **OpenAI** | GPT 系列生態完善 | 價格較高 | GPT 愛好者 |
| **Google Gemini** | Gemini Flash 性價比極高 | 較新，生態較小 | 省錢又要品質 |

### 方案 1：OpenRouter（推薦新手）

1. 前往 [openrouter.ai](https://openrouter.ai) 註冊
2. 點選右上角 **Keys** → **Create Key**
3. 複製 `sk-or-...` 開頭的金鑰

設定到 OpenClaw：

```bash
# 建立資料夾（如果還沒有的話）
mkdir -p ~/.openclaw

# 建立 / 編輯環境變數檔
nano ~/.openclaw/.env
```

加入（只改 `=` 右邊的內容，左邊不要動）：

```env
OPENROUTER_API_KEY=sk-or-你的金鑰
```

> 💡 模型選擇可透過 `openclaw onboard` 設定，或編輯 `~/.openclaw/openclaw.json`。
> OpenRouter 上的模型 ID 格式範例：`anthropic/claude-sonnet-4.6`、`openai/gpt-4.1`。
> 請到 [openrouter.ai/models](https://openrouter.ai/models) 查看最新可用模型。

### 方案 2：Anthropic（Claude 直連）

1. 前往 [console.anthropic.com](https://console.anthropic.com) 註冊（可能已遷移至 platform.claude.com）
2. 點選 **API Keys** → **Create Key**
3. 複製 `sk-ant-...` 開頭的金鑰

```env
ANTHROPIC_API_KEY=sk-ant-你的金鑰
```

> 💡 推薦模型：`claude-sonnet-4-6`（最新）或 `claude-sonnet-4-5`。
> 請到 [Anthropic 官方文件](https://docs.anthropic.com/en/docs/about-claude/models) 確認最新模型 ID。

### 方案 3：DeepSeek（省錢方案）

1. 前往 [platform.deepseek.com](https://platform.deepseek.com) 註冊（新用戶送 500 萬免費 tokens）
2. 建立 API Key

```env
DEEPSEEK_API_KEY=你的金鑰
```

> 💡 模型 ID：`deepseek-chat`（背後為 DeepSeek V3.2）。

### 方案 4：OpenAI（GPT）

1. 前往 [platform.openai.com](https://platform.openai.com) 註冊
2. 建立 Secret Key

```env
OPENAI_API_KEY=sk-你的金鑰
```

> 💡 推薦模型：`gpt-4.1`（性價比最佳）或 `gpt-5`（最新旗艦）。GPT-4o 仍可用但已非最新。
> 預算有限可用 `gpt-4.1-mini`（$0.40/$1.60）。

### 方案 5：Google Gemini

1. 前往 [aistudio.google.com](https://aistudio.google.com) 取得 API Key

```env
GOOGLE_API_KEY=你的金鑰
```

> 💡 推薦模型：`gemini-2.5-flash`（$0.30/$2.50，性價比極高）。

### 費用參考（2026 年 3 月）

> ⚠️ 定價隨時可能調整，請以各平台官網為準。

| 模型 | 每百萬 Token 輸入 | 每百萬 Token 輸出 | 月估算（輕度使用） |
|------|------------------|------------------|-----------------|
| Claude Sonnet 4.6 | $3 | $15 | NT$100-300 |
| GPT-4.1 | $2 | $8 | NT$70-200 |
| GPT-5 | $1.25 | $10 | NT$60-200 |
| Gemini 2.5 Flash | $0.30 | $2.50 | NT$10-50 |
| DeepSeek V3.2 | $0.28 | $0.42 | NT$10-30 |
| GPT-4.1 Mini | $0.40 | $1.60 | NT$15-50 |

### nano 存檔方式

如果你是第一次用 `nano`：

1. 按 `Ctrl + O`（儲存）
2. 按 `Enter`（確認檔名）
3. 按 `Ctrl + X`（離開）

### ✅ 成功標準

完成以下三件事就可以進下一章：

- 你有申請好 API Key
- 你有建立 `~/.openclaw/.env` 並把金鑰寫進去
- 你有存檔離開

### 卡住時先檢查

| 狀況 | 解法 |
|------|------|
| 不確定 key 有沒有存好 | 執行 `cat ~/.openclaw/.env` 看內容（注意不要在錄影、截圖時外流） |
| key 少貼一段 / 多空格 | 重新用 `nano ~/.openclaw/.env` 打開確認 |
| 不確定要選哪個方案 | 新手先用 OpenRouter，一把 key 最方便 |

### 使用自動化腳本（推薦）

```bash
bash scripts/05_api_keys_config.sh
```

互動式選單，自動驗證金鑰、設定模型。

---

## 第五章：首次啟動，確認成功

> **這一步在做什麼：** 真正把 OpenClaw 啟動起來
>
> **成功後你會得到：** 你會知道自己前面不是白裝，而是真的完成了
>
> ⏱ 預估時間：2 分鐘

### 啟動

在 Ubuntu 輸入：

```bash
openclaw
```

第一次啟動時，可能會出現初始化訊息、載入設定、模型連線資訊等。你不用每一行都看懂。你只要看一件事：

**它是不是有正常往下跑，而不是立刻報錯退出。**

如果出現互動式設定，先選預設值、先不要自訂太多東西、能跳過的先跳過。

### ✅ 成功標準

| 狀態 | 意思 |
|------|------|
| 畫面顯示正在啟動、載入、等待互動，或已進入主介面 | **成功！** |
| 一執行就報錯、說找不到指令 | 回第三章確認安裝 |
| 說缺少 API key 或模型設定錯誤 | 回第四章確認 `.env` 設定 |

### 如果失敗，照這個順序檢查

```bash
# 1. OpenClaw 有沒有裝好
openclaw --version

# 2. Node.js 有沒有裝好
node -v && npm -v

# 3. .env 有沒有真的存好
cat ~/.openclaw/.env

# 4. API key 有沒有貼對（最常見的問題）
```

### 恭喜！基礎篇完成

到這裡，你已經完成了：

- ✓ 安裝 Linux 執行環境（WSL2）
- ✓ 安裝 Node.js
- ✓ 安裝 OpenClaw
- ✓ 設定 AI 金鑰
- ✓ 成功啟動 OpenClaw

對完全沒 coding 背景的人來說，這已經很不錯了。接下來的進階篇——LINE、Telegram、Skills、雲端部署——都會輕鬆很多。

---

# 進階篇

> 以下章節請在**基礎篇全部完成、本機確認能跑**之後再進行。

---

## 第六章：LINE 整合

> **這一步在做什麼：** 讓你的 AI 助手出現在 LINE 上
>
> **成功後你會得到：** 在手機 LINE 上傳訊息就能得到 AI 回覆
>
> ⏱ 預估時間：10-15 分鐘 ｜ 💡 自動化腳本：`scripts/03_line_setup.sh`、`scripts/06_ngrok_tunnel.sh`

這是台灣用戶最需要的功能。

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
echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
sudo apt-get update && sudo apt-get install -y ngrok

# 設定 auth token（前往 https://dashboard.ngrok.com/signup 註冊取得）
ngrok config add-authtoken 你的token

# 啟動隧道（OpenClaw Gateway 預設使用 port 18789）
ngrok http 18789
```

**方式 B：Cloudflare Tunnel（長期推薦）**

```bash
# 安裝
curl -sSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
sudo dpkg -i /tmp/cloudflared.deb

# 啟動 Quick Tunnel（不需帳號）
cloudflared tunnel --url http://localhost:18789
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
```

> 💡 LINE 整合也可能需要透過 `openclaw plugins install @openclaw/line` 安裝插件，
> 並在 `~/.openclaw/openclaw.json` 的 `channels.line` 區段中做額外設定。
> 請以 [OpenClaw LINE 文件](https://docs.openclaw.ai/channels/line) 為準。

### 步驟 5：設定 LINE Webhook

回到 LINE Developers Console → 你的 Channel → Messaging API 分頁：

1. **Webhook URL** 填入：`https://你的隧道URL/line/webhook`
2. 啟用 **Use webhook**（開關打開）
3. 點選 **Verify** 確認連線成功
4. **關閉** Auto-reply messages（避免自動回覆干擾）
5. **關閉** Greeting messages

> ⚠️ Webhook 路徑為 `/line/webhook`（不是 `/webhook/line`），請以官方文件確認。

### 步驟 6：測試

1. 啟動 OpenClaw：`openclaw`
2. 用手機 LINE 掃描 Channel 頁面上的 QR Code 加好友
3. 傳一則訊息：「你好，自我介紹一下」
4. 如果收到 AI 回覆——恭喜你成功了！

### ✅ 成功標準

在手機 LINE 傳訊息後，幾秒內收到 AI 回覆。

### 卡住時先檢查

| 狀況 | 解法 |
|------|------|
| Webhook Verify 失敗 | 確認 ngrok 正在運行、URL 正確、OpenClaw 已啟動 |
| 收不到訊息 | 確認已關閉 Auto-reply messages |
| ngrok URL 變了 | 免費版每次重啟都會變。重新到 LINE Console 更新 Webhook URL |
| 「此官方帳號目前無法使用」 | 確認 Channel 狀態為 Published |

### ⚠️ 注意事項

- ngrok 免費版每次重啟 URL 會變，需要重新到 LINE Console 更新 Webhook URL
- 如果要長期使用，建議改用 Cloudflare Tunnel 或部署到雲端伺服器

---

## 第七章：Telegram 整合

> **這一步在做什麼：** 讓你的 AI 助手出現在 Telegram 上
>
> **成功後你會得到：** 在 Telegram 上傳訊息就能得到 AI 回覆
>
> ⏱ 預估時間：5 分鐘 ｜ 💡 自動化腳本：`scripts/04_telegram_setup.sh`

Telegram 整合比 LINE 簡單很多，不需要 HTTPS 隧道。

### 步驟 1：建立 Telegram Bot

1. 開啟 Telegram，搜尋 **@BotFather**（認明藍勾勾）
2. 發送 `/newbot`
3. 輸入 Bot 顯示名稱（例如：我的 AI 助手）
4. 輸入 Bot username（必須以 `bot` 結尾，例如：`my_ai_helper_bot` 或 `MyAIBot`）
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
TELEGRAM_ALLOWED_USER_IDS=你的user_id
```

### 步驟 4：測試

1. 啟動 OpenClaw：`openclaw`
2. 在 Telegram 搜尋你的 Bot，發送 `/start`
3. 傳一則訊息：「你好，自我介紹一下」
4. 收到 AI 回覆即成功！

### ✅ 成功標準

在 Telegram 傳訊息後，幾秒內收到 AI 回覆。

### 卡住時先檢查

| 狀況 | 解法 |
|------|------|
| Bot 不回覆 | 確認 `TELEGRAM_ALLOWED_USER_IDS` 包含你的 User ID |
| Token 無效 | 重新到 @BotFather 取得 Token，或用 `/revoke` 重新產生 |

### 進階自訂

用 @BotFather 可以進一步設定：

| 指令 | 功能 |
|------|------|
| `/setdescription` | 設定 Bot 說明 |
| `/setabouttext` | 設定關於資訊 |
| `/setuserpic` | 設定 Bot 頭像 |
| `/setcommands` | 設定快捷指令選單 |

---

## 第八章：安裝必備 Skills

> **這一步在做什麼：** 替 OpenClaw 擴充能力
>
> **成功後你會得到：** OpenClaw 能做更多事，例如搜尋網路、操作 Google 服務
>
> ⏱ 預估時間：5 分鐘

OpenClaw 的真正威力在於 **Skills**——透過 ClawHub 可以安裝社區開發的技能包。

> ⚠️ **安全提醒：** 2026 年初發生 ClawHavoc 事件，曾有 341 個惡意 Skills 被發現。
> 建議只安裝經過驗證、下載量高的 Skills，並留意 ClawHub 上的安全標章。

### 安裝 Skill 的方法

```bash
# 從 ClawHub 安裝
clawhub install <skill名稱>

# 列出已安裝的 Skills
clawhub list

# 搜尋 Skills
clawhub search <關鍵字>
```

> 💡 Skill 管理使用 `clawhub` 指令（不是 `openclaw skill`）。
> 如果 `clawhub` 指令不存在，請執行 `npm install -g clawhub` 安裝。

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
clawhub install gog

# 安裝摘要功能
clawhub install summarize

# 安裝網路搜尋
clawhub install web-search
```

### 瀏覽更多 Skills

- ClawHub 官方：[clawhub.ai](https://clawhub.ai)
- GitHub 精選清單：[awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)

---

## 第九章：雲端部署

> **這一步在做什麼：** 讓 OpenClaw 24/7 全天候運行
>
> **成功後你會得到：** 關掉自己的電腦，AI 助手仍然在線
>
> ⏱ 預估時間：30-60 分鐘

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
ExecStart=/home/你的使用者名稱/.nvm/versions/node/v22.0.0/bin/openclaw
Restart=always
RestartSec=10
EnvironmentFile=/home/你的使用者名稱/.openclaw/.env

[Install]
WantedBy=multi-user.target
```

> 💡 `ExecStart` 的路徑請依實際 Node.js 版本調整。可用 `which openclaw` 查看正確路徑。

```bash
sudo systemctl enable openclaw
sudo systemctl start openclaw
sudo systemctl status openclaw
```

---

## 第十章：疑難排解

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
| 回覆很慢 | 可能是模型太大或 API 服務端延遲。嘗試切換到較小的模型（如 DeepSeek 或 Gemini Flash） |

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

### 通用除錯流程

如果你卡住了，不要亂改很多地方。請**照這個順序**逐一檢查：

1. WSL2 有沒有成功（`wsl --list --verbose`）
2. Node.js 有沒有成功（`node -v`）
3. OpenClaw 有沒有成功（`openclaw --version`）
4. `.env` 有沒有存對（`cat ~/.openclaw/.env`）
5. API Key 有沒有貼對

---

## 附錄

### A. 環境變數範本（.env.example）

```env
# ============================================
# OpenClaw 環境變數設定範本
# 檔案位置：~/.openclaw/.env
# ============================================

# --- AI 模型金鑰（選一組） ---

# 方案 1：OpenRouter（推薦）
OPENROUTER_API_KEY=sk-or-你的金鑰

# 方案 2：Anthropic 直連
# ANTHROPIC_API_KEY=sk-ant-你的金鑰

# 方案 3：DeepSeek
# DEEPSEEK_API_KEY=你的金鑰

# 方案 4：OpenAI
# OPENAI_API_KEY=sk-你的金鑰

# 方案 5：Google Gemini
# GOOGLE_API_KEY=你的金鑰

# --- LINE 整合 ---
# LINE_CHANNEL_ACCESS_TOKEN=你的token
# LINE_CHANNEL_SECRET=你的secret

# --- Telegram 整合 ---
# TELEGRAM_BOT_TOKEN=你的bot_token
# TELEGRAM_ALLOWED_USER_IDS=你的user_id
```

> 💡 模型選擇與進階設定請透過 `openclaw onboard` 或編輯 `~/.openclaw/openclaw.json`。
> 環境變數名稱可能隨版本更新，請以 [OpenClaw 官方文件](https://docs.openclaw.ai) 為準。

### B. 指令速查表

| 指令 | 功能 |
|------|------|
| `openclaw` | 啟動 OpenClaw |
| `openclaw onboard` | 執行初始化精靈 |
| `openclaw --version` | 查看版本 |
| `clawhub install <name>` | 安裝 Skill |
| `clawhub list` | 列出已安裝 Skills |
| `clawhub search <keyword>` | 搜尋 Skills |
| `ngrok http 18789` | 啟動 ngrok 隧道 |
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
