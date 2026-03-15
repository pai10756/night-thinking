# Claude API 基礎教程

> 翻譯自 Anthropic 官方 GitHub 開源課程 https://github.com/anthropics/courses
> 本教程專為無技術背景的讀者撰寫，所有專業術語均附上白話說明。

---

## 第一章：開始使用 Claude SDK

> **SDK**（Software Development Kit，軟體開發工具包）：就像一個工具箱，裡面裝了你跟 Claude 溝通所需的所有工具。你不需要自己從零開始寫程式，SDK 幫你把複雜的事情簡化了。

### 本章學習目標
- 安裝必要的套件並完成身份驗證
- 向 Claude AI 助理發出你的第一個請求

### 安裝 SDK

在開始之前，請確保你的電腦已安裝 Python。

> **Python**：一種廣受歡迎的程式語言，就像你跟電腦溝通的「語言」。Claude 的 SDK 就是用 Python 寫的。

Claude Python SDK 需要 Python 3.7.1 或更新的版本。你可以在終端機（Terminal）中執行以下指令來檢查你的 Python 版本：

```
python --version
```

如果你還沒安裝 Python，或版本太舊，請到 [Python 官方網站](https://www.python.org) 下載安裝。

安裝好 Python 後，用以下指令安裝 Anthropic 套件：

```python
# 在 Jupyter Notebook 中安裝
%pip install anthropic

# 或在命令列中安裝
# pip install anthropic
```

> **pip**：Python 的「應用程式商店」，專門用來安裝各種工具包。

### 取得 API 金鑰

> **API 金鑰**（API Key）：就像一把專屬的「通行證」，讓你的程式能夠合法地跟 Claude 對話。沒有這把鑰匙，Claude 不會理你。

取得 API 金鑰的步驟：

1. 前往 https://console.anthropic.com 註冊帳號
2. 登入後，點擊右上角的個人圖示，選擇「API Keys」
3. 點擊「Create Key」按鈕，為你的金鑰取一個名稱
4. 點擊「Create」，你的新 API 金鑰就會顯示在畫面上

> 請務必複製並妥善保存這組金鑰，離開頁面後就無法再次查看了！

請像對待密碼一樣保護你的 API 金鑰，千萬不要公開分享或上傳到 Git 等版本控制系統。

### 安全儲存 API 金鑰

雖然你可以直接把金鑰寫在程式碼裡，但最好的做法是把敏感資訊跟程式碼分開存放。常見的方法是把 API 金鑰放在 `.env` 檔案中：

1. 在你的專案目錄中建立一個名為 `.env` 的檔案
2. 在檔案中加入以下內容：

```
ANTHROPIC_API_KEY=在這裡貼上你的API金鑰
```

3. 安裝 `python-dotenv` 套件：

```python
%pip install python-dotenv
```

4. 在程式碼中載入金鑰：

```python
from dotenv import load_dotenv  # 載入 .env 檔案的工具
import os  # 作業系統相關工具

load_dotenv()  # 讀取 .env 檔案
my_api_key = os.getenv("ANTHROPIC_API_KEY")  # 取出 API 金鑰
```

> 想像 `.env` 檔案就像一個保險箱，把你的密碼鎖在裡面，程式需要時再去拿，而不是把密碼直接貼在牆上。

### 發出第一個請求

安裝好套件、載入金鑰後，就可以開始跟 Claude 對話了！

第一步是建立一個「客戶端」物件：

```python
from anthropic import Anthropic  # 匯入 Anthropic 工具

client = Anthropic(
    api_key=my_api_key  # 把你的 API 金鑰傳進去
)
```

> **客戶端（Client）**：就像一個「代理人」，幫你把訊息送到 Claude 那邊，再把 Claude 的回覆帶回來給你。

小提示：`anthropic` SDK 會自動尋找名為 `ANTHROPIC_API_KEY` 的環境變數，所以你也可以簡化成：

```python
from anthropic import Anthropic
client = Anthropic()  # 自動找到金鑰，不用手動傳入
```

現在來發出第一個請求吧！我們使用 `messages.create()` 方法來向 Claude 發送訊息：

```python
our_first_message = client.messages.create(
    model="claude-3-haiku-20240307",  # 指定使用的模型
    max_tokens=1000,  # 最多回覆 1000 個 token（文字片段）
    messages=[
        {"role": "user", "content": "嗨！請幫我寫一首關於寵物雞的俳句"}
    ]
)

print(our_first_message.content[0].text)  # 印出 Claude 的回覆
```

> 恭喜！你剛剛成功跟 Claude 說了第一句話！就像打了第一通電話一樣簡單。

---

## 第二章：訊息格式

### 本章學習目標
- 理解 Messages API 的格式
- 了解模型回應物件的結構
- 建立一個簡單的多輪對話機器人

### 基本設定

```python
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()  # 載入環境變數
client = Anthropic()  # 建立客戶端（自動找 API 金鑰）
```

### 訊息格式說明

我們用 `client.messages.create()` 來發送訊息並取得回覆。其中最關鍵的部分是 `messages` 參數：

```python
messages=[
    {"role": "user", "content": "Dr. Pepper 用了哪些口味？"}
]
```

> **messages（訊息列表）**：就像一本對話紀錄簿，記錄了你和 Claude 之間的所有對話。

`messages` 參數接受一個「訊息字典列表」，每個字典代表對話中的一則訊息。每則訊息必須包含兩個關鍵資訊：

- **`role`（角色）**：誰在說話？只有兩種選擇——`"user"`（使用者，就是你）或 `"assistant"`（助理，就是 Claude）
- **`content`（內容）**：說了什麼話

單一訊息的範例：

```python
messages = [
    {"role": "user", "content": "嗨 Claude！你好嗎？"}
]
```

多輪對話的範例：

```python
messages = [
    {"role": "user", "content": "嗨 Claude！你好嗎？"},
    {"role": "assistant", "content": "你好！我很好，謝謝。有什麼可以幫你的嗎？"},
    {"role": "user", "content": "你能告訴我一個關於雪貂的有趣事實嗎？"},
    {"role": "assistant", "content": "當然！你知道興奮的雪貂會發出一種叫做「dooking」的咯咯聲嗎？"},
]
```

> 重要規則：訊息必須在 `user` 和 `assistant` 之間交替出現，就像真實對話一樣，你一句我一句。

訊息格式的好處是能保留**對話上下文**——Claude 可以看到整段對話歷史，所以它的回覆會更連貫、更相關。

> 想像你跟朋友聊天，如果朋友記得你之前說過什麼，對話會順暢很多。Claude 也是一樣，有了對話歷史，它就能「記住」你之前說了什麼。

**注意：很多情況下你不需要對話歷史，只傳一則訊息完全沒問題！**

### 檢視回覆內容

讓我們看看 Claude 回覆的內容長什麼樣子：

```python
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "把 hello 翻譯成法文，只回覆一個字"}
    ]
)
```

我們會得到一個 `Message` 物件，包含以下重要資訊：

```
Message(
    id='msg_01...',           # 唯一識別碼
    content=[ContentBlock(text='Bonjour.', type='text')],  # 實際回覆內容
    model='claude-3-haiku-20240307',  # 使用的模型
    role='assistant',         # 角色（永遠是 assistant）
    stop_reason='end_turn',   # 停止原因
    usage=Usage(input_tokens=19, output_tokens=8)  # 使用的 token 數量
)
```

> **Token（語言片段）**：Claude 不是一個字一個字讀的，而是把文字切成小片段來處理，這些片段就叫 token。大約每 3.5 個英文字母算一個 token。token 的數量會影響費用和速度。

最重要的是取出 Claude 的回覆文字：

```python
print(response.content[0].text)  # 印出：Bonjour.
```

> 記住這個公式：`response.content[0].text` 就是 Claude 回覆的文字內容。這是你最常用到的。

其他回覆資訊包括：
- **`id`**：唯一識別碼，像身分證號碼
- **`type`**：物件類型，永遠是 "message"
- **`role`**：永遠是 "assistant"
- **`model`**：處理這次請求的模型名稱
- **`stop_reason`**：模型停止生成的原因
- **`usage`**：使用了多少 token（影響計費）
  - `input_tokens`：輸入（你的問題）用了多少 token
  - `output_tokens`：輸出（Claude 的回覆）用了多少 token

### 常見的訊息列表錯誤

#### 錯誤 1：以 assistant 訊息開頭

訊息列表必須以 `user` 訊息開頭。如果以 `assistant` 開頭，會報錯：

```python
# 這會出錯！
messages=[
    {"role": "assistant", "content": "你好！"}
]
```

#### 錯誤 2：訊息沒有正確交替

`user` 和 `assistant` 必須交替出現，不能連續兩個相同角色：

```python
# 這也會出錯！連續兩個 assistant
messages=[
    {"role": "user", "content": "嗨！"},
    {"role": "assistant", "content": "你好！"},
    {"role": "assistant", "content": "有什麼可以幫你的？"}  # 不行！
]
```

### 訊息列表的進階用法

#### 幫 Claude「開口說話」（Putting words in Claude's mouth）

你可以提供一個 `assistant` 訊息，讓 Claude 從你指定的內容接著說下去。

> 就像演戲時，你先給演員一句台詞，讓他從那句話接著演下去。

例如，你想讓 Claude 寫一首以「寧靜山風」開頭的俳句：

```python
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=500,
    messages=[
        {"role": "user", "content": "請寫一首美麗的俳句"},
        {"role": "assistant", "content": "寧靜山風吹"}  # 幫 Claude 開了第一句
    ]
)
# Claude 會接著寫完剩下的部分
```

#### 少量範例提示（Few-shot Prompting）

> **Few-shot Prompting（少量範例提示）**：透過給 Claude 幾個「示範」，讓它學會你想要的回答方式。就像教小朋友寫字，你先寫幾個字給他看，他就知道該怎麼寫了。

這在需要 Claude 以特定格式回覆時特別有用。例如，你想讓 Claude 分析推文的情緒，但只回覆「POSITIVE（正面）」或「NEGATIVE（負面）」：

```python
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=500,
    messages=[
        # 範例 1：負面推文 → NEGATIVE
        {"role": "user", "content": "不受歡迎的觀點：醃黃瓜超噁心"},
        {"role": "assistant", "content": "NEGATIVE"},
        # 範例 2：正面推文 → POSITIVE
        {"role": "user", "content": "我對醃黃瓜的愛可能有點失控了，我剛買了一個醃黃瓜造型的泳池浮板"},
        {"role": "assistant", "content": "POSITIVE"},
        # 範例 3：負面推文 → NEGATIVE
        {"role": "user", "content": "說真的，誰會想吃醃黃瓜？那東西好噁！"},
        {"role": "assistant", "content": "NEGATIVE"},
        # 實際要分析的推文
        {"role": "user", "content": "剛試了 @PickleCo 的新辣醃黃瓜，我的味蕾在跳舞！"},
    ]
)
print(response.content[0].text)  # 輸出：POSITIVE
```

> 透過前面三個範例，Claude 學會了：「噢，原來我只需要回覆 POSITIVE 或 NEGATIVE 就好。」

### 練習：建立一個聊天機器人

利用訊息格式，你可以建立一個簡單的多輪聊天機器人：

```python
conversation_history = []  # 用一個列表來存對話歷史

while True:
    user_input = input("你：")  # 讓使用者輸入訊息

    if user_input.lower() == "quit":  # 輸入 quit 結束對話
        print("對話結束。")
        break

    conversation_history.append({"role": "user", "content": user_input})

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        messages=conversation_history,  # 把整段對話歷史送出去
        max_tokens=500
    )

    assistant_response = response.content[0].text
    print(f"Claude：{assistant_response}")
    conversation_history.append({"role": "assistant", "content": assistant_response})
```

> 這就像 Claude 有了「記憶」——每次你說話，它都能回顧之前的對話，給出更有脈絡的回答。

---

## 第三章：模型

### 本章學習目標
- 了解各種 Claude 模型
- 比較 Claude 模型的速度與能力

### Claude 模型介紹

> **模型（Model）**：你可以把不同的 Claude 模型想像成不同等級的員工。有的速度快但簡單任務比較擅長（像是實習生），有的能力強但速度慢、費用高（像是資深顧問）。

Claude 有多個模型，選擇哪個要考慮三個因素：

| 考量因素 | 說明 | 比喻 |
|---------|------|------|
| **延遲（Latency）** | 回覆速度有多快？ | 像餐廳上菜速度 |
| **能力（Capabilities）** | 有多聰明？ | 像廚師的手藝等級 |
| **費用（Cost）** | 有多貴？ | 像餐廳的價位 |

### 比較模型速度

以下是各模型回答同一問題的速度比較（以「用一段話解釋光合作用」為例）：

| 模型 | 生成的 Token 數 | 執行時間（秒） | 每個 Token 的時間（秒） |
|------|----------------|--------------|---------------------|
| Claude 3.5 Sonnet | 146 | 2.56 | 0.02 |
| Claude 3 Opus | 146 | 7.32 | 0.05 |
| Claude 3 Sonnet | 108 | 2.64 | 0.02 |
| Claude 3 Haiku | 126 | 1.09 | 0.01 |

> **Haiku** 最快、最便宜，**Opus** 最強大但最慢最貴，**Sonnet** 則是中間路線。就像搭計程車、搭公車、搭高鐵的差別。

### 比較模型能力

用一道數學題測試各模型（正確答案是 18），每個模型做 7 次：

| 模型 | 答對次數 |
|------|---------|
| Claude 3.5 Sonnet | 7/7 |
| Claude 3 Opus | 7/7 |
| Claude 3 Sonnet | 3/7 |
| Claude 3 Haiku | 2/7 |

> 可以看出，對於需要精確計算的複雜任務，較強的模型表現明顯更好。

### 如何選擇模型？

Claude 3.5 Sonnet 適合以下場景：
- **程式撰寫**：自主撰寫、編輯和執行程式碼
- **客戶支援**：理解使用者意圖，處理多步驟工作流程
- **資料分析**：處理非結構化資料，產生洞察與視覺化
- **圖像處理**：解讀圖表、圖形和圖片
- **寫作**：理解語境和幽默，產生高品質內容

#### 建議的選擇策略：從 Haiku 開始

> 就像買車先試駕基本款——如果基本款就夠用，何必花大錢買頂配？如果不夠用，再升級也不遲。

1. **先用 Haiku 試試**：它速度快、便宜，很多情況下表現就夠好了
2. **建立評估標準**：針對你的使用場景設計測試
3. **按需升級**：如果 Haiku 不夠用，再換成 Sonnet 或 Opus

---

## 第四章：模型參數

### 本章學習目標
- 理解 `max_tokens` 參數的作用
- 使用 `temperature` 參數控制回覆的隨機性
- 了解 `stop_sequence`（停止序列）的用途

### 三個必填參數

每次向 Claude 發送請求，都必須包含三個參數：

| 參數 | 說明 |
|------|------|
| `model` | 使用哪個模型 |
| `max_tokens` | 最多生成多少個 token |
| `messages` | 對話訊息列表 |

### Max Tokens（最大 Token 數）

> **Token（語言片段）**：大型語言模型不是以「完整的字」來思考的，而是把文字拆成更小的片段，叫做 token。對 Claude 來說，一個 token 大約等於 3.5 個英文字母。
>
> 想像你在寫作文，老師說「最多寫 500 字」——`max_tokens` 就是這個「字數上限」，只不過這裡的單位是 token 而不是字。

如果 `max_tokens` 設太小，Claude 的回覆會被截斷：

```python
# max_tokens 設為 10，回覆會被硬生生切斷
truncated_response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=10,  # 只允許 10 個 token
    messages=[
        {"role": "user", "content": "幫我寫一首詩"}
    ]
)
# 可能只得到：「這是一首為你寫的詩：\n\n那」——就被切斷了！
```

你可以檢查 `stop_reason` 來了解 Claude 為什麼停止：

```python
truncated_response.stop_reason
# 'max_tokens' — 表示因為達到 token 上限而停止
```

如果把 `max_tokens` 設大一點（例如 500），Claude 就有足夠空間完成回覆：

```python
longer_poem_response.stop_reason
# 'end_turn' — 表示 Claude 自然地說完了，不是被強制截斷
```

> 重要：把 `max_tokens` 設很大，不代表 Claude 一定會生成那麼多內容。如果你問「講個笑話」然後設 `max_tokens=1000`，Claude 可能只用 55 個 token 就講完了。`max_tokens` 是「天花板」，不是「目標」。

#### 為什麼要調整 max_tokens？

- **控制 API 費用**：生成越多 token，花費越多
- **控制速度**：生成越多 token，所需時間越長
- **確保回覆品質**：設太低可能導致回覆不完整

> 就像訂外送，你告訴廚師「最多做 10 道菜」。如果菜色簡單，可能 3 道就夠了；如果是滿漢全席，10 道可能不夠。

### Stop Sequences（停止序列）

> **Stop Sequences（停止序列）**：你可以告訴 Claude「如果你生成了這個特定的文字，就立刻停下來」。就像對司機說「看到紅色招牌就停車」。

例如，你請 Claude 生成一個 JSON 物件，但不想讓它在 JSON 後面多寫解釋：

```python
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=500,
    messages=[{"role": "user", "content": "生成一個代表人的 JSON 物件，包含姓名、email 和電話號碼"}],
    stop_sequences=["}"]  # 遇到 } 就停止
)
```

> 注意：停止序列本身不會包含在回覆中。如果你設 `}` 為停止序列，回覆中不會有 `}`，你需要自己加回去。

你也可以提供多個停止序列：

```python
stop_sequences=["b", "c"]  # 遇到 b 或 c 就停止
```

### Temperature（溫度）

> **Temperature（溫度）**：控制 Claude 回覆的「創意程度」或「隨機性」。
>
> 想像一下：溫度低（接近 0）就像一個嚴謹的會計師，每次都給你一模一樣的答案；溫度高（接近 1）就像一個天馬行空的藝術家，每次都給你不同的創意回答。

- 溫度範圍：0 到 1
- 預設值：1

```python
# 溫度 = 0：每次回答幾乎一樣
# 問 Claude「幫外星球取名」三次 → Xendor, Xendor, Xendor

# 溫度 = 1：每次回答都不同
# 問 Claude「幫外星球取名」三次 → Xyron, Xandar, Zyrcon
```

#### 什麼時候用什麼溫度？

| 溫度 | 適合的任務 | 比喻 |
|------|----------|------|
| 接近 0 | 分析性任務、資料處理、事實性問答 | 數學考試要精確答案 |
| 接近 1 | 創意寫作、腦力激盪、故事創作 | 畫畫要有想像力 |

### System Prompt（系統提示）

> **System Prompt（系統提示）**：在對話開始前，給 Claude 的「角色設定」或「背景資訊」。就像導演在開拍前告訴演員：「你現在要演一個法語老師。」

```python
message = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1000,
    system="你是一位友善的外語家教，總是用法語回覆。",  # 系統提示
    messages=[
        {"role": "user", "content": "嘿，你好嗎？"}
    ]
)
# Claude 會用法語回覆：Bonjour ! Je suis ravi de vous rencontrer...
```

系統提示的注意事項：
- 它是可選的，但對設定對話基調很有幫助
- 它會影響整個對話中 Claude 的所有回覆
- 主要放**角色、語氣、背景**資訊
- 詳細指令、範例等應放在第一個 `user` 訊息中

---

## 第五章：串流（Streaming）

### 本章學習目標
- 理解串流的運作方式
- 處理串流事件

### 為什麼需要串流？

> **串流（Streaming）**：正常情況下，你要等 Claude 把整個回覆都想好了才會一次收到。串流則是讓 Claude「邊想邊說」，你可以一個字一個字地看到回覆出現。
>
> 想像你在看即時字幕——文字一個一個蹦出來，而不是整段話一次出現。這就是串流的效果，也是 claude.ai 網站上的體驗。

沒有串流時：等很久 → 一次看到全部內容
有串流時：幾乎立刻看到第一個字 → 內容逐漸出現

### 如何使用串流

只需要加上 `stream=True`：

```python
stream = client.messages.create(
    messages=[
        {"role": "user", "content": "寫一個三個字的句子，不要前言，只給我三個字"}
    ],
    model="claude-3-haiku-20240307",
    max_tokens=100,
    temperature=0,
    stream=True,  # 開啟串流模式
)
```

### 處理串流事件

開啟串流後，你會收到一連串的「事件」，就像收快遞一樣，一個包裹一個包裹地到：

| 事件類型 | 說明 | 比喻 |
|---------|------|------|
| **MessageStartEvent** | 訊息開始 | 快遞員按門鈴 |
| **ContentBlockStartEvent** | 內容區塊開始 | 開始拆包裹 |
| **ContentBlockDeltaEvent** | 新的文字片段到達 | 一件一件拿出包裹裡的東西 |
| **ContentBlockStopEvent** | 內容區塊結束 | 這個包裹拆完了 |
| **MessageDeltaEvent** | 訊息層級的變更資訊 | 快遞單據 |
| **MessageStopEvent** | 整個訊息結束 | 所有包裹都到齊了 |

我們最關心的是 **ContentBlockDeltaEvent**，因為它包含了 Claude 實際生成的文字：

```python
for event in stream:
    if event.type == "content_block_delta":
        # event.delta.text 就是新生成的文字片段
        print(event.delta.text, end="", flush=True)
        # end="" 表示不換行，flush=True 表示立即顯示
```

### 首個 Token 的時間（TTFT）

> **TTFT（Time To First Token，首個 Token 時間）**：從發出請求到收到第一個字的等待時間。

串流的最大好處就是大幅縮短 TTFT：

| 方式 | 首個 Token 時間 | 完整回覆時間 |
|------|---------------|-------------|
| 不使用串流 | 4.19 秒 | 4.19 秒 |
| 使用串流 | 0.49 秒 | 4.27 秒 |

> 注意：串流不會讓整體生成速度變快，而是讓你更早看到第一個字。就像看電影，串流讓你「邊下載邊看」，而不是「下載完才能看」，但整部電影的總下載時間是一樣的。

用更強大的 Opus 模型生成更長的內容時，差異更加明顯：

| 方式 | 首個 Token 時間 |
|------|---------------|
| 不使用串流 | 47 秒 |
| 使用串流 | 1.8 秒 |

### 串流輔助工具

Python SDK 提供了更方便的串流工具。使用 `client.messages.stream()` 代替 `client.messages.create(stream=True)`：

```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def streaming_with_helpers():
    async with client.messages.stream(
        max_tokens=1024,
        messages=[{"role": "user", "content": "寫一首關於蘭花的十四行詩"}],
        model="claude-3-opus-20240229",
    ) as stream:
        # text_stream 讓你輕鬆取得文字內容
        async for text in stream.text_stream:
            print(text, end="", flush=True)

    # get_final_message() 取得完整的最終訊息
    final_message = await stream.get_final_message()
```

> `text_stream` 就像一個「文字專用通道」，自動幫你過濾掉那些你不關心的事件，只給你文字內容。

其他有用的事件處理器：
- **`on_text`**：每當有新文字片段到達時觸發
- **`on_stream_event`**：每當收到任何串流事件時觸發
- **`on_message`**：完整訊息累積完成時觸發
- **`on_exception`**：發生錯誤時觸發
- **`on_end`**：串流結束時觸發

---

## 第六章：圖像提示（Vision）

### 本章學習目標
- 了解 Claude 的圖像辨識能力
- 學會如何在提示中加入圖片

### Claude 的視覺能力

Claude 3 系列模型具備圖像理解能力，可以分析和理解圖片。Opus、Sonnet 和 Haiku 都能處理圖像，其中 Claude 3.5 Sonnet 的視覺能力最強。

> 就像 Claude 不只能「聽」（讀文字），還能「看」（看圖片）了！

### 內容區塊格式

之前我們的 `content`（內容）都是一個簡單的字串：

```python
messages = [
    {"role": "user", "content": "講個笑話"}
]
```

但 `content` 也可以是一個**列表**，包含多個「內容區塊」：

```python
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "講個笑話"},  # 文字區塊
        ]
    }
]
```

> 這兩種寫法效果完全一樣。但當你想同時傳文字和圖片時，就必須使用列表格式。

### 如何傳送圖片給 Claude

傳送圖片需要建立一個「圖像內容區塊」：

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",     # 編碼格式
                    "media_type": "image/jpeg",  # 圖片類型（jpeg/png/gif/webp）
                    "data": "實際的圖片資料（base64 編碼後的字串）"
                }
            }
        ]
    }
]
```

> **Base64 編碼**：把圖片的二進位資料（電腦看的 0 和 1）轉換成一長串文字。就像把一幅畫「翻譯」成一封信的內容，這樣就能透過文字通道傳送圖片了。

### 處理圖片的步驟

```python
import base64

# 1. 以二進位模式開啟圖片檔案
with open("./my_image.png", "rb") as image_file:
    # 2. 讀取圖片的二進位內容
    binary_data = image_file.read()
    # 3. 用 Base64 編碼
    base_64_encoded_data = base64.b64encode(binary_data)
    # 4. 轉成字串
    base64_string = base_64_encoded_data.decode('utf-8')
```

### 只傳圖片（不附文字）

你可以只傳一張圖片，不附任何文字指令。這時 Claude 會自動描述圖片內容。

### 圖片加文字

更常見的用法是同時傳圖片和文字：

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": base64_string
                },
            },
            {
                "type": "text",
                "text": "這個人可以做什麼來預防這種情況？"
            }
        ]
    }
]
```

> 就像你拿一張照片給朋友看，然後問他一個問題。Claude 會根據圖片和你的問題來回答。

### 多張圖片

你可以在一則訊息中傳多張圖片：

```python
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "圖片 1："},
            create_image_message('./animal1.png'),  # 第一張圖
            {"type": "text", "text": "圖片 2："},
            create_image_message('./animal2.png'),  # 第二張圖
            {"type": "text", "text": "圖片 3："},
            create_image_message('./animal3.png'),  # 第三張圖
            {"type": "text", "text": "這些是什麼動物？"}
        ]
    }
]
```

> 小技巧：為每張圖片加上文字標籤（如「圖片 1：」、「圖片 2：」），可以幫助 Claude 更好地區分和識別每張圖片，尤其是使用較小的模型時。

### 圖片輔助函式

處理多張圖片時，寫一個輔助函式會很方便：

```python
import base64
import mimetypes

def create_image_message(image_path):
    """把圖片檔案轉換成 Claude 能接受的格式"""
    with open(image_path, "rb") as image_file:
        binary_data = image_file.read()

    base64_string = base64.b64encode(binary_data).decode('utf-8')
    mime_type, _ = mimetypes.guess_type(image_path)  # 自動判斷圖片類型

    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": mime_type,
            "data": base64_string
        }
    }
```

### 使用網路圖片

如果圖片不在本機，可以用 `httpx` 從網路下載：

```python
import base64
import httpx

image_url = "https://example.com/photo.jpg"
# 下載圖片並轉成 base64
image_data = base64.b64encode(httpx.get(image_url).content).decode("utf-8")
```

### 圖像提示技巧

#### 技巧 1：具體明確

跟文字提示一樣，越具體越好。例如，要計算圖片中的人數：

不好的提示：
> 「這張圖片裡有幾個人？」

好的提示：
> 「你有完美的視力並非常注重細節，這讓你成為計算圖片中物件的專家。這張圖片裡有幾個人？有些人可能被遮擋或被圖片邊緣切掉，可能只有一隻手臂可見。即使只看到一個身體部位，也請算進去。在回答前，請先在 `<thinking>` 標籤中逐步思考並分析圖片的每個部分。」

#### 技巧 2：使用範例

就像文字提示的 few-shot 技巧，你也可以給 Claude 看一個「輸入圖片 + 期望輸出」的範例，然後再給它新的圖片：

```python
messages = [
    # 範例：給 Claude 看第一張投影片，然後提供期望的 JSON 輸出
    {"role": "user", "content": [
        create_image_message("slide1.png"),
        {"type": "text", "text": "生成這張投影片的 JSON 描述"}
    ]},
    {"role": "assistant", "content": '{"background": "#F2E0BD", "title": "Haiku", ...}'},
    # 實際任務：給新的投影片
    {"role": "user", "content": [
        create_image_message("slide2.png"),
        {"type": "text", "text": "生成這張投影片的 JSON 描述"}
    ]},
]
```

> Claude 看到範例後就知道你想要什麼格式的輸出，然後對新的圖片也能產生相同格式的回覆。就像你給裝修師傅看了一張你喜歡的房間照片，他就知道你要什麼風格了。

---

## 總結

恭喜你完成了 Claude API 基礎教程！讓我們回顧一下學到的重點：

| 章節 | 重點 |
|------|------|
| 入門 | 安裝 SDK、取得 API 金鑰、發出第一個請求 |
| 訊息格式 | `role` + `content` 的結構、多輪對話、few-shot 提示 |
| 模型 | Haiku（快速便宜）、Sonnet（均衡）、Opus（最強大）的選擇 |
| 參數 | `max_tokens`（長度上限）、`temperature`（創意度）、`stop_sequences`（停止條件）、`system`（角色設定） |
| 串流 | 即時接收回覆、改善使用者體驗、TTFT 優化 |
| 圖像 | Base64 編碼、圖文混合提示、多圖片處理 |

> 這些基礎知識就像學開車——學會了方向盤、油門、煞車，你就可以上路了。接下來就是多練習、多嘗試，找到最適合你的使用方式！
