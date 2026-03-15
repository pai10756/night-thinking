# LifePulse 生活脈動

> AI 驅動的全方位自我管理平台 — 讓數據洞察引領更好的生活節奏。

## App Concept

LifePulse 整合睡眠、習慣、專注力與消費追蹤於一身，透過 AI 分析跨維度數據關聯，提供個人化的生活改善建議。不只記錄，更懂你的生活模式。

## Screens

| Screen | Description |
|---|---|
| **首頁 (Dashboard)** | 時間感知問候語、生活分數圓環動畫、2x2 指標卡片（睡眠/習慣/專注/支出）、AI 洞察卡片 |
| **習慣 (Habits)** | 週曆帶、可互動習慣清單含打勾動畫與連續天數、新增習慣 FAB |
| **專注 (Focus)** | 大型倒數計時器含脈動動畫、25/45/自訂分鐘切換、開始/暫停控制、今日統計 |
| **洞察 (Insights)** | 本週長條圖、趨勢徽章、AI 深度洞察列表含標籤分類 |
| **設定 (Settings)** | 個人檔案、使用統計、分組設定項目（通知/匯出/主題/隱私/關於） |

## Tech Stack

- **Framework**: React Native (Expo SDK 55)
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Bottom Tabs)
- **UI**: Custom components, Expo Linear Gradient
- **Animations**: React Native Animated API
- **Design**: Dark mode, Indigo/Cyan color system

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platform
npx expo start --web
npx expo start --android
npx expo start --ios
```

## Pricing Strategy

| Plan | Price | Features |
|---|---|---|
| **Free** | $0 | 3 habits, basic focus timer, 7-day history |
| **Pro** | $4.99/mo | Unlimited habits, AI insights, data export, custom themes |
| **Premium** | $9.99/mo | Advanced analytics, API integrations (Apple Health, Google Fit), priority support |
| **Lifetime** | $79.99 | All Premium features forever |

## Roadmap

### Phase 1: Foundation (Q2 2026)
- Core habit tracking with streaks and reminders
- Pomodoro focus timer with session history
- Basic sleep logging (manual entry)
- Monthly spending tracker
- Local data storage

### Phase 2: Intelligence (Q3 2026)
- AI-powered cross-domain insights engine
- Apple Health / Google Fit integration
- Social features (accountability partners)
- Widget support (iOS/Android)
- Cloud sync and multi-device support

### Phase 3: Ecosystem (Q4 2026)
- Wearable companion app (Apple Watch / Wear OS)
- Open API for third-party integrations
- Team/family plans
- Guided programs (sleep improvement, habit building)
- Community challenges and leaderboards
