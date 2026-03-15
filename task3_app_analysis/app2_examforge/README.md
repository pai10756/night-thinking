# ExamForge 考試鍛造所

> AI-powered multi-country exam prep platform that helps you master any standardized test through smart practice and analytics.

## App Concept

ExamForge is a mobile-first exam preparation app that supports multiple countries' standardized tests. Using AI-driven analytics, it identifies weak areas and creates personalized study plans. The app gamifies the learning process with streaks, achievements, and progress tracking to keep users motivated.

## Screens

1. **Home (首頁)** - Dashboard with study streak, daily goals with progress bar, quick action grid (practice, mock exam, weakness training, daily challenge), and recent activity feed.

2. **Practice (練習模式)** - Interactive question cards with multiple choice options, timer, progress tracking, answer validation with green/red indicators, and detailed explanations.

3. **Analytics (學習分析)** - Mastery ring chart, per-category progress bars with color-coded status (mastered/proficient/needs review/weak), weekly study time bar chart, and AI-powered study recommendations.

4. **Exams (考試模組)** - Browse and purchase exam modules from multiple countries (Taiwan driving test, GEPT, JLPT N3, UK Driving Theory, US Citizenship Test) with mastery progress for purchased modules.

5. **Profile (個人檔案)** - Study statistics (total hours, questions completed, accuracy, longest streak), achievement badges (earned and locked), app settings, and account management.

## Tech Stack

- **Framework**: React Native (Expo SDK 55)
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Icons**: @expo/vector-icons (Ionicons)
- **Styling**: React Native StyleSheet with custom design system

## How to Run

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go (iOS/Android) or press `w` for web.

## Pricing Strategy

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | 1 exam module (Taiwan driving test), limited daily questions |
| Exam Pack | $1.99 - $2.99 | Individual exam module unlock with full question bank |
| Pro Subscription | $4.99/mo | All exam modules, AI tutor, offline mode, ad-free |
| Annual Pro | $39.99/yr | All Pro features at 33% discount |

## Roadmap

- [ ] Dark mode support
- [ ] Offline mode with local question caching
- [ ] AI-powered adaptive question selection
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Social features: study groups, leaderboards
- [ ] Voice-powered question reading (TTS)
- [ ] Handwriting recognition for kanji/Chinese characters
- [ ] More exam modules: TOEFL, IELTS, HSK, Korean TOPIK
- [ ] Detailed exam simulation with time limits and scoring
- [ ] Export study reports as PDF
- [ ] Apple Watch / WearOS companion for quick review
