"""
多 Agent 公民審議模擬：敬老卡使用優化
==========================================
模擬不同角色的公民、專家、與協調者，針對敬老卡政策進行多輪審議，
產出具體的政策優化建議。

使用 Google Gemini API
"""

from google import genai
from datetime import datetime
import sys
import io
import time

# 強制 UTF-8 輸出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = genai.Client(api_key="AIzaSyA6QRc22XT5h9mkfPqGp0oh_bM9Rc3tw2Q")
MODEL = "gemini-2.5-flash"

# ============================================================
# 政策背景資料
# ============================================================
POLICY_CONTEXT = """## 台灣敬老卡現行政策摘要

### 基本制度
- 對象：65歲以上長者（原住民55歲以上）
- 形式：結合悠遊卡/一卡通，每月自動儲值點數（1點=1元）

### 各縣市補助差異
| 縣市 | 月補助點數 | 主要使用範圍 |
|------|-----------|-------------|
| 台北市 | 480點 | 公車、捷運、計程車(每趟上限65元)、YouBike、運動中心 |
| 新北市 | 480點 | 公車、捷運、計程車、YouBike |
| 桃園市 | 800點 | 公車、計程車(每趟上限100元)、運動中心 |
| 台中市 | 1,000點 | 公車免費、計程車(每趟上限85元)、運動中心 |
| 新竹市 | 800點 | 公車、運動中心(含游泳池)、藥局 |
| 高雄市 | 1,200點/年 | 公車、輕軌、渡輪、計程車 |

### 現行問題
1. 點數限當月使用，不可累積至次月
2. 使用範圍主要限於交通，生活應用有限
3. 各縣市標準不一，跨縣市使用受限
4. 部分長者不熟悉數位操作，使用率偏低
5. 補助金額是否足夠、是否應依需求差異化
6. 計程車補助上限低，對行動不便者不足

### 本次審議目標
優化敬老卡的使用，使其更好地服務長者的多元需求，同時確保財政可持續性。
"""

# ============================================================
# Agent 角色定義
# ============================================================
CITIZEN_AGENTS = [
    {
        "name": "陳阿嬤",
        "role": "78歲獨居長者",
        "profile": """你是陳阿嬤，78歲，獨居在台北市萬華區老公寓4樓（無電梯）。
丈夫5年前過世，兩個兒子在外縣市工作，每月來探望1-2次。
你每天早上會去市場買菜、到公園做運動，偶爾到醫院回診。
主要交通方式是公車，但膝蓋不好，有時需要搭計程車。
每月敬老卡480點經常不夠用，特別是看醫生那週。
你不太會用手機，對新科技感到困惑。
你最在意的是：能不能搭得起計程車去看醫生、買菜方便、不要太複雜。
說話方式：直接、樸實，偶爾用台語思維講國語，關心實際生活需求。"""
    },
    {
        "name": "林伯伯",
        "role": "70歲退休公務員",
        "profile": """你是林伯伯，70歲，退休公務員，住在新北市新店區，與太太同住。
退休金加上儲蓄生活無虞，但你精打細算，重視每一分錢的效益。
你每天游泳或打太極拳，是社區活動中心的常客，也常帶朋友到處走走。
你對政策很有意見，常看新聞評論政治，會比較各縣市的福利差異。
你覺得敬老卡應該擴大使用範圍到更多休閒場所。
你會用智慧型手機，會LINE和看YouTube。
你最在意的是：運動健身補助、休閒使用範圍擴大、各縣市應該公平統一。
說話方式：有條理、引經據典、喜歡舉例子比較，偶爾語帶批評。"""
    },
    {
        "name": "王大姐",
        "role": "66歲社區志工",
        "profile": """你是王大姐，66歲，剛退休的國小老師，住在台中市北區。
你是社區發展協會的志工，每週帶長者做手工藝和讀書會。
你接觸很多不同狀況的長者，深知獨居、失智、身障長者的困難。
台中市雖然有1000點，但你發現很多長者不知道怎麼用、或根本不出門。
你認為敬老卡不只是交通卡，應該是促進社會參與的工具。
你最在意的是：如何讓不出門的長者也能受益、社會參與功能、數位落差問題。
說話方式：溫暖、有同理心、常從她服務的長者角度出發，善於提出建設性意見。"""
    },
    {
        "name": "張先生",
        "role": "45歲上班族（照顧者視角）",
        "profile": """你是張先生，45歲，在新竹科技業上班，80歲的母親住在桃園獨居。
你每週末回去看媽媽，幫她處理各種事務。你很擔心媽媽的安全和健康。
你覺得敬老卡應該結合更多健康管理和安全功能，不只是搭車。
你願意自己出錢加值，但希望系統更智慧化，能追蹤媽媽的出行狀況。
你也擔心詐騙集團針對長者的問題。
你最在意的是：遠端關懷功能、安全防護、健康管理整合、使用介面友善。
說話方式：理性、科技導向、實事求是，但談到母親時會流露感性。"""
    },
    {
        "name": "蔡議員",
        "role": "市議員（財政與政治考量）",
        "profile": """你是蔡議員，55歲，基層市議員，選區在都會邊陲的老社區。
你支持照顧長者，但也要面對預算現實。你知道敬老卡支出逐年增加，
隨著高齡化，未來財政壓力會更大。你要在選民期待和財政紀律之間平衡。
你看過其他國家的案例，認為應該把錢花在刀口上，鼓勵健康促進而非純粹補貼。
你擔心無限擴大使用範圍會變成政策買票的工具。
你最在意的是：財政可持續性、福利的公平性、避免資源浪費、政策效果評估。
說話方式：政治語言，善於平衡各方立場，但偶爾會講出直白的預算現實。"""
    },
    {
        "name": "黃醫師",
        "role": "家醫科醫師（健康促進視角）",
        "profile": """你是黃醫師，50歲，在社區開家醫科診所，看了二十幾年的老人家。
你的病人很多是用敬老卡搭車來看診的，你深知交通是就醫的最大障礙之一。
你認為敬老卡應該與預防保健結合——鼓勵長者運動、社交、健康檢查。
你看到太多長者因為省車錢不來回診、因為不出門導致失智加速的案例。
你最在意的是：就醫可近性、預防保健、運動促進、社交對心理健康的影響。
說話方式：專業但平易近人，善用醫學數據說服人，真心關心病人。"""
    },
]

FACILITATOR_SYSTEM = """你是本次公民審議的主持人。你的角色是：
1. 引導結構化討論，確保每個議題都被充分探討
2. 確保所有參與者都有發言機會，特別是弱勢觀點
3. 在討論偏題時拉回焦點
4. 識別共識點和分歧點
5. 在適當時候推進到下一階段

你不表達自己的政策立場，只負責促進對話品質。
用繁體中文回應。每次發言控制在150-250字。"""

SYNTHESIZER_SYSTEM = """你是政策綜合分析師。你的任務是：
1. 閱讀完整的公民審議紀錄
2. 識別所有共識點和分歧點
3. 將討論結果轉化為具體、可執行的政策建議
4. 評估每項建議的可行性、預算影響、受益群體
5. 產出結構化的政策建議報告
用繁體中文撰寫。報告要具體、有數據支撐、可操作。"""


def call_gemini(system_instruction: str, user_prompt: str, max_tokens: int = 800) -> str:
    """呼叫 Gemini API，含重試機制"""
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL,
                config={
                    "system_instruction": system_instruction,
                    "max_output_tokens": max_tokens,
                    "temperature": 0.9,
                    "thinking_config": {"thinking_budget": 0},
                },
                contents=user_prompt,
            )
            return response.text
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = (attempt + 1) * 10
                print(f"  [Rate limited, waiting {wait}s...]")
                time.sleep(wait)
            else:
                raise
    return "[API 呼叫失敗]"


def get_recent_context(transcript: str, max_chars: int = 3000) -> str:
    """只取最近的討論紀錄以避免 context 過長"""
    if len(transcript) <= max_chars:
        return transcript
    return "...(前略)...\n\n" + transcript[-max_chars:]


def agent_speak(agent: dict, context: str, facilitator_prompt: str) -> str:
    """讓一個公民 Agent 發言"""
    system = f"""你正在參加一場關於「敬老卡使用優化」的公民審議會議。

你的角色：{agent['name']}（{agent['role']}）

{agent['profile']}

重要規則：
- 完全從你的角色出發發言，展現該角色的真實關切和語氣
- 每次發言控制在150-250字，像真實會議中的發言
- 可以回應其他參與者的觀點，表達同意或反對
- 提出具體的建議或經驗，不要空泛
- 用繁體中文
- 直接以角色身份說話，不要重複你的角色名稱標籤"""

    recent = get_recent_context(context)
    user_prompt = f"""政策背景：
{POLICY_CONTEXT}

最近的討論：
{recent}

主持人說：{facilitator_prompt}

請直接以 {agent['name']} 的身份發言（不要加角色標籤前綴）。"""

    return call_gemini(system, user_prompt, max_tokens=800)


def facilitator_speak(transcript: str, stage: str, instruction: str) -> str:
    """主持人引導討論"""
    recent = get_recent_context(transcript, max_chars=4000)
    user_prompt = f"""目前審議階段：{stage}
任務：{instruction}

最近的討論紀錄：
{recent}

請作為主持人發言，引導下一步討論。控制在150-250字。"""

    return call_gemini(FACILITATOR_SYSTEM, user_prompt, max_tokens=600)


def synthesize_report(full_transcript: str) -> str:
    """產出最終政策建議報告"""
    user_prompt = f"""以下是完整的公民審議紀錄，請產出政策建議報告。

{full_transcript}

請產出結構化報告，包含：
1. 審議摘要（300字）
2. 主要共識點（所有或多數參與者同意的，列出5-8項）
3. 主要分歧點（參與者意見不一的，列出3-5項）
4. 具體政策建議（分短期3個月內/中期1年內/長期3年內，每期至少3項）
5. 預算影響評估
6. 實施優先序建議"""

    return call_gemini(SYNTHESIZER_SYSTEM, user_prompt, max_tokens=8000)


def run_deliberation():
    """執行完整審議流程"""

    transcript = f"# 敬老卡使用優化 — 公民審議模擬紀錄\n"
    transcript += f"日期：{datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
    transcript += f"## 政策背景\n{POLICY_CONTEXT}\n\n"
    transcript += f"## 參與者\n"
    for agent in CITIZEN_AGENTS:
        transcript += f"- **{agent['name']}**：{agent['role']}\n"
    transcript += "\n---\n\n"

    # ============================================================
    # 第一輪：問題盤點
    # ============================================================
    stage = "第一輪：問題盤點"
    print(f"\n{'='*60}")
    print(f"  {stage}")
    print(f"{'='*60}\n")

    facilitator_msg = facilitator_speak(
        transcript, stage,
        "開場介紹本次審議目的，邀請每位參與者從自身經驗出發，說明敬老卡目前最大的問題。"
    )
    transcript += f"## {stage}\n\n"
    transcript += f"**【主持人】**：{facilitator_msg}\n\n"
    print(f"【主持人】{facilitator_msg}\n")

    for agent in CITIZEN_AGENTS:
        response = agent_speak(agent, transcript, facilitator_msg)
        transcript += f"**【{agent['name']}・{agent['role']}】**：{response}\n\n"
        print(f"【{agent['name']}】{response}\n")
        time.sleep(1)  # 避免 rate limit

    # ============================================================
    # 第二輪：方案提議
    # ============================================================
    stage = "第二輪：方案提議"
    print(f"\n{'='*60}")
    print(f"  {stage}")
    print(f"{'='*60}\n")

    facilitator_msg = facilitator_speak(
        transcript, stage,
        "總結第一輪問題，歸納核心議題，邀請參與者針對問題提出具體改善方案。"
    )
    transcript += f"\n## {stage}\n\n"
    transcript += f"**【主持人】**：{facilitator_msg}\n\n"
    print(f"【主持人】{facilitator_msg}\n")

    for agent in CITIZEN_AGENTS:
        response = agent_speak(agent, transcript, facilitator_msg)
        transcript += f"**【{agent['name']}・{agent['role']}】**：{response}\n\n"
        print(f"【{agent['name']}】{response}\n")
        time.sleep(1)

    # ============================================================
    # 第三輪：辯論與修正
    # ============================================================
    stage = "第三輪：辯論與修正"
    print(f"\n{'='*60}")
    print(f"  {stage}")
    print(f"{'='*60}\n")

    facilitator_msg = facilitator_speak(
        transcript, stage,
        "列出第二輪的主要方案和爭議點，邀請參與者互相質疑和回應，特別關注預算可行性和操作面。"
    )
    transcript += f"\n## {stage}\n\n"
    transcript += f"**【主持人】**：{facilitator_msg}\n\n"
    print(f"【主持人】{facilitator_msg}\n")

    # 第一輪回應
    for agent in CITIZEN_AGENTS:
        response = agent_speak(agent, transcript, facilitator_msg)
        transcript += f"**【{agent['name']}・{agent['role']}】**：{response}\n\n"
        print(f"【{agent['name']}】{response}\n")
        time.sleep(1)

    # 第二輪交叉回應
    print(f"\n--- 交叉回應 ---\n")
    transcript += "\n**--- 交叉回應 ---**\n\n"
    for agent in CITIZEN_AGENTS:
        response = agent_speak(
            agent, transcript,
            facilitator_msg + " 請回應你最同意或最不同意的其他參與者觀點。"
        )
        transcript += f"**【{agent['name']}・{agent['role']}】**：{response}\n\n"
        print(f"【{agent['name']}】{response}\n")
        time.sleep(1)

    # ============================================================
    # 第四輪：共識形成
    # ============================================================
    stage = "第四輪：共識形成"
    print(f"\n{'='*60}")
    print(f"  {stage}")
    print(f"{'='*60}\n")

    facilitator_msg = facilitator_speak(
        transcript, stage,
        "總結前三輪討論，列出已形成共識的方案和仍有分歧的方案，請每位參與者表態（支持/反對/有條件支持）並說明最終立場。"
    )
    transcript += f"\n## {stage}\n\n"
    transcript += f"**【主持人】**：{facilitator_msg}\n\n"
    print(f"【主持人】{facilitator_msg}\n")

    for agent in CITIZEN_AGENTS:
        response = agent_speak(agent, transcript, facilitator_msg)
        transcript += f"**【{agent['name']}・{agent['role']}】**：{response}\n\n"
        print(f"【{agent['name']}】{response}\n")
        time.sleep(1)

    # ============================================================
    # 綜合報告
    # ============================================================
    print(f"\n{'='*60}")
    print(f"  政策建議報告生成中...")
    print(f"{'='*60}\n")

    report = synthesize_report(transcript)
    transcript += f"\n---\n\n## 政策建議報告\n\n{report}\n"
    print(report)

    # 儲存完整紀錄
    output_path = "senior_card_deliberation_result.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(transcript)

    print(f"\n✅ 完整紀錄已儲存至：{output_path}")
    return transcript


if __name__ == "__main__":
    run_deliberation()
